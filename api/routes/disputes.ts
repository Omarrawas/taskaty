import { z } from "zod";
import { createRouter, authedQuery, adminQuery } from "../middleware";
import {
  createDispute,
  listDisputes,
  getDisputeById,
  listDisputesByUser,
  resolveDispute,
} from "../queries/disputes";

export const disputesRouter = createRouter({
  create: authedQuery
    .input(
      z.object({
        orderId: z.string(),
        reason: z.string().min(3, "يرجى إدخال سبب النزاع"),
        description: z.string().min(10, "يرجى كتابة وصف تفصيلي"),
        evidence: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = (ctx.user as any).unionId || String(ctx.user.id);
      const userName = (ctx.user as any).name || "مستخدم";
      return createDispute({
        ...input,
        openedBy: userId,
        openedByName: userName,
      });
    }),

  myDisputes: authedQuery.query(async ({ ctx }) => {
    const userId = (ctx.user as any).unionId || String(ctx.user.id);
    return listDisputesByUser(userId);
  }),

  byId: authedQuery
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const dispute = await getDisputeById(input.id);
      if (!dispute) throw new Error("النزاع غير موجود");
      return dispute;
    }),

  adminList: adminQuery
    .input(z.object({ status: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return listDisputes(input?.status);
    }),

  adminResolve: adminQuery
    .input(
      z.object({
        id: z.string(),
        decision: z.enum(["buyer_favor", "seller_favor", "cancelled"]),
        adminNote: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return resolveDispute(input.id, input.decision, input.adminNote);
    }),
});
