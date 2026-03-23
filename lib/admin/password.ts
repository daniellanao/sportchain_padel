import { createHash, timingSafeEqual } from "node:crypto";

/** Constant-time comparison via SHA-256 digests (32 bytes each). */
export function verifyAdminPassword(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}
