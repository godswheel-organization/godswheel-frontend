import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import FieldMessage, { fieldMessageId } from "./FieldMessage";

interface CheckboxFieldProps extends Omit<ComponentProps<"input">, "id" | "type"> {
  id: string;
  label: ReactNode;
  error?: string;
}

export default function CheckboxField({ id, label, error, className, ...inputProps }: CheckboxFieldProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-3">
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={fieldMessageId(id, undefined, error)}
          className={cn(
            "size-6 shrink-0 cursor-pointer rounded-md border-border bg-transparent text-brand-500 transition focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-0",
            error && "border-danger"
          )}
          {...inputProps}
        />
        <label htmlFor={id} className="text-sm text-foreground">
          {label}
        </label>
      </div>
      <FieldMessage id={id} error={error} />
    </div>
  );
}
