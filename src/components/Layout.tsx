import { useSession } from "next-auth/react";
import React from "react";
import Navbar from "./Navbar";
import PageSpinner from "./PageSpinner";

const Layout = ({ children }: React.PropsWithChildren) => {
  const { status } = useSession();

  return status === "loading" ? (
    <PageSpinner />
  ) : (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
};

export default Layout;
