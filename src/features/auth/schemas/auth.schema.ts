import { z } from "zod";
import { emailSchema, passwordSchema } from "@/lib/validation/primitives";

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type SignInFormValues = z.infer<typeof signInSchema>;
