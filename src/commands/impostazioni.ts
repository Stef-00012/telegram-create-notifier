import { getSettingsPanel } from "@/panels/settings";
import type { Command } from "@/types/handlers";
import { eq } from "drizzle-orm";

export default {
	name: "impostazioni",
	description: "Gestisci le impostazioni del bot",
	displaySuggestion: true,

	async execute(ctx) {
		const allowed = await ctx.adminOnly(ctx);

		if (!allowed) return;

		const chatId = ctx.chatId.toString();

		const chat = await ctx.db.query.chats.findFirst({
			where: eq(ctx.dbSchemas.chats.chatId, chatId),
		});

		if (!chat)
			return ctx.reply(
				"Questa chat non è configurata per le notifiche degli addon",
			);

		const settingsPanel = await getSettingsPanel("home", {
			enabled: chat.enabled,
		});

		ctx.reply("Impostazioni per le notifiche degli addon della create", {
			reply_markup: settingsPanel,
		});
	},
} satisfies Command;
