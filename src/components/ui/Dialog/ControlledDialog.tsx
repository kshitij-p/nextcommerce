import { Dialog as HeadlessDialog, Transition } from "@headlessui/react";
import React, { type ForwardedRef, Fragment } from "react";

const DEFAULT_DIALOG_SIZE = {
  width: "50rem" as React.CSSProperties["width"],
  height: "50rem" as React.CSSProperties["height"],
  maxWidth: "90vw" as React.CSSProperties["maxWidth"],
  maxHeight: "75vh" as React.CSSProperties["maxHeight"],
};

const DEFAULT_TRANSITION = {
  enter: "transition ease-out duration-300",
  hidden: "opacity-0",
  visible: "opacity-100",
  leave: "ease-in duration-200",
  as: Fragment,
};

const DEFAULT_TRANSITION_PROPS = {
  backdrop: DEFAULT_TRANSITION,
  root: DEFAULT_TRANSITION,
  container: {
    ...DEFAULT_TRANSITION,
    visible: "transform scale-100 opacity-100",
    hidden: "transform scale-90 opacity-0",
  },
};

const transitionToProps = (props: typeof DEFAULT_TRANSITION) => {
  const { enter, leave, as, visible, hidden } = props;

  return {
    enter,
    leave,
    as,
    enterFrom: hidden,
    enterTo: visible,
    leaveFrom: visible,
    leaveTo: hidden,
  };
};

export type ControlledDialogProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue"
> & {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  Root?: React.ReactElement<React.HTMLProps<HTMLElement>>;
  Opener?: React.ReactElement<Record<string, unknown>>;
  Container?: React.ReactElement<Record<string, unknown>>;
  Backdrop?: React.ReactElement<Record<string, unknown>>;
  TitleElement?: React.FunctionComponent;
  DescriptionElement?: React.FunctionComponent;
  title?: React.ReactNode;
  description?: React.ReactNode;
  size?: Partial<typeof DEFAULT_DIALOG_SIZE>;
  transitionProps?: Partial<typeof DEFAULT_TRANSITION_PROPS>;
  zIndex?: number;
};

const DefaultTitle = React.forwardRef(
  (
    { children, ...rest }: React.ComponentProps<"h2">,
    passedRef: ForwardedRef<HTMLHeadingElement>
  ) => {
    return (
      <h2 {...rest} className="text-2xl" ref={passedRef}>
        {children}
      </h2>
    );
  }
);

DefaultTitle.displayName = "DefaultTitle";

const ControlledDialog = React.forwardRef(
  (
    {
      children,
      open,
      setOpen,
      Root = <div className="fixed inset-0 flex items-center justify-center" />,
      Backdrop = (
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      ),
      Opener,
      Container = (
        <div className="h-full w-full rounded-sm bg-neutral-900 p-4" />
      ),
      TitleElement = DefaultTitle,
      DescriptionElement,
      title,
      description,
      transitionProps: passedTransitionProps = DEFAULT_TRANSITION_PROPS,
      size: passedSize = DEFAULT_DIALOG_SIZE,
      zIndex = 1500,
      ...rest
    }: ControlledDialogProps,
    passedRef: ForwardedRef<HTMLDivElement>
  ) => {
    const size = { ...DEFAULT_DIALOG_SIZE, ...passedSize };
    const {
      root: rootTransition,
      container: containerTransition,
      backdrop: backdropTransition,
    } = { ...DEFAULT_TRANSITION_PROPS, ...passedTransitionProps };

    const handleOpen = () => {
      setOpen(true);
    };

    const handleClose = () => {
      setOpen(false);
    };

    return (
      <>
        <Transition appear {...transitionToProps(rootTransition)} show={open}>
          <HeadlessDialog {...rest} onClose={handleClose} ref={passedRef}>
            <Transition.Child {...transitionToProps(backdropTransition)}>
              {Backdrop}
            </Transition.Child>
            <Transition.Child {...transitionToProps(containerTransition)}>
              {React.cloneElement(Root, {
                ...Root.props,
                style: { ...Root.props?.style, zIndex: zIndex },
                children: (
                  <HeadlessDialog.Panel
                    style={{
                      ...size,
                    }}
                  >
                    {React.cloneElement(Container, {
                      ...Container.props,
                      children: (
                        <>
                          <HeadlessDialog.Title as={TitleElement}>
                            {title}
                          </HeadlessDialog.Title>
                          <HeadlessDialog.Description as={DescriptionElement}>
                            {description}
                          </HeadlessDialog.Description>
                          {children}
                        </>
                      ),
                    })}
                  </HeadlessDialog.Panel>
                ),
              })}
            </Transition.Child>
          </HeadlessDialog>
        </Transition>
        {Opener &&
          React.cloneElement(Opener, {
            ...Opener.props,
            onClick: (e: React.MouseEvent) => {
              if (
                Opener.props?.onClick &&
                typeof Opener.props.onClick == "function"
              ) {
                Opener.props.onClick(e);
              }
              handleOpen();
            },
          })}
      </>
    );
  }
);

ControlledDialog.displayName = "ControlledDialog";

export default ControlledDialog;
