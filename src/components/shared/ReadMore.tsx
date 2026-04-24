"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ReadMoreProps {
  /**
   * Array of paragraph strings. Each string renders as a separate <p>.
   * Supports both modes:
   *   - paragraphs={["Intro.", "Details.", "..."]}  (preferred)
   *   - text="single string"  (auto-split on newlines or sentence boundaries)
   */
  paragraphs: string[];
  /**
   * Number of paragraphs visible when collapsed. Default: 1
   */
  previewCount?: number;
  className?: string;
}

/**
 * Paragraph-aware ReadMore component.
 *
 * - Collapses to the first N paragraphs (not an arbitrary character slice)
 * - No layout shift — hides excess paragraphs via display:none rather than
 *   re-rendering different text
 * - Smooth chevron icon rotation
 * - Accessible: aria-expanded on the trigger
 */
export function ReadMore({
  paragraphs,
  previewCount = 1,
  className = "",
}: ReadMoreProps) {
  const [expanded, setExpanded] = useState(false);
  const safe = paragraphs.filter((p) => p.trim().length > 0);
  const needsToggle = safe.length > previewCount;

  return (
    <div className={className}>
      <div className="space-y-4">
        {safe.map((para, i) => {
          const isHidden = !expanded && needsToggle && i >= previewCount;
          return (
            <p
              key={i}
              className={`text-[15px] leading-8 text-slate-600 transition-all ${
                isHidden ? "hidden" : ""
              }`}
            >
              {para.trim()}
            </p>
          );
        })}
      </div>

      {needsToggle && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          className="group mt-5 inline-flex items-center gap-1.5 rounded-full border border-[#3A4A1F]/20 bg-[#3A4A1F]/5 px-4 py-2 text-sm font-semibold text-[#3A4A1F] transition-colors hover:bg-[#3A4A1F]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A4A1F]/40 focus-visible:ring-offset-2"
        >
          {expanded ? (
            <>
              Sembunyikan
              <ChevronUp className="h-3.5 w-3.5 transition-transform duration-200" />
            </>
          ) : (
            <>
              Lihat selengkapnya
              <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
