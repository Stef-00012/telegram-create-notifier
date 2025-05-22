import type { Command } from "@/types/handlers";

export default {
	name: "setcanale",
	description: "Setta il canale in cui mandare le notifiche delle mod",
	displaySuggestion: true,

	async execute(ctx) {
		const allowed = await ctx.adminOnly(ctx);

		if (!allowed) return;

		const chatId = ctx.chatId.toString();
		const topicId = ctx.msg.is_topic_message
			? ctx.msg.message_thread_id?.toString()
			: null;
		const chatType = ctx.chat.type;

		await ctx.db
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
			});

		return await ctx.reply(
			"Questa chat è stata configurata per le notifiche degli addons",
		);
	},
} satisfies Command;
