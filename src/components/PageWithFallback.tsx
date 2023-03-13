import { type NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import PageSpinner from "./ui/PageSpinner";

//This is a HOC whose props we will never use in this component so any here is fine.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PageWithFallback = (Page: NextPage<any>) => {
  const NewPage = (props: React.PropsWithChildren) => {
    const router = useRouter();

    if (router.isFallback) {
      return <PageSpinner />;
    }

    return <Page {...props} />;
  };

  return NewPage;
};

export default PageWithFallback;
