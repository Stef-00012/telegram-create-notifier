import { commands } from "@/commands";
import { config } from "$config";

import { Bot } from "grammy";
import { autoThread } from "@grammyjs/auto-thread";
import WebSocket from "ws";

import db from "@/db/db";
import { eq } from "drizzle-orm";
import { chats as chatsSchema } from "@/db/schemas/chats";

import {
	type CreateMessage,
	type PingMessage,
	type PongMessage,
	type UpdateMessage,
	WSEvents,
} from "@/types/addonsWS";

const socket = new WebSocket("wss://create-addons.stefdp.com/ws");
// const socket = new WebSocket("ws://localhost:3000/ws");

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

socket.on("open", () => {
	console.log("Connesso al WebSocket per gli addon della create");
})

socket.on("close", (code, reason) => {
	console.log(
		`Disconnesso dal WebSocket per gli addon della create:\n - Code: ${code}\n - Reason: ${reason}`,
	);
})

socket.on("error", (error) => {
	console.error("Errore del WebSocket:", error);
})

socket.on("message", async (data) => {
	const message = JSON.parse(data.toString()) as
		| CreateMessage
		| UpdateMessage
		| PingMessage;

	if (message.type === WSEvents.PING) {
		const pong: PongMessage = {
			type: WSEvents.PONG,
		};

		socket.send(JSON.stringify(pong));
	}

	const chats = await db.query.chats.findMany();

	if (message.type === WSEvents.CREATE) {
		console.log(data)
		for (const addon of message.data) {
			const msg = `Nuovo addon aggiunto: ${addon.name} (https://modrinth.com/mod/${addon.slug})`;

			for (const chat of chats) {
				if (chat.topicId) {
					await bot.api.sendMessage(chat.chatId, msg, {
						message_thread_id: Number.parseInt(chat.topicId),
					});

					continue;
				}

				await bot.api.sendMessage(chat.chatId, msg);
			}
		}
	}

	if (message.type === WSEvents.UPDATE) {
		console.log(data)
		for (const addon of message.data) {
			let msg = `Addon aggiornato: ${addon.name} (https://modrinth.com/mod/${addon.slug})\n`;

			for (const key in addon.changes) {
				msg += `\n${key}: ${addon.changes[key as keyof typeof addon.changes].old} => ${key}: ${addon.changes[key as keyof typeof addon.changes].new}`;
			}

			for (const chat of chats) {
				if (chat.topicId) {
					await bot.api.sendMessage(chat.chatId, msg, {
						message_thread_id: Number.parseInt(chat.topicId),
					});

					continue;
				}

				await bot.api.sendMessage(chat.chatId, msg);
			}
		}
	}
})

bot.start();
