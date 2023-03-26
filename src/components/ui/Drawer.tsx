import React, { Fragment, useState } from "react";
import Dialog from "./Dialog";

const Drawer = ({
  children,
  zIndex = 1400,
  ...rest
}: React.ComponentProps<typeof Dialog>) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog
      {...rest}
      open={open}
      setOpen={setOpen}
      Root={<div className="fixed inset-0 flex items-start justify-start" />}
      size={{
        maxHeight: "100vh",
        height: "100vh",
        maxWidth: "85vw",
      }}
      transitionProps={{
        container: {
          enter: "transition ease-out duration-300",
          leave: "ease-in duration-200",
          hidden: "-translate-x-full",
          visible: "translate-x-0",
          as: Fragment,
        },
      }}
      zIndex={zIndex}
    >
      {children}
    </Dialog>
  );
};

export default Drawer;
