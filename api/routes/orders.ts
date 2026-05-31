import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import {
  listOrdersByUser,
  findOrderById,
  createOrder,
  updateOrderStatus,
} from "../queries/orders";
import { findServiceBySlug } from "../queries/services";

export const ordersRouter = createRouter({
  list: authedQuery
    .input(z.object({ role: z.enum(["buyer", "seller"]).optional() }).optional())
    .query(async ({ input, ctx }) => {
      const userId = (ctx.user as any).unionId || String(ctx.user.id);
      return listOrdersByUser(userId, input?.role ?? "buyer");
    }),

  byId: authedQuery
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const order = await findOrderById(input.id) as any;
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود" });
      const userId = (ctx.user as any).unionId || String(ctx.user.id);
      if (order.buyerId !== userId && order.sellerId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "غير مصرح لك بعرض هذا الطلب" });
      }
      return order;
    }),

  create: authedQuery
    .input(
      z.object({
        serviceSlug: z.string(),
        extras: z.array(z.object({ name: z.string(), price: z.number() })).optional(),
        requirements: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const service = await findServiceBySlug(input.serviceSlug) as any;
      
      if (!service)
        throw new TRPCError({ code: "NOT_FOUND", message: "الخدمة غير موجودة" });
      if (service.status !== "active")
        throw new TRPCError({ code: "BAD_REQUEST", message: "الخدمة غير متاحة للطلب" });
      
      const userId = (ctx.user as any).unionId || String(ctx.user.id);
      if (service.sellerId === userId)
        throw new TRPCError({ code: "BAD_REQUEST", message: "لا يمكنك طلب خدمتك الخاصة" });

      const extrasTotal = input.extras?.reduce((sum, e) => sum + e.price, 0) ?? 0;
      const totalAmount = (parseFloat(service.price) + extrasTotal).toFixed(2);
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + (service.deliveryTime ?? 3));

      try {
        await createOrder({
          buyerId: userId,
          sellerId: String(service.sellerId),
          serviceId: String(service.id),
          serviceTitle: service.title,
          serviceSlug: service.slug,
          buyerName: ctx.user.name || "مشتري",
          extras: input.extras as any,
          totalAmount,
          requirements: input.requirements,
          deliveryDate,
        });
        return { success: true };
      } catch (err: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: err.message || "فشل في إتمام عملية الشراء",
        });
      }
    }),

  updateStatus: authedQuery
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["in_progress", "delivered", "revision", "completed", "cancelled"]),
        note: z.string().max(2000).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const order = await findOrderById(input.id) as any;
      if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود" });
      
      const userId = (ctx.user as any).unionId || String(ctx.user.id);
      if (order.buyerId !== userId && order.sellerId !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "غير مصرح لك بتعديل هذا الطلب" });
      }

      const isBuyer = order.buyerId === userId;
      const isSeller = order.sellerId === userId;
      const sellerStatuses = ["in_progress", "delivered", "cancelled"];
      const buyerStatuses = ["revision", "completed", "cancelled"];

      if ((isSeller && !sellerStatuses.includes(input.status)) || (isBuyer && !buyerStatuses.includes(input.status))) {
        throw new TRPCError({ code: "FORBIDDEN", message: "هذه العملية غير متاحة لدورك في الطلب" });
      }

      await updateOrderStatus(input.id, userId, input.status, input.note);
      return { success: true };
    }),
});
