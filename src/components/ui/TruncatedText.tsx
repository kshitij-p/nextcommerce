import React from "react";

const TruncatedText = ({
  children,
  maxLines,
  lineHeight = 1.5,
  className = "",
  ...rest
}: React.ComponentProps<"p"> & {
  maxLines: number;
  lineHeight?: number;
}) => {
  return (
    <p
      {...rest}
      className={`truncate whitespace-normal ${className}`}
      //Max height = 3 lines. 1em = fontsize, 1.5 = lineheight
      style={{ maxHeight: `calc(1em * ${lineHeight} * ${maxLines})`, lineHeight: lineHeight }}
    >
      {children}
    </p>
  );
};

export default TruncatedText;
