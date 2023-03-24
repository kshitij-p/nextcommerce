import { signIn } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import GuestPage from "../components/GuestPage";
import { extractQueryParam } from "../utils/client";

const SignInPage = () => {
  const router = useRouter();

  const callbackUrl = extractQueryParam(router.query.callbackUrl);

  useEffect(() => {
    void signIn("google", {
      redirect: true,
      callbackUrl: callbackUrl,
    });
  }, [callbackUrl]);

  return (
    <>
      <Head>Sign in | Nextcommerce</Head>
    </>
  );
};

export default GuestPage(SignInPage);
