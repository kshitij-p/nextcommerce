import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";

//This is HOC whose props we will never use in this component so any here is fine.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ProtectedPage = (Page: NextPage<any>) => {
  const NewPage = (props: React.PropsWithChildren) => {
    const { status } = useSession();
    const router = useRouter();

    //To do throw a spinner here
    if (status === "loading" || !router.isReady) {
      return <div>Loading...</div>;
    }

    if (status === "unauthenticated") {
      void router.replace(
        `/api/auth/signin?${new URLSearchParams({
          callbackUrl: window.location.href,
        }).toString()}`
      );

      return <div>Loading...</div>;
    }

    return <Page {...props} />;
  };

  return NewPage;
};

export default ProtectedPage;
