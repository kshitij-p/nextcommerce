import { cva } from "class-variance-authority";
import React, { type ForwardedRef } from "react";
import Input from "./Input";
import UnstyledTextarea from "./Textarea/UnstyledTextarea";

const inputVariants = {
  type: {
    unfilled: [
      "bg-transparent",
      "border-2",
      "border-teal-900",
      "aria-[invalid=true]:border-red-700/30",
      "aria-[invalid]:hover:border-teal-800",
      "aria-[invalid]:focus:border-teal-700",
      "aria-[invalid]:focus:shadow-[0px_0px_6px_#0f766e]",
    ],
  },
  borderRadius: {
    sm: "rounded-sm",
    base: "rounded",
    md: "rounded-md",
  },
  padding: {
    base: ["py-1", "px-2", "md:py-1", "md:px-2"],
    lg: ["py-2", "px-3", "md:py-2", "md:px-3"],
  },
};

const labelVariants = {
  type: {
    unfilled: ["mb-1", "md:mb-2"],
  },
};

const labelClasses = cva([], {
  variants: labelVariants,
});

export type InputVariants = {
  [k in keyof typeof inputVariants]: keyof (typeof inputVariants)[k];
};

export const inputClasses = cva(["focus:outline-0"], {
  variants: inputVariants,
});

export const DEFAULT_INPUT_VARIANTS: InputVariants = {
  type: "unfilled",
  borderRadius: "md",
  padding: "base",
};

interface GenericProps {
  labelProps?: React.ComponentProps<"label">;
  LabelTitle?: React.ReactElement<React.HTMLProps<HTMLElement>>;
  variants?: Partial<InputVariants>;
}

interface TextareaProps
  extends GenericProps,
    React.ComponentProps<typeof UnstyledTextarea> {
  inputEl?: "textarea";
}

interface InputProps extends GenericProps, React.ComponentProps<typeof Input> {
  inputEl?: "input";
}

const LabelledInput = React.forwardRef(
  (
    {
      name = "",
      labelProps,
      LabelTitle = <p />,
      variants: passedVariants = DEFAULT_INPUT_VARIANTS,
      className = "",
      inputEl = "input",
      ErrorText,
      ...rest
    }: TextareaProps | InputProps,
    passedRef: ForwardedRef<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const variants = { ...DEFAULT_INPUT_VARIANTS, ...passedVariants };

    const inputProps = {
      className: `${inputClasses(variants)} ${className}`,
      name: name,
      ErrorText: (
        <b
          {...ErrorText?.props}
          className={`text-[0.75em] font-medium text-red-500 ${
            ErrorText?.props.className ?? ""
          }`}
        />
      ),
    };

    return (
      <label {...labelProps}>
        {LabelTitle !== undefined &&
          React.cloneElement(LabelTitle, {
            ...LabelTitle.props,
            className: `capitalize ${labelClasses(variants)} ${
              LabelTitle.props?.className ?? ""
            }`,
            children: name,
          })}
        {inputEl === "input" ? (
          <Input
            {...(rest as React.ComponentProps<typeof Input>)}
            {...inputProps}
            ref={passedRef as ForwardedRef<HTMLInputElement>}
          />
        ) : (
          <UnstyledTextarea
            {...(rest as React.ComponentProps<typeof UnstyledTextarea>)}
            {...inputProps}
            ref={passedRef as ForwardedRef<HTMLTextAreaElement>}
          />
        )}
      </label>
    );
  }
);

LabelledInput.displayName = "LabelledInput";

export default LabelledInput;
