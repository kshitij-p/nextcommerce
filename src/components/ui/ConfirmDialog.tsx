import React from "react";
import Button from "./Button";
import { type ControlledDialogProps } from "./Dialog/ControlledDialog";
import StyledDialog from "./StyledDialog";

const ConfirmDialog = ({
  Opener,
  BackButton = <Button variants={{ type: "secondary" }}>No go back</Button>,
  ConfirmButton = <Button>Yes do it</Button>,
  open,
  setOpen,
  title,
  description = "Are you sure you want to do this ?",
  isLoading = false,
  onConfirm,
  handleDiscard,
}: {
  Opener?: ControlledDialogProps["Opener"];
  BackButton?: React.ReactElement<Record<string, unknown>>;
  ConfirmButton?: React.ReactElement<Record<string, unknown>>;
  open: ControlledDialogProps["open"];
  setOpen: ControlledDialogProps["setOpen"];
  title: string;
  description?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  handleDiscard?: () => void;
}) => {
  const handleConfirm = () => {
    if (isLoading) {
      return;
    }
    onConfirm();
  };

  const handleDiscardClick = () => {
    if (!handleDiscard) {
      setOpen(false);
      return;
    }
    handleDiscard();
  };

  return (
    <StyledDialog
      open={open}
      setOpen={setOpen}
      Opener={Opener}
      title={title}
      description={description}
    >
      <div className="mt-4 flex items-center gap-2 md:gap-4">
        {React.cloneElement(BackButton, {
          ...BackButton.props,
          disabled: isLoading,
          onClick: handleDiscardClick,
        })}
        {React.cloneElement(ConfirmButton, {
          ...ConfirmButton.props,
          disabled: isLoading,
          onClick: handleConfirm,
        })}
      </div>
    </StyledDialog>
  );
};

export default ConfirmDialog;
