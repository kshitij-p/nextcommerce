import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import useForm from "../../hooks/useForm";
import { api } from "../../utils/api";
import { invalidateReviewsQuery } from "../../utils/client";
import Button from "../Button";
import Form from "../Form";
import LabelledInput from "../LabelledInput";
import Textarea from "../Textarea";

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
  const queryClient = useQueryClient();

  const form = useForm({ schema: CreateReviewFormSchema });

  const { mutate: postReview, isLoading } = api.review.create.useMutation({
    onSuccess: async () => {
      await invalidateReviewsQuery({
        queryClient: queryClient,
        productId: productId,
      });
    },
  });

  const handleSubmit = ({ body, rating }: CreateReviewForm) => {
    postReview({ productId: productId, body: body, rating: rating });
  };

  return (
    <div>
      <Form form={form} onSubmit={handleSubmit}>
        <div className="flex flex-col">
          <b>Write a review</b>
          <Textarea
            {...form.register("body")}
            disabled={isLoading}
            placeholder="Leave your thoughts about this product..."
          />
          <LabelledInput {...form.register("rating")} disabled={isLoading} />
          <Button type="submit">Create</Button>
        </div>
      </Form>
    </div>
  );
};

export default CreateReview;
