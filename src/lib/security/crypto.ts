import { getSessionKey } from "./sessionKey";

export interface EncryptedPayload {
  ciphertext: ArrayBuffer;
  iv: Uint8Array;
}

// AES-GCM encrypt/decrypt — the only code allowed to touch Web Crypto for stored PII.
export async function encryptForStorage(data: unknown): Promise<EncryptedPayload> {
  const key = await getSessionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    encoded as BufferSource
  );

  return { ciphertext, iv };
}

export async function decryptFromStorage<T>(payload: EncryptedPayload): Promise<T> {
  const key = await getSessionKey();
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: payload.iv as BufferSource },
    key,
    payload.ciphertext
  );
  return JSON.parse(new TextDecoder().decode(plaintext)) as T;
}
