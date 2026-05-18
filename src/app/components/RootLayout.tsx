import { Outlet } from "react-router";
import { InstallAppButton } from "./pwa/InstallAppButton";
import { OfflineBanner } from "./pwa/OfflineBanner";
import { PwaLifecycle } from "./pwa/PwaLifecycle";
import { ScrollManager } from "./ScrollManager";

export function RootLayout() {
  return (
    <>
      <PwaLifecycle />
      <ScrollManager />
      <OfflineBanner />
      <Outlet />
      <InstallAppButton />
    </>
  );
}
