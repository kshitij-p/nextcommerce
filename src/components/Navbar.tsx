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
    <header className="sticky inset-0 z-[1300] bg-neutral-1000/50 backdrop-blur-[6px]">
      <nav className="flex items-center justify-center gap-4 p-2 text-lg font-light tracking-wider md:gap-12 md:p-4 md:text-3xl xl:gap-16 [&>*]:shrink-0">
        <Link className="text-xl font-bold md:text-4xl" href="/">
          NEXT
        </Link>

        <Link
          className="underline-teal-anim focus:outline focus:outline-2 focus:outline-teal-500"
          href="/cart"
        >
          Cart
        </Link>

        <Link
          className="underline-teal-anim focus:outline focus:outline-2 focus:outline-teal-500"
          href="/products"
          prefetch={false}
        >
          Products
        </Link>
        <AuthButton className="hidden xl:inline-block" />
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
