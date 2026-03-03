const DEVICE_KEY = "pp_device_id_v1";

function newId() {
  const c = crypto as unknown as { randomUUID?: () => string };
  return c?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function getDeviceId() {
  const existing = localStorage.getItem(DEVICE_KEY);
  if (existing) return existing;
  const id = newId();
  localStorage.setItem(DEVICE_KEY, id);
  return id;
}

