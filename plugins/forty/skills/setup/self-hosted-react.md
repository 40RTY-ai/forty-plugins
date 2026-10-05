# Self-hosted in any React app

The same integration as `self-hosted-hydrogen.md` — read it; every rule and step
there applies — with the Hydrogen specifics replaced by the app's own:

| Hydrogen step | In this app |
|---|---|
| `vite.config.ts` `optimizeDeps.include` | only if the app uses Vite |
| route file convention (`app/routes/…`) | the framework's own (Next.js App Router: `app/<route>/page.tsx` rendering a `'use client'` component) |
| CSP in `app/entry.server.tsx` | wherever the app sets its Content-Security-Policy (Next.js: `next.config` headers or middleware); skip if it sets none |
| `FORTY_DEV_TOKEN` read in a loader | read it on the SERVER (a Server Component, `getServerSideProps`, a loader) and pass it as a prop — never in client code |
| store binding in `.env` | `npx forty connect` reads `PUBLIC_STORE_DOMAIN` / `PUBLIC_STOREFRONT_API_TOKEN` and falls back to `SHOPIFY_STORE_DOMAIN` / `SHOPIFY_STOREFRONT_ACCESS_TOKEN` (Next.js Commerce's names) — never rename the app's own variables. `PUBLIC_CHECKOUT_DOMAIN` is only needed for Hydrogen's consent API |
| `forty init` | detects the framework (Next.js, Remix, React Router, Vite) as self-hosted and writes `app/forty/...`; pass `--self-hosted` if it doesn't |
| `package.json` `version` | `forty dev`/`publish` send it; add `"version": "0.1.0"` if the app has none |
| pnpm ≥ 11 | pin `@40rty/ams-sdk@^<latest>` / `@40rty/ams-cli@^<latest>` (pnpm holds back releases younger than a day) and allow esbuild/sharp builds (`allowBuilds` in `pnpm-workspace.yaml`), or `pnpm dev` fails |
| store components that read the URL (`useSearchParams`: variant pickers, add-to-cart, galleries) | wrap each renderer in `<Suspense>`; the picker writes `?size=` to the `/` URL, which works |
| agentic page | Next.js App Router: `app/forty/page.tsx` (Server Component — reads `FORTY_DEV_TOKEN`) renders `app/forty/AgenticPage.tsx` (`'use client'` — mounts `<Spacefront>`); `next.config` adds `rewrites: process.env.FORTY_AGENTIC === '1' ? {beforeFiles: [{source: '/', destination: '/forty'}]} : []` (merged with existing rewrites) |
| live link | `forty deploy` runs Hydrogen apps only today; for other apps finish on the dev server, `forty publish`, and `forty origin add <their production URL>` |

`<Spacefront>` is client-only — it fetches the engine in an effect — so in a
server-rendering framework mount it from a client component.

`hydrogen-example/` is still the best reference for the blocks, the manifests,
the renderers and the shell; only the agentic-page wiring differs.
