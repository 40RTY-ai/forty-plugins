import {useEffect, useState} from 'react';
import {
  SpacefrontCanvas,
  renderInline,
  useComposerChipSelect,
  useComposerDraft,
  useFourtySession,
  useThreadRows,
} from '@40rty/ams-sdk';

import {Button} from '~/components/Button';
import {Text} from '~/components/Text';

/*
 * The `/ask` page: the canvas the agent composes onto, and the AMS island over it.
 *
 * Design read from this store (hydrogen-demo-store): surface `bg-contrast`, ink
 * `text-primary`, accent from its Tailwind theme, `rounded` buttons from
 * `~/components/Button`, body copy from `~/components/Text`. Its header is
 * sticky at the TOP, so the island sits 16px from the bottom of the viewport.
 */
export function Shell() {
  const session = useFourtySession();
  const [draft, setDraft] = useComposerDraft();
  const {rows, isEmpty} = useThreadRows();
  const selectChip = useComposerChipSelect();
  const chips = session.suggestions?.actions ?? [];
  const latest = rows.at(-1);

  const [threadOpen, setThreadOpen] = useState(false);
  const [folded, setFolded] = useState(false);

  // Folds to the pill while the visitor scrolls down the canvas, back on scroll up.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) > 24) {
        setFolded(y > last && y > 120);
        last = y;
      }
    };
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const send = (text: string) => {
    if (text.trim() === '') return;
    session.sendMessage(text);
    setDraft('');
    setFolded(false);
  };

  return (
    <div className="relative min-h-screen pb-56">
      <SpacefrontCanvas />

      <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 pointer-events-none">
        {folded ? (
          <button
            type="button"
            className="pointer-events-auto h-10 w-28 rounded-[20px] bg-primary text-contrast font-medium shadow-lg"
            onClick={() => setFolded(false)}
          >
            Ask
          </button>
        ) : (
          <div className="pointer-events-auto grid gap-2 w-full max-w-[640px]">
            {chips.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {chips.map((chip) => (
                  <Button key={chip.id} variant="secondary" onClick={() => selectChip(chip)}>
                    {chip.label}
                  </Button>
                ))}
              </div>
            )}

            <div className="rounded-2xl bg-contrast text-primary overflow-hidden shadow-[0_0_0_1px_rgb(var(--color-primary)/.14),0_6px_16px_-4px_rgb(var(--color-primary)/.26),0_20px_44px_-12px_rgb(var(--color-primary)/.36)]">
              <button
                type="button"
                aria-label="Fold the assistant"
                className="flex w-full justify-center py-2"
                onClick={() => setFolded(true)}
              >
                <span className="h-1 w-8 rounded-full bg-primary/40" />
              </button>

              <div
                className={`px-4 ${threadOpen ? 'max-h-64 overflow-y-auto grid gap-3 pb-2' : ''}`}
                aria-live="polite"
              >
                {session.error ? (
                  <Text color="notice">{session.error}</Text>
                ) : session.isRunning ? (
                  <Text size="fine" color="subtle" className="animate-pulse">
                    Pulling that together…
                  </Text>
                ) : threadOpen ? (
                  rows.map((row) => (
                    <div key={row.key} className="grid gap-1">
                      <Text as="p" size="fine" color="subtle">
                        {row.visitorText}
                      </Text>
                      <Text as="p">{renderInline(row.prose, row.key)}</Text>
                    </div>
                  ))
                ) : isEmpty ? (
                  <Text color="subtle">
                    Tell us what you’re dressing for — an outfit, an occasion, a feel.
                  </Text>
                ) : (
                  latest && (
                    <button
                      type="button"
                      className="line-clamp-2 text-left text-primary/70"
                      onClick={() => setThreadOpen(true)}
                    >
                      {renderInline(latest.prose, latest.key)}
                    </button>
                  )
                )}
              </div>

              <form
                className="flex items-center gap-2 px-3 pb-3 pt-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  send(draft);
                }}
              >
                <input
                  type="text"
                  className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 focus:ring-0"
                  aria-label="Ask about our products"
                  placeholder="Seamless under a white tee…"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onFocus={() => setThreadOpen(false)}
                />
                <button
                  type="submit"
                  aria-label="Ask"
                  className="grid place-items-center h-[34px] w-[34px] shrink-0 rounded-full bg-primary text-contrast disabled:opacity-40"
                  disabled={session.isRunning || draft.trim() === ''}
                >
                  ↑
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
