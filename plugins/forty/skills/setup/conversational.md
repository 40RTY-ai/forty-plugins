# Conversational UI (the default)

Every agentic webpage is built as a **conversational UI** unless the developer
asks for classic. It answers like a shop-floor expert: each
question gets its own page — the visitor's words, what the agent knows, the
answer as a headline, then a bento of reasoning blocks (a verdict, a shortlist,
a trade-off, a guided pick, next paths) around the store's own product cards.

| Mode | Shell | Blocks |
|---|---|---|
| **conversational UI** (default) | conversation page: `ConversationCanvas` + `PageComposer` in `ShellScaffold` | tier 1 + the shared conversation blocks |
| classic (only on request) | the store's page reshaped, with the chat side panel (`classic.md`) | tier 1 + tier 2 (`components.md`) |

A hosted package from `forty create` already starts as this; the steps below are
what it contains, and what a self-hosted app adds by hand.

Everything below comes from `@40rty/ams-ui/conversation` and `@40rty/ams-sdk`.
Never copy a brand package's blocks or shell — the kit is the source.

## 1. Blocks — spread the kit into the catalog

```ts
// catalog.ts
import {conversationBlocks} from '@40rty/ams-ui/conversation';

export const declarations = [...conversationBlocks, /* the store's own: productGrid, collectionList, … */];
export const catalog = Object.fromEntries(
  declarations.map(({component: _c, ...entry}) => [entry.type, entry]),
);
```

The renderers come from the same declarations
(`Object.fromEntries(declarations.map((d) => [d.type, d.component]))`). Keep
tier 1 (`productGrid`, `collectionList`) as the store's components — the
conversation blocks sit beside them, they do not replace them.

`conversationBlocks` = `verdict`, `shortlist`, `tradeoff`, `guidedPick`,
`facts`, `explain`, `note`, `paths`. Their manifests ship in the kit — list them
after your own in `forty.config.json`:

```json
"manifests": ["src/catalogs", "node_modules/@40rty/ams-ui/dist/conversation/manifests"]
```

## 2. Products inside the blocks are the store's card

The blocks draw every product with the tile you give them:

```tsx
import {ConversationProvider, type ConversationTileProps} from '@40rty/ams-ui/conversation';

function StoreTile({product, badge, blurb}: ConversationTileProps) {
  // the store's own product card (the same one productGrid uses),
  // `badge` over its image, `blurb` as one line under it
}
```

Wrap the shell in `<ConversationProvider tile={StoreTile}>`.

## 3. Shell — the conversation page

```tsx
import {renderInline, useComposerChipSelect, useScrollContainerRef, useThreadRows} from '@40rty/ams-sdk';
import {Composer, ShellScaffold} from '@40rty/ams-ui/shell';
import {ConversationCanvas, ConversationProvider, PageComposer} from '@40rty/ams-ui/conversation';
import '@40rty/ams-ui/conversation.css';

<ConversationProvider tile={StoreTile}>
  <ShellScaffold
    scrollRef={useScrollContainerRef()}
    canvasPaddingTop={HEADER_HEIGHT}            // clears the store's header
    header={<StoreHeader />}                    // the store's own header, pinned
    canvas={<ConversationCanvas />}             // turn header + bento, one page per turn
    canvasComposer={<PageComposer placeholder="…" starters={STARTERS} />}
    composer={<Composer placeholder="…" onChipSelect={useComposerChipSelect()}
      threadHistory={(ref) => <Thread scrollerRef={ref} />} />}   // the side dock's thread
    placeholder="…"                             // the mobile island, same copy
  />
</ConversationProvider>
```

`Thread` is a few lines over `useThreadRows()` (`rows[].visitorText`,
`rows[].prose` through `renderInline`) in the store's type, rendered into the
`scrollerRef` the Composer hands it.

And export `turnAsk` beside `shells`, so the agent's closing question is drawn
by the page instead of buried in its prose:

```ts
export const turnAsk: TurnAskPlacement = 'shell';
```

## 4. Look — the store's tokens

`conversation.css` reads `--fourty-convo-*`. Set them once from the store's
design (the same reading `classic.md` describes):

```css
:root {
  --fourty-convo-sheet: <page background>;
  --fourty-convo-ink: <text>;
  --fourty-convo-muted: <secondary text>;
  --fourty-convo-surface: <card / well background>;
  --fourty-convo-rule: <hairline>;
  --fourty-convo-accent: <primary button / brand colour>;
  --fourty-convo-on-accent: <text on it>;
  --fourty-convo-highlight: <a second brand colour — the `note` panel>;
  --fourty-convo-on-highlight: <text on it>;
  --fourty-convo-radius: <button radius>;
  --fourty-convo-button-transform: <uppercase | none — as the store's buttons>;
  --fourty-convo-card-radius: <card radius>;
  --fourty-convo-sheet-radius: <card radius>;
  --fourty-convo-composer-radius: <input radius>;
}
```

Never override the kit's classes — the tokens are the whole skin.

## 5. Composition — how the agent builds a page

A `brand.ts` with a composition prompt tells the agent which blocks answer which
question. Without it the agent answers with one grid and the blocks go unused.

```ts
// src/brand.ts
import type {BrandDefinition} from '@40rty/ams-sdk';

export const brand: BrandDefinition = {
  sourceId: '<package name — the sourceId in forty.config.json>',
  theme: {id: '<sourceId>-theme', themeClass: 'fourty-theme-<slug>'},
  label: '<Store name>',
  promptSections: [{
    id: 'composition', order: 210, file: 'composition.md',
    requires: ['render:verdict', 'render:shortlist', 'render:tradeoff', 'render:guidedPick', 'render:facts', 'render:explain', 'render:note', 'render:paths', 'render:productGrid'],
  }],
};
```

`forty.config.json`: `"brand": "src/brand.ts"`, `"prompts": "prompts"`. Then
`prompts/composition.md`, in the store's words (what it sells, who for):

```md
Answer with a page, not one block: 4-6 blocks that each add something; every turn is its own page, and every answer ends with `paths`.
- "Which one?" → `verdict` + `shortlist` of the runners-up, a `note` from <the store's experts>, `facts` of the pick, then `paths`. If one answer would change the pick (age, budget, who it's for), open with `guidedPick`.
- "X or Y?" → `tradeoff` with a product for each side, an `explain` of what decides it, then `paths`.
- A buying guide / "how do I choose" → an `explain` per thing that decides it, each carrying products that show it, a `productGrid` across the range, a `guidedPick`, then `paths`.
- Browsing a category → `productGrid`, a `note` on how to choose, a `guidedPick` to narrow it, then `paths`.
- A `productGrid` is for browsing, never for a recommendation.
- Open your reply with one `# ` line: the page headline; the rest is its supporting text.
```

`forty dev` sends the brand and prompts with every draft, so the preview link
answers as a conversational UI right away.

## Check

On the preview (desktop and 390px): ask "which one should I get for <who>",
"A or B?", "how do I choose <category>" and "show me <category>". Each answer is
its own page with a headline and 4-6 blocks, products drawn as the store's
cards, add-to-cart fills the store's cart, and the closing question's answers
are tappable.
