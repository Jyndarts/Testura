import { useId } from 'react';

function ResultMeter({ pass = 0, fail = 0, blocked = 0, total }) {
  const uid = useId();

  if (total === undefined) {
    total = pass + fail + blocked;
  }

  if (total === 0) {
    return (
      <div>
        <div
          className="w-full h-2 rounded-full"
          style={{ background: 'var(--neutral)' }}
        />
        <p
          className="text-[12px] leading-5 tracking-tight"
          style={{ fontFamily: '"JetBrains Mono", monospace', color: 'var(--muted)' }}
        >
          awaiting execution
        </p>
      </div>
    );
  }

  const segments = [];
  if (pass > 0) segments.push({ key: 'pass', count: pass, color: 'var(--pass)' });
  if (fail > 0) segments.push({ key: 'fail', count: fail, color: 'var(--fail)' });
  if (blocked > 0) segments.push({ key: 'blocked', count: blocked, color: 'var(--blocked)' });

  const tested = pass + fail + blocked;
  const untested = total - tested;

  const barSegments = segments.map((s) => ({
    ...s,
    pct: (s.count / total) * 100,
  }));

  return (
    <div>
      <div
        className="w-full h-2 rounded-full flex overflow-hidden"
        style={{ background: 'var(--neutral)' }}
      >
        {barSegments.map((s) => (
          <div
            key={s.key}
            style={{ width: `${s.pct}%`, background: s.color }}
            className="h-full first:rounded-l-full last:rounded-r-full"
          />
        ))}
      </div>

      <div className="flex items-center gap-3 mt-1.5">
        {segments.map((s) => (
          <span
            key={s.key}
            className="flex items-center gap-1 text-[12px] leading-5 tracking-tight"
            style={{ fontFamily: '"JetBrains Mono", monospace', color: 'var(--muted)' }}
          >
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: s.color }}
            />
            {s.count}
          </span>
        ))}
        {untested > 0 && (
          <span
            className="flex items-center gap-1 text-[12px] leading-5 tracking-tight"
            style={{ fontFamily: '"JetBrains Mono", monospace', color: 'var(--muted)' }}
          >
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: 'var(--neutral)' }}
            />
            {untested}
          </span>
        )}
        <span
          className="ml-auto text-[12px] leading-5 tracking-tight"
          style={{ fontFamily: '"JetBrains Mono", monospace', color: 'var(--muted)' }}
        >
          {total} total
        </span>
      </div>
    </div>
  );
}

export default ResultMeter;
