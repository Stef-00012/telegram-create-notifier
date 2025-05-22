import { handleSettingsPanel } from "@/panels/settings";

export default {
    name: "callback_query:data",

    async execute(bot, ctx) {
        const chatId = ctx.chatId?.toString();
    	const value = ctx.callbackQuery.data;
    
    	if (value.startsWith("settings__")) return await handleSettingsPanel(
    	    ctx,
    	    value.replace("settings__", ""),
    	    chatId
    	)
    	
    	await ctx.answerCallbackQuery("Qualcosa è andati storto")
    }
}