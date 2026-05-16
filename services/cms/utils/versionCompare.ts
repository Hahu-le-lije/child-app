/** Compare dotted version strings; returns positive if a > b */
export function compareVersions(a: string, b: string): number {
  const pa = parseVersionParts(a);
  const pb = parseVersionParts(b);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da !== db) return da > db ? 1 : -1;
  }
  return 0;
}

function parseVersionParts(v: string): number[] {
  return String(v)
    .trim()
    .split(/[.\-_+]/)
    .map((part) => {
      const digits = part.replace(/[^0-9].*$/, "");
      const n = parseInt(digits, 10);
      return Number.isFinite(n) ? n : 0;
    });
}

export function isRemoteVersionNewer(
  remote: string | null | undefined,
  local: string | null | undefined,
): boolean {
  if (!remote?.trim()) return false;
  if (!local?.trim()) return true;
  return compareVersions(remote.trim(), local.trim()) > 0;
}
