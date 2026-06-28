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
        className="border-b border-dashed border-gray-400 cursor-pointer"
        onClick={() => setOpen(v => !v)}
      >
        {children ?? term}
      </span>
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-500 text-[9px] font-bold leading-none hover:bg-gray-300 transition-colors shrink-0"
        aria-label={`What is ${term}?`}
      >
        ?
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 z-50 mb-2 w-72 bg-slate-800 text-white text-xs rounded-xl p-3.5 shadow-2xl">
            <p className="font-semibold text-slate-100 mb-1.5">{term}</p>
            <p className="text-slate-300 leading-relaxed">{def}</p>
          </div>
        </>
      )}
    </span>
  );
}
