# The shell: the AMS island, in the store's design

Every 40rty spacefront is recognisable by one thing: **the island** — a floating
composer at the bottom of the screen, over the canvas the agent composes. Its
anatomy is fixed; its look is the store's. Build it from the store's own design
system, never from a new one.

## Read the store's design first

Before writing the shell, find and write down (in a comment at the top of `Shell.tsx`):

- the surface and text colours — CSS variables, Tailwind theme, or the values
  its header/buttons actually use;
- the primary/accent colour and the button style (radius, weight, case);
- the font family and the heading style;
- its input style (the newsletter or search field is usually the best source);
- anything pinned to the viewport (a sticky header or a header at the BOTTOM,
  a cart drawer, a cookie bar) — the island must clear it.

Reuse the store's own button, input and text components when they exist. If it
styles with classes only, reuse its classes. Never add a CSS file, a UI library,
or colours the store does not use.

## Anatomy (keep all of it)

```
            ┌ chips: suggested next steps (session.suggestions) ┐
┌───────────────────────────────────────────────────────────────┐
│                         ─── grip                              │   ← surface: the store's surface colour,
│  last answer, one or two lines (useThreadRows → row.prose)    │     radius ≈ 16px, a 1px edge ring and a
│  ┌──────────────────────────────────────────────┐  ( ↑ )      │     soft shadow tinted with the store's
│  │ Ask about …  (the store's voice)              │  stamp     │     primary colour
│  └──────────────────────────────────────────────┘            │
└───────────────────────────────────────────────────────────────┘
```

- **Placement:** `position: fixed` (not sticky — a short canvas would leave a
  sticky island mid-page), bottom `16px` + whatever the store pins to the bottom,
  centred over the column the canvas sits in (if the store keeps a cart or
  sidebar beside main content, match main's width, e.g. `w-full 800:w-2/3`),
  `max-width ≈ 640px`; above page content.
- **Store resets win over utilities.** Stores often style bare elements globally
  (`form button { width: 100% }`, `input { border; margin }`). Check the computed
  width of the send button and the field; override with important utilities
  (`w-[34px]!`, `border-0!`) rather than editing the store's reset.
- **Surface:** store surface + text colours. Edge ring
  `0 0 0 1px color-mix(in srgb, <primary> 14%, transparent)`; shadow
  `0 6px 16px -4px color-mix(in srgb, <primary> 26%, transparent), 0 20px 44px -12px color-mix(in srgb, <primary> 36%, transparent)`.
- **Grip:** a 32×4 rounded bar, the text colour at ~40%. Clicking it collapses
  the island.
- **Field:** the store's input styling without its border (the island is the
  border); placeholder in the store's voice, about this store's products.
- **Stamp:** the send button — a 34px circle filled with the text colour, the
  surface colour arrow inside; disabled while `session.isRunning`.
- **Answer line:** the latest `row.prose` (rendered with `renderInline`), muted,
  max two lines, expandable into the full thread (`rows`) on click.
- **Chips:** `session.suggestions.actions`, the store's secondary/outline button
  style, selected with `useComposerChipSelect()`.
- **Collapsed:** when the visitor scrolls down the canvas, the island folds to a
  pill (≈112×40, radius 20) with inverted colours (text colour background,
  surface colour text) labelled "Ask"; it expands on tap or when they scroll up.
- **Working state:** while `session.isRunning`, a subtle shimmer on the surface
  edge or a "thinking" line in place of the answer — never a blocking spinner.
- **Error:** `session.error` replaces the answer line in the store's error colour.

## Around it

- `<SpacefrontCanvas />` fills the page's main column, with bottom padding equal
  to the island's height so the last row is never hidden behind it.
- The store's header, footer and cart stay as they are. The cart is the store's:
  product components add to it through the store's own add-to-cart.
- Hooks: `useFourtySession()` (`sendMessage`, `isRunning`, `error`,
  `suggestions`), `useComposerDraft()`, `useThreadRows()`, `useComposerChipSelect()`,
  `useGoHome()` for the store logo inside the spacefront.

## Check it

Open the route on a phone width (390px) and a desktop width: the island never
covers the store's own sticky bars, the last canvas row is reachable, the input
takes focus without triggering the store's keyboard shortcuts (stop propagation
of `keydown` from the field if the store binds single keys), and it reads as the
store's UI — same font, colours and radius — in the AMS shape.
