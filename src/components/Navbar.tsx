import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

const Navbar = () => {
  const { status } = useSession();

  const handleAuthButtonClick = () => {
    if (status !== "authenticated") {
      void signIn();
      return;
    }
    void signOut();
  };

  return (
    <header>
      <nav className="flex items-center justify-center gap-4 p-5 text-lg font-light tracking-wider md:gap-12 md:p-6 md:text-3xl xl:gap-16 xl:p-8">
        <Link className="text-xl font-bold md:text-4xl" href="/">
          NEXT
        </Link>
        <Link href="/products">Products</Link>
        <div>Cart</div>
        <button onClick={handleAuthButtonClick}>
          {status !== "authenticated" ? "Login" : "Logout"}
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
