import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { extractQueryParam } from "../utils/client";
import { useRouter } from "next/router";
import Drawer from "./ui/Drawer";
import { HamburgerMenuIcon } from "@radix-ui/react-icons";
import React, { type ForwardedRef } from "react";

const AuthButton = React.forwardRef(
  (
    {
      className = "",
      ...rest
    }: Omit<React.ComponentProps<"button">, "onClick">,
    passedRef: ForwardedRef<HTMLButtonElement>
  ) => {
    const { status } = useSession();

    const router = useRouter();

    const callbackUrl = extractQueryParam(router.query.callbackUrl);

    return (
      <button
        {...rest}
        className={`underline-teal-anim focus:outline focus:outline-2 focus:outline-teal-500 ${className}`}
        onClick={() => {
          if (status !== "authenticated") {
            void signIn("google", {
              redirect: true,
              callbackUrl: callbackUrl,
            });
            return;
          }
          void signOut({
            callbackUrl: "/",
          });
        }}
        ref={passedRef}
      >
        {status !== "authenticated" ? "Login" : "Logout"}
      </button>
    );
  }
);

AuthButton.displayName = "AuthButton";

const Navbar = () => {
  return (
    <header className="sticky inset-0 z-[1300] bg-slate-700/25 backdrop-blur">
      <nav className="flex items-center justify-center gap-4 py-2 text-lg font-normal tracking-wider md:gap-12 md:py-3 md:text-xl xl:gap-16 [&>*]:shrink-0">
        <div className="flex items-center justify-center gap-[inherit] xl:w-full xl:justify-around [&>*]:shrink-0">
          <Link
            className="rounded-sm text-xl font-bold transition hover:text-teal-100 focus:outline focus:outline-2 focus:outline-teal-500 focus-visible:text-teal-100 md:text-3xl"
            href="/"
          >
            NEXT
          </Link>

          <div className="flex items-center justify-center gap-[inherit] [&>*]:shrink-0">
            <Link
              className="underline-teal-anim focus:outline focus:outline-2 focus:outline-teal-500"
              href="/products"
              prefetch={false}
            >
              Products
            </Link>

            <Link
              className="underline-teal-anim focus:outline focus:outline-2 focus:outline-teal-500"
              href="/cart"
            >
              Cart
            </Link>
            <AuthButton className="hidden xl:inline-block" />
          </div>
        </div>
        <Drawer
          Container={
            <div className="h-full w-full bg-teal-900/10 p-8 text-3xl backdrop-blur md:p-14 md:text-6xl" />
          }
          Opener={
            <button className="p-1 focus:outline focus:outline-2 focus:outline-teal-500 xl:hidden">
              <HamburgerMenuIcon className="aspect-square h-auto w-5 md:w-8" />
            </button>
          }
        >
          <AuthButton />
        </Drawer>
      </nav>
    </header>
  );
};

export default Navbar;
