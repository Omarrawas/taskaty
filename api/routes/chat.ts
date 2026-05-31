import { z } from "zod";
import { createRouter, authedQuery } from "../middleware";
import { 
  listConversations, 
  listMessages, 
  createMessage, 
  findOrCreateConversation 
} from "../queries/chat";

export const chatRouter = createRouter({
  conversations: authedQuery.query(async ({ ctx }) => {
    const userId = (ctx.user as any).unionId || String(ctx.user.id);
    return await listConversations(userId);
  }),

  messages: authedQuery
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ input }) => {
      return await listMessages(input.conversationId);
    }),

  send: authedQuery
    .input(
      z.object({
        receiverUnionId: z.string(),
        content: z.string().min(1).max(2000),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const senderId = (ctx.user as any).unionId || String(ctx.user.id);
      const conv = await findOrCreateConversation(senderId, input.receiverUnionId);
      
      if (!conv) throw new Error("فشل في بدء المحادثة");
      
      await createMessage({
        conversationId: conv.id,
        senderId,
        content: input.content,
      });

      return { success: true, conversationId: conv.id };
    }),
});

