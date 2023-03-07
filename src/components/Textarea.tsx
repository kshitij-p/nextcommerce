import React, {
  type ForwardedRef,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useFormContext } from "react-hook-form";
import useMultipleRefs from "../hooks/useMultipleRefs";

const Textarea = React.forwardRef(
  (
    {
      autoResize = false,
      cursorToTextEndOnFocus = false,
      onChange,
      onFocus,
      name,
      isInvalid = false,
      ...rest
    }: React.ComponentProps<"textarea"> & {
      autoResize?: boolean;
      cursorToTextEndOnFocus?: boolean;
      isInvalid?: boolean;
    },
    passedRef: ForwardedRef<HTMLTextAreaElement>
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const form = useFormContext();
    const state = name ? form.getFieldState(name) : undefined;
    const errorMessage = state?.error?.message;

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
      <>
        <textarea
          {...rest}
          name={name}
          aria-invalid={isInvalid || errorMessage ? "true" : "false"}
          onChange={autoResize ? handleChange : onChange}
          onFocus={cursorToTextEndOnFocus ? handleFocus : onFocus}
          ref={handleRef}
        />
        {errorMessage ? <b className="text-red-500">{errorMessage}</b> : null}
      </>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
