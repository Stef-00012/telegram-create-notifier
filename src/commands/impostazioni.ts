import db from "@/db/db";
import { eq } from "drizzle-orm";
import { chats as chatsSchema } from "@/db/schemas/chats";
import { getSettingsPanel } from "@/panels/settings";

export default {
    name: "impostazioni",
    description: "Gestisci le impostazioni del bot",
    displaySuggestions: true,
    adminOnly: true,

    async execute(bot, ctx) {
        const chatId = ctx.chatId.toString();

    	const chat = await db.query.chats.findFirst({
    		where: eq(chatsSchema.chatId, chatId),
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
    }
}