import { appRouter } from "@cub/api";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "./context.ts";

function resolvePort() {
  const value = Bun.env.PORT;

  if (value === undefined) {
    return 3000;
  }

  const port = Number(value);
  if (!Number.isInteger(port) || port < 0 || port > 65_535) {
    throw new Error("PORT must be an integer between 0 and 65535");
  }

  return port;
}

const server = Bun.serve({
  port: resolvePort(),
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/trpc" || url.pathname.startsWith("/trpc/")) {
      return fetchRequestHandler({
        endpoint: "/trpc",
        req,
        router: appRouter,
        createContext,
      });
    }
    return new Response("Not found", { status: 404 });
  },
  error(error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  },
});

console.log(`Server running at ${server.url}`);
