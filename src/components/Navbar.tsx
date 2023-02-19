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
    <nav>
      <Link href="/">Home</Link>
      <button onClick={handleAuthButtonClick}>
        {status !== "authenticated" ? "Login" : "Logout"}
      </button>
    </nav>
  );
};

export default Navbar;
