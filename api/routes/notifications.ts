import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { 
  listNotifications, 
  markNotificationRead, 
  markAllNotificationsRead,
  countUnreadNotifications
} from "../queries/notifications";

export const notificationsRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const userId = (ctx.user as any).unionId || String(ctx.user.id);
    return await listNotifications(userId);
  }),

  unreadCount: authedQuery.query(async ({ ctx }) => {
    const userId = (ctx.user as any).unionId || String(ctx.user.id);
    const count = await countUnreadNotifications(userId);
    return { count };
  }),

  markRead: authedQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const userId = (ctx.user as any).unionId || String(ctx.user.id);
      await markNotificationRead(userId, input.id);
      return { success: true };
    }),

  markAllRead: authedQuery.mutation(async ({ ctx }) => {
    const userId = (ctx.user as any).unionId || String(ctx.user.id);
    await markAllNotificationsRead(userId);
    return { success: true };
  }),
});
