import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { Montserrat } from "@next/font/google";

import { api } from "../utils/api";

import "../styles/globals.css";
import Layout from "../components/Layout";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const inter = Montserrat({ subsets: ["latin"] });

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => {
      setLoading(true);
    };

    const handleEnd = () => {
      setLoading(false);
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleEnd);
    router.events.on("routeChangeError", handleEnd);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleEnd);
      router.events.off("routeChangeError", handleEnd);
    };
  }, [router]);

  return (
    <SessionProvider session={session}>
      <>
        <style jsx global>{`
          html {
            font-family: ${inter.style.fontFamily};
          }
        `}</style>
        <Layout loading={loading}>
          <ReactQueryDevtools initialIsOpen={false} />
          <Component {...pageProps} />
          <AnimatePresence>
            {loading && (
              <motion.div
                className="absolute inset-0 h-1 bg-teal-500"
                initial={{ width: "0%" }}
                animate={{ width: "25%" }}
                exit={{ width: "100%" }}
              />
            )}
          </AnimatePresence>
        </Layout>
      </>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
