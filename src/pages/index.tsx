import { type InferGetStaticPropsType, type GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { type RouterOutputs } from "../utils/api";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { breakpoints } from "../utils/client";
import HandDrawnArrowLeftIcon from "../components/icons/HandDrawnArrowLeftIcon";
import HandDrawnArrowRightIcon from "../components/icons/HandDrawnArrowRightIcon";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { createInnerTRPCContext } from "../server/api/trpc";
import superjson from "superjson";
import { appRouter } from "../server/api/root";

export const getStaticProps: GetStaticProps<{
  featuredProducts: RouterOutputs["product"]["getAll"]["products"];
}> = async () => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: null }),
    transformer: superjson,
  });

  const { products: featuredProducts } = await ssg.product.getAll.fetch({
    limit: 10,
  });

  return {
    props: {
      featuredProducts,
    },
    revalidate: 3600, //1 Hour in seconds
  };
};

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? "33%" : "-33%",
      opacity: 0,
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? "33%" : "-33%",
      opacity: 0,
    };
  },
};

const getLoopedIndex = ({
  min = 0,
  curr,
  max,
}: {
  min?: number;
  curr: number;
  max: number;
}) => {
  return curr > max - 1
    ? curr % max
    : curr < min
    ? max + (((curr + 1) % max) - 1)
    : curr;
};

const getProductsArray = ({
  activeIndex,
  totalProducts,
  maxProducts,
}: {
  activeIndex: number;
  totalProducts: number;
  maxProducts: number;
}) => {
  const sep = Math.floor((maxProducts - 1) / 2);
  let arr = [];
  for (let i = activeIndex - sep; i <= activeIndex + sep; i++) {
    arr.push({
      index: i,
      loopedIndex: getLoopedIndex({ max: totalProducts, curr: i }),
    });
  }
  return arr;
};

const swipeConfidenceThreshold = 500;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

