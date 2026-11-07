import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";
import NextLink from "next/link";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "size" | "onClick"> {
  children: ReactNode;
  size?: "sm" | "md" | "xs" | "icon";
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
    xs: "px-2.5 py-2 text-xs",
    icon: "p-2",
  };

  const variantClasses = {
    primary:
      "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300",
    secondary:
      "bg-gray-100 text-gray-800 shadow-theme-xs hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300",
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
      <NextLink href={href} className={classes}>
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
