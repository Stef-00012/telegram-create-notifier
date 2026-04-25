import { getSettingsPanel } from "@/telegram/panels/settings";
import type { TelegramCommand } from "@/types/handlers";

export default {
	name: "settings",
	description: "Manage the settings of the bot",
	displaySuggestion: true,
	adminOnly: true,

	async execute(ctx) {
		if (!ctx.dbChat)
			return ctx.localizedReply("telegram.commands.settings.messages.notConfigured");

		const settingsPanel = await getSettingsPanel("home", ctx.locale, {
			enabled: ctx.dbChat.enabled,
		});

		ctx.localizedReply("telegram.commands.settings.messages.success", {
			reply_markup: settingsPanel,
		});
	},
} satisfies TelegramCommand;
