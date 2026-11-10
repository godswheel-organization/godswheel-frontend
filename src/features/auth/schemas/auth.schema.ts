import { z } from "zod";
import { emailSchema, passwordSchema, personalNameSchema } from "@/lib/validation/primitives";

export const signInSchema = z.object({
  email: emailSchema,
  // Sign-in only checks that something was typed; the strength rules apply when the password is created.
  password: z.string().min(1, "Enter your password"),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  firstName: personalNameSchema("First name"),
  lastName: personalNameSchema("Last name"),
  email: emailSchema,
  password: passwordSchema,
  // A boolean refined to true (not z.literal(true)) so the form can start with the box unticked.
  termsAccepted: z.boolean().refine((accepted) => accepted, "Agree to the Terms and Privacy notice to continue"),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
