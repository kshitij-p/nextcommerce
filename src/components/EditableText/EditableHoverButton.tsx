import { Pencil1Icon } from "@radix-ui/react-icons";
import React, { type ForwardedRef } from "react";

const EditableHoverButton = React.forwardRef(
  (
    { className = "", ...rest }: React.ComponentProps<"button">,
    passedRef: ForwardedRef<HTMLButtonElement>
  ) => {
    return (
      <button
        {...rest}
        className={`visible ml-2 align-baseline opacity-50 transition-all duration-300 group-hover:visible group-hover:opacity-100 group-focus:visible group-focus:opacity-100 xl:invisible xl:opacity-0 ${className}`}
        ref={passedRef}
      >
        <Pencil1Icon className="h-full w-6 md:w-8" />
      </button>
    );
  }
);

EditableHoverButton.displayName = "EditableHoverButton";

export default EditableHoverButton;
