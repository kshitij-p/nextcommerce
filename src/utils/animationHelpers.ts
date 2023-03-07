import { type Variants } from "framer-motion";

const animSettings = {
  startScale: "0%",
  endScale: "100%",
  autoAlpha: {
    visible: {
      opacity: 1,
      visibility: "visible",
    },
    hidden: {
      opacity: 0,
      transitionEnd: {
        visibility: "hidden",
      },
    },
  },
  transformTransitionEnd: {
    transitionEnd: {
      transform: "none",
    },
  },
};

export const animationVariants = {
  fade: {
    visible: {
      ...animSettings.autoAlpha.visible,
    },
    hidden: {
      ...animSettings.autoAlpha.hidden,
    },
    directional: false,
  },
  zoom: {
    visible: {
      ...animSettings.autoAlpha.visible,
      scale: animSettings.endScale,
    },
    hidden: {
      ...animSettings.autoAlpha.hidden,
      scale: animSettings.startScale,
    },
    directional: false,
  },
  scaleY: {
    visible: {
      ...animSettings.autoAlpha.visible,
      scaleY: animSettings.endScale,
    },
    hidden: {
      ...animSettings.autoAlpha.hidden,
      scaleY: animSettings.startScale,
    },
    directional: false,
  },
  slide: {
    left: {
      visible: {
        transform: "translateX(0%)",
        ...animSettings.transformTransitionEnd,
      },
      hidden: {
        transform: "translateX(-101%)",
      },
    },
    right: {
      visible: {
        transform: "translateX(0%)",
        ...animSettings.transformTransitionEnd,
      },
      hidden: {
        transform: "translateX(101%)",
      },
    },
    top: {
      visible: {
        transform: "translateY(0%)",
        ...animSettings.transformTransitionEnd,
      },
      hidden: {
        transform: "translateY(-101%)",
      },
    },
    bottom: {
      visible: {
        transform: "translateY(0%)",
        ...animSettings.transformTransitionEnd,
      },
      hidden: {
        transform: "translateY(101%)",
      },
    },
    directional: true,
  },
  pulsate: {
    visible: {
      opacity: 0.5,
    },
    hidden: {
      opacity: 1,
    },
    directional: false,
  },
  none: {
    visible: {},
    hidden: {},
    directional: false,
  },
};

export const defaultAnimationTransition = {
  type: "tween",
  duration: 0.3,
};

export const getAnimationVariant = (
  anim: Variants | keyof typeof animationVariants,
  direction?: "top" | "left" | "right" | "bottom"
) => {
  if (typeof anim !== "object") {
    let transition = animationVariants[anim];

    if (transition) {
      if (transition.directional && direction) {
        let directionalVariant = transition as {
          top: Variants;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          left: any;
          bottom: Variants;
          right: Variants;
          directional: true;
        };

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return directionalVariant[direction];
      }

      return animationVariants[anim];
    }

    throw new Error("Invalid animation variant name provided.");
  }

  return anim;
};

export const getAnimationInitial = (
  anim: keyof typeof animationVariants,
  unmountOnChange: boolean
) => {
  return unmountOnChange ? anim : false;
};
