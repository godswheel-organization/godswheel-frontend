import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";

// A form-level error (e.g. "wrong password"), announced as soon as it appears.
export default function FormAlert({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>{children}</p>
    </div>
  );
}
