# Hosted package (no app)

For a store with **no app of its own**: the developer ships a package of
components and 40rty serves the page. If the repo has a Hydrogen or React app,
stop — integrate into that app and `forty deploy` it instead
(`self-hosted-hydrogen.md`); a package can only approximate an existing store's
design, while the app on 40rty is identical to it.

## New project

```
npx --package @40rty/ams-cli@latest forty create <directory>
cd <directory> && npm install
npx forty init [--space <slug> | --create <slug>]
npx forty connect --from <the store's live URL>
npm run dev
```

`forty create` writes a conversational UI starter: blocks for the types a store
needs (`productGrid`, `collectionList`, `hero`) beside the conversation blocks, a
component for each, the conversation-page shell (with its scroller), the store
tile, `src/brand.ts`, `prompts/composition.md` and a Tailwind build. `forty init` signs in and writes `forty.config.json` for the
space (create it with `--create` if the developer named a new one).

`forty connect --from <url>` attaches the store from its live page: the domain
and the public Storefront token every visitor's browser already receives (a bot
wall: pass a page the developer saved from their browser — see `SKILL.md`). It
has to be a real, published store; the agent cannot search without one. `npm run dev` then stores every save as a draft and prints the **preview
link**. Leave it running.

## Existing package

```
npm install @40rty/ams-sdk
npm install -D @40rty/ams-cli
npx forty dev
```

The entry named by `bundle.entry` in `forty.config.json` must export `catalog`,
`renderers` (one per block, plus `agentText` and `turn`) and optionally
`shells`. Components import only `@40rty/ams-sdk` and React — no router, no cart
route; cart, navigation and the conversation come from the SDK's hooks. Each
block needs a markdown manifest (`# <type>`, what it shows,
`## When to Use`, `## Don't Use When`).

## Make it the brand's (required)

Never hand over the starter's neutral look — it is a placeholder, and a hosted
space that does not look like the store reads as broken. Before the first
preview link, restyle the package from the store's own design:

- **Source:** the store's repo if you have it (Tailwind theme, CSS variables,
  fonts in `public/`), else its live site — read its colours, fonts, radius,
  button and input styles from the computed styles of its header, product card
  and buttons.
- **Tokens:** set `--color-ink`, `--color-paper`, `--color-accent` (and add any
  second accent) in `src/styles.css`; add the store's fonts with `@font-face`
  pointing at an origin that serves them with `access-control-allow-origin`
  (check with `curl -I`), and map them in `tailwind.config.js`.
- **Components:** match the store's card (image ratio, corners, title case),
  price style, button (fill, radius, hover) and section headings in
  `src/blocks.tsx`; give the header the store's logo treatment.
- **Conversational UI (default):** the starter already is one. Restyle its
  header, store tile and `--fourty-convo-*` tokens from the same reading, word
  `prompts/composition.md` in the store's words (`conversational.md`), and keep
  tier 1 from `components.md` in the store's look. Keep `scrollRef` on the shell.
- **Classic (only on request):** replace the shell as `classic.md` describes,
  then follow `components.md` (tier 1, then `comparisonTable` and `productDetail`).

**Product pages from the store's own theme (Shopify).** When the store has
granted 40rty's Shopify app the optional `read_themes` scope, don't rebuild the
product page by eye: add `"theme": { "designs": "./theme.designs.mjs", "out":
"src/theme/pdp-theme.json" }` to `forty.config.json` and run `npx forty theme
sync`. It writes every product template's sections in the store's order (and
what its apps add — reels, photo walls, sibling tiles, badges); render that file
in `productDetail`. Anything the sync cannot name fails it, naming it — describe
it in `theme.designs.mjs`, never paste the store's raw HTML. Re-run it whenever
the merchant edits a template, then release.

Compare the preview with the store's site side by side before handing it over.

## Check

```
npx forty doctor
```

Then hand over the preview link. Release only when the developer asks:
`npm run release` (or `npx forty publish`) — the space's public page then
renders the package for every visitor.

## Release

- **Draft, then release.** `npx forty dev --once` puts the package on the
  space as a draft (a preview link, visitors unaffected); check it there first.
- **Bump `version` in `package.json` every release.** The platform refuses a
  release whose version is not higher than every one already released
  (`409 … not higher than …`) — a refused release changes nothing for visitors.
- **Then check the live page itself**, not the draft: open the space's public
  link (no `?preview=`) and confirm the change is there. A release job that
  "succeeded" with an unbumped version did not release.
