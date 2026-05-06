import { ReadMore } from "@/components/shared/ReadMore";

interface VillaDescriptionBlockProps {
  text: string;
}

/**
 * Splits a raw description string into clean, readable paragraphs.
 *
 * Strategy:
 *   1. Split on double-newlines (explicit paragraph breaks from CMS)
 *   2. Fall back to splitting on sentence endings
 *   3. Always return at least 1 non-empty paragraph
 */
function splitIntoParagraphs(raw: string): string[] {
  const normalized = raw.trim();

  const byNewline = normalized
    .split(/\n{2,}/)
    .map((s) => s.replace(/\n/g, " ").trim())
    .filter((s) => s.length > 0);

  if (byNewline.length > 1) return byNewline;

  const sentences = normalized.match(/[^.!?]+[.!?]+[\s]*/g) ?? [normalized];
  if (sentences.length <= 1) return [normalized];

  const paragraphs: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    const chunk = [sentences[i], sentences[i + 1]].filter(Boolean).join("").trim();
    if (chunk) paragraphs.push(chunk);
  }

  return paragraphs.length > 0 ? paragraphs : [normalized];
}

export function VillaDescriptionBlock({ text }: VillaDescriptionBlockProps) {
  const normalized = text?.trim();
  if (!normalized) return null;

  const paragraphs = splitIntoParagraphs(normalized);

  return (
    <section
      className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      aria-label="Deskripsi villa"
    >
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3A4A1F]/70">
          Tentang Properti
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
          Kenali villa ini lebih dekat
        </h2>
        <div className="mt-2 h-0.5 w-12 rounded-full bg-[#3A4A1F]/20" />
      </div>

      <ReadMore paragraphs={paragraphs} previewCount={1} />
    </section>
  );
}
