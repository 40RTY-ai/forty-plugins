# Hosted by 40rty

The developer ships a package of components; 40rty serves the page.

## New project

```
npx --package @40rty/ams-cli forty create <directory>
cd <directory> && npm install
npx forty init [--space <slug> | --create <slug>]
npx forty connect
npm run dev
```

`forty create` writes a starter: a catalog with the types a store needs
(`productGrid`, `collectionList`, …), a component for each, a shell and a
Tailwind build. `forty init` signs in and writes `forty.config.json` for the
space (create it with `--create` if the developer named a new one).

`forty connect` attaches the store: put `PUBLIC_STORE_DOMAIN`,
`PUBLIC_STOREFRONT_API_TOKEN` (and `SHOP_ID` if known) in the package's `.env`
first — a real store with a Storefront token; the agent cannot search without
one. `npm run dev` then stores every save as a draft and prints the **preview
link**. Leave it running.

## Existing package

```
npm install @40rty/ams-sdk
npm install -D @40rty/ams-cli
npx forty dev
```

The entry named by `bundle.entry` in `forty.config.json` must export `catalog`,
`renderers` (one per catalog type, plus `agentText` and `turn`) and optionally
`shells`. Components import only `@40rty/ams-sdk` and React — no router, no cart
route; cart, navigation and the conversation come from the SDK's hooks. Each
catalog type needs a markdown manifest (`# <type>`, what it shows,
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
- **Shell:** keep the island's anatomy (`island.md`), in those tokens.
- **Then** follow `components.md` (tier 1, then `comparisonTable` and
  `productDetail`).

Compare the preview with the store's site side by side before handing it over.

## Check

```
npx forty doctor
```

Then hand over the preview link. Release only when the developer asks:
`npm run release` (or `npx forty publish`) — the space's public page then
renders the package for every visitor.
