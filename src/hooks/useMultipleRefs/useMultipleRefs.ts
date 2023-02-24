import { useCallback } from "react";

const useMultipleRefs = (
  ...refs: Array<
    | React.MutableRefObject<unknown>
    | React.RefCallback<unknown>
    | undefined
    | null
  >
) => {
  return useCallback((el: unknown) => {
    refs.forEach((ref) => {
      if (ref) {
        if (typeof ref === "function") {
          ref(el);
        } else {
          ref.current = el;
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refs);
};

export default useMultipleRefs;
