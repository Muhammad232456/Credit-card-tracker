import { useState } from 'react';
import { GLOSSARY } from '../data/glossary';

interface Props {
  term: string;
  children?: React.ReactNode;
}

export default function GlossaryTerm({ term, children }: Props) {
  const [open, setOpen] = useState(false);
  const def = GLOSSARY[term];
  if (!def) return <>{children ?? term}</>;

  return (
    <span className="relative inline-flex items-center gap-0.5">
      <span
        className="border-b border-dashed border-ink-soft cursor-pointer"
        onClick={() => setOpen(v => !v)}
      >
        {children ?? term}
      </span>
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-line text-ink-soft text-[9px] font-bold leading-none hover:bg-line transition-colors shrink-0"
        aria-label={`What is ${term}?`}
      >
        ?
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 z-50 mb-2 w-72 bg-ink text-white text-xs rounded-xl p-3.5 shadow-2xl">
            <p className="font-semibold text-line mb-1.5">{term}</p>
            <p className="text-line leading-relaxed">{def}</p>
          </div>
        </>
      )}
    </span>
  );
}
