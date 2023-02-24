import React, {
  type ForwardedRef,
  useCallback,
  useEffect,
  useRef,
} from "react";
import useMultipleRefs from "../hooks/useMultipleRefs";

const Textarea = React.forwardRef(
  (
    {
      autoResize = false,
      cursorToTextEndOnFocus = false,
      onChange,
      onFocus,
      ...rest
    }: React.ComponentProps<"textarea"> & {
      autoResize?: boolean;
      cursorToTextEndOnFocus?: boolean;
    },
    passedRef: ForwardedRef<HTMLTextAreaElement>
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const resizeToFit = useCallback(
      (el?: HTMLTextAreaElement | null) => {
        if (!autoResize || !el) {
          return;
        }

        el.style.height = `${el.scrollHeight}px`;
      },
      [autoResize]
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(e);
      }
      resizeToFit(e.currentTarget);
    };

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (onFocus) {
        onFocus(e);
      }
      if (!cursorToTextEndOnFocus) {
        return;
      }
      e.currentTarget.setSelectionRange(
        e.currentTarget.value.length,
        e.currentTarget.value.length
      );
    };

    const handleRef = useMultipleRefs(
      passedRef,
      autoResize ? resizeToFit : undefined,
      textareaRef
    );

    //Resize textarea on viewport resizes
    useEffect(() => {
      const handleResize = () => {
        resizeToFit(textareaRef.current);
      };

      window.addEventListener("resize", handleResize);

      return function cleanup() {
        window.removeEventListener("resize", handleResize);
      };
    }, [resizeToFit]);

    return (
      <textarea
        {...rest}
        onChange={autoResize ? handleChange : onChange}
        onFocus={cursorToTextEndOnFocus ? handleFocus : onFocus}
        ref={handleRef}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
