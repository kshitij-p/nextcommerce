import React from "react";
import Navbar from "./Navbar";

const Layout = ({ children }: React.PropsWithChildren) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
};

export default Layout;
