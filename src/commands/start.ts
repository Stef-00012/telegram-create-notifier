import { localize } from "@/functions/localize";
import type { Command } from "@/types/handlers";
import { InlineKeyboard } from "grammy";

export default {
	name: "start",
	description: "Displays a welcom message",
	displaySuggestion: true,
	adminOnly: true,

	async execute(ctx) {
		const openSourceButton = new InlineKeyboard()
			.url(
				localize(ctx.locale, "commands.start.buttons.viewSource"),
				"https://github.com/Stef-00012/telegram-create-notifier",
			)
			.row();

		return await ctx.localizedReply("commands.start.messages.success", {
			reply_markup: openSourceButton,
			parse_mode: "HTML",
		});
	},
} satisfies Command;
