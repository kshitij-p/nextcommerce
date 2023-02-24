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
