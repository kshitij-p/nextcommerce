import React from "react";
import { FALLBACK_IMG_URL } from "../../utils/client";
import Image from "./Image/Image";

const Avatar = ({
  alt,
  src = FALLBACK_IMG_URL,
  className = "",
  ...rest
}: Omit<React.ComponentProps<typeof Image>, "fill" | "src"> & {
  src?: React.ComponentProps<typeof Image>["src"] | null;
}) => {
  return (
    <Image
      {...rest}
      className={`rounded-[50%] ${className}`}
      src={src ?? FALLBACK_IMG_URL}
      alt={alt}
      fill
    />
  );
};

export default Avatar;
