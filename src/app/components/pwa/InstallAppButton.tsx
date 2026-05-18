import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "../ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

function isStandaloneDisplayMode() {
  return window.matchMedia("(display-mode: standalone)").matches;
}

export function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    const navigatorWithStandalone = navigator as Navigator & {
      standalone?: boolean;
    };
    return (
      isStandaloneDisplayMode() || navigatorWithStandalone.standalone === true
    );
  });

  useEffect(() => {
    const displayModeQuery = window.matchMedia("(display-mode: standalone)");

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    const handleDisplayModeChange = () => {
      const navigatorWithStandalone = navigator as Navigator & {
        standalone?: boolean;
      };
      setIsInstalled(
        isStandaloneDisplayMode() ||
          navigatorWithStandalone.standalone === true,
      );
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    displayModeQuery.addEventListener("change", handleDisplayModeChange);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
      displayModeQuery.removeEventListener("change", handleDisplayModeChange);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    setDeferredPrompt(null);

    if (choice.outcome === "accepted") {
      setIsInstalled(true);
    }
  };

  if (isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:right-4 sm:w-auto">
      <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Download className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">
              Install PrintFlow App
            </p>
            <p className="text-sm text-slate-600">
              Add PrintFlow to your home screen for faster access and offline
              use.
            </p>
          </div>
          <Button onClick={handleInstall} className="shrink-0">
            Install
          </Button>
        </div>
      </div>
    </div>
  );
}
