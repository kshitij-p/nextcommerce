import React from "react";
import Image from "./Image";

const DEFAULT_FALLBACK = "";

const Avatar = ({
  alt,
  src = DEFAULT_FALLBACK,
  className = "",
  ...rest
}: Omit<React.ComponentProps<typeof Image>, "fill" | "src"> & {
  src?: React.ComponentProps<typeof Image>["src"] | null;
}) => {
  return (
    <Image
      {...rest}
      className={`rounded-[50%] ${className}`}
      src={src ?? DEFAULT_FALLBACK}
      alt={alt}
      fill
    />
  );
};

export default Avatar;
