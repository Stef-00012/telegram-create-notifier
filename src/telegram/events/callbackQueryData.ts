import { handleSettingsPanel } from "@/telegram/panels/settings";
import type { TelegramEvent } from "@/types/handlers";

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

		await ctx.localizedAnswerCallbackQuery("telegram.messages.error");
	},
} satisfies TelegramEvent<"callback_query:data">;
