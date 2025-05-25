import type { Command } from "@/types/handlers";

export default {
	name: "setchannel",
	description: "Set the channel where to send the notifications of the addons",
	displaySuggestion: true,

	async execute(ctx) {
		if (!ctx.isAdmin) return;

		const chatId = ctx.chatId.toString();
		const topicId = ctx.msg.is_topic_message
			? ctx.msg.message_thread_id?.toString()
			: null;
		const chatType = ctx.chat.type;

		const [newChat] = await ctx.db
			.insert(ctx.dbSchemas.chats)
			.values({
				chatId: chatId,
				chatType: chatType,
				topicId: topicId,
				enabled: true,
			})
			.onConflictDoUpdate({
				set: {
					topicId: topicId,
					chatType: chatType,
					enabled: true,
				},
				target: ctx.dbSchemas.chats.chatId,
			})
			.returning({
				locale: ctx.dbSchemas.chats.locale
			});

		return await ctx.localizedReply("commands.setchannel.messages.success", null, newChat.locale)
	},
} satisfies Command;
