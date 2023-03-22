import { type Transition, type Variants } from "framer-motion";

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
} as const;

export const animationVariants = {
  fade: {
    variants: {
      visible: {
        ...animSettings.autoAlpha.visible,
      },
      hidden: {
        ...animSettings.autoAlpha.hidden,
      },
    },
    directional: false,
  },
  zoom: {
    variants: {
      visible: {
        ...animSettings.autoAlpha.visible,
        scale: animSettings.endScale,
      },
      hidden: {
        ...animSettings.autoAlpha.hidden,
        scale: animSettings.startScale,
      },
    },
    directional: false,
  },
  scaleY: {
    variants: {
      visible: {
        ...animSettings.autoAlpha.visible,
        scaleY: animSettings.endScale,
      },
      hidden: {
        ...animSettings.autoAlpha.hidden,
        scaleY: animSettings.startScale,
      },
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
    variants: {
      visible: {
        opacity: 0.5,
      },
      hidden: {
        opacity: 1,
      },
    },
    directional: false,
  },
  none: {
    variants: {
      visible: {},
      hidden: {},
    },
    directional: false,
  },
} as const;

export const defaultAnimationTransition: Transition = {
  type: "tween",
  duration: 0.3,
  ease: "easeIn",
};

export const getAnimationVariant = <T extends keyof typeof animationVariants>({
  type,
  direction,
}: (typeof animationVariants)[T]["directional"] extends true
  ? {
      type: T;
      direction: keyof (typeof animationVariants)[T];
    }
  : {
      type: T;
      direction?: undefined;
    }) => {
  let transition = animationVariants[type];

  if (transition.directional) {
    return transition[
      direction as Exclude<typeof direction, undefined>
    ] as Variants;
  }

  return transition.variants;
};

export type AnimationVariant = Parameters<
  typeof getAnimationVariant
>[0]["type"];

export const getAnimationInitial = (
  anim: keyof typeof animationVariants,
  unmountOnChange: boolean
) => {
  return unmountOnChange ? anim : false;
};

const DEFAULT_TRANSITION_ANIMATION = {
  enter: "transition ease-out duration-300",
  hidden: "opacity-0",
  visible: "opacity-100",
  leave: "ease-in duration-200",
};

export const getTransitionAnimation = (
  passedTransitionAnimation: Partial<typeof DEFAULT_TRANSITION_ANIMATION>
) => {
  const { enter, leave, hidden, visible } = {
    ...DEFAULT_TRANSITION_ANIMATION,
    ...passedTransitionAnimation,
  };

  return {
    enter,
    leave,
    enterFrom: hidden,
    enterTo: visible,
    leaveFrom: visible,
    leaveTo: hidden,
  };
};
