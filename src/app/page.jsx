import Link from "next/link"
import { ThemeToggle } from "@/components/ThemeToggele"
import { BentoGrid } from "@/components/bento-grid"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <main>


      {/* Hero */}
      <section className="container mx-auto px-4 py-16 md:py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-900/50 px-3 py-1 text-xs font-medium text-amber-900 dark:text-amber-100">
            New
            <span className="opacity-70">AI Thumbnail Studio</span>
          </p>
          <h2 className="mt-4 text-balance text-4xl font-bold leading-tight md:text-5xl">
            Create eye-catching YouTube thumbnails in seconds
          </h2>
          <p className="mt-4 max-w-prose mx-auto text-pretty text-muted-foreground md:text-lg leading-relaxed">
            PixineLab turns simple ideas into stunning thumbnails. Get an expert-engineered prompt, fine-tune it, and
            generate a high‑resolution image ready to download.
          </p>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <SignedIn>
              <Link
                href="/imagine"
                className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors w-full sm:w-auto"
              >
                Imagine Your Thumbnail
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors w-full sm:w-auto">
                  Start creating for free
                </button>
              </SignInButton>
            </SignedOut>
            <Link
              href="#gallery"
              className="rounded-md border px-4 py-2.5 text-sm font-semibold hover:bg-accent transition-colors w-full sm:w-auto"
            >
              See examples
            </Link>
          </div>
        </div>
      </section>

      {/* Bento Grid Gallery */}
      <section id="gallery" className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="text-center">
            <h3 className="text-pretty text-2xl font-semibold md:text-3xl">From simple prompts to stunning visuals</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
              Our AI understands context, style, and composition to generate thumbnails that get clicks.
            </p>
          </div>

          <div className="mt-8">
            <BentoGrid
              items={[
                { src: "/BentoPlaceholder/placeholder (5).png", alt: "Bold callout thumbnail", rowspan: 2 },
                { src: "/BentoPlaceholder/placeholder (2).png", alt: "Clean product shot" },
                { src: "/BentoPlaceholder/placeholder (3).png", alt: "Vibrant contrast" },
                { src: "/BentoPlaceholder/placeholder (4).png", alt: "Creator face emphasis", colspan: 2 },
                { src: "/BentoPlaceholder/placeholder (1).png", alt: "Minimal text" },
                { src: "/BentoPlaceholder/placeholder (6).png", alt: "High contrast typography" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="features" className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center">
           <h3 className="text-pretty text-2xl font-semibold md:text-3xl">An intelligent workflow, not just a generator</h3>
        </div>
        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          <li className="rounded-lg border bg-card p-4">
            <p className="text-sm font-semibold">1. Describe your idea</p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Enter a short brief with your video title, niche, mood and any must-have elements.
            </p>
          </li>
          <li className="rounded-lg border bg-card p-4">
            <p className="text-sm font-semibold">2. Refine the prompt</p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              PixineLab rewrites it like an expert designer. Review and edit before generating.
            </p>
          </li>
          <li className="rounded-lg border bg-card p-4">
            <p className="text-sm font-semibold">3. Generate & download</p>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Create a high‑resolution thumbnail and download it instantly as PNG.
            </p>
          </li>
        </ol>
      </section>

      {/* CTA */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="rounded-xl border bg-card p-6 md:p-8">
            <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h4 className="text-pretty text-xl font-semibold md:text-2xl">Ready to create your next thumbnail?</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sign in to generate thumbnails and save your best results.
                </p>
              </div>
               <SignedIn>
                 <Link
                    href="/imagine"
                    className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors flex-shrink-0"
                  >
                    Get started
                  </Link>
               </SignedIn>
               <SignedOut>
                <SignInButton mode="modal">
                    <button className="rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors flex-shrink-0">
                        Get started for free
                    </button>
                </SignInButton>
               </SignedOut>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
    
    </main>
  )
}

