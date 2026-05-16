/** Compare manifest/download checksum strings (case-insensitive, strip algo prefix). */
export function normalizeChecksum(value: string | null | undefined): string | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  const parts = trimmed.split(":");
  return (parts.length > 1 ? parts[parts.length - 1] : trimmed).trim() || null;
}

export function checksumsMatch(
  a: string | null | undefined,
  b: string | null | undefined,
): boolean {
  const na = normalizeChecksum(a);
  const nb = normalizeChecksum(b);
  if (!na || !nb) return false;
  return na === nb;
}
