import { useEffect } from "react";
import { toast } from "sonner";
import { registerSW } from "virtual:pwa-register";

export function PwaLifecycle() {
  useEffect(() => {
    const updateServiceWorker = registerSW({
      immediate: true,
      onOfflineReady() {
        toast.success("PrintFlow is ready to work offline.");
      },
      onNeedRefresh() {
        toast("A PrintFlow update is ready.", {
          action: {
            label: "Reload",
            onClick: () => {
              updateServiceWorker(true);
            },
          },
        });
      },
      onRegisterError(error) {
        console.error("Service worker registration failed:", error);
      },
    });
  }, []);

  return null;
}
