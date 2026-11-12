import type { ReportReason } from "../types";

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "wrong_information", label: "Wrong information" },
  { value: "rights_concern", label: "Rights or copyright concern" },
  { value: "inappropriate_content", label: "Inappropriate content" },
  { value: "other", label: "Other" },
];

export const REPORT_DETAILS_MAX = 2000;
