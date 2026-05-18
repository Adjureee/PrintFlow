/** In-memory holder for the selected print file between wizard steps. */
let pendingPrintFile: File | null = null;

export function setPendingPrintFile(file: File | null): void {
  pendingPrintFile = file;
}

export function getPendingPrintFile(): File | null {
  return pendingPrintFile;
}

export function clearPendingPrintFile(): void {
  pendingPrintFile = null;
}