const FeaturedProducts = ({
  products,
}: {
  products: RouterOutputs["product"]["getAll"]["products"] | undefined;
}) => {
  const [state, setState] = useState({
    direction: 0,
    index: 0,
    dragging: false,
  });

  const { index: activeIndex, direction } = state;

  const controlsContainerRef = useRef<HTMLDivElement>(null);

  const handleCarouselChange = (newState: typeof state) => {
    setState({ ...newState, dragging: false });
  };

  const incrementCarousel = (increment: number) => {
    handleCarouselChange({
      ...state,
      direction: increment,
      index: activeIndex + increment,
    });
  };

  if (!products) {
    return null;
  }

  //To do add image placeholder here

  return (
    <div className="flex flex-col gap-2 md:gap-4 xl:gap-8">
      <div className="flex items-center justify-between">
        <a
          className="underline-teal-anim text-2xl font-bold focus:outline-0 md:text-5xl xl:text-7xl"
          id={"featured-products"}
          href={"#featured-products"}
        >
          Featured Products
        </a>
        <div
          className="group mr-4 flex items-center gap-4 focus:outline-0 md:gap-8 xl:gap-12"
          tabIndex={0}
          onKeyUp={(e) => {
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
              e.preventDefault();
              incrementCarousel(e.key === "ArrowLeft" ? -1 : 1);
              controlsContainerRef.current?.focus();
            }
          }}
          ref={controlsContainerRef}
        >
          <button
            tabIndex={-1}
            onClick={() => incrementCarousel(-1)}
            aria-label={"Move featured products carousel to the left button"}
          >
            <HandDrawnArrowLeftIcon className="h-auto w-6 opacity-50 transition hover:opacity-100 focus:opacity-100 group-focus:opacity-100 md:w-12 xl:w-20" />
            <p className="sr-only">
              Shift featured products carousel to the left
            </p>
          </button>
          <button
            tabIndex={-1}
            onClick={() => incrementCarousel(1)}
            aria-label={"Move featured products carousel to the right button"}
          >
            <HandDrawnArrowRightIcon className="h-auto w-6 opacity-50 transition hover:opacity-100 focus:opacity-100 group-focus:opacity-100 md:w-12 xl:w-20" />
            <p className="sr-only">
              Shift featured products carousel to the right
            </p>
          </button>
        </div>
      </div>
      <div className="relative flex w-full justify-center overflow-hidden">
        <div className="aspect-square h-auto w-[34%]" />
        {/* ^ this div is to manage relative parent ctn's height and so shld
        be equal to image container's height */}
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={activeIndex}
            className="absolute inset-0 flex w-full items-center overflow-hidden"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragStart={() => {
              setState({ ...state, dragging: true });
            }}
            onDragLeave={() => {
              setState({ ...state, dragging: false });
            }}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                incrementCarousel(1);
              } else if (swipe > swipeConfidenceThreshold) {
                incrementCarousel(-1);
              }
            }}
          >
            {getProductsArray({
              activeIndex,
              totalProducts: products.length,
              maxProducts: 5,
            }).map(({ loopedIndex, index }, arrIdx) => {
              const product = products[loopedIndex];

              if (!product) {
                return null;
              }

              const isActive = index === activeIndex;

              const order = `order-[${arrIdx}]`;

              const imgContainerProps = {
                className:
                  "relative flex aspect-square h-full w-full cursor-pointer",
                draggable: false,
                onClick: isActive
                  ? state.dragging
                    ? (e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    : undefined
                  : state.dragging
                  ? undefined
                  : () => {
                      handleCarouselChange({
                        ...state,
                        index: index,
                        direction: index < activeIndex ? -1 : 1,
                      });
                    },
              };

              const ProductImage = (
                <Image
                  draggable={false}
                  className="object-cover"
                  fill
                  src={product.images?.[0]?.publicUrl ?? ""}
                  alt={`Image of ${product.title}`}
                  sizes={`(max-width: ${breakpoints.sm}) 210px, (max-width: ${breakpoints.md}) 250px, (max-width: ${breakpoints.lg}): 330px, 640px`}
                />
              );

              return (
                <div
                  className={`h-full flex-shrink-0 ${order}
                  ${
                    isActive
                      ? "z-10 w-[34%] shadow-[0px_0px_24px_6px_black] brightness-100 focus-within:scale-[102%] focus-within:shadow-[0px_0px_24px_8px_black] hover:scale-[102%] hover:shadow-[0px_0px_24px_8px_black]"
                      : "w-[16.5%] blur-[2px] brightness-[35%] data-[dragging=false]:hover:blur-0 data-[dragging=false]:hover:brightness-75 data-[dragging=false]:focus:blur-0 data-[dragging=false]:focus:brightness-75"
                  } transition duration-300`}
                  key={product.id}
                  draggable={false}
                  data-active={isActive}
                  data-dragging={state.dragging}
                >
                  {isActive ? (
                    <Link
                      {...imgContainerProps}
                      className={`${imgContainerProps.className} `}
                      href={`/products/${product.id}`}
                    >
                      {ProductImage}
                    </Link>
                  ) : (
                    <div {...imgContainerProps}>{ProductImage}</div>
                  )}
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
const Home = ({
  featuredProducts,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <>
      <Head>
        <title>Home | Nextcommerce</title>
        <style global jsx>
          {`
            header > nav,
            .hero-section {
              background: black;
            }
          `}
        </style>
      </Head>
      <div>
        <div
          className={`hero-section relative inset-0 h-[70vh] w-full max-md:max-h-[460px] lg:h-screen`}
        >
          <div className={`absolute inset-0 h-full w-full`}>
            <div
              className={`absolute inset-0 z-[2] h-full w-full bg-[url("/images/hero-fg.webp")] bg-cover bg-[left_center] brightness-90 lg:inset-[unset] lg:right-0 lg:aspect-square lg:w-[70%] lg:bg-[right_30%]`}
            />
            {/*  ^ Fg image */}
            <div
              className={`absolute inset-0 aspect-[9/16] h-full w-full bg-[url("/images/hero-bg.webp")] bg-cover bg-[left_center] brightness-90 lg:inset-[unset] lg:right-0 lg:aspect-square lg:w-[70%] lg:bg-[right_30%]`}
            />
            {/* ^ Bg image */}
            <div className="l-8 -1/2 flex h-full w-full items-center">
              <div className="ml-[5%] text-[5rem] leading-[1] tracking-wider md:mb-[7.5%] md:text-9xl lg:mb-0">
                <p className="relative z-[1] inline font-extralight">FIND</p>
                <br />
                <p className="relative z-10 inline text-[5rem] font-bold md:text-8xl">
                  YOUR <b className="font-bold">STYLE</b>
                </p>
                <br />
                <Link
                  className="relative z-[2] inline-block border-2 border-teal-500 bg-black/40 p-3 text-4xl font-light backdrop-blur-[2px] transition hover:bg-teal-800/40 focus:bg-teal-800/40 focus:outline-0 md:text-6xl"
                  href={"/products"}
                  style={{
                    boxShadow: "2px 2px 5px red, -2px 0px 5px cyan",
                  }}
                >
                  Explore now
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full px-4 py-12 md:px-8 md:py-24 xl:px-10 xl:py-28">
          <div>
            <FeaturedProducts products={featuredProducts} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
