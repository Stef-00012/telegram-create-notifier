import { localize } from "@/functions/localize";
import type { TelegramCommand } from "@/types/handlers";
import { InlineKeyboard } from "grammy";

export default {
	name: "start",
	description: "Displays a welcome message",
	displaySuggestion: true,
	adminOnly: true,

	async execute(ctx) {
		const openSourceButton = new InlineKeyboard()
			.url(
				localize(ctx.locale, "telegram.commands.start.buttons.viewSource"),
				"https://git.stefdp.com/Stef/telegram-create-notifier",
			)
			.row();

		return await ctx.localizedReply("telegram.commands.start.messages.success", {
			other: {
				reply_markup: openSourceButton,
				parse_mode: "HTML",
				link_preview_options: {
					is_disabled: true,
				}
			},
			variables: {
				link_start: `<a href="${process.env.DISCORD_INVITE_URL || "https://discord.com/oauth2/authorize?client_id=1390937506710683708"}">`,
				link_end: '</a>',
			}
		});
	},
} satisfies TelegramCommand;
