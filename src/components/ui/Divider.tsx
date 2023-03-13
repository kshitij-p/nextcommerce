import React from "react";

interface DividerProps extends React.ComponentPropsWithRef<"div"> {
  color?: string;
  vertical?: boolean;
  size?: string;
  thickness?: string;
  className?: string;
  style?: React.CSSProperties;
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  (
    {
      color = "",
      vertical = false,
      thickness = "1px",
      size = "3em",
      style,
      ...rest
    },
    passedRef
  ) => {
    const width = vertical ? thickness : size;
    const height = vertical ? size : thickness;

    return (
      <div
        {...rest}
        style={{
          height: height,
          width,
          backgroundColor: color,
          ...style,
        }}
        ref={passedRef}
      />
    );
  }
);

Divider.displayName = "Divider";

export default Divider;
