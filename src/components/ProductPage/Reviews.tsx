import { useSession } from "next-auth/react";
import { flushSync } from "react-dom";
import { type PageProduct } from "../../pages/products/[id]";
import { api, type RouterOutputs } from "../../utils/api";
import { TIME_IN_MS } from "../../utils/client";
import ConfirmDialog from "../ConfirmDialog";
import { useEditableText } from "../EditableText";
import EditableHoverButton from "../EditableText/EditableHoverButton";
import ExpandableText from "../ExpandableText";
import StarRating from "../StarRating";
import CreateReview from "./CreateReview";
import DeleteReviewDialog from "./DeleteReviewDialog";
import { EditableReviewText, useEditReview } from "./EditReview";

export type ProductReview =
  RouterOutputs["review"]["getForProduct"]["reviews"][0];

const ReviewRating = ({
  review,
  canEdit,
}: {
  review: ProductReview;
  canEdit: boolean;
}) => {
  const {
    text,
    setText,
    diagOpen,
    setDiagOpen,
    editing,
    setEditing,
    onStopEditing,
  } = useEditableText();

  const { mutate: updateReview, isLoading } = useEditReview({
    fieldToEdit: "rating",
    value: text,
    onMutationComplete: onStopEditing,
    review: review,
  });

  const rating = `${review.rating}`;

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget)) {
      return;
    }
    if (rating.trim() === text.trim()) {
      setEditing(false);
      return;
    }
    setDiagOpen(true);
  };

  const handleConfirm = () => {
    updateReview({ id: review.id, rating: text });
  };

  //To do replace rating with a star rating component

  return (
    <div className="group relative">
      {editing ? (
        <StarRating
          autoFocusActive
          onBlur={handleBlur}
          asInput={true}
          inputProps={{
            onClick: (e) => {
              if (e.currentTarget.value === text) {
                setEditing(false);
                return;
              }
              setDiagOpen(true);
            },
          }}
          onRatingChange={(e) => {
            setText(e.currentTarget.value);
          }}
          value={text}
        />
      ) : (
        <>
          <StarRating value={rating} />
          {canEdit ? (
            <EditableHoverButton
              onClick={() => {
                flushSync(() => {
                  setText(rating);
                });
                setEditing(true);
              }}
            />
          ) : null}
        </>
      )}

      <ConfirmDialog
        open={diagOpen}
        setOpen={setDiagOpen}
        title={`Edit this review's rating`}
        isLoading={isLoading}
        onConfirm={handleConfirm}
        handleDiscard={onStopEditing}
      />
    </div>
  );
};

const Review = ({ review }: { review: ProductReview }) => {
  const { data: session } = useSession();

  const canEdit = review.userId === session?.user?.id;

  return (
    <div key={review.id}>
      <p>{`Posted by: ${review.user.name ?? "Unknown Name"}`}</p>
      <ReviewRating review={review} canEdit={canEdit} />
      <EditableReviewText
        className="flex"
        canEdit={canEdit}
        review={review}
        fieldToEdit={"body"}
        as={
          <ExpandableText
            className="mt-2 text-zinc-400 md:mt-3 xl:max-w-[80%]"
            maxLines={10}
          />
        }
      >
        {review.body}
      </EditableReviewText>
      {canEdit ? <DeleteReviewDialog review={review} /> : null}
    </div>
  );
};

const Reviews = ({ product }: { product: PageProduct }) => {
  const { status } = useSession();

  const {
    data: { reviews, userReview },
  } = api.review.getForProduct.useQuery(
    { productId: product.id },
    {
      staleTime: TIME_IN_MS.FIVE_MINUTES,
      initialData: { message: "Initial data", reviews: [] },
      initialDataUpdatedAt: 0,
    }
  );

  return (
    <div className="flex flex-col gap-2">
      <b className="text-2xl md:text-4xl">Reviews</b>
      {status === "authenticated" ? (
        userReview ? (
          <Review review={userReview} />
        ) : (
          <CreateReview productId={product.id} />
        )
      ) : null}

      <div className="flex flex-col">
        {reviews.map((review) => {
          return <Review key={review.id} review={review} />;
        })}
      </div>
    </div>
  );
};

export default Reviews;
