import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Providers } from "@/lib/Providers";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Header } from "@/components/Header";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Pixine Lab",
  description: "Generate YouTube thumbnails with AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        >
          <Providers>
            {/* 🎨 CHANGE: Added a wrapper div with Flexbox properties */}
            <div className="flex flex-col min-h-screen">
              <Header />

              {/* 🎨 CHANGE: Wrapped children in a <main> tag that grows */}
              <main className="flex-grow">{children}</main>

              <footer className="border-t">
                <div className="container mx-auto flex flex-col items-center justify-between gap-3 p-4 text-sm text-muted-foreground md:flex-row">
                  <p>
                    © {new Date().getFullYear()} PixineLab. All rights reserved.
                  </p>
                  <div className="flex items-center gap-4">
                    <Link
                      href="#"
                      className="hover:text-foreground transition-colors"
                    >
                      Privacy
                    </Link>
                    <Link
                      href="#"
                      className="hover:text-foreground transition-colors"
                    >
                      Terms
                    </Link>
                  </div>
                </div>
              </footer>
            </div>
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}