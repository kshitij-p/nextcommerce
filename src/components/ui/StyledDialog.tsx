import React, { type ForwardedRef } from "react";
import Dialog from "./Dialog";

const DialogDescriptionElement = React.forwardRef(
  (
    { children, ...rest }: React.ComponentProps<"p">,
    passedRef: ForwardedRef<HTMLParagraphElement>
  ) => {
    return (
      <p {...rest} className="text-base md:text-xl" ref={passedRef}>
        {children}
      </p>
    );
  }
);

const DialogTitleElement = React.forwardRef(
  (
    { children, ...rest }: React.ComponentProps<"h2">,
    passedRef: ForwardedRef<HTMLHeadingElement>
  ) => {
    return (
      <h2
        {...rest}
        className="text-2xl font-semibold md:text-3xl"
        ref={passedRef}
      >
        {children}
      </h2>
    );
  }
);

DialogTitleElement.displayName = "DialogTitleElement";

DialogDescriptionElement.displayName = "DialogDescriptionElement";

const StyledDialog = ({
  children,
  Container = (
    <div className="text-md flex flex-col gap-2 bg-neutral-900 p-4 md:p-6" />
  ),
  TitleElement = DialogTitleElement,
  DescriptionElement = DialogDescriptionElement,
  size = { width: "35rem", height: "15rem" },
  ...rest
}: React.ComponentProps<typeof Dialog>) => {
  return (
    <Dialog
      {...rest}
      Container={Container}
      TitleElement={TitleElement}
      DescriptionElement={DescriptionElement}
      size={size}
    >
      {children}
    </Dialog>
  );
};

export default StyledDialog;
