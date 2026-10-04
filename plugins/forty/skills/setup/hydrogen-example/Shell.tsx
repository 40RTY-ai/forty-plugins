import {SpacefrontCanvas} from '@40rty/ams-sdk';
import {SpacefrontIsland} from '@40rty/ams-ui/island';
import {SpacefrontPresence} from '@40rty/ams-ui/presence';
import {SpacefrontThreadPanel} from '@40rty/ams-ui/thread-panel';
import islandCss from '@40rty/ams-ui/island.css?url';
import presenceCss from '@40rty/ams-ui/presence.css?url';
import threadPanelCss from '@40rty/ams-ui/thread-panel.css?url';

/** The shell's stylesheets, linked by the `/ask` route. */
export const shellStyles = [islandCss, presenceCss, threadPanelCss];

/*
 * The `/ask` page: the canvas the agent composes onto, and AMS UI's shell —
 * the island, the conversation panel and the agent's presence — in this
 * store's design: map the six shared tokens in the store's CSS, e.g.
 *
 *   :root { --fourty-surface: #fff; --fourty-fg: #111; --fourty-accent: <brand>;
 *           --fourty-accent-fg: #fff; --fourty-radius: 8px;
 *           --fourty-font-family: <brand font>; }
 *
 * plus placement (`--fourty-island-offset-bottom`, `--fourty-panel-offset-top`,
 * `--fourty-panel-inset-right`) to clear the store's own fixed bars. This is
 * the swag-store version: its header is pinned to the bottom, its cart rail
 * takes the right third from 800px.
 */
export function Shell() {
  return (
    <div className="relative min-h-screen bg-white pb-56 pr-[var(--fourty-thread-panel-inset,0px)]">
      <SpacefrontCanvas />
      <SpacefrontPresence />
      <SpacefrontThreadPanel
        title="Ask the store"
        placeholder="A gift for a developer under $50…"
        emptyText="Gifts, team merch, a hoodie in your size — ask, and we’ll lay it out."
      />
      <SpacefrontIsland
        placeholder="A gift for a developer under $50…"
        emptyText="Gifts, team merch, a hoodie in your size — ask, and we’ll lay it out."
      />
    </div>
  );
}
