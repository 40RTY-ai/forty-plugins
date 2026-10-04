# Self-hosted in any React app

The same integration as `self-hosted-hydrogen.md` — read it; every rule and step
there applies — with the Hydrogen specifics replaced by the app's own:

| Hydrogen step | In this app |
|---|---|
| `vite.config.ts` `optimizeDeps.include` | only if the app uses Vite |
| route file convention (`app/routes/…`) | the framework's own (Next.js App Router: `app/<route>/page.tsx` rendering a `'use client'` component) |
| CSP in `app/entry.server.tsx` | wherever the app sets its Content-Security-Policy (Next.js: `next.config` headers or middleware); skip if it sets none |
| `FORTY_DEV_TOKEN` read in a loader | read it on the SERVER (a Server Component, `getServerSideProps`, a loader) and pass it as a prop — never in client code |
| store binding in `.env` | `npx forty connect` reads `PUBLIC_STORE_DOMAIN` and `PUBLIC_STOREFRONT_API_TOKEN`; if the app names them differently, ask for the values rather than renaming the app's variables |

`<Spacefront>` is client-only — it fetches the engine in an effect — so in a
server-rendering framework mount it from a client component.

`hydrogen-example/` is still the best reference for the catalog, the manifests,
the renderers and the shell; only the route and config wiring differ.
