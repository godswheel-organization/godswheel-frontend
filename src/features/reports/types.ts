// TODO(backend): replace with the real reports contract once the Godswheel API spec is available.
export type ReportReason = "wrong_information" | "rights_concern" | "inappropriate_content" | "other";

export interface ReportRequest {
  // Absent for a general report (from Settings or About → Contact us).
  sermonId?: string;
  reason: ReportReason;
  details: string;
  // So the team can reply. Optional.
  email?: string;
}

export interface ReportReceipt {
  id: string;
}
