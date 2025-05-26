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
				ctx.locale,
				chatId,
			);

		await ctx.localizedAnswerCallbackQuery("messages.error");
	},
} satisfies Event<"callback_query:data">;
