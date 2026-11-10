import { z } from "zod";
import { optionalEmailSchema } from "@/lib/validation/primitives";
import { REPORT_DETAILS_MAX } from "../lib/reasons";

export const reportSchema = z
  .object({
    reason: z.enum(["wrong_information", "rights_concern", "inappropriate_content", "other"], {
      message: "Choose what the issue is",
    }),
    details: z.string().trim().max(REPORT_DETAILS_MAX, `Keep it under ${REPORT_DETAILS_MAX} characters`),
    email: optionalEmailSchema,
  })
  // "Other" says nothing on its own, so it needs a description; the named reasons don't.
  .superRefine((values, context) => {
    if (values.reason === "other" && !values.details) {
      context.addIssue({ code: "custom", path: ["details"], message: "Tell us what's wrong" });
    }
  });

export type ReportFormValues = z.input<typeof reportSchema>;
