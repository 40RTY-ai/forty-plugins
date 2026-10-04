---
name: setup
description: Set up a 40rty spacefront in this repository — detect the vertical, platform and framework, ask how to deploy (self-hosted or hosted by 40rty), then wire it up end to end and hand back a preview link. Use when asked to add 40rty / Forty / "the agentic storefront" / a spacefront to a project.
---

# Set up 40rty

One command, the whole setup. The developer should only ever answer two
questions — which space, and how to deploy — and get a working preview link.

## 1. Detect

Read `package.json` and the tree, then state in one line what you found:

| Signal | Means |
|---|---|
| `@shopify/hydrogen` | E-commerce › Shopify, a Hydrogen app |
| `next`, `react-router`, `@remix-run/*`, `vite` + `react` | a React app you could self-host in |
| `.env` with `PUBLIC_STORE_DOMAIN` / `PUBLIC_STOREFRONT_API_TOKEN` | a Shopify store binding |
| an empty folder, or no app | nothing to host in — hosted by 40rty |

Shopify is the only platform today. If the project is clearly another vertical
or platform, say so and stop — do not force a Shopify integration onto it.

## 2. Ask how to deploy

Skip the question when the answer is forced (no app → hosted). Otherwise ask:

- **Self-hosted** — the spacefront runs inside this app, with its own components and cart.
- **Hosted by 40rty** — ship components as a package; 40rty serves the page.

## 3. Follow the guide

| Answer | Read and follow |
|---|---|
| Self-hosted, Hydrogen | `self-hosted-hydrogen.md` (worked example in `hydrogen-example/`) |
| Self-hosted, any other React app | `self-hosted-react.md` |
| Hosted by 40rty | `hosted.md` |

All three share these rules:

- The organization and space already exist (40rty creates them). The CLI signs
  the developer in through the browser — tell them to expect it. When it asks
  which space, pass the question to the developer; never pick one.
- A `404` from the CLI means the space is not the signed-in organization's — stop and say so.
- `npx forty doctor` is the definition of done. Never report success on a failing check.

## 4. Finish

Report in a few lines: the preview link or route, what was published, what you
assumed, and the two commands they use from here — `npx forty dev` (every save
updates the preview) and `npx forty publish` (visitors see it).
