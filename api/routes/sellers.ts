import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { listTopSellers, findSellerById } from "../queries/sellers";

export const sellersRouter = createRouter({
  list: publicQuery
    .input(z.object({ limit: z.number().int().min(1).max(100).optional() }).optional())
    .query(async ({ input }) => {
      try {
        return await listTopSellers(input?.limit ?? 10);
      } catch (err: any) {
        return [];
      }
    }),

  profile: publicQuery
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        return await findSellerById(input.id);
      } catch (err: any) {
        return { id: input.id, name: "مورد غير متاح حالياً", avatar: "", bio: "حدث خطأ في الاتصال بقاعدة البيانات." };
      }
    }),
});
