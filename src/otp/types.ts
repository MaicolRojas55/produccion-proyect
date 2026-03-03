export type OtpPurpose = "activate_account" | "conference_attendance";

export interface OtpRecord {
  id: string;
  purpose: OtpPurpose;
  otp: string; // 6 digits
  userId: string;
  deviceId: string;
  conferenceId?: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
}

