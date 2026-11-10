import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import NextLink from "next/link";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size" | "onClick"> {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xs" | "icon";
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "submit" | "reset" | "button" | undefined;
  href?: string;
  ref?: Ref<HTMLButtonElement>;
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  type = undefined,
  href,
  ...buttonProps
}) => {
  const sizeClasses = {
    sm: "px-4 py-3 text-sm",
    md: "px-5 py-3.5 text-sm",
    lg: "rounded-2xl px-7 py-4 text-base font-semibold",
    xs: "px-2.5 py-2 text-xs",
    icon: "p-2",
  };

  const variantClasses = {
    primary:
      // Dark text on the orange fill: white on #F28C4B fails contrast.
      "bg-brand-500 text-brand-950 shadow-theme-xs hover:bg-brand-400 disabled:bg-brand-300",
    secondary:
      "bg-gray-100 text-gray-800 shadow-theme-xs hover:bg-gray-200 dark:bg-surface dark:text-foreground dark:ring-1 dark:ring-inset dark:ring-border dark:hover:bg-surface-raised",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-transparent dark:text-foreground dark:ring-border dark:hover:bg-surface",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5",
    link: "p-0 font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400",
  };

  const classes = twMerge(
    "inline-flex items-center justify-center gap-2 rounded-lg transition",
    sizeClasses[size],
    variantClasses[variant],
    disabled && "cursor-not-allowed opacity-50",
    className
  );

  const content = (
    <>
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </>
  );

  if (href) {
    return (
      <NextLink href={href} className={classes} onClick={onClick}>
        {content}
      </NextLink>
    );
  }

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...buttonProps}
    >
      {content}
    </button>
  );
};

export default Button;
