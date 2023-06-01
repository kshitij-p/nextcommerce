import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { Montserrat } from "next/font/google";

import { api } from "../utils/api";

import "../styles/globals.css";
import Layout from "../components/Layout";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";

const montserrat = Montserrat({ subsets: ["latin"] });

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
      toast.dismiss();
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
            font-family: ${montserrat.style.fontFamily};
          }
        `}</style>
        <Toaster
          position="bottom-left"
          toastOptions={{
            duration: 4000,
            className:
              "px-3 py-2 text-lg shadow-md md:px-4 md:py-3 md:text-xl flex-row-reverse",
            style: {
              background: "rgb(38, 38, 38)",
              color: "rgb(250, 250, 250)",
              borderRadius: "0.37rem",
              maxWidth: "90vw",
            },
          }}
        />
        <Layout loading={loading}>
          <ReactQueryDevtools initialIsOpen={false} />
          <Component {...pageProps} />
        </Layout>
      </>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
