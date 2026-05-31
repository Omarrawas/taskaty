import { z } from "zod";
import { createRouter, adminQuery } from "../middleware";
import {
  getAdminStats,
  listUsers,
  listPendingServices,
  approveService,
  rejectService,
  listAllOrders,
  listWithdrawalRequests,
  updateUserRole,
  deleteUser,
} from "../queries/admin";
import {
  listPaymentProofs,
  approvePaymentProof,
  updateWithdrawalRequest,
  adjustUserBalance,
} from "../queries/wallet";

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
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return approveService(input.id);
    }),

  rejectService: adminQuery
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return rejectService(input.id);
    }),

  orders: adminQuery.query(async () => {
    return listAllOrders();
  }),

  withdrawals: adminQuery.query(async () => {
    return listWithdrawalRequests();
  }),

  deposits: adminQuery.query(async () => {
    return listPaymentProofs();
  }),

  approveDeposit: adminQuery
    .input(z.object({ id: z.string(), userId: z.string(), amount: z.string() }))
    .mutation(async ({ input }) => {
      return approvePaymentProof(input.id, input.userId, input.amount);
    }),

  updateWithdrawal: adminQuery
    .input(z.object({ 
      id: z.string(), 
      status: z.enum(["approved", "rejected"]),
      adminNote: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      return updateWithdrawalRequest(input.id, input.status, input.adminNote);
    }),

  adjustBalance: adminQuery
    .input(z.object({ userId: z.string(), amount: z.string(), description: z.string() }))
    .mutation(async ({ input }) => {
      return adjustUserBalance(input.userId, input.amount, input.description);
    }),

  updateRole: adminQuery
    .input(z.object({ userId: z.string(), role: z.string() }))
    .mutation(async ({ input }) => {
      return updateUserRole(input.userId, input.role);
    }),

  deleteUser: adminQuery
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      return deleteUser(input.userId);
    }),
});
