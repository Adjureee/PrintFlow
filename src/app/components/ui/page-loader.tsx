import { Loader2 } from 'lucide-react';

interface PageLoaderProps {
  label?: string;
}

export function PageLoader({ label = 'Loading…' }: PageLoaderProps) {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-10 w-10 animate-spin text-[#00736D]" aria-hidden />
      <p className="text-sm font-semibold text-[#80B9B6]">{label}</p>
    </div>
  );
}
