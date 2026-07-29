import { initTRPC } from "@trpc/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

const t = initTRPC.create();

const appRouter = t.router({
  greeting: t.procedure.query(() => "Hello from Bun and tRPC!"),
});

export type AppRouter = typeof appRouter;

Bun.serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/trpc")) {
      return fetchRequestHandler({
        endpoint: "/trpc",
        req,
        router: appRouter,
        createContext: () => ({}),
      });
    }
    return new Response("Not found", { status: 404 });
  },
});

console.log("Server running at http://localhost:3000");
