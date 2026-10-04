# Hosted by 40rty

The developer ships a package of components; 40rty serves the page.

## New project

```
npx --package @40rty/ams-sdk forty create <directory>
cd <directory> && npm install
npm run dev
```

`forty create` writes a starter: a catalog with the types a store needs
(`productGrid`, `collectionList`, …), a component for each, a shell and a
Tailwind build. The first `npm run dev` signs in, asks which space, writes
`forty.config.json` and prints a **preview link**. Leave it running.

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

If the developer gave you a brand, a site or a design, restyle the starter's
components to match it — fonts, colours, spacing — rather than leaving the
starter's look.

## Check

```
npx forty doctor
```

Then hand over the preview link. Release only when the developer asks:
`npm run release` (or `npx forty publish`).
