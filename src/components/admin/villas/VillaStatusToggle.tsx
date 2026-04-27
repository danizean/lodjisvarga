"use client";

import { useCallback, useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateVillaStatus } from "@/lib/actions/villas";

// ── Types ──────────────────────────────────────────────────────────────────────

type VillaStatus = "active" | "coming_soon" | "inactive";

interface VillaStatusToggleProps {
  villaId: string;
  villaName: string;
  /** Current persisted status from the server */
  currentStatus: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Normalise the raw DB status string into one of our three canonical values.
 * "Published" is treated as "active" for legacy compatibility.
 */
function normaliseStatus(raw: string | null): VillaStatus {
  const s = raw?.toLowerCase();
  if (s === "active" || s === "published") return "active";
  if (s === "coming_soon") return "coming_soon";
  return "inactive";
}

/**
 * For the binary toggle we only toggle between "active" and "inactive".
 * "coming_soon" is treated as inactive for the toggle (it can be set
 * explicitly via the full editor).
 */
function toggleStatus(current: VillaStatus): VillaStatus {
  return current === "active" ? "inactive" : "active";
}

// ── Sub-components ─────────────────────────────────────────────────────────────

/** Minimal inline spinner, matches the switch track height */
function Spinner({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

/**
 * `VillaStatusToggle`
 *
 * Inline active/inactive switch for the villa list page.
 *
 * - Uses `useOptimistic` for instant visual feedback.
 * - Uses `useTransition` to keep the UI responsive during the server action.
 * - Reverts the optimistic state automatically if the server action fails.
 * - Shows a Sonner toast for both success and error outcomes.
 * - Disables the toggle while the transition is pending.
 * - Fully keyboard-navigable and screen-reader friendly.
 */
export function VillaStatusToggle({
  villaId,
  villaName,
  currentStatus,
}: VillaStatusToggleProps) {
  const [isPending, startTransition] = useTransition();

  const canonical = normaliseStatus(currentStatus);

  const [optimisticStatus, setOptimisticStatus] = useOptimistic<VillaStatus>(canonical);

  const isActive = optimisticStatus === "active";

  const handleToggle = useCallback(() => {
    if (isPending) return;

    const next = toggleStatus(optimisticStatus);

    startTransition(async () => {
      // 1. Apply optimistic update immediately
      setOptimisticStatus(next);

      // 2. Call server action
      const result = await updateVillaStatus(villaId, next);

      // 3. Handle outcome — optimistic state reverts automatically on error
      //    because useOptimistic rolls back when the transition completes.
      if ("error" in result) {
        toast.error("Gagal mengubah status", {
          description: result.error ?? `Status ${villaName} tidak berhasil diperbarui.`,
        });
      } else {
        toast.success(
          next === "active"
            ? `${villaName} sekarang aktif`
            : `${villaName} dinonaktifkan`,
          {
            description:
              next === "active"
                ? "Properti sekarang tampil di halaman publik."
                : "Properti disembunyikan dari halaman publik.",
          }
        );
      }
    });
  }, [isPending, optimisticStatus, villaId, villaName, setOptimisticStatus]);

  // Handle Enter / Space as click (the role="switch" button already does this,
  // but we add explicit keydown for browsers that don't follow the spec).
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleToggle();
      }
    },
    [handleToggle]
  );

  return (
    <div
      className="flex items-center gap-2"
      title={isActive ? "Klik untuk menonaktifkan" : "Klik untuk mengaktifkan"}
    >
      {/* ── Switch track ─────────────────────────────────── */}
      <button
        type="button"
        role="switch"
        aria-checked={isActive}
        aria-label={`Status ${villaName}: ${isActive ? "Aktif" : "Nonaktif"}`}
        disabled={isPending}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          // Layout
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full",
          // Transition
          "transition-colors duration-200 ease-in-out",
          // Focus ring
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
          // Track color
          isActive
            ? "bg-emerald-500"
            : "bg-slate-200",
          // Disabled / pending
          isPending && "cursor-not-allowed opacity-60"
        )}
      >
        {/* ── Thumb / Spinner ───────────────────────────────── */}
        <span
          aria-hidden="true"
          className={cn(
            // Size
            "flex h-4 w-4 items-center justify-center rounded-full shadow-sm",
            // Background
            "bg-white",
            // Slide animation
            "transform transition-transform duration-200 ease-in-out",
            isActive ? "translate-x-4" : "translate-x-0.5"
          )}
        >
          {isPending && (
            <Spinner className="h-2.5 w-2.5 text-slate-400" />
          )}
        </span>
      </button>

      {/* ── Label ────────────────────────────────────────────── */}
      <span
        className={cn(
          "text-xs font-medium transition-colors duration-200",
          isActive ? "text-emerald-700" : "text-slate-400"
        )}
      >
        {isPending ? "Menyimpan…" : isActive ? "Aktif" : "Nonaktif"}
      </span>
    </div>
  );
}
