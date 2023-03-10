import NextImage from "next/image";
import React, { type ForwardedRef } from "react";

const DEFAULT_CONTAINER_PROPS = {
  position: "relative" as Exclude<React.CSSProperties["position"], undefined>,
  height: "max-content" as Exclude<React.CSSProperties["height"], undefined>,
};

const Image = React.forwardRef(
  (
    {
      fill,
      Container = <div />,
      containerProps: passedContainerProps = DEFAULT_CONTAINER_PROPS,
      aspectRatio = "1 / 1",
      width,
      ...rest
    }: React.ComponentProps<typeof NextImage> & {
      Container?: React.ReactElement<
        React.ComponentProps<"div"> & Record<string, unknown>
      >;
      containerProps?: Partial<typeof DEFAULT_CONTAINER_PROPS>;
      aspectRatio?: string;
      width?: string;
    },
    passedRef: ForwardedRef<HTMLDivElement | HTMLImageElement>
  ) => {
    const { position: containerPosition, height: containerHeight } = {
      ...DEFAULT_CONTAINER_PROPS,
      ...passedContainerProps,
    };

    const renderImage = () => {
      return (
        <NextImage
          {...rest}
          fill={fill}
          ref={fill ? undefined : (passedRef as ForwardedRef<HTMLImageElement>)}
        />
      );
    };

    return fill
      ? React.cloneElement(Container, {
          ...Container.props,
          className: `${Container.props.className ?? ""}`,
          style: {
            ...Container.props?.style,
            aspectRatio: aspectRatio,
            width: width,
            height: containerHeight,
            position: containerPosition,
          },
          children: renderImage(),
          ref: passedRef,
        })
      : renderImage();
  }
);

Image.displayName = "Image";

export default Image;
