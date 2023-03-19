import { useState } from "react";
import useTRPCUtils from "../../hooks/useTRPCUtils";
import { api } from "../../utils/api";
import DangerDialog from "../ui/DangerDialog";
import { type ProductReview } from "./Reviews";

const DeleteReviewDialog = ({ review }: { review: ProductReview }) => {
  const utils = useTRPCUtils();

  const [open, setOpen] = useState(false);

  const { mutate: deleteReview, isLoading } = api.review.delete.useMutation({
    onSuccess: async () => {
      await utils.review.getForProduct.invalidate();
    },
    onSettled: () => {
      setOpen(false);
    },
  });

  const handleConfirmDelete = () => {
    deleteReview({ id: review.id });
  };

  return (
    <DangerDialog
      open={open}
      setOpen={setOpen}
      title={"Delete this review"}
      openerChildren={"Delete"}
      confirmButtonChildren={"Yes delete this"}
      onConfirmDelete={handleConfirmDelete}
      isLoading={isLoading}
    />
  );
};

export default DeleteReviewDialog;
