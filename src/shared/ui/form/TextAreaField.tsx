import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";
import FieldMessage, { fieldMessageId } from "./FieldMessage";
import { inputClasses, invalidInputClasses } from "./inputStyles";

interface TextAreaFieldProps extends Omit<ComponentProps<"textarea">, "id"> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
}

// TextField's multi-line twin. Spread react-hook-form's register() onto it.
export default function TextAreaField({ id, label, hint, error, className, rows = 4, ...textareaProps }: TextAreaFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={fieldMessageId(id, hint, error)}
        className={cn(inputClasses, "resize-none bg-transparent", error && invalidInputClasses)}
        {...textareaProps}
      />
      <FieldMessage id={id} hint={hint} error={error} />
    </div>
  );
}
