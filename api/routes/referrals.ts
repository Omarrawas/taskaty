import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "../middleware";
import { 
  getReferralStats, 
  getReferralLink, 
  validateReferralCode,
  processReferral
} from "../queries/referrals";

export const referralsRouter = createRouter({
  stats: authedQuery.query(async ({ ctx }) => {
    const userId = (ctx.user as any).unionId || String(ctx.user.id);
    return await getReferralStats(userId);
  }),

  link: authedQuery.query(async ({ ctx }) => {
    const userId = (ctx.user as any).unionId || String(ctx.user.id);
    const link = await getReferralLink(userId);
    return { link };
  }),

  validate: publicQuery
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const valid = await validateReferralCode(input.code);
      return { valid };
    }),

  process: publicQuery
    .input(z.object({ 
      userId: z.string(), 
      referralCode: z.string() 
    }))
    .mutation(async ({ input }) => {
      await processReferral(input.userId, input.referralCode);
      return { success: true };
    }),
});
