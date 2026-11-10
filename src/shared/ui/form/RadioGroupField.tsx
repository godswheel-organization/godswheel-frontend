import type { ComponentProps } from "react";
import { cn } from "@/lib/utils/cn";
import FieldMessage, { fieldMessageId } from "./FieldMessage";
import type { SelectOption } from "./SelectField";

interface RadioGroupFieldProps extends Omit<ComponentProps<"input">, "id" | "type"> {
  id: string;
  legend: string;
  options: SelectOption[];
  error?: string;
}

// A labelled set of radio buttons (a fieldset, so screen readers announce the question with each choice).
// Spread react-hook-form's register() onto it like any input.
export default function RadioGroupField({ id, legend, options, error, className, ...inputProps }: RadioGroupFieldProps) {
  return (
    // role="radiogroup" is where invalid-ness belongs: aria-invalid isn't allowed on the individual radios.
    <fieldset
      role="radiogroup"
      aria-invalid={error ? true : undefined}
      aria-describedby={fieldMessageId(id, undefined, error)}
      className={cn("flex flex-col gap-2", className)}
    >
      <legend className="mb-2 text-xl font-semibold text-foreground">{legend}</legend>
      {options.map((option) => (
        <label
          key={option.value}
          htmlFor={`${id}-${option.value}`}
          className="flex cursor-pointer items-center gap-4 rounded-xl px-2 py-2.5 text-foreground transition hover:bg-surface/60"
        >
          <input
            id={`${id}-${option.value}`}
            type="radio"
            value={option.value}
            className={cn(
              "size-6 shrink-0 cursor-pointer border-2 border-foreground/80 bg-transparent text-brand-500 focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-0",
              error && "border-danger"
            )}
            {...inputProps}
          />
          {option.label}
        </label>
      ))}
      <FieldMessage id={id} error={error} />
    </fieldset>
  );
}
