import { useRef } from "react";
import { type TimeoutRef } from ".";

type TimeoutFunction = (callback: () => void, delayDuration: number) => void;

/**
 * The setTimeouthook with the same syntax as the native setTimeout.
 * Stores a ref for the timeoutID that is returned as the second item in the return array.
 *
 * Note: Its safe to exclude runAfterClearing function from useEffect dep array since this function never changes only the callback does (meaning
 * the vars in your callback need to be included not runAfterClearing function)
 *
 * @returns [runAfterClearing, timeoutRef, runTimeout]
 */
const useTimeout = () => {
  const timeoutRef: TimeoutRef = useRef(undefined);

  /**
   * Clears previous timeouts then sets a new one
   * Its safe to exclude this from useEffect dep array since this function never changes only the callback does (meaning
   * the vars in your callback need to be included not runAfterClearing function).
   * @param {Function} callback
   * @param {Number} delayDuration
   */
  const runAfterClearing: TimeoutFunction = (callback, delayDuration) => {
    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(callback, delayDuration);
  };

  /**
   * This only sets timeout and doesn't clear any previous timeouts. You will have to manage clearing timeouts manually.
   * Its safe to exclude this from useEffect dep array since this function never changes only the callback does (meaning
   * the vars in your callback need to be included not runAfterClearing function).
   * @param {Function} callback
   * @param {Number} delayDuration
   */
  const runTimeout: TimeoutFunction = (callback, delayDuration) => {
    timeoutRef.current = setTimeout(callback, delayDuration);
  };

  return {
    runAfterClearing,
    runTimeout,
    timeoutRef,
  };
};

export default useTimeout;
