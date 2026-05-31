import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import {
  getWalletByUserId,
  ensureWallet,
  getWalletTransactions,
  createDepositRequest,
  createWithdrawalRequest,
} from "../queries/wallet";

export const walletRouter = createRouter({
  balance: authedQuery.query(async ({ ctx }) => {
    const userId = (ctx.user as any).unionId || String(ctx.user.id);
    const wallet = await ensureWallet(userId);
    return { balance: wallet.balance ?? "0" };
  }),

  transactions: authedQuery
    .input(z.object({ limit: z.number().int().min(1).max(100).optional() }).optional())
    .query(async ({ input, ctx }) => {
      const userId = (ctx.user as any).unionId || String(ctx.user.id);
      return getWalletTransactions(userId, input?.limit ?? 30);
    }),

  deposit: authedQuery
    .input(
      z.object({
        amount: z.string().min(1),
        method: z.enum(["sham_cash", "syriatel_cash", "mtn_cash"]),
        transactionNumber: z.string().optional(),
        senderPhone: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = (ctx.user as any).unionId || String(ctx.user.id);
      await createDepositRequest(
        userId,
        input.amount,
        input.method,
        input.transactionNumber,
        input.senderPhone,
      );
      return { success: true };
    }),

  withdraw: authedQuery
    .input(
      z.object({
        amount: z.string().min(1),
        method: z.enum(["sham_cash", "syriatel_cash", "mtn_cash", "bank_transfer"]),
        accountNumber: z.string().optional(),
        accountName: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = (ctx.user as any).unionId || String(ctx.user.id);
      const wallet = await getWalletByUserId(userId);
      const balance = parseFloat(wallet?.balance ?? "0");
      const amount = parseFloat(input.amount);

      if (balance < amount) {
        throw new Error("رصيدك غير كافٍ لإتمام عملية السحب");
      }

      await createWithdrawalRequest(
        userId,
        input.amount,
        input.method,
        input.accountNumber,
        input.accountName,
      );
      return { success: true };
    }),
});
