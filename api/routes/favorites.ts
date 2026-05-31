import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { 
  addFavorite, 
  removeFavorite, 
  listFavorites, 
  isFavorited,
  toggleFavorite,
  countFavorites
} from "../queries/favorites";

export const favoritesRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const userId = (ctx.user as any).unionId || String(ctx.user.id);
    return await listFavorites(userId);
  }),

  toggle: authedQuery
    .input(z.object({ serviceId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = (ctx.user as any).unionId || String(ctx.user.id);
      const result = await toggleFavorite(userId, input.serviceId);
      return result;
    }),

  add: authedQuery
    .input(z.object({ serviceId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = (ctx.user as any).unionId || String(ctx.user.id);
      await addFavorite(userId, input.serviceId);
      return { success: true };
    }),

  remove: authedQuery
    .input(z.object({ serviceId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = (ctx.user as any).unionId || String(ctx.user.id);
      await removeFavorite(userId, input.serviceId);
      return { success: true };
    }),

  isFavorited: authedQuery
    .input(z.object({ serviceId: z.string() }))
    .query(async ({ input, ctx }) => {
      const userId = (ctx.user as any).unionId || String(ctx.user.id);
      const favorited = await isFavorited(userId, input.serviceId);
      return { favorited };
    }),

  count: authedQuery.query(async ({ ctx }) => {
    const userId = (ctx.user as any).unionId || String(ctx.user.id);
    const count = await countFavorites(userId);
    return { count };
  }),
});
