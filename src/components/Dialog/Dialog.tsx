import React, { ForwardedRef, useState } from "react";
import ControlledDialog, { ControlledDialogProps } from "./ControlledDialog";

type AutoControlledDialogProps = Omit<ControlledDialogProps, "open" | "setOpen"> & {
  defaultValue?: ControlledDialogProps["open"];
};

const AutoControlledDialog = React.forwardRef(
  ({ defaultValue = false, ...rest }: AutoControlledDialogProps, passedRef: ForwardedRef<HTMLDivElement>) => {
    const [open, setOpen] = useState(defaultValue);

    return <ControlledDialog {...rest} open={open} setOpen={setOpen} ref={passedRef} />;
  }
);

AutoControlledDialog.displayName = "AutoControlledDialog";

const Dialog = React.forwardRef(
  (
    {
      open,
      setOpen,
      ...rest
    }: AutoControlledDialogProps & {
      open?: ControlledDialogProps["open"];
      setOpen?: ControlledDialogProps["setOpen"];
    },
    passedRef: ForwardedRef<HTMLDivElement>
  ) => {
    const passedProps = {
      ...rest,
      ref: passedRef,
    };

    return open !== undefined && setOpen !== undefined ? (
      <ControlledDialog {...passedProps} open={open} setOpen={setOpen} />
    ) : (
      <AutoControlledDialog {...passedProps} />
    );
  }
);

Dialog.displayName = "Dialog";

export default Dialog;
