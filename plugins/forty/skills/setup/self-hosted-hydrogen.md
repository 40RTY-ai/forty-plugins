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
| `app/forty/Shell.tsx` | the page: canvas + conversation + composer |
| a route | mounts `<Spacefront>` with the above |

`hydrogen-example/` holds a complete working integration (Shopify's `hydrogen-demo-store`).
Read it first; adapt it, do not paste it — the component and class names in it
belong to that store.

## Non-negotiables

- **Reuse the store's components.** Find its product card, grid, section,
  heading, text, button and input, and build on those. Do not write new visual
  components, do not add a CSS file, do not install a UI library.
- **The catalog file imports nothing but `@40rty/ams-sdk`.** It is published to the
  platform as data; a React import in it breaks the publish.
- **`z`, `resolved` and the entity schemas come from `@40rty/ams-sdk`**, never from
  the store's own `zod`.
- **Do not upgrade React, Hydrogen or the router.** The sdk supports React 18.3+.
- **Do not touch the store's cart.** A product card that is the store's own
  already adds to the store's own cart.

## Before you start

The organization and its space already exist: an organization admin creates the
space in the 40rty console. Nothing in this skill creates a space.

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
- the store binding in `.env`: `PUBLIC_STORE_DOMAIN`, `PUBLIC_STOREFRONT_API_TOKEN`, and `SHOP_ID` if present;
- the Content-Security-Policy call in `app/entry.server.tsx`.

### 2. Install

```
npm install "${FORTY_SDK_PACKAGE:-@40rty/ams-sdk}"
```

If npm refuses with `EALLOWREMOTE`, the repo's `.npmrc` names a registry host
that differs from its lockfile; re-run with the lockfile's host, e.g.
`--@shopify:registry=https://registry.npmjs.org`. Do not edit the lockfile.

Add `'@40rty/ams-sdk'` to `optimizeDeps.include` in `vite.config.ts`, so the first
page load does not stall on dependency pre-bundling.

### 3. `forty.config.json`

```
npx forty init
```

It signs the developer in if needed, asks which of the organization's spaces
this repo is for, and writes the file. If it asks which space, pass the question
to the developer — do not pick one. Then adjust two things if the store differs
from the defaults it wrote: `route`, the path the spacefront will be served at,
and `catalog` / `manifests`, pointing at the files below.

### 4. Catalog and manifests

Every ecommerce space must offer two types, by these exact names — the agent's
commerce instructions are written against them:

- `productGrid` — products: `resolved(ProductSchema, 'product', { min, max })`
- `collectionList` — collections: `resolved(CollectionSchema, 'collection', { min, max })`

Then add a type for each further thing the store has a component for and a
visitor would want composed (a hero, an editorial block, a lookbook). A
`resolved()` prop is filled with real store entities at render time; the agent
only ever supplies ids. Keep props few and describe each one.

Every type needs `app/forty/catalogs/<type>.md`: a `# <type>` title, one
paragraph saying what it shows, `## When to Use`, `## Don't Use When`. This prose
is what the agent chooses from — write it about the visitor's intent.

### 5. Components

One renderer per catalog type, plus the two the platform requires because they
are how the agent speaks:

- `agentText` — props `{ text?, parts? }`. Render `text` with `renderInline` from the sdk (it handles the agent's `**bold**`).
- `turn` — props `{ prompt?, children }`. One exchange: the visitor's ask, then what was composed for it.

A renderer receives hydrated entities in the sdk's shape (`hydrogen-example/components.tsx`
shows the fields). The store's components expect the store's own GraphQL
fragment shape, so write one small mapper per entity and pass the result to the
store's component unchanged.

### 6. Shell and route

The shell is ordinary store markup around `<SpacefrontCanvas />`, using:
`useThreadRows()` for the conversation, `useComposerDraft()` and
`useFourtySession().sendMessage()` for the composer, `session.suggestions` with
`useComposerChipSelect()` for suggested next steps, `session.isRunning` and
`session.error` for state. Write its copy for this store.

Add the route following the store's convention, rendering `<Spacefront>` inside
the store's normal page layout so its header and footer stay. Add one link to it
where the store's navigation lives.

`consent` must reflect the store's real consent state. If the store has a
consent tool, read it; if you cannot find one, pass `"granted"` and say so in
your summary.

The developer previews their own draft, and a space that is not live yet is
locked, so `<Spacefront>` takes the developer's credential: pass `token`, read on the SERVER from the `FORTY_DEV_TOKEN` environment
variable (a route loader) and handed to the component. Never hardcode it and
never read it in client code. It is absent in production, where it stays
`undefined`.

### 7. Content-Security-Policy

Add the API origin to `scriptSrc` (the engine loads from it) and to `connectSrc`
as both `http(s)://` and `ws(s)://` (the session is a WebSocket). Read the origin
from `forty.config.json`; do not hardcode it.

### 8. Connect, preview, verify

```
npx forty connect       # attach this store to the space
npx forty dev --once    # store the catalog and manifests as a draft; write FORTY_DEV_TOKEN to .env
npx forty doctor <dev-server-origin>
```

Nothing here changes what the space's visitors see: the draft is rendered only
for the developer, through the token in `.env`. A refused draft lists what to
fix; fix the files and run it again. A `404` means the space named in
`forty.config.json` is not one of the signed-in organization's — stop and say
so; do not try another slug.

Tell the developer the two commands they will use from here: `npx forty dev`
(leave it running; every save updates their preview) and `npx forty publish`
(the release — visitors see it).

`FORTY_DEV_TOKEN` is a credential. If `.env` is tracked by git in this repo,
say so in your summary rather than committing it.

`forty doctor` needs the store's dev server running; start it, run the check, and
stop it again. It is the definition of done — do not report success on a failing
check. If you have browser tools, also open the route, ask for products, and
confirm they render with the store's card and that its add-to-cart updates the
store's cart.

## Finish

Report: the route, the types published, which store components draw them, and
anything you assumed (the consent source above all).
