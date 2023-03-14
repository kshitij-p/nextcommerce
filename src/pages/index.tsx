import { type NextPage } from "next";
import Head from "next/head";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Home | Nextcommerce</title>
      </Head>
      <div>
        <div className={`relative inset-0 -z-[1] h-screen w-full`}>
          <div className={`absolute inset-0 -z-[1] h-full w-full`}>
            <div
              className={`absolute inset-0 h-full w-full bg-[url("/images/hero-5-fg.png")] bg-cover bg-[left_center] brightness-90 lg:inset-[unset] lg:right-0 lg:aspect-square lg:w-[70%] lg:bg-[right_30%]`}
            />
            {/*  ^Bg image */}
            <div
              className={`absolute inset-0 -z-[1] aspect-[9/16] h-full w-full bg-[url("/images/hero-5.jpg")] bg-cover bg-[left_center] brightness-90 lg:inset-[unset] lg:right-0 lg:aspect-square lg:w-[70%] lg:bg-[right_30%]`}
            />
            {/* ^ Fg image */}
            <div className="l-8 -1/2 flex h-full w-full items-center">
              <div className="ml-[5%] text-[5rem] leading-[1] tracking-wider md:mb-[7.5%] md:text-9xl lg:mb-0">
                <p className="inline font-extralight">FIND</p>
                <br />
                <p className="relative z-10 inline text-[5rem] font-bold md:text-8xl">
                  YOUR STYLE
                </p>
                <br />
                <button className="relative z-[1] border-2 border-teal-500 bg-black/40 p-3 text-[2.75rem] font-light hover:bg-teal-800/60 focus:bg-teal-800/60 focus:outline-0 md:text-6xl ">
                  Explore now
                </button>
              </div>
            </div>
          </div>
        </div>
        <div>Featured Collection</div>
      </div>
    </>
  );
};

export default Home;
