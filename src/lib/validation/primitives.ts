import { z } from "zod";
import type { ChangeEvent } from "react";

// Single source of truth per field shape — reused across every feature schema.

export const emailSchema = z.string().email("Enter a valid email address");

export const optionalEmailSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || emailSchema.safeParse(value).success,
    "Enter a valid email address"
  )
  .optional();

// A Nigerian number without the +234 prefix: 10 digits starting 7, 8 or 9.
export const nigerianNumberSchema = z
  .string()
  .trim()
  .regex(/^[789]\d{9}$/, "Enter a valid Nigerian phone number");

export const requiredTrimmedString = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

export const selectValueSchema = (fieldName: string) =>
  z
    .string({
      error: (issue) => (issue.input === undefined ? `Select ${fieldName}` : undefined),
    })
    .trim()
    .min(1, `Select ${fieldName}`);

export const personalNameSchema = (fieldName = "Name") =>
  requiredTrimmedString(fieldName)
    .max(80, `${fieldName} must be 80 characters or fewer`)
    .regex(
      /^[A-Za-z][A-Za-z' -]*$/,
      `${fieldName} can only contain letters, spaces, apostrophes, and hyphens`
    );

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be 128 characters or fewer");

export const urlSchema = z.string().url("Enter a valid URL");

export const searchTermSchema = z.string().trim().max(120);

export const digitsOnly =
  (maxLength?: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, "");
    event.target.value = maxLength ? digits.slice(0, maxLength) : digits;
  };
