import { Hono } from "hono";
import { handle } from "hono/vercel";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";

// We define the app
const app = new Hono().basePath("/api");

// COOP and Debug headers
app.use("*", async (c, next) => {
  c.res.headers.set("Cross-Origin-Opener-Policy", "unsafe-none");
  await next();
});

// Error handling
app.onError((err, c) => {
  console.error("[CRITICAL HONO]", err);
  return c.json({ 
    error: "Server Error", 
    message: err.message,
    details: err.stack
  }, 500);
});

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Health
app.get("/health", (c) => c.json({ status: "ok", time: new Date().toISOString(), ver: "v3" }));

// Diagnose
app.get("/diagnose", async (c) => {
  try {
    const { getDb } = await import("./queries/connection");
    await getDb().execute("SELECT 1");
    return c.json({ db: "CONNECTED", env: !!process.env.DATABASE_URL });
  } catch (e: any) {
    return c.json({ db: "FAILED", error: e.message, env: !!process.env.DATABASE_URL }, 500);
  }
});

// tRPC
app.all("/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: (opts) => createContext(opts),
    onError: ({ error, path }) => {
      console.error(`[tRPC Error] ${path}:`, error);
    },
  });
});

// Vercel Entry Point
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const PATCH = handle(app);
export const OPTIONS = handle(app);

export default handle(app);
