import { type NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "../utils/api";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";

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

const FeaturedProducts = () => {
  const { data } = api.product.getAll.useQuery({
    limit: 10,
  });

  const products = data?.products;

  const [state, setState] = useState({
    direction: 0,
    index: 0,
    dragging: false,
  });

  const { index: activeIndex, direction } = state;

  const activeImgRef = useRef<HTMLDivElement>(null);

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
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Featured Products</h3>
        <div className="mr-4">
          <button onClick={() => incrementCarousel(-1)}>
            <ArrowLeftIcon className="h-auto w-6" />
          </button>
          <button onClick={() => incrementCarousel(1)}>
            <ArrowRightIcon className="h-auto w-6" />
          </button>
        </div>
      </div>
      <div className="relative flex w-full justify-center overflow-hidden">
        <div className="aspect-square h-auto w-[34%]" ref={activeImgRef} />
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
              maxProducts: 10,
            }).map(({ loopedIndex, index }, arrIdx) => {
              const product = products[loopedIndex];

              if (!product) {
                return null;
              }

              const isActive = index === activeIndex;

              const order = `order-[${arrIdx}]`;

              const imgContainerProps = {
                className: "relative flex aspect-square h-full w-full",
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
                />
              );

              return (
                <div
                  className={`h-full flex-shrink-0 ${order}
                  ${
                    isActive
                      ? "z-10 w-[34%] brightness-100"
                      : "w-[16.5%] brightness-[35%]"
                  } transition`}
                  key={product.id}
                  draggable={false}
                  style={{
                    boxShadow: isActive ? "0px 0px 24px 6px black" : "",
                  }}
                >
                  {isActive ? (
                    <Link
                      {...imgContainerProps}
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

const Home: NextPage = () => {
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
        <div className={`hero-section relative inset-0 h-screen w-full`}>
          <div className={`absolute inset-0 h-full w-full`}>
            <div
              className={`absolute inset-0 z-[2] h-full w-full bg-[url("/images/hero-5-fg.png")] bg-cover bg-[left_center] brightness-90 lg:inset-[unset] lg:right-0 lg:aspect-square lg:w-[70%] lg:bg-[right_30%]`}
            />
            {/*  ^ Fg image */}
            <div
              className={`absolute inset-0 aspect-[9/16] h-full w-full bg-[url("/images/hero-5.jpg")] bg-cover bg-[left_center] brightness-90 lg:inset-[unset] lg:right-0 lg:aspect-square lg:w-[70%] lg:bg-[right_30%]`}
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
            <FeaturedProducts />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
