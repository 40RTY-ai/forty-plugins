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

## Make it the brand's

Restyle the starter to the brand's design system — from the developer's site,
repo or design — fonts, colours, radius, spacing, rather than leaving the
starter's look. The shell is the AMS island in that design (`island.md`); the
components follow `components.md` (tier 1, then `comparisonTable` and
`productDetail`).

## Check

```
npx forty doctor
```

Then hand over the preview link. Release only when the developer asks:
`npm run release` (or `npx forty publish`) — the space's public page then
renders the package for every visitor.
