import { signOut } from "next-auth/react";
import Head from "next/head";
import React, { useEffect } from "react";

const LogoutPage = () => {
  useEffect(() => {
    void signOut({
      callbackUrl: "/",
    });
  }, []);

  return (
    <>
      <Head>
        <title>Sign out | Nextcommerce</title>
      </Head>
    </>
  );
};

//Not protected by ProtectedPage HOC because we dont want this to trigger a login redirect
export default LogoutPage;
