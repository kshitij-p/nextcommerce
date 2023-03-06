import { cva } from "class-variance-authority";
import React from "react";

const cvaVariants = {
  type: {
    primary: [
      "bg-slate-800",
      "text-slate-100",
      "enabled:hover:bg-slate-900",
      "enabled:hover:text-slate-200",
      "enabled:focus:bg-slate-900",
      "enabled:focus:text-slate-200",
    ],
    secondary: [
      "bg-slate-200",
      "text-slate-600",
      "enabled:hover:bg-blue-100",
      "enabled:hover:text-slate-700",
      "enabled:focus:bg-blue-100",
      "enabled:focus:text-slate-700",
    ],
    danger: [
      "bg-red-500",
      "text-red-100",
      "enabled:hover:bg-red-700",
      "enabled:focus:bg-red-700",
    ],
  },
  size: {
    sm: ["px-1", "py-1", "text-sm", "md:px-3", "md:py-2", "md:text-base"],
    md: ["px-2", "py-1", "text-base", "md:px-3", "md:py-2", "md:text-xl"],
    lg: ["px-2", "py-1", "text-lg", "md:px-3", "md:py-2", "md:text-2xl"],
  },
};

type ButtonVariantsProp = {
  [k in keyof typeof cvaVariants]: keyof (typeof cvaVariants)[k];
};

const buttonClasses = cva(
  [
    "font-semibold",
    "rounded",
    "max-w-max",
    "shadow",
    "shadow-black/50",
    "transition",
    "hover:shadow-md",
    "hover:shadow-black/50",
    "focus:outline-0",
    "focus:ring-2",
    "focus:ring-blue-500",
  ],
  {
    variants: cvaVariants,
  }
);

const DEFAULT_BUTTON_VARIANTS: ButtonVariantsProp = {
  type: "primary",
  size: "md",
};

const Button = ({
  children,
  className = "",
  variants: passedVariants = DEFAULT_BUTTON_VARIANTS,
  type = "button",
  ...rest
}: React.ComponentProps<"button"> & {
  variants?: Partial<ButtonVariantsProp>;
}) => {
  const variants = { ...DEFAULT_BUTTON_VARIANTS, ...passedVariants };

  return (
    <button
      {...rest}
      type={type}
      className={`${buttonClasses(variants)} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
