import { z } from "zod";
import useForm from "../../hooks/useForm";
import useTRPCUtils from "../../hooks/useTRPCUtils";
import { api } from "../../utils/api";
import Button from "../ui/Button";
import Form from "../ui/Form";
import StarRating from "../ui/StarRating";
import UnstyledTextarea from "../ui/Textarea/UnstyledTextarea";

export const ReviewBodyValidator = z
  .string()
  .min(1, "Must have atleast 1 character");
export const ReviewRatingValidtor = z.coerce
  .number({
    required_error: "Must be a number between 1-5",
    invalid_type_error: "Must be a number between 1-5",
  })
  .min(1, "Can't be less than 1")
  .max(5, "Can't be more than 5");

const CreateReviewFormSchema = z.object({
  body: ReviewBodyValidator,
  rating: ReviewRatingValidtor,
});

type CreateReviewForm = z.infer<typeof CreateReviewFormSchema>;

const CreateReview = ({ productId }: { productId: string }) => {
  const utils = useTRPCUtils();

  const form = useForm({
    schema: CreateReviewFormSchema,
    defaultValues: {
      rating: 1,
    },
  });

  const { mutate: postReview, isLoading } = api.review.create.useMutation({
    onSuccess: async () => {
      await utils.review.getForProduct.invalidate({ productId: productId });
    },
  });

  const handleSubmit = ({ body, rating }: CreateReviewForm) => {
    postReview({ productId: productId, body: body, rating: rating });
  };

  const { onChange, ...inputProps } = form.register("rating");

  return (
    <div>
      <Form form={form} onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <StarRating
            asInput
            inputProps={inputProps}
            onRatingChange={onChange}
            value={form.getValues("rating").toString()}
          />
          <UnstyledTextarea
            {...form.register("body")}
            autoResize
            className="resize-none rounded-sm bg-neutral-800 p-1 ring-0
            transition-all focus:outline-0 focus:ring-2 focus:ring-teal-500/40 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-500/60 xl:max-w-[75%]"
            disabled={isLoading}
            placeholder="Leave your thoughts about this product..."
          />

          <Button
            className="mt-2"
            variants={{ type: "secondary" }}
            disabled={isLoading}
            type="submit"
          >
            Post review
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CreateReview;
