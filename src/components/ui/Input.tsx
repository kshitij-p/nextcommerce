import { type HTMLMotionProps } from "framer-motion";
import React, { type ForwardedRef } from "react";
import { useFormContext } from "react-hook-form";
import ErrorText from "./ErrorText";

const Input = React.forwardRef(
  (
    {
      name,
      showErrors = true,
      orientation = "vertical",
      isInvalid = false,
      errorTextProps,
      ...rest
    }: React.ComponentProps<"input"> & {
      showErrors?: boolean;
      orientation?: "vertical" | "horizontal";
      isInvalid?: boolean;
      errorTextProps?: HTMLMotionProps<"b">;
    },
    passedRef: ForwardedRef<HTMLInputElement>
  ) => {
    const form = useFormContext();
    const state = name ? form.getFieldState(name, form.formState) : undefined;
    const errorMessage = state?.error?.message;

    return (
      <div
        className={`flex ${
          orientation === "vertical" ? "flex-col" : "flex-row"
        }`}
      >
        <input
          {...rest}
          aria-invalid={isInvalid || errorMessage ? "true" : "false"}
          name={name}
          ref={passedRef}
        />
        <ErrorText
          {...errorTextProps}
          visible={showErrors && (errorMessage?.length ? true : false)}
        >
          {errorMessage}
        </ErrorText>
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
