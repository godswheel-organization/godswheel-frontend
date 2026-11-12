// The mock backend never stores a password itself, only this hash. It is NOT real security (a fast,
// unsalted-per-user 32-bit hash) — just enough that dummy data isn't plain text. The real backend owns hashing.
export function hashPassword(password: string): string {
  let hash = 0x811c9dc5;
  for (const char of `godswheel-mock:${password}`) {
    hash ^= char.codePointAt(0)!;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `fnv1a:${hash.toString(16).padStart(8, "0")}`;
}
