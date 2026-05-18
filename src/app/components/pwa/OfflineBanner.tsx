import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-amber-200 bg-amber-50/95 px-4 py-3 text-amber-950 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-amber-50/90">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <WifiOff className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">You are offline</p>
          <p className="text-sm text-amber-900/80">
            Cached PrintFlow screens are still available. Reconnect to sync new
            actions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex h-9 items-center justify-center rounded-md border border-amber-200 bg-white px-3 text-sm font-medium text-amber-950 transition hover:bg-amber-100"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
