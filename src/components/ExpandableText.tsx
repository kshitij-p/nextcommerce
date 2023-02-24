import React, {
  type ForwardedRef,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

interface OpenerProps {
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  targetId: string;
}

const DefaultOpener: React.FC<OpenerProps> = ({
  expanded,
  setExpanded,
  targetId,
}) => {
  const handleOnClick = () => {
    setExpanded(!expanded);
  };

  return (
    <button
      onClick={handleOnClick}
      className="text-md text-[0.75em] font-semibold tracking-wider transition hover:text-blue-200 focus:text-blue-200"
      style={{
        appearance: "none",
        WebkitAppearance: "none",
        background: "transparent",
      }}
      aria-controls={targetId}
      aria-expanded={expanded}
    >
      {expanded ? "Show less" : "Read more"}
    </button>
  );
};

const ExpandableText = React.forwardRef(
  (
    {
      children,
      defaultValue = false,
      maxLines,
      maxHeight,
      lineHeight = 1.2,
      transition = "0.3s ease",
      styles,
      Opener = DefaultOpener,
      ...rest
    }: Omit<React.ComponentPropsWithRef<"div">, "defaultValue"> & {
      defaultValue?: boolean;
      maxLines?: number;
      maxHeight?: React.CSSProperties["maxHeight"];
      lineHeight?: number;
      transition?: React.CSSProperties["transition"];
      Opener?: React.FC<OpenerProps>;
      styles?: React.CSSProperties;
    },
    passedRef: ForwardedRef<HTMLDivElement>
  ) => {
    const [expanded, setExpanded] = useState(defaultValue);
    const textRef = useRef<HTMLParagraphElement | null>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    const id = useId();

    const shrunkHeight =
      maxLines !== undefined
        ? `calc(${maxLines} * ${lineHeight} * 1em )`
        : maxHeight;

    const truncStyles: React.CSSProperties = {
      lineHeight: lineHeight,
      maxHeight: expanded
        ? textRef.current?.scrollHeight ?? "auto"
        : shrunkHeight,
      overflow: "hidden",
      transition: transition,
    };

    const renderOpener = () => {
      return (
        <Opener expanded={expanded} setExpanded={setExpanded} targetId={id} />
      );
    };

    useEffect(() => {
      if (!textRef.current) {
        return;
      }

      const checkOverflow = () => {
        if (!textRef.current) {
          return;
        }
        setIsOverflowing(
          textRef.current.scrollHeight !== textRef.current.clientHeight
        );
      };
      checkOverflow();

      const observer = new MutationObserver(() => {
        checkOverflow();
      });

      observer.observe(textRef.current, {
        subtree: true,
        characterData: true,
        attributes: false,
      });

      window.addEventListener("resize", checkOverflow);

      return function cleanup() {
        window.removeEventListener("resize", checkOverflow);
        observer.disconnect();
      };
    }, []);

    return (
      <div
        {...rest}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
        id={id}
        ref={passedRef}
      >
        <p style={{ ...styles, ...truncStyles }} ref={textRef}>
          {children}
        </p>
        {isOverflowing ? renderOpener() : null}
      </div>
    );
  }
);

ExpandableText.displayName = "ExpandableText";

export default ExpandableText;
