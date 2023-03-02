import React from "react";
import Button from "./Button";
import { type ControlledDialogProps } from "./Dialog/ControlledDialog";
import StyledDialog from "./StyledDialog";

const DangerDialog = ({
  openerChildren,
  backButtonChildren = "No go back",
  confirmButtonChildren,
  open,
  setOpen,
  title,
  description = "Are you sure you want to do this ?",
  isLoading = false,
  onConfirmDelete,
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
  const handleConfirmDelete = () => {
    if (isLoading) {
      return;
    }
    onConfirmDelete();
  };

  return (
    <StyledDialog
      open={open}
      setOpen={setOpen}
      Opener={<Button variants={{ type: "danger" }}>{openerChildren}</Button>}
      title={title}
      description={description}
    >
      <div className="mt-4 flex items-center gap-2 md:gap-4">
        <Button
          disabled={isLoading}
          variants={{ type: "secondary" }}
          onClick={() => setOpen(false)}
        >
          {backButtonChildren}
        </Button>
        <Button
          onClick={handleConfirmDelete}
          disabled={isLoading}
          variants={{ type: "danger" }}
        >
          {confirmButtonChildren}
        </Button>
      </div>
    </StyledDialog>
  );
};

export default DangerDialog;
