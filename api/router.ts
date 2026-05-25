import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { categoriesRouter } from "./routes/categories";
import { servicesRouter } from "./routes/services";
import { sellersRouter } from "./routes/sellers";
import { ordersRouter } from "./routes/orders";
import { walletRouter } from "./routes/wallet";
import { reviewsRouter } from "./routes/reviews";
import { chatRouter } from "./routes/chat";
import { adminRouter } from "./routes/admin";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  categories: categoriesRouter,
  services: servicesRouter,
  sellers: sellersRouter,
  orders: ordersRouter,
  wallet: walletRouter,
  reviews: reviewsRouter,
  chat: chatRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
