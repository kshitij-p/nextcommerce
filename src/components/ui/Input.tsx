import React, { type ForwardedRef } from "react";
import { useFormContext } from "react-hook-form";

const Input = React.forwardRef(
  (
    {
      name,
      showErrors = true,
      ErrorText = <b className="text-red-500" />,
      orientation = "vertical",
      isInvalid = false,
      ...rest
    }: React.ComponentProps<"input"> & {
      showErrors?: boolean;
      ErrorText?: React.ReactElement<React.HTMLProps<HTMLElement>>;
      orientation?: "vertical" | "horizontal";
      isInvalid?: boolean;
    },
    passedRef: ForwardedRef<HTMLInputElement>
  ) => {
    const form = useFormContext();
    const state = name ? form.getFieldState(name, form.formState) : undefined;
    const errorMessage = state?.error?.message;

    return (
      <div
        className={`max-w-max ${
          orientation === "vertical" ? "flex-col" : "flex-row"
        }`}
      >
        <input
          {...rest}
          aria-invalid={isInvalid || errorMessage ? "true" : "false"}
          name={name}
          ref={passedRef}
        />
        {showErrors && errorMessage
          ? React.cloneElement(ErrorText, {
              ...ErrorText.props,
              children: errorMessage,
            })
          : null}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
