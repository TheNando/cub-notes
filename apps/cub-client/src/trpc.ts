import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@cub/api";

export const trpc = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: "/trpc" })],
});
