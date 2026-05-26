import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";

const app = new Hono();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

try {
  app.use("/api/trpc/*", async (c) => {
    const res = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: c.req.raw,
      router: appRouter,
      createContext,
    });
    return res;
  });
  app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));
} catch (e) {
  console.error("Failed to initialize API routes:", e);
}

export default app;

if (env.isProduction && !process.env.VERCEL) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);
  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

