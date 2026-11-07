import { LoaderCircle } from "lucide-react";

interface LoaderProps {
  className?: string;
  size?: number;
  label?: string;
}

export default function Loader({ className = "", size = 40, label = "Loading" }: LoaderProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={`flex items-center justify-center gap-4 sm:justify-normal ${className}`}
    >
      <LoaderCircle size={size} className="animate-spin text-brand-500" />
    </div>
  );
}
