interface VillaDescriptionBlockProps {
  text: string;
}

export function VillaDescriptionBlock({ text }: VillaDescriptionBlockProps) {
  const normalized = text.trim();
  const shortText =
    normalized.length > 240 ? `${normalized.slice(0, 240).trimEnd()}...` : normalized;
  const needsExpand = normalized.length > shortText.length;

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3A4A1F]/70">Description</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Tentang villa ini</h2>
      </div>

      <p className="text-sm leading-7 text-slate-600 sm:text-[15px]">{shortText}</p>

      {needsExpand && (
        <details className="mt-4 rounded-2xl bg-slate-50 px-4 py-3">
          <summary className="cursor-pointer text-sm font-semibold text-slate-900">
            Read more
          </summary>
          <p className="mt-3 text-sm leading-7 text-slate-600">{normalized}</p>
        </details>
      )}
    </section>
  );
}
