import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { Montserrat } from "@next/font/google";

import { api } from "../utils/api";

import "../styles/globals.css";
import Layout from "../components/Layout";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const inter = Montserrat({ subsets: ["latin"] });

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <>
        <style jsx global>{`
          html {
            font-family: ${inter.style.fontFamily};
          }
        `}</style>
        <Layout>
          <ReactQueryDevtools initialIsOpen={false} />
          <Component {...pageProps} />
        </Layout>
      </>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
