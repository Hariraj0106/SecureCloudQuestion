import crypto from "crypto";

/**
 * Generates a SHA-256 hex digest from the given string content.
 */
export function generateHash(content: string): string {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

/**
 * Validates the SHA-256 hash using constant-time comparison to prevent timing attacks.
 */
export function verifyHash(content: string, expectedHash: string): boolean {
  const calculatedHash = generateHash(content);
  if (calculatedHash.length !== expectedHash.length) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(calculatedHash, "utf8"),
    Buffer.from(expectedHash, "utf8")
  );
}
