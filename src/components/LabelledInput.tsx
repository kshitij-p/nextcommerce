import React, { type ForwardedRef } from "react";
import Input from "./Input";

const LabelledInput = React.forwardRef(
  (
    {
      name = "",
      labelProps,
      LabelTitle = <p />,
      ...rest
    }: React.ComponentProps<typeof Input> & {
      labelProps?: React.ComponentProps<"label">;
      LabelTitle?: React.ReactElement<React.HTMLProps<HTMLElement>>;
    },
    passedRef: ForwardedRef<HTMLInputElement>
  ) => {
    return (
      <label {...labelProps}>
        {React.cloneElement(LabelTitle, {
          ...LabelTitle.props,
          children: name,
        })}
        <Input {...rest} name={name} ref={passedRef} />
      </label>
    );
  }
);

LabelledInput.displayName = "LabelledInput";

export default LabelledInput;
