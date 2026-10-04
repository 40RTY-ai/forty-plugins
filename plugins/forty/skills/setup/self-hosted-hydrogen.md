# Integrate 40rty into a Hydrogen storefront

The spacefront is a page where an agent composes a layout for each visitor. In a
store that hosts itself, **everything the visitor sees is the store's own**: the
agent decides *what* to show, the store's components decide how it looks. 40rty
contributes an engine (loaded at runtime from the 40rty API) and nothing visual.

You are adding five things to the store's repo and publishing one:

| File | What it is |
|---|---|
| `forty.config.json` | API origin, space slug, source id |
| `app/forty/catalog.ts` | what the agent may compose — data only |
| `app/forty/catalogs/<type>.md` | each type described to the agent |
| `app/forty/components.tsx` | the store's components drawing each type |
| `app/forty/Shell.tsx` | the page: the canvas, and the AMS island in the store's design (`island.md`) |
| a route | mounts `<Spacefront>` with the above |

`hydrogen-example/` holds a complete working integration (Shopify's `hydrogen-demo-store`).
Read it first; adapt it, do not paste it — the component and class names in it
belong to that store.

## Non-negotiables

- **Reuse the store's components and design system.** Find its product card,
  grid, section, heading, text, button and input, and build on those; where a
  type needs something the store lacks (a comparison table, the island), compose
  it from the store's own pieces, colours and type. Do not add a CSS file or
  install a UI library.
- **The catalog file imports nothing but `@40rty/ams-sdk`.** It is published to the
  platform as data; a React import in it breaks the publish.
- **`z`, `resolved` and the entity schemas come from `@40rty/ams-sdk`**, never from
  the store's own `zod`.
- **Do not upgrade React, Hydrogen or the router.** The sdk supports React 18.3+.
- **Do not touch the store's cart.** A product card that is the store's own
  already adds to the store's own cart.

## Before you start

The organization exists (the developer belongs to it). The space may not:
`forty init --create <slug>` creates it in their organization.

The credential is the developer's own login. If `npx forty init` (step 3) finds
none it opens the browser for them to approve — tell them to expect that. In CI
or any shell with no browser, `FORTY_API_KEY` (an organization API key from the
console's **API keys** page) is used instead.

- `FORTY_SDK_PACKAGE` — what to install; defaults to `@40rty/ams-sdk`

## Steps

### 1. Read the store

Before writing anything, establish:

- the router: `@remix-run/react` or `react-router` (imports differ, the APIs used here do not);
- the route naming convention (`app/routes/($locale).products.tsx` → a locale prefix);
- the path alias (`~/…`), and where shared components live;
- the components to reuse, and the exact props each takes;
- its **design system** — colours, type, radius, buttons, inputs, what is pinned
  to the viewport (`island.md` says what to collect);
- keyboard shortcuts the store binds to single keys (a field inside the
  spacefront must not trigger them);
- the store binding in `.env`: `PUBLIC_STORE_DOMAIN`, `PUBLIC_STOREFRONT_API_TOKEN`,
  `PUBLIC_CHECKOUT_DOMAIN`, and `SHOP_ID` if present;
- other services the app needs at runtime (a CMS like Sanity, reviews) and
  whether their keys are in `.env` — pages that need a missing service may fail;
  the spacefront route must not depend on them;
- the Content-Security-Policy call in `app/entry.server.tsx`.

**Get the store's environment first — don't ask for it.** If `.env` lacks
`PUBLIC_STORE_DOMAIN` / `PUBLIC_STOREFRONT_API_TOKEN` (a fresh clone usually
does), pull everything the store's Oxygen storefront already has:

```
npx shopify hydrogen link        # once: pick the store and storefront (browser sign-in to Shopify)
npx shopify hydrogen env pull    # writes .env: store domain, Storefront token, checkout domain, SESSION_SECRET, and the app's other services (CMS keys, …)
```

That also fixes pages that need other services (a CMS homepage, reviews):
with the real variables they render instead of failing. If the store is not on
Oxygen, ask the developer for its `.env` — never invent values or point the app
at a demo store.

**A real store is required.** The agent searches the catalog through Shopify's
global catalog, so it needs a real store's domain and Storefront API token.
`mock.shop` and stores without a token cannot be searched — ask the developer
for the token (Shopify admin › Headless or Hydrogen channel) rather than
continuing without one. If `PUBLIC_CHECKOUT_DOMAIN` is missing, set it (the
store's checkout domain, or its `*.myshopify.com` domain): without it Hydrogen's
privacy API never loads, consent stays pending, and the spacefront ignores
every message.

### 2. Install

```
npm install "${FORTY_SDK_PACKAGE:-@40rty/ams-sdk}"
npm install -D @40rty/ams-cli
```

Use the repo's package manager (`pnpm add`, `yarn add`) if it has a lockfile for
one. With pnpm, a fresh install may skip build scripts (`Ignored build scripts:
esbuild, workerd …`); the Hydrogen dev server needs them — allow them in the
repo's `package.json` (`"pnpm": {"onlyBuiltDependencies": ["esbuild", "workerd", "@tailwindcss/oxide"]}`,
merged with any list already there) and reinstall, rather than running the
interactive `pnpm approve-builds`. If npm refuses with `EALLOWREMOTE`, the repo's `.npmrc` names a registry
host that differs from its lockfile; re-run with the lockfile's host, e.g.
`--@shopify:registry=https://registry.npmjs.org`. Do not edit the lockfile.

Add `'@40rty/ams-sdk'` to `optimizeDeps.include` in `vite.config.ts`, so the first
page load does not stall on dependency pre-bundling.

### 3. `forty.config.json`

```
npx forty init [--space <slug> | --create <slug>] [--source @<org>/storefront]
```

It signs the developer in if needed and writes the file for the space. Pass
`--space` when the developer named an existing space and `--create` when they
named one that does not exist yet; otherwise it asks, and you pass the question
to the developer — do not pick one. Then adjust `route` (the path the
spacefront is served at) and `catalog` / `manifests` if the store differs from
the defaults it wrote.

### 4. Catalog and manifests

Follow `components.md`: tier 1 always (`productGrid`, `collectionList` by these
exact names — the agent's commerce instructions are written against them), then
tier 2 starting with `comparisonTable` and `productDetail`. Every type needs
`app/forty/catalogs/<type>.md`: a `# <type>` title, one paragraph saying what it
shows, `## When to Use`, `## Don't Use When`, written about the visitor's intent.

### 5. Components

One renderer per catalog type, plus the two the platform requires because they
are how the agent speaks:

- `agentText` — props `{ text?, parts? }`. Render `text` with `renderInline` from the sdk (it handles the agent's `**bold**`).
- `turn` — props `{ prompt?, children }`. One exchange: the visitor's ask, then what was composed for it.

A renderer receives hydrated entities in the sdk's shape (`hydrogen-example/components.tsx`
shows the fields). The store's components expect the store's own GraphQL
fragment shape, so write one small mapper per entity and pass the result to the
store's component unchanged. Variants may arrive without `selectedOptions`; a
store form that reads `options[0]` must still get one (key it by the variant title).

### 6. Shell and route

Build the shell as `island.md` describes: the AMS island in the store's design,
over `<SpacefrontCanvas />`. Write its copy for this store.

Add the route following the store's convention, rendering `<Spacefront>` inside
the store's normal page layout so its header, footer and cart stay. Add one link
to it where the store's navigation lives.

`consent` must reflect the store's real consent state. A Hydrogen store with
`Analytics.Provider` exposes it through `useAnalytics().customerPrivacy` (see
`hydrogen-example/route.tsx`); if the store has another consent tool, read that;
if you find none, pass `"granted"` and say so in your summary.

The developer previews their own draft, and a space that is not live yet is
locked, so `<Spacefront>` takes the developer's credential: pass `token`, read on
the SERVER from the `FORTY_DEV_TOKEN` environment variable (a route loader) and
handed to the component. Never hardcode it and never read it in client code. It
is absent in production, where it stays `undefined`.

### 7. Content-Security-Policy

Add the API origin to **`defaultSrc`** (the engine script loads from it) and to
`connectSrc` as both `https://` and `wss://` (the session is a WebSocket). Read
the origin from `forty.config.json`; do not hardcode it.

Do **not** pass `scriptSrc`: Hydrogen's `createContentSecurityPolicy` then
REPLACES its script defaults, `'self'` is dropped, and the app stops hydrating
— the page renders server-side and nothing on it works. Only if the store
already sets `scriptSrc` itself, append the origin to its existing list.

### 8. Connect, preview, verify

```
npx forty connect       # attach this store to the space; verifies the token and finds the shop id
npx forty dev --once    # store the catalog and manifests as a draft; write FORTY_DEV_TOKEN to .env
npx forty doctor <dev-server-origin>
```

Nothing here changes what the space's visitors see: the draft is rendered only
for the developer, through the token in `.env`. A refused draft lists what to
fix; fix the files and run it again. A `404` means the space named in
`forty.config.json` is not one of the signed-in organization's — stop and say
so; do not try another slug.

`forty doctor` needs the store's dev server running; start it, run the check, and
stop it again. It is the definition of done — do not report success on a failing
check. If you have browser tools, also open the route, ask one question per
component type (`components.md` › Check), and confirm each renders with the
store's look and that add-to-cart updates the store's cart.

`FORTY_DEV_TOKEN` is a credential. If `.env` is tracked by git in this repo,
say so in your summary rather than committing it.

### 9. Release and go live

```
npx forty publish       # the release: the space's visitors see these components
npx forty deploy        # run this app on 40rty and allow its origin — prints the live link
npx forty doctor <live-link>
```

`forty deploy` builds the app and serves it on 40rty regardless of where the
store deploys itself — the developer gets a working link now. It ships the
store's public variables from `.env`, never `FORTY_DEV_TOKEN`. When the store's
own production site (Oxygen, Vercel, …) serves the route, run
`npx forty origin add <its origin>` so the space answers it too.

## Finish

Report: the live link, the route, the types published and which store components
draw them, where the store itself deploys, and anything you assumed (the consent
source above all).
