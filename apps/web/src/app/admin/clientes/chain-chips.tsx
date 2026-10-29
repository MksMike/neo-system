import { cn } from '@neo/ui';
import { chainColorVar } from './schema';

/** Color mark of a subcontractor, as in the 勤怠表 border (R04-03). Always with text (R02-03). */
export function ChainSwatch({ color, className }: { color: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('inline-block size-3 shrink-0 rounded-full', className)}
      style={{ background: chainColorVar(color) }}
    />
  );
}

/** The chain above a client as small chips: color and abbreviation, the full name on hover. */
export function ChainChips({
  links,
  empty,
}: {
  links: { id: string; color: string; abbreviation: string; name: string }[];
  empty?: string;
}) {
  if (links.length === 0) return <span className="text-ink-subtle">{empty ?? '—'}</span>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {links.map((l) => (
        <span
          key={l.id}
          title={l.name}
          className="inline-flex h-6 items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2 text-xs font-semibold"
        >
          <ChainSwatch color={l.color} className="size-2.5" />
          {l.abbreviation}
          <span className="sr-only">{l.name}</span>
        </span>
      ))}
    </span>
  );
}
