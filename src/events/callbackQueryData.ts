import { handleSettingsPanel } from "@/panels/settings";
import type { Event } from "@/types/handlers";

export default {
	name: "callback_query:data",

	async execute(ctx) {
		const chatId = ctx.chatId?.toString();
		const value = ctx.callbackQuery.data;

		if (value.startsWith("settings__"))
			return await handleSettingsPanel(
				ctx,
				value.replace("settings__", ""),
				chatId,
			);

		await ctx.answerCallbackQuery("Qualcosa è andati storto");
	},
} satisfies Event<"callback_query:data">;
