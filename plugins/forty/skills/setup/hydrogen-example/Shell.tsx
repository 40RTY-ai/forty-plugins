import {
  SpacefrontCanvas,
  renderInline,
  useComposerChipSelect,
  useComposerDraft,
  useFourtySession,
  useThreadRows,
} from '@40rty/ams-sdk';

import {Button} from '~/components/Button';
import {Input} from '~/components/Input';
import {Heading, Text} from '~/components/Text';

/**
 * The `/ask` page: the canvas the agent composes onto, and a rail with the
 * conversation, suggested next steps and the composer.
 */
export function Shell() {
  const session = useFourtySession();
  const [draft, setDraft] = useComposerDraft();
  const {rows, isEmpty} = useThreadRows();
  const selectChip = useComposerChipSelect();
  const chips = session.suggestions?.actions ?? [];

  return (
    <div className="grid lg:grid-cols-[1fr_24rem] min-h-screen-no-nav">
      <div className="min-w-0">
        <SpacefrontCanvas />
      </div>

      <aside className="flex flex-col gap-6 p-6 border-t lg:border-t-0 lg:border-l border-primary/10 lg:sticky lg:top-nav lg:h-screen-no-nav">
        <Heading as="h1" size="lead">
          Find your fit
        </Heading>

        <div
          className="grid gap-4 overflow-y-auto grow content-start"
          aria-live="polite"
        >
          {isEmpty && (
            <Text color="subtle">
              Tell us what you’re dressing for — an outfit, an occasion, a feel
              — and we’ll pull the pieces together.
            </Text>
          )}
          {rows.map((row) => (
            <div key={row.key} className="grid gap-1">
              <Text as="p" size="fine" color="subtle">
                {row.visitorText}
              </Text>
              <Text as="p">{renderInline(row.prose, row.key)}</Text>
            </div>
          ))}
          {session.isRunning && (
            <Text size="fine" color="subtle">
              Pulling that together…
            </Text>
          )}
          {session.error && <Text color="notice">{session.error}</Text>}
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <Button
                key={chip.id}
                variant="secondary"
                onClick={() => selectChip(chip)}
              >
                {chip.label}
              </Button>
            ))}
          </div>
        )}

        <form
          className="flex items-end gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (draft.trim() === '') return;
            session.sendMessage(draft);
            setDraft('');
          }}
        >
          <Input
            variant="search"
            type="text"
            className="!text-copy"
            aria-label="Ask about our products"
            placeholder="Seamless under a white tee…"
            value={draft}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setDraft(event.target.value)
            }
          />
          <Button type="submit" disabled={session.isRunning}>
            Ask
          </Button>
        </form>
      </aside>
    </div>
  );
}
