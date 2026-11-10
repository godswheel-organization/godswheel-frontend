import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import FieldMessage, { fieldMessageId } from "./FieldMessage";
import { inputClasses, invalidInputClasses } from "./inputStyles";

export interface TextFieldProps extends Omit<ComponentProps<"input">, "id"> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  // Rendered inside the input's right edge (e.g. the show-password toggle).
  endAdornment?: ReactNode;
}

// Label, input and its hint/error, wired together for screen readers. Spread react-hook-form's
// register() straight onto it: `ref` is a plain prop in React 19.
export default function TextField({ id, label, hint, error, endAdornment, className, ...inputProps }: TextFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldMessageId(id, hint, error)}
          className={cn(inputClasses, error && invalidInputClasses, endAdornment ? "pr-14" : undefined)}
          {...inputProps}
        />
        {endAdornment && <div className="absolute inset-y-0 right-1.5 flex items-center">{endAdornment}</div>}
      </div>
      <FieldMessage id={id} hint={hint} error={error} />
    </div>
  );
}
