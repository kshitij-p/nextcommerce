import { Roboto } from "@next/font/google";
import { type InferGetStaticPropsType, type GetStaticProps } from "next";
import { getProviders, signIn } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import GuestPage from "../components/GuestPage";
import GoogleIcon from "../components/icons/GoogleIcon";
import { extractQueryParam } from "../utils/client";

const roboto = Roboto({
  subsets: ["latin"],
  weight: "500",
  preload: true,
});

export const getServerSideProps: GetStaticProps<{
  providers: NonNullable<Awaited<ReturnType<typeof getProviders>>>;
}> = async () => {
  const providers = await getProviders();

  return {
    props: {
      providers:
        providers ??
        ({} as NonNullable<Awaited<ReturnType<typeof getProviders>>>),
    },
  };
};

const SignInPage = ({
  providers,
}: InferGetStaticPropsType<typeof getServerSideProps>) => {
  const router = useRouter();

  const callbackUrl = extractQueryParam(router.query.callbackUrl);

  return (
    <>
      <Head>Sign in | Nextcommerce</Head>
      <div>
        <div>
          <button
            className="flex shrink-0 items-center justify-center gap-4 rounded-xl bg-white p-4 text-xl font-medium text-neutral-500 hover:shadow-[0px_0px_6px_3px_#4285f4] focus:shadow-[0px_0px_6px_3px_#4285f4] focus:outline focus:outline-4 focus:outline-[#4285f4]"
            onClick={() =>
              signIn(providers.google.id, {
                redirect: true,
                callbackUrl: callbackUrl,
              })
            }
            style={{
              fontFamily: roboto.style.fontFamily,
            }}
          >
            <GoogleIcon />
            {`Sign in with ${providers.google.name}`}
          </button>
          {Object.values(providers).map((provider) => {
            return <div key={provider.id}></div>;
          })}
        </div>
      </div>
    </>
  );
};

export default GuestPage(SignInPage);
