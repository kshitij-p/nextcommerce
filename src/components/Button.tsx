import { cva } from "class-variance-authority";
import React, { type ForwardedRef } from "react";

const cvaVariants = {
  type: {
    primary: [
      "bg-teal-600",
      "text-teal-100",
      "enabled:hover:bg-teal-700",
      "enabled:hover:text-teal-200",
      "focus:bg-teal-700",
      "focus:text-teal-200",
      "focus:ring-2",
      "focus:ring-teal-400",
      "disabled:bg-teal-800",
      "disabled:opacity-50",
      "",
    ],
    secondary: [
      "bg-neutral-1000",
      "text-teal-600",
      "border-2",
      "border-teal-600",
      "enabled:hover:bg-teal-800/40",
      "enabled:hover:text-teal-600",
      "enabled:hover:border-teal-600",
      "focus:bg-teal-800/40",
      "focus:text-teal-600",
      "focus:border-teal-600",
      "focus:outline-0",
      "disabled:opacity-50",
    ],
    danger: [
      "bg-red-500",
      "text-red-100",
      "enabled:hover:bg-red-700",
      "enabled:focus:bg-red-700",
      "focus:ring-2",
      "focus:ring-red-300",
      "disabled:opacity-50",
    ],
  },
  size: {
    sm: ["px-1", "py-1", "text-sm", "md:px-3", "md:py-2", "md:text-base"],
    md: ["px-2", "py-1", "text-base", "md:px-3", "md:py-2", "md:text-xl"],
    lg: ["px-2", "py-1", "text-lg", "md:px-3", "md:py-2", "md:text-2xl"],
  },
  borderRadius: {
    sm: "rounded-sm",
    base: "rounded",
  },
};

type ButtonVariantsProp = {
  [k in keyof typeof cvaVariants]: keyof (typeof cvaVariants)[k];
};

const buttonClasses = cva(
  [
    "font-semibold",
    "max-w-max",
    "shadow",
    "shadow-black/50",
    "transition",
    "hover:shadow-md",
    "hover:shadow-black/50",
    "focus:outline-0",
  ],
  {
    variants: cvaVariants,
  }
);

const DEFAULT_BUTTON_VARIANTS: ButtonVariantsProp = {
  type: "primary",
  size: "md",
  borderRadius: "base",
};

const Button = React.forwardRef(
  (
    {
      children,
      className = "",
      variants: passedVariants = DEFAULT_BUTTON_VARIANTS,
      type = "button",
      ...rest
    }: React.ComponentProps<"button"> & {
      variants?: Partial<ButtonVariantsProp>;
    },
    passedRef: ForwardedRef<HTMLButtonElement>
  ) => {
    const variants = { ...DEFAULT_BUTTON_VARIANTS, ...passedVariants };

    return (
      <button
        {...rest}
        type={type}
        className={`${buttonClasses(variants)} ${className}`}
        ref={passedRef}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
