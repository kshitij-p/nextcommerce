import { type Review } from "@prisma/client";
import useTRPCUtils from "../../hooks/useTRPCUtils";
import { api } from "../../utils/api";
import EditableText, { useEditableText } from "../EditableText";
import EditableTextDialog, {
  type EditableTextProps,
} from "../EditableText/EditableTextDialog";
import { ReviewBodyValidator, ReviewRatingValidtor } from "./CreateReview";
import { type ProductReview } from "./Reviews";

export type EditableReviewFields = keyof Omit<
  Review,
  "userId" | "id" | "productId"
>;

const reviewValidators: {
  [k in EditableReviewFields]: Zod.Schema;
} = {
  body: ReviewBodyValidator,
  rating: ReviewRatingValidtor,
};

export const useEditReview = ({
  fieldToEdit,
  value,
  review,
  onMutationComplete,
}: {
  fieldToEdit: EditableReviewFields;
  value: string;
  review: ProductReview;
  onMutationComplete: () => void;
}) => {
  const utils = useTRPCUtils();

  return api.review.update.useMutation({
    onMutate: async () => {
      await utils.review.getForProduct.cancel({ productId: review.productId });

      const previousReviews = utils.review.getForProduct.getData({
        productId: review.productId,
      });

      utils.review.getForProduct.setData(
        { productId: review.productId },
        (data) => {
          if (!data) {
            return data;
          }

          return {
            ...data,
            reviews: data.reviews.map((currReview) => {
              if (currReview.id !== review.id) {
                return currReview;
              }

              return { ...review, [fieldToEdit]: value };
            }),
          };
        }
      );

      onMutationComplete();

      return { previousReviews: previousReviews };
    },
    onError: (err, _, ctx) => {
      if (!ctx) {
        return;
      }

      utils.review.getForProduct.setData(
        { productId: review.productId },
        ctx.previousReviews
      );
    },
    onSettled: async () => {
      await utils.review.getForProduct.invalidate({
        productId: review.productId,
      });
    },
  });
};

export const ReviewEditDialog = ({
  open,
  setOpen,
  onDiscard,
  review,
  fieldToEdit,
  value,
  onMutationComplete,
  canSave,
}: {
  open: EditableTextProps["open"];
  setOpen: EditableTextProps["setOpen"];
  onDiscard: EditableTextProps["onDiscard"];
  review: ProductReview;
  fieldToEdit: EditableReviewFields;
  value: string;
  onMutationComplete: () => void;
  canSave: boolean;
}) => {
  const { mutate: updateReview, isLoading } = useEditReview({
    fieldToEdit,
    review,
    value,
    onMutationComplete,
  });

  const handleSaveEditChanges = () => {
    updateReview({ id: review.id, [fieldToEdit]: value });
  };

  return (
    <EditableTextDialog
      title={`Edit this review's ${fieldToEdit as string}`}
      open={open}
      setOpen={setOpen}
      isLoading={isLoading}
      onDiscard={onDiscard}
      onSaveChanges={handleSaveEditChanges}
      canSave={canSave}
    />
  );
};

export const EditableReviewText = ({
  children,
  canEdit,
  fieldToEdit,
  review,
  ...rest
}: Omit<React.ComponentProps<"p">, "children"> & {
  children: string;
  canEdit: boolean;
  as?: React.ReactElement<Record<string, unknown>>;
  inputElement?: "textarea" | "input";
  inputContainerProps?: React.ComponentProps<"div">;
  fieldToEdit: EditableReviewFields;
  review: ProductReview;
  onChangeComplete?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
}) => {
  const {
    diagOpen,
    setDiagOpen,
    editing,
    setEditing,
    text,
    setText,
    errorMsg,
    setErrorMsg,
    onStopEditing,
  } = useEditableText();

  return (
    <EditableText
      {...rest}
      value={children}
      canEdit={canEdit}
      text={text}
      setText={setText}
      setDiagOpen={setDiagOpen}
      editing={editing}
      setEditing={setEditing}
      errorMsg={errorMsg}
      setErrorMsg={setErrorMsg}
      validatorSchema={reviewValidators[fieldToEdit]}
    >
      <ReviewEditDialog
        onMutationComplete={onStopEditing}
        onDiscard={onStopEditing}
        open={diagOpen}
        setOpen={setDiagOpen}
        fieldToEdit={fieldToEdit}
        value={text}
        review={review}
        canSave={errorMsg ? false : true}
      />
    </EditableText>
  );
};
