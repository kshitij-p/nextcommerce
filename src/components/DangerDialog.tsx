import React from "react";
import Button from "./Button";
import ConfirmDialog from "./ConfirmDialog";
import { type ControlledDialogProps } from "./Dialog/ControlledDialog";

const DangerDialog = ({
  openerChildren,
  openerProps,
  backButtonChildren = "No go back",
  backButtonProps,
  confirmButtonChildren,
  confirmButtonProps,
  open,
  setOpen,
  title,
  description = "Are you sure you want to do this ?",
  onConfirmDelete,
  ...rest
}: {
  openerChildren: React.ReactNode;
  openerProps?: React.ComponentProps<typeof Button>;
  backButtonChildren?: React.ReactNode;
  backButtonProps?: React.ComponentProps<typeof Button>;
  confirmButtonChildren?: React.ReactNode;
  confirmButtonProps?: React.ComponentProps<typeof Button>;
  open: ControlledDialogProps["open"];
  setOpen: ControlledDialogProps["setOpen"];
  title: string;
  description?: string;
  isLoading?: boolean;
  onConfirmDelete: () => void;
}) => {
  return (
    <ConfirmDialog
      {...rest}
      open={open}
      setOpen={setOpen}
      title={title}
      description={description}
      Opener={
        <Button {...openerProps} variants={{ type: "danger" }}>
          {openerChildren}
        </Button>
      }
      BackButton={
        <Button {...backButtonProps} variants={{ type: "secondary" }}>
          {backButtonChildren}
        </Button>
      }
      ConfirmButton={
        <Button {...confirmButtonProps} variants={{ type: "danger" }}>
          {confirmButtonChildren}
        </Button>
      }
      onConfirm={onConfirmDelete}
    />
  );
};

export default DangerDialog;
