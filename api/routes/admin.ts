import { z } from "zod/v4";
import { createRouter, adminQuery } from "../middleware";
import {
  getAdminStats,
  listUsers,
  listPendingServices,
  approveService,
  rejectService,
  listAllOrders,
  listWithdrawalRequests,
} from "../queries/admin";

export const adminRouter = createRouter({
  stats: adminQuery.query(async () => {
    return getAdminStats();
  }),

  users: adminQuery.query(async () => {
    return listUsers();
  }),

  services: adminQuery.query(async () => {
    return listPendingServices();
  }),

  approveService: adminQuery
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      return approveService(input.id);
    }),

  rejectService: adminQuery
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      return rejectService(input.id);
    }),

  orders: adminQuery.query(async () => {
    return listAllOrders();
  }),

  withdrawals: adminQuery.query(async () => {
    return listWithdrawalRequests();
  }),
});
