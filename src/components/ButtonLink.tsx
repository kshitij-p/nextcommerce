import Link from "next/link";
import React from "react";
import Button from "./Button";

const ButtonLink = ({
  children,
  href,
  ...rest
}: Omit<React.ComponentProps<typeof Button>, "tabIndex"> & {
  href: React.ComponentProps<typeof Link>["href"];
}) => {
  return (
    <Link className="inline-block" href={href} tabIndex={-1}>
      <Button {...rest}>{children}</Button>
    </Link>
  );
};

export default ButtonLink;
