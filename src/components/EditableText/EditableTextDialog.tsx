import Button from "../ui/Button";
import { type ControlledDialogProps } from "../ui/Dialog/ControlledDialog";
import StyledDialog from "../ui/StyledDialog";

export type EditableTextProps = {
  open: ControlledDialogProps["open"];
  setOpen: ControlledDialogProps["setOpen"];
  title: string;
  isLoading: boolean;
  onDiscard: () => void;
  onSaveChanges: () => void;
  canSave: boolean;
};

const EditableTextDialog = ({
  open,
  setOpen,
  title,
  isLoading,
  onDiscard,
  onSaveChanges,
  canSave,
}: EditableTextProps) => {
  return (
    <StyledDialog
      open={open}
      setOpen={setOpen}
      title={title}
      description="Are you sure you want to do this ?"
    >
      <div className="mt-1 flex flex-wrap items-center gap-2 md:mt-2 md:gap-4">
        <Button
          variants={{ type: "secondary", size: "sm" }}
          onClick={() => setOpen(false)}
          disabled={isLoading}
        >
          Keep editing
        </Button>
        <Button
          variants={{ type: "secondary", size: "sm" }}
          onClick={onDiscard}
          disabled={isLoading}
        >
          Discard Changes
        </Button>
        <Button
          variants={{ size: "sm" }}
          onClick={onSaveChanges}
          disabled={!canSave || isLoading}
        >
          Save changes
        </Button>
      </div>
    </StyledDialog>
  );
};

export default EditableTextDialog;
