const CLIENT_ID_KEY = "mood-pulse-client-id";

export function getClientId(): string {
  const existingClientId = localStorage.getItem(CLIENT_ID_KEY);

  if (existingClientId) {
    return existingClientId;
  }

  const nextClientId =
    globalThis.crypto?.randomUUID?.() ??
    `client_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  localStorage.setItem(CLIENT_ID_KEY, nextClientId);

  return nextClientId;
}
