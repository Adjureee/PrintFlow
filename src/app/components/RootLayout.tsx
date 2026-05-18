import { Outlet } from "react-router";
import { InstallAppButton } from "./pwa/InstallAppButton";
import { OfflineBanner } from "./pwa/OfflineBanner";
import { PwaLifecycle } from "./pwa/PwaLifecycle";

export function RootLayout() {
  return (
    <>
      <PwaLifecycle />
      <OfflineBanner />
      <Outlet />
      <InstallAppButton />
    </>
  );
}
