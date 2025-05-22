import db from "@/db/db";
import { chats as chatsSchema } from "@/db/schemas/chats";

export default {
    name: "setcanale",
    description: "Setta il canale in cui mandare le notifiche delle mod",
    displaySuggestions: true,
    adminOnly: true,

    async execute(bot, ctx) {
        const chatId = ctx.chatId.toString();
    	const topicId = ctx.msg.is_topic_message
    		? ctx.msg.message_thread_id?.toString()
    		: null;
    	const chatType = ctx.chat.type;
    
    	await db
    		.insert(chatsSchema)
    		.values({
    			chatId: chatId,
    			chatType: chatType,
    			topicId: topicId,
    			enabled: true,
    		})
    		.onConflictDoUpdate({
    			set: {
    				topicId: topicId,
    				chatType: chatType,
    				enabled: true,
    			},
    			target: chatsSchema.chatId,
    		});
    
    	return await ctx.reply(
    		"Questa chat è stata configurata per le notifiche degli addons",
    	);
    }
}