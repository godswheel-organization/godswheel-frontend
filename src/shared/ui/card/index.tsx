import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface CardProps {
  children?: ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: ReactNode;
}

interface CardDescriptionProps {
  children: ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div
      className={twMerge(
        "rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6",
        className
      )}
    >
      {children}
    </div>
  );
};

const CardTitle: React.FC<CardTitleProps> = ({ children }) => {
  return (
    <h4 className="mb-1 font-medium text-gray-800 text-theme-xl dark:text-white/90">
      {children}
    </h4>
  );
};

const CardDescription: React.FC<CardDescriptionProps> = ({ children }) => {
  return <p className="text-sm text-gray-500 dark:text-gray-400">{children}</p>;
};

export { Card, CardTitle, CardDescription };
