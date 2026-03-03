import { getDeviceId } from "@/device/device";
import { loadOtpRecords, saveOtpRecords } from "./storage";
import type { OtpPurpose, OtpRecord } from "./types";

function newId() {
  const c = crypto as unknown as { randomUUID?: () => string };
  return c?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function addSecondsIso(seconds: number) {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

export function generateOtp6() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function issueOtp(input: {
  purpose: OtpPurpose;
  userId: string;
  conferenceId?: string;
  ttlSeconds: number;
}) {
  const records = loadOtpRecords();
  const rec: OtpRecord = {
    id: newId(),
    purpose: input.purpose,
    otp: generateOtp6(),
    userId: input.userId,
    deviceId: getDeviceId(),
    conferenceId: input.conferenceId,
    createdAt: nowIso(),
    expiresAt: addSecondsIso(input.ttlSeconds),
  };
  saveOtpRecords([...records, rec]);
  return rec;
}

export function verifyAndConsumeOtp(input: {
  purpose: OtpPurpose;
  userId: string;
  otp: string;
  conferenceId?: string;
}) {
  const records = loadOtpRecords();
  const deviceId = getDeviceId();
  const now = Date.now();

  const idx = [...records]
    .map((r, i) => ({ r, i }))
    .reverse()
    .find(({ r }) => {
      if (r.purpose !== input.purpose) return false;
      if (r.userId !== input.userId) return false;
      if (r.deviceId !== deviceId) return false;
      if ((r.conferenceId ?? null) !== (input.conferenceId ?? null)) return false;
      if (r.usedAt) return false;
      if (r.otp !== input.otp.trim()) return false;
      if (new Date(r.expiresAt).getTime() < now) return false;
      return true;
    })?.i;

  if (idx === undefined) return { ok: false as const };

  const updated = records.map((r) => (r.id === records[idx].id ? { ...r, usedAt: nowIso() } : r));
  saveOtpRecords(updated);
  return { ok: true as const };
}

