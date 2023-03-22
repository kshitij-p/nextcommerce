import React, { type ForwardedRef } from "react";
import { type HTMLMotionProps, motion, AnimatePresence } from "framer-motion";
import { getAnimationVariant } from "../../utils/animationHelpers";

const ErrorText = React.forwardRef(
  (
    {
      visible,
      children,
      className = "",
      ...rest
    }: Omit<HTMLMotionProps<"b">, "variants"> & {
      visible: boolean;
    },
    passedRef: ForwardedRef<HTMLBaseElement>
  ) => {
    return (
      <AnimatePresence>
        {visible && (
          <motion.b
            {...rest}
            className={`text-[0.75em] font-medium text-red-500 ${className}`}
            variants={getAnimationVariant({ type: "fade" })}
            initial={"hidden"}
            animate={"visible"}
            exit={"hidden"}
            ref={passedRef}
          >
            {children}
          </motion.b>
        )}
      </AnimatePresence>
    );
  }
);

ErrorText.displayName = "ErrorText";

export default ErrorText;
