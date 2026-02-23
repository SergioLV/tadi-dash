// AES-256-GCM decryption using Web Crypto API
// Key derived via PBKDF2 with password "eup-k3y-2025-s4lt!", salt "eligeunplan", 100k iterations

const PASSWORD = "eup-k3y-2025-s4lt!";
const SALT = "eligeunplan";
const ITERATIONS = 100000;

async function deriveKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(PASSWORD),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(SALT),
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
}

export async function decryptData(encryptedBase64: string): Promise<string> {
  const key = await deriveKey();
  const raw = Uint8Array.from(atob(encryptedBase64), (c) => c.charCodeAt(0));
  // First 12 bytes = IV, last 16 bytes = auth tag (included in ciphertext for Web Crypto)
  const iv = raw.slice(0, 12);
  const ciphertext = raw.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  return new TextDecoder().decode(decrypted);
}
