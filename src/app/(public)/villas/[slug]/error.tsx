"use client";

export default function VillaDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong loading this villa.</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
