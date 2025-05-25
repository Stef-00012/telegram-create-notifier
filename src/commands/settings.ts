import { getSettingsPanel } from "@/panels/settings";
import type { Command } from "@/types/handlers";

export default {
	name: "settings",
	description: "Manage the settings of the bot",
	displaySuggestion: true,

	async execute(ctx) {
		if (!ctx.isAdmin) return;

		if (!ctx.dbChat)
			return ctx.localizedReply("commands.settings.messages.notConfigured")

		const settingsPanel = await getSettingsPanel("home", ctx.locale, {
			enabled: ctx.dbChat.enabled,
		});

		ctx.localizedReply("commands.settings.messages.success", {
			reply_markup: settingsPanel,
		});
	},
} satisfies Command;
