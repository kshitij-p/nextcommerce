import { useSession } from "next-auth/react";
import React from "react";
import Navbar from "./Navbar";
import PageSpinner from "./ui/PageSpinner";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import {
  defaultAnimationTransition,
  getAnimationVariant,
} from "../utils/animationHelpers";

const Layout = ({
  children,
  loading,
}: React.PropsWithChildren & {
  loading: boolean;
}) => {
  const { status } = useSession();
  const router = useRouter();

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        {status === "loading" || loading ? (
          <PageSpinner />
        ) : (
          <motion.main
            key={router.route}
            variants={getAnimationVariant({
              type: "fade",
            })}
            initial={"hidden"}
            animate={"visible"}
            transition={defaultAnimationTransition}
          >
            {children}
          </motion.main>
        )}
      </AnimatePresence>
    </>
  );
};

export default Layout;
