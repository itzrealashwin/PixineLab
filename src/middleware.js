import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// By default, this will protect all routes including api/trpc routes.
// See https://clerk.com/docs/references/nextjs/clerk-middleware for more information about configuring your Middleware
export default clerkMiddleware({
  publicRoutes: ["/"]
});
export const config = {
  matcher: ["/((?!.+.[w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
