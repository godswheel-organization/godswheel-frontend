"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { CircleCheck } from "lucide-react";
import { useSession } from "@/features/auth/hooks/useSession";
import SermonSummary from "@/features/sermons/components/SermonSummary";
import type { Sermon } from "@/features/sermons/types";
import { toApiError } from "@/lib/api/apiError";
import { ROUTES } from "@/lib/routes";
import PageHeader from "@/shared/layouts/PageHeader";
import Button from "@/shared/ui/button/Button";
import Container from "@/shared/ui/container/Container";
import FormAlert from "@/shared/ui/form/FormAlert";
import RadioGroupField from "@/shared/ui/form/RadioGroupField";
import TextAreaField from "@/shared/ui/form/TextAreaField";
import TextField from "@/shared/ui/form/TextField";
import { useSubmitReportMutation } from "../api/reportsApi";
import { REPORT_DETAILS_MAX, REPORT_REASONS } from "../lib/reasons";
import { reportSchema, type ReportFormValues } from "../schemas/report.schema";

interface ReportIssueScreenProps {
  // The sermon being reported, or null for a general report (Settings → Report an issue, About → Contact us).
  sermon: Sermon | null;
}

export default function ReportIssueScreen({ sermon }: ReportIssueScreenProps) {
  const { session } = useSession();
  const [submitReport] = useSubmitReportMutation();
  const [formError, setFormError] = useState<string | null>(null);
  // Where the reply will go, once sent ("" = no email given).
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReportFormValues, unknown, z.output<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues: { reason: undefined, details: "", email: "" },
  });

  // Signed in: offer the account's email, unless something's already been typed.
  useEffect(() => {
    if (session?.email && !getValues("email")) setValue("email", session.email);
  }, [session?.email, getValues, setValue]);

  const onSubmit = handleSubmit(async ({ reason, details, email }) => {
    setFormError(null);
    try {
      await submitReport({ sermonId: sermon?.id, reason, details, email: email || undefined }).unwrap();
      setSentTo(email ?? "");
    } catch (error) {
      setFormError(
        toApiError(error).code === "network_error"
          ? "We couldn't reach GodsWheel. Check your connection and try again."
          : "Something went wrong sending your report. Please try again."
      );
    }
  });

  const backHref = sermon ? ROUTES.sermon(sermon.id) : ROUTES.settings;

  return (
    <Container className="py-4 md:py-8">
      <div className="mx-auto max-w-xl">
        <PageHeader title="Report an issue" backHref={backHref} variant="compact" />

        {sentTo !== null ? (
          <div role="status" className="mt-10 flex flex-col items-center text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-brand-500/10 text-brand-500">
              <CircleCheck className="size-7" aria-hidden />
            </span>
            <p className="mt-5 text-xl font-semibold text-foreground">Thanks for letting us know</p>
            <p className="mt-2 max-w-sm text-muted">
              We read every report.
              {sentTo ? (
                <>
                  {" "}If we need more detail, we&rsquo;ll write to <span className="text-foreground">{sentTo}</span>.
                </>
              ) : null}
            </p>
            <Button href={backHref} size="lg" className="mt-8 w-full">
              {sermon ? "Back to sermon" : "Back to settings"}
            </Button>
          </div>
        ) : (
          <form noValidate onSubmit={onSubmit} className="mt-6 flex flex-col gap-6">
            {sermon && <SermonSummary sermon={sermon} />}
            {formError && <FormAlert>{formError}</FormAlert>}

            <RadioGroupField
              id="report-reason"
              legend="What is the issue?"
              options={REPORT_REASONS}
              error={errors.reason?.message}
              {...register("reason")}
            />
            <TextAreaField
              id="report-details"
              label="Details"
              placeholder="Tell us more about the issue"
              maxLength={REPORT_DETAILS_MAX}
              error={errors.details?.message}
              {...register("details")}
            />
            <TextField
              id="report-email"
              label="Email (optional)"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              hint="Only used to reply about this report."
              error={errors.email?.message}
              {...register("email")}
            />

            <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Sending…" : "Submit report"}
            </Button>
          </form>
        )}
      </div>
    </Container>
  );
}
