import { z } from "zod/v4";
import { createRouter, authedQuery } from "../middleware";
import {
  listConversations,
  listMessages,
  sendMessage,
} from "../queries/chat";

export const chatRouter = createRouter({
  conversations: authedQuery.query(async ({ ctx }) => {
    return listConversations(ctx.user.id);
  }),

  messages: authedQuery
    .input(z.object({ otherId: z.number().int() }))
    .query(async ({ input, ctx }) => {
      return listMessages(ctx.user.id, input.otherId);
    }),

  send: authedQuery
    .input(
      z.object({
        receiverId: z.number().int(),
        content: z.string().min(1).max(2000),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return sendMessage({
        senderId: ctx.user.id,
        receiverId: input.receiverId,
        content: input.content,
      });
    }),
});
