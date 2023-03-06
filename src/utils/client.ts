import { type Product } from "@prisma/client";
import { type QueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";
import { api } from "./api";

export const TIME_IN_MS = {
  FIVE_MINUTES: 1000 * 60 * 5,
} as const;

export const invalidateProducts = async (queryClient: QueryClient) => {
  const queryKey = getQueryKey(api.product.getAll);

  await queryClient.cancelQueries(queryKey);

  await queryClient.invalidateQueries(getQueryKey(api.product.getAll), {
    refetchType: "all",
  });
};

export const getReviewsQueryKey = (productId: Product["id"]) => {
  return getQueryKey(
    api.review.getForProduct,
    { productId: productId },
    "query"
  );
};

export const invalidateReviewsQuery = async ({
  queryClient,
  productId,
}: {
  queryClient: QueryClient;
  productId: Product["id"];
}) => {
  await queryClient.invalidateQueries(getReviewsQueryKey(productId));
};
