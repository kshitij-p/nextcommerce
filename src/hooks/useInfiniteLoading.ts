import { useCallback, useRef } from "react";

const useInfiniteLoading = ({
  fetchNextPage,
  hasNextPage,
}: {
  fetchNextPage: () => void;
  hasNextPage?: boolean;
}) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const setRef = useCallback(
    (el: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!el || !hasNextPage) {
        return;
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && hasNextPage) {
            fetchNextPage();
          }
        },
        {
          threshold: [0.1],
        }
      );

      observerRef.current.observe(el);
    },
    [fetchNextPage, hasNextPage]
  );

  return setRef;
};

export default useInfiniteLoading;
