import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import PageSpinner from "../components/ui/PageSpinner";

const SignoutPage = () => {
  const { status } = useSession();

  const router = useRouter();

  useEffect(() => {
    if (status === "loading" || !router.isReady) {
      return;
    }

    if (status === "authenticated") {
      void signOut({
        callbackUrl: "/",
      });
      return;
    }

    void router.replace("/");
  }, [status, router]);

  return (
    <>
      <Head>
        <title>Sign out | Nextcommerce</title>
      </Head>
      <PageSpinner />
    </>
  );
};

//Not protected by ProtectedPage HOC because we dont want this to trigger a login redirect
export default SignoutPage;
