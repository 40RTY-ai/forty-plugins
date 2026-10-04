# The components the agent composes — your palette

The **palette** is the set of component types the agent may put on the page
(in code: `catalog`, `app/forty/catalog.ts`). It is not the store's product
catalog — that's the data the agent searches.

A component is a **catalog type** (data, in `catalog.ts`), a **manifest** (prose
for the agent, `catalogs/<type>.md`) and a **renderer** built from the store's
own components. The agent only ever picks types and fills props; `resolved()`
props are filled with real store entities at render time.

Build in this order. Each tier makes the spacefront materially more useful; ship
tier 1 always, then propose tier 2 to the developer with one line each and build
what they accept (default: build `comparisonTable` and `productDetail` — they
need nothing but the product data the store already has).

## Tier 1 — required (every ecommerce space)

| Type | Props | Built from the store's |
|---|---|---|
| `productGrid` | `title`, `products: resolved(ProductSchema,'product',{min:1,max:12})` | product card / tile + its add-to-cart |
| `collectionList` | `title`, `collections: resolved(CollectionSchema,'collection',{min:2,max:4})` | collection tile or collection links |
| `agentText` | `text?`, `parts?` (render `text` with `renderInline`) | body text style |
| `turn` | `prompt?`, `children` | section wrapper + heading style |

## Tier 2 — the basics that make it useful

| Type | Why the visitor needs it | Props | Built from |
|---|---|---|---|
| `comparisonTable` | "A or B?" is the most common shopping question; a grid can't answer it | `products: resolved(ProductSchema,'product',{min:2,max:4})`, `verdict?: string` (one-line call, ≤140 chars), `highlightedProductId?: string` (one of `products`), `attributeRows?: {id,label,values: Record<gid, string\|number\|boolean>, winner?: gid}[]` | a table/grid with the product card's image + title + price as column heads, the store's add-to-cart per column; price, sale and availability rows come from the product data, `attributeRows` add the agent's judgment |
| `productDetail` | one clear answer: "which one should I get" | `product: resolved(ProductSchema,'product',{max:1})`, `reason?: string` | the store's PDP pieces — gallery/image, title, price, option picker, add-to-cart — never a full PDP route |
| `faq` | shipping, returns, sizing — questions that otherwise leave the page | `title`, `items: {question, answer}[]` | the store's accordion/details or plain headings + text |
| `hero` | a strong opener for a broad ask or the home canvas | `collection?: resolved(CollectionSchema,'collection',{max:1})`, `heading`, `byline?`, `cta?` | the store's hero/banner |

## Tier 3 — when the store has the data

`reviews` (needs a reviews app), `bundle` / "complete the look" (products that go
together, with one add-all button), `sizeGuide`, `giftFinder` (a few choices →
`productGrid`), `promoBanner` (needs the store's discounts). Propose these only
when you found the data or the component in the repo.

## Rules for every type

- Props are few and each has `.describe()` written for the agent. Use `z`,
  `resolved`, `ProductSchema`, `CollectionSchema` from `@40rty/ams-sdk` only —
  `catalog.ts` imports nothing else.
- The manifest's **first sentence** is all the agent sees of your palette — the
  rest is for people. Make that sentence say what it shows AND when to use it
  ("Two to four products side by side … — for "A or B?" questions."). Then
  `## When to Use` (the visitor's intent, in their words) and `## Don't Use When`
  (which other type to use instead). For
  `comparisonTable`: use for "X vs Y", "which is better for…", "difference
  between"; not for browsing (`productGrid`) or a single pick (`productDetail`).
- Renderers map the SDK's hydrated product to the store component's own props
  with one small mapper per entity; tolerate missing fields (variants without
  `selectedOptions`, products without images) — never crash the canvas.
- Every type gets an `examples` entry with placeholder gids.
- Add-to-cart always goes through the store's own cart, never the SDK's. If
  the store's product card has no add-to-cart (Next.js Commerce's tiles only
  link to the product page), keep the card as it is in `productGrid` and use
  the store's add-to-cart in `comparisonTable` / `productDetail`.

## Check

A session keeps the palette it was opened with until the page is reloaded —
reload after `forty dev` or `forty publish`. Then ask the live route one question per type — "what do
you sell", "show me X", "compare A and B", "which one should I get for Y",
"what's your return policy" — and confirm each renders with the store's look.
