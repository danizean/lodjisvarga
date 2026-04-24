import { ReadMore } from "@/components/shared/ReadMore";
import { CheckCircle2 } from "lucide-react";

interface VillaDescriptionBlockProps {
  text: string;
}

/**
 * Splits a raw description string into clean, readable paragraphs.
 *
 * Strategy:
 *   1. Split on double-newlines (explicit paragraph breaks from CMS)
 *   2. Fall back to splitting on periods that end sentences (≥60 chars)
 *   3. Always return at least 1 non-empty paragraph
 */
function splitIntoParagraphs(raw: string): string[] {
  const normalized = raw.trim();

  // 1. Double newline split (Supabase/CMS paragraph breaks)
  const byNewline = normalized
    .split(/\n{2,}/)
    .map((s) => s.replace(/\n/g, " ").trim())
    .filter((s) => s.length > 0);

  if (byNewline.length > 1) return byNewline;

  // 2. Sentence split — break on ". " after at least 60 chars
  const sentences = normalized.match(/[^.!?]+[.!?]+[\s]*/g) ?? [normalized];
  if (sentences.length <= 1) return [normalized];

  // Group every 2 sentences into one paragraph
  const paragraphs: string[] = [];
  for (let i = 0; i < sentences.length; i += 2) {
    const chunk = [sentences[i], sentences[i + 1]]
      .filter(Boolean)
      .join("")
      .trim();
    if (chunk) paragraphs.push(chunk);
  }

  return paragraphs.length > 0 ? paragraphs : [normalized];
}

/**
 * Extracts bullet-point candidates from text.
 * Looks for facility-style keywords (WiFi, kolam, parkir, AC, etc.)
 * Returns an array of short labels, or empty if nothing found.
 */
const FACILITY_KEYWORDS = [
  "wifi", "internet", "kolam", "pool", "parkir", "parking",
  "garasi", "ac", "pendingin", "sarapan", "breakfast",
  "dapur", "kitchen", "bbq", "rooftop", "kamar mandi",
  "bathroom", "shower", "tv", "netflix", "laundry",
];

function extractBullets(paragraphs: string[]): string[] {
  const full = paragraphs.join(" ").toLowerCase();
  return FACILITY_KEYWORDS
    .filter((kw) => full.includes(kw))
    .map((kw) => {
      // Capitalize first letter
      return kw.charAt(0).toUpperCase() + kw.slice(1);
    });
}

/**
 * Villa Description Block
 *
 * Server Component wrapper — the ReadMore toggle is the only client piece.
 * Renders:
 *   1. Section eyebrow + heading
 *   2. Paragraph-aware ReadMore (collapses to 1st paragraph)
 *   3. Auto-detected facility bullets (if text contains facility keywords)
 */
export function VillaDescriptionBlock({ text }: VillaDescriptionBlockProps) {
  const normalized = text?.trim();
  if (!normalized) return null;

  const paragraphs = splitIntoParagraphs(normalized);
  const bullets = extractBullets(paragraphs);

  return (
    <section
      className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      aria-label="Deskripsi villa"
    >
      {/* ── Header ── */}
      <div className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#3A4A1F]/70">
          Tentang Properti
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
          Kenali villa ini lebih dekat
        </h2>
        <div className="mt-2 h-0.5 w-12 rounded-full bg-[#3A4A1F]/20" />
      </div>

      {/* ── Body: paragraph-aware ReadMore ── */}
      <ReadMore paragraphs={paragraphs} previewCount={1} />

      {/* ── Auto-detected facility bullets ── */}
      {bullets.length >= 3 && (
        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Fasilitas yang tersebut
          </p>
          <ul className="grid gap-y-2 sm:grid-cols-2" role="list">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#3A4A1F]" aria-hidden="true" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
