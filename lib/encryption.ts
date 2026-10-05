import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16; // 16 bytes for AES CBC IV

/**
 * Derives a strict 32-byte Buffer key from the ENCRYPTION_KEY environment variable.
 */
function getKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY;
  if (!envKey) {
    throw new Error("ENCRYPTION_KEY is not defined in environment variables.");
  }

  // If provided as 64 hex characters (32 bytes)
  if (/^[0-9a-fA-F]{64}$/.test(envKey)) {
    return Buffer.from(envKey, "hex");
  }

  // Otherwise hash the key with SHA-256 to ensure exact 32 bytes
  return crypto.createHash("sha256").update(String(envKey)).digest();
}

/**
 * Encrypts sensitive text using AES-256-CBC with a unique per-operation IV.
 */
export function encryptContent(plaintext: string): {
  encryptedContent: string;
  iv: string;
} {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  return {
    encryptedContent: encrypted,
    iv: iv.toString("hex"),
  };
}

/**
 * Decrypts AES-256-CBC ciphertext given its IV.
 */
export function decryptContent(encryptedContent: string, ivHex: string): string {
  const key = getKey();
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  let decrypted = decipher.update(encryptedContent, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
