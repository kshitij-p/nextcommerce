import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { extractQueryParam } from "../utils/client";
import { useRouter } from "next/router";

const Navbar = () => {
  const { status } = useSession();

  const router = useRouter();

  const callbackUrl = extractQueryParam(router.query.callbackUrl);

  const handleAuthButtonClick = () => {
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
  };

  return (
    <header>
      <nav className="flex items-center justify-center gap-4 p-5 text-lg font-light tracking-wider md:gap-12 md:p-6 md:text-3xl xl:gap-16 xl:p-8">
        <Link className="text-xl font-bold md:text-4xl" href="/">
          NEXT
        </Link>
        <Link
          className="underline-teal-anim focus:outline focus:outline-2 focus:outline-teal-500"
          href="/products"
        >
          Products
        </Link>
        <Link
          className="underline-teal-anim focus:outline focus:outline-2 focus:outline-teal-500"
          href="/cart"
        >
          Cart
        </Link>
        <button
          className="underline-teal-anim focus:outline focus:outline-2 focus:outline-teal-500"
          onClick={handleAuthButtonClick}
        >
          {status !== "authenticated" ? "Login" : "Logout"}
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
