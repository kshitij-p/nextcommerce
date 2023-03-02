import React from "react";
import Button from "./Button";
import ConfirmDialog from "./ConfirmDialog";
import { type ControlledDialogProps } from "./Dialog/ControlledDialog";

const DangerDialog = ({
  openerChildren,
  backButtonChildren = "No go back",
  confirmButtonChildren,
  open,
  setOpen,
  title,
  description = "Are you sure you want to do this ?",
  onConfirmDelete,
  ...rest
}: {
  openerChildren: React.ReactNode;
  backButtonChildren?: React.ReactNode;
  confirmButtonChildren?: React.ReactNode;
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
      Opener={<Button variants={{ type: "danger" }}>{openerChildren}</Button>}
      BackButton={
        <Button variants={{ type: "secondary" }}>{backButtonChildren}</Button>
      }
      ConfirmButton={
        <Button variants={{ type: "danger" }}>{confirmButtonChildren}</Button>
      }
      onConfirm={onConfirmDelete}
    />
  );
};

export default DangerDialog;
