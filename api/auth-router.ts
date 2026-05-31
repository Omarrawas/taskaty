import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { 
  updateUserProfile, 
  changeUserPassword, 
  getUserSettings, 
  updateUserSettings,
  deleteUserAccount 
} from "./queries/users";

export const authRouter = createRouter({
  // me requires auth - returns the current user from context
  me: authedQuery.query((opts) => opts.ctx.user),

  // logout is PUBLIC - Firebase handles session invalidation on client side.
  // The server just needs to acknowledge. No token required since Firebase
  // auth.signOut() already happened before this is called.
  logout: publicQuery.mutation(async () => {
    return { success: true };
  }),

  updateProfile: authedQuery
    .input(
      z.object({
        name: z.string().min(2).max(100).optional(),
        phone: z.string().max(20).optional(),
        avatar: z.string().url().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = (ctx.user as any).unionId || String(ctx.user.id);
      const updatedUser = await updateUserProfile(userId, input);
      return updatedUser;
    }),

  changePassword: authedQuery
    .input(
      z.object({
        newPassword: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = (ctx.user as any).unionId || String(ctx.user.id);
      await changeUserPassword(userId, input.newPassword);
      return { success: true };
    }),

  getSettings: authedQuery.query(async ({ ctx }) => {
    const userId = (ctx.user as any).unionId || String(ctx.user.id);
    const settings = await getUserSettings(userId);
    return settings;
  }),

  updateSettings: authedQuery
    .input(
      z.object({
        notifications: z.object({
          orderUpdates: z.boolean().optional(),
          messages: z.boolean().optional(),
          payments: z.boolean().optional(),
          promotions: z.boolean().optional(),
        }).optional(),
        privacy: z.object({
          showEmail: z.boolean().optional(),
          showPhone: z.boolean().optional(),
          showProfile: z.boolean().optional(),
        }).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = (ctx.user as any).unionId || String(ctx.user.id);
      const settings = await updateUserSettings(userId, input);
      return settings;
    }),

  deleteAccount: authedQuery.mutation(async ({ ctx }) => {
    const userId = (ctx.user as any).unionId || String(ctx.user.id);
    await deleteUserAccount(userId);
    return { success: true };
  }),
});
