import { type HTMLMotionProps } from "framer-motion";
import React, {
  type ForwardedRef,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useFormContext } from "react-hook-form";
import useMultipleRefs from "../../../hooks/useMultipleRefs";
import ErrorText from "../ErrorText";

const UnstyledTextarea = React.forwardRef(
  (
    {
      autoResize = false,
      cursorToTextEndOnFocus = false,
      showErrors = true,
      orientation = "vertical",
      onChange,
      onFocus,
      name,
      isInvalid = false,
      containerProps,
      errorTextProps,
      ...rest
    }: React.ComponentProps<"textarea"> & {
      autoResize?: boolean;
      cursorToTextEndOnFocus?: boolean;
      isInvalid?: boolean;
      containerProps?: React.ComponentProps<"div">;
      errorTextProps?: HTMLMotionProps<"b">;
      showErrors?: boolean;
      orientation?: "vertical" | "horizontal";
    },
    passedRef: ForwardedRef<HTMLTextAreaElement>
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const form = useFormContext();
    const state = name ? form.getFieldState(name) : undefined;
    const errorMessage = state?.error?.message;
    const initHeightRef = useRef<number | null>(null);

    //IMP NOTE: Transitioning height will make this not work properly
    const resizeToFit = useCallback(
      (el?: HTMLTextAreaElement | null) => {
        if (!autoResize || !el) {
          return;
        }
        if (initHeightRef.current === null) {
          initHeightRef.current = el.clientHeight;
        }

        const padding = parseInt(window.getComputedStyle(el).paddingBlock);

        el.style.height = `${initHeightRef.current ?? 0}px`;
        el.style.height = `${
          el.scrollHeight + (isNaN(padding) ? 0 : padding)
        }px`;
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
      <div
        {...containerProps}
        className={`flex ${
          orientation === "vertical" ? "flex-col" : "flex-row"
        } ${containerProps?.className ?? ""}`}
      >
        <textarea
          {...rest}
          name={name}
          aria-invalid={isInvalid || errorMessage ? "true" : "false"}
          onChange={autoResize ? handleChange : onChange}
          onFocus={cursorToTextEndOnFocus ? handleFocus : onFocus}
          ref={handleRef}
        />
        <ErrorText
          {...errorTextProps}
          visible={showErrors && (errorMessage?.length ? true : false)}
        >
          {errorMessage}
        </ErrorText>
      </div>
    );
  }
);

UnstyledTextarea.displayName = "UnstyledTextarea";

export default UnstyledTextarea;
