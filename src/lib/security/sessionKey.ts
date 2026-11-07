// Per-session AES-GCM key for encrypting local drafts — lives only in sessionStorage, never persisted.
const SESSION_KEY_STORAGE_KEY = "godswheel_draft_key_material";

export async function setSessionKeyMaterial(base64Material: string): Promise<void> {
  sessionStorage.setItem(SESSION_KEY_STORAGE_KEY, base64Material);
}

// Call once sign-in succeeds; until then nothing can be encrypted, so nothing is written locally.
export async function generateDraftEncryptionKey(): Promise<void> {
  // crypto.subtle needs a secure context (HTTPS/localhost) — skip on plain-HTTP LAN.
  if (!crypto.subtle) return;

  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
  const rawBytes = new Uint8Array(await crypto.subtle.exportKey("raw", key));
  const base64Material = btoa(String.fromCharCode(...rawBytes));
  await setSessionKeyMaterial(base64Material);
}

export async function getSessionKey(): Promise<CryptoKey> {
  const raw = sessionStorage.getItem(SESSION_KEY_STORAGE_KEY);
  if (!raw) {
    throw new Error("No active session key — cannot access encrypted drafts.");
  }

  const rawBytes = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("raw", rawBytes, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
}

export function clearSessionKeyMaterial(): void {
  sessionStorage.removeItem(SESSION_KEY_STORAGE_KEY);
}
