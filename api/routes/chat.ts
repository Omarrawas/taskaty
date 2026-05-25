import { z } from "zod/v4";
import { createRouter, authedQuery } from "../middleware";
import {
  listConversations,
  listMessages,
  findOrCreateConversation,
  createMessage,
} from "../queries/chat";

export const chatRouter = createRouter({
  conversations: authedQuery.query(async ({ ctx }) => {
    return listConversations(ctx.user.id);
  }),

  messages: authedQuery
    .input(z.object({ conversationId: z.number().int() }))
    .query(async ({ input }) => {
      return listMessages(input.conversationId);
    }),

  send: authedQuery
    .input(
      z.object({
        receiverId: z.number().int(),
        content: z.string().min(1).max(2000),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const conv = await findOrCreateConversation(ctx.user.id, input.receiverId);
      await createMessage({
        conversationId: conv.id,
        senderId: ctx.user.id,
        content: input.content,
      });
      return { success: true, conversationId: conv.id };
    }),
});
