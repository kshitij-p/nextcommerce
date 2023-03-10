import { Pencil1Icon } from "@radix-ui/react-icons";
import { useSession } from "next-auth/react";
import { flushSync } from "react-dom";
import { type PageProduct } from "../../pages/products/[id]";
import { api, type RouterOutputs } from "../../utils/api";
import { TIME_IN_MS } from "../../utils/client";
import Avatar from "../Avatar";
import ConfirmDialog from "../ConfirmDialog";
import { useEditableText } from "../EditableText";
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
  starProps,
}: {
  review: ProductReview;
  canEdit: boolean;
  starProps?: React.ComponentProps<typeof StarRating>["starProps"];
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

  return (
    <div className="group relative flex">
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
          <StarRating value={rating} starProps={starProps} />
          {canEdit ? (
            <button
              className={`visible ml-2 align-baseline opacity-25 transition-all duration-300 group-hover:visible group-hover:opacity-100 group-focus:visible group-focus:opacity-100 xl:invisible xl:opacity-0`}
              onClick={() => {
                flushSync(() => {
                  setText(rating);
                });
                setEditing(true);
              }}
            >
              <Pencil1Icon className="h-full w-4 md:w-6" />
            </button>
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
    <div className="flex flex-col gap-2" key={review.id}>
      <div className="flex gap-2 md:gap-3">
        <Avatar
          src={review.user.image}
          Container={<div className="relative w-[40px] md:w-[50px]" />}
          alt={`${review.user.name ?? "Unknown user"}'s profile picture`}
        />
        <div className="flex flex-col">
          <b className="text-base md:text-xl">{`${
            review.user.name ?? "Unknown Name"
          }`}</b>
          <ReviewRating
            review={review}
            canEdit={canEdit}
            starProps={{ size: "w-4 md:w-5" }}
          />
        </div>
      </div>
      <div>
        <EditableReviewText
          className="flex"
          canEdit={canEdit}
          review={review}
          fieldToEdit={"body"}
          as={
            <ExpandableText
              className="text-zinc-400 xl:max-w-[80%]"
              maxLines={10}
            />
          }
        >
          {review.body}
        </EditableReviewText>
      </div>
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
      <div className="mt-1 flex flex-col gap-6 md:mt-2 md:gap-8">
        {status === "authenticated" ? (
          userReview ? (
            <Review review={userReview} />
          ) : (
            <CreateReview productId={product.id} />
          )
        ) : null}

        {reviews.map((review) => {
          return <Review key={review.id} review={review} />;
        })}
      </div>
    </div>
  );
};

export default Reviews;
