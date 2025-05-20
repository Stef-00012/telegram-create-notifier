import { commands } from "@/commands";
import { config } from "$config";

import { Bot } from "grammy";
import { autoThread } from "@grammyjs/auto-thread";

import db from "@/db/db";
import { eq } from "drizzle-orm";
import { chats as chatsSchema } from "./db/schemas/chats";

const socket = new WebSocket("wss://create-addons.stefdp.com/ws");

const bot = new Bot(config.token);
bot.use(autoThread());

bot.api.setMyCommands(commands);

bot.command("setcanale", async (ctx) => {
	const chatId = ctx.chat.id.toString();
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
});

// bot.command("unsetcanale", async (ctx) => {
// 	const chatId = ctx.chat.id.toString();

// 	const chat = await db.query.chats.findFirst({
// 		where: eq(chatsSchema.chatId, chatId),
// 	});

// 	if (!chat)
// 		return await ctx.reply("Questa chat non è registrata per le notifiche");

// 	await db.delete(chatsSchema).where(eq(chatsSchema.chatId, chatId));

// 	return await ctx.reply(
// 		"Questa chat è stata rimossa dalle notifiche degli addons",
// 	);
// });

bot.command("toggle", async (ctx) => {
	const chatId = ctx.chat.id.toString();
	const chatType = ctx.chat.type;

	const chat = await db.query.chats.findFirst({
		where: eq(chatsSchema.chatId, chatId),
	});

	if (!chat)
		return await ctx.reply(
			"Questa chat non è registrata per le notifiche, esegui /setchannel per registrarla",
		);

	const [newValue] = await db
		.update(chatsSchema)
		.set({
			enabled: !chat.enabled,
			chatType: chatType,
		})
		.where(eq(chatsSchema.chatId, ctx.chat.id.toString()))
		.returning({
			enabled: chatsSchema.enabled,
		});

	return await ctx.reply(
		`Le notifiche sono state ${newValue.enabled ? "abilitate" : "disabilitate"} per questa chat`,
	);
});

socket.onopen = () => {
	console.log("Connesso al WebSocket per gli addon della create");
};

socket.onclose = (event) => {
	console.log("Disconnesso dal WebSocket per gli addon della create:", event.code, event.reason);
};

socket.onerror = (error) => {
	console.error("Errore del WebSocket:", error);
};

socket.onmessage = (event) => {
	const data = JSON.parse(event.data as string);

	console.log(JSON.stringify(data, null, 4));
};

bot.start();
