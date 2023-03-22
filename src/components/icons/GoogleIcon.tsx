import Image from "next/image";
import React from "react";

const GoogleIcon = ({
  width = 24,
  height = 24,
  ...rest
}: Omit<React.ComponentProps<typeof Image>, "src" | "alt">) => {
  return (
    <Image
      {...rest}
      width={width}
      height={height}
      src={"/icons/google-logo.png"}
      alt={"google logo"}
    />
  );
};

export default GoogleIcon;
