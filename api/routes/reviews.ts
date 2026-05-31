import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "../middleware";
import {
  listReviewsByService,
  listReviewsBySeller,
  createReview,
  findReviewByOrderAndReviewer,
} from "../queries/reviews";
import { findOrderById } from "../queries/orders";
import { TRPCError } from "@trpc/server";

export const reviewsRouter = createRouter({
  byService: publicQuery
    .input(z.object({ serviceId: z.string() }))
    .query(async ({ input }) => {
      try {
        return await listReviewsByService(input.serviceId);
      } catch {
        return [];
      }
    }),

  bySeller: publicQuery
    .input(z.object({ sellerId: z.string() }))
    .query(async ({ input }) => {
      try {
        return await listReviewsBySeller(input.sellerId);
      } catch {
        return [];
      }
    }),

  byOrderForMe: authedQuery
    .input(z.object({ orderId: z.string() }))
    .query(async ({ input, ctx }) => {
      const order = await findOrderById(input.orderId) as any;
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود" });

      const userId = (ctx.user as any).unionId || String(ctx.user.id);
      if (order.buyerId !== userId && order.sellerId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "غير مصرح لك بعرض تقييم هذا الطلب" });
      }

      return findReviewByOrderAndReviewer(input.orderId, userId);
    }),

  create: authedQuery
    .input(
      z.object({
        orderId: z.string(),
        revieweeId: z.string(),
        rating: z.number().int().min(1).max(5),
        comment: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const order = await findOrderById(input.orderId) as any;
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود" });
      if (order.status !== "completed")
        throw new TRPCError({ code: "BAD_REQUEST", message: "يجب أن يكون الطلب مكتملاً للتقييم" });

      const userId = (ctx.user as any).unionId || String(ctx.user.id);
      const isBuyer = order.buyerId === userId;
      const isSeller = order.sellerId === userId;
      
      if (!isBuyer && !isSeller)
        throw new TRPCError({ code: "FORBIDDEN", message: "غير مصرح لك بإضافة تقييم" });

      const expectedRevieweeId = isBuyer ? order.sellerId : order.buyerId;
      if (input.revieweeId !== expectedRevieweeId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكن تقييم طرف غير مرتبط بهذا الطلب" });
      }

      const existing = await findReviewByOrderAndReviewer(input.orderId, userId);
      if (existing) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "تم تقييم هذا الطلب مسبقاً" });
      }

      try {
        await createReview({
          orderId: input.orderId,
          reviewerId: userId,
          revieweeId: input.revieweeId,
          type: isBuyer ? "buyer_to_seller" : "seller_to_buyer",
          rating: input.rating,
          comment: input.comment,
        });
      } catch (err: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: err.message || "تعذر حفظ التقييم",
        });
      }
      return { success: true };
    }),
});
