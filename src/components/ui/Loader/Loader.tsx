import React from "react";
import LOADER_VARIANTS from "./util/variants";

interface LoaderProps extends React.ComponentPropsWithRef<"div"> {
  variant?: keyof typeof LOADER_VARIANTS;
  height?: string;
  width?: string;
}

const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  (
    { variant = "default", height = "1em", width = "1em", ...rest },
    passedRef
  ) => {
    const data = LOADER_VARIANTS[variant];

    return (
      <div {...rest} ref={passedRef}>
        <style>{data.css(width, height)}</style>
        {data.html}
      </div>
    );
  }
);

Loader.displayName = "Loader";

export default Loader;
