interface FieldMessageProps {
  id: string;
  hint?: string;
  error?: string;
}

// The line under a field: the error when there is one, otherwise the hint.
export default function FieldMessage({ id, hint, error }: FieldMessageProps) {
  if (error) {
    return (
      <p id={`${id}-error`} className="text-sm text-danger">
        {error}
      </p>
    );
  }
  if (hint) {
    return (
      <p id={`${id}-hint`} className="text-xs text-muted">
        {hint}
      </p>
    );
  }
  return null;
}

// The id FieldMessage rendered, for the control's aria-describedby.
export function fieldMessageId(id: string, hint?: string, error?: string): string | undefined {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}
