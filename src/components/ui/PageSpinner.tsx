import React from "react";
import { motion } from "framer-motion";
import Loader from "./Loader";
import {
  getAnimationVariant,
  defaultAnimationTransition,
} from "../../utils/animationHelpers";

const PageSpinner = ({ children }: React.PropsWithChildren) => {
  return (
    <motion.div
      className="absolute inset-0 flex h-screen w-full items-center justify-center"
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      variants={getAnimationVariant("fade")}
      initial={"hidden"}
      animate={"visible"}
      exit={"hidden"}
      transition={defaultAnimationTransition}
    >
      <div className="flex max-w-max flex-col items-center gap-8 text-lg tracking-wider md:text-4xl">
        <Loader height="4em" width="4em" />
        {children}
      </div>
    </motion.div>
  );
};

export default PageSpinner;
