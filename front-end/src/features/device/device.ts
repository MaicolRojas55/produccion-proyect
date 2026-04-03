const DEVICE_KEY = "pp_device_id_v1";

function newId() {
  const c = crypto as unknown as { randomUUID?: () => string };
  return c?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function getStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function getDeviceId() {
  const storage = getStorage();
  if (!storage) return newId();
  try {
    const existing = storage.getItem(DEVICE_KEY);
    if (existing) return existing;
    const id = newId();
    storage.setItem(DEVICE_KEY, id);
    return id;
  } catch {
    return newId();
  }
}

