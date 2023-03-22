import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import PageSpinner from "./ui/PageSpinner";

//This is HOC whose props we will never use in this component so any here is fine.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const GuestPage = (Page: NextPage<any>) => {
  const NewPage = (props: React.PropsWithChildren) => {
    const { status } = useSession();
    const router = useRouter();

    if (status === "loading" || !router.isReady) {
      return <PageSpinner />;
    }

    if (status === "authenticated") {
      void router.replace("/");

      return <PageSpinner />;
    }

    return <Page {...props} />;
  };

  return NewPage;
};

export default GuestPage;
