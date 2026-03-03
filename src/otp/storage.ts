import type { OtpRecord } from "./types";

const OTP_KEY = "pp_otp_records_v1";

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadOtpRecords(): OtpRecord[] {
  const recs = safeParseJson<OtpRecord[]>(localStorage.getItem(OTP_KEY));
  return Array.isArray(recs) ? recs : [];
}

export function saveOtpRecords(records: OtpRecord[]) {
  localStorage.setItem(OTP_KEY, JSON.stringify(records));
}

