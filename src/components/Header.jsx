import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggele"; // Corrected typo from 'ThemeToggele'
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2">
          <span className=" playwrite-pt inline-flex font-extrabold h-9 w-9 items-center justify-center rounded-md bg-blue-600 text-white font-semibold">
            P
          </span>
          <h1 className="text-2xl  font-semibold tracking-tight"> PixineLab</h1>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/#features"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            Features
          </Link>
          <Link
            href="/#gallery"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
          >
            Gallery
          </Link>
          <ThemeToggle />
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
        </nav>
      </div>
    </header>
  );
}