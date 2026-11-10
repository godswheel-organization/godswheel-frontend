"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import TextField, { type TextFieldProps } from "./TextField";

type PasswordFieldProps = Omit<TextFieldProps, "type" | "endAdornment">;

export default function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      endAdornment={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-controls={props.id}
          className="flex size-11 items-center justify-center rounded-lg text-muted transition hover:text-foreground"
        >
          <Icon className="size-5" aria-hidden />
        </button>
      }
    />
  );
}
