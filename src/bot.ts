import { commands } from "@/commands";
import { config } from "$config";

import { Bot, InlineKeyboard } from "grammy";
import { autoThread } from "@grammyjs/auto-thread";

import WebSocket from "ws";

import db from "@/db/db";
import { eq } from "drizzle-orm";
import { chats as chatsSchema, type DBEvents } from "@/db/schemas/chats";

import {
	type CreateMessage,
	type PingMessage,
	type PongMessage,
	type UpdateMessage,
	type WSAddon,
	type WSAddonKeys,
	WSEvents,
} from "@/types/addonsWS";
import {
	addKeyNames,
	removeKeyNames,
	keyNames,
	supportTypes,
} from "@/constants/keys";
import { compareArrays } from "@/functions/util";
import { getSettingsPanel, type Sections } from "@/panels/settings";

const socket = new WebSocket("wss://create-addons.stefdp.com/ws");

const bot = new Bot(config.token);
bot.use(autoThread());

bot.api.setMyCommands(commands);

bot.command("setcanale", async (ctx) => {
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
});

// bot.command("unsetcanale", async (ctx) => {
// 	const chatId = ctx.chatId.toString();

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

// bot.command("toggle", async (ctx) => {
// 	const chatId = ctx.chatId.toString();
// 	const chatType = ctx.chat.type;

// 	const chat = await db.query.chats.findFirst({
// 		where: eq(chatsSchema.chatId, chatId),
// 	});

// 	if (!chat)
// 		return await ctx.reply(
// 			"Questa chat non è registrata per le notifiche, esegui /setchannel per registrarla",
// 		);

// 	const [newValue] = await db
// 		.update(chatsSchema)
// 		.set({
// 			enabled: !chat.enabled,
// 			chatType: chatType,
// 		})
// 		.where(eq(chatsSchema.chatId, ctx.chatId.toString()))
// 		.returning({
// 			enabled: chatsSchema.enabled,
// 		});

// 	return await ctx.reply(
// 		`Le notifiche sono state ${newValue.enabled ? "abilitate" : "disabilitate"} per questa chat`,
// 	);
// });

bot.command("impostazioni", async (ctx) => {
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
});

bot.on("callback_query:data", async (ctx) => {
	const chatId = ctx.chatId?.toString();
	const value = ctx.callbackQuery.data;

	if (!chatId) return ctx.answerCallbackQuery("Qualcosa è andato storto");

	const oldChat = await db.query.chats.findFirst({
		where: eq(chatsSchema.chatId, chatId),
	});

	if (!oldChat) return ctx.reply("Qualcosa è andato storto");

	if (value.startsWith("go__")) {
		const section = value.replace("go__", "") as Sections;

		const settingsPanel = await getSettingsPanel(section, {
			filteredKeys: oldChat.filteredKeys,
			enabled: oldChat.enabled,
			events: oldChat.events,
		});

		return ctx.editMessageReplyMarkup({
			reply_markup: settingsPanel,
		});
	}

	if (value.startsWith("filters_")) {
		const setting = value.replace("filters_", "") as keyof WSAddon;

		let newFilteredKeys = oldChat.filteredKeys;

		if (newFilteredKeys.includes(setting))
			newFilteredKeys = newFilteredKeys.filter((key) => key !== setting);
		else newFilteredKeys.push(setting);

		await db
			.update(chatsSchema)
			.set({
				filteredKeys: newFilteredKeys,
			})
			.where(eq(chatsSchema.chatId, chatId));

		const newSettingsPanel = await getSettingsPanel("filters", {
			filteredKeys: newFilteredKeys,
		});

		await ctx.answerCallbackQuery("Impostazione aggiornata");

		return ctx.editMessageReplyMarkup({
			reply_markup: newSettingsPanel,
		});
	}

	if (value.startsWith("settingstoggle_")) {
		const setting = value.replace(
			"settingstoggle_",
			"",
		) as keyof typeof oldChat;

		const [newChat] = await db
			.update(chatsSchema)
			.set({
				[setting]: !oldChat[setting],
			})
			.where(eq(chatsSchema.chatId, chatId))
			.returning({
				enabled: chatsSchema.enabled,
			});

		const newSettingsPanel = await getSettingsPanel("home", {
			enabled: newChat.enabled,
		});

		await ctx.answerCallbackQuery(
			`Notifiche ${newChat.enabled ? "abilitate" : "disabilitate"}`,
		);

		return ctx.editMessageReplyMarkup({
			reply_markup: newSettingsPanel,
		});
	}

	if (value.startsWith("events_")) {
		const event = value.replace("events_", "") as unknown as DBEvents[0];

		let newEvents = oldChat.events;

		if (newEvents.includes(event))
			newEvents = newEvents.filter((key) => key !== event);
		else newEvents.push(event);

		await db
			.update(chatsSchema)
			.set({
				events: newEvents,
			})
			.where(eq(chatsSchema.chatId, chatId));

		const newSettingsPanel = await getSettingsPanel("events", {
			events: newEvents,
		});

		await ctx.answerCallbackQuery("Impostazione aggiornata");

		return ctx.editMessageReplyMarkup({
			reply_markup: newSettingsPanel,
		});
	}
});

bot.catch((error) => {
	console.error(error);
});

socket.on("open", () => {
	console.info("Connesso al WebSocket per gli addon della create");
});

socket.on("close", (code, reason) => {
	console.warn(
		`Disconnesso dal WebSocket per gli addon della create:\n - Code: ${code}\n - Reason: ${reason}`,
	);
});

socket.on("error", (error) => {
	console.error("Errore del WebSocket:", error);
});

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
		const data = message.data;

		for (const chat of chats) {
			if (!chat.enabled || !chat.events.includes("create")) continue;

			for (const addon of data) {
				const addonUrl = `https://modrinth.com/mod/${addon.slug}`;

				const addonUrlButton = new InlineKeyboard()
					.url("Apri su Modrinth", addonUrl)
					.row();

				const msgData = [
					"<blockquote><b>Nuovo addon aggiunto</b></blockquote>",
					`<b>Nome</b>: ${addon.name}`,
					`<b>Descrizione</b>: ${addon.description}`,
					`<b>Autore</b>: <a href="https://modrinth.com/user/${addon.author}">${addon.author}</a>`,
					`<b>Versioni</b>${addon.versions.map((version: string) => `<code>${version}</code>`).join(", ")}`,
					`<b>Data di Creazione</b>: ${new Date(addon.created).toLocaleDateString("it")}`,
					`<b>Categorie</b>: ${addon.categories.map((category: string) => `<code>${category}</code>`).join(", ")}`,
					`<b>Client Side</b>: ${supportTypes[addon.clientSide]}`,
					`<b>Server Side</b>: ${supportTypes[addon.serverSide]}`,
					`<b>Modloaders</b>: ${addon.modloaders.map((modloader: string) => `<code>${modloader}</code>`).join(", ")}`,
				];

				bot.api.sendMessage(chat.chatId, msgData.join("\n"), {
					message_thread_id: chat.topicId
						? Number.parseInt(chat.topicId)
						: undefined,
					parse_mode: "HTML",
					reply_markup: addonUrlButton,
					link_preview_options: {
						is_disabled: true,
					},
				});
			}
		}
	}

	if (message.type === WSEvents.UPDATE) {
		const data = message.data;

		for (const chat of chats) {
			if (!chat.enabled || !chat.events.includes("update")) continue;

			for (const addon of data) {
				const addonUrl = `https://modrinth.com/mod/${addon.slug}`;

				const addonUrlButton = new InlineKeyboard()
					.url("Apri su Modrinth", addonUrl)
					.row();

				const msgData = [
					"<blockquote><b>Addon aggiornato</b></blockquote>",
					`<b>Nome</b>: ${addon.name}`,
				];

				for (const _key in addon.changes) {
					const key = _key as WSAddonKeys;

					if (
						Array.isArray(addon.changes[key].old) &&
						Array.isArray(addon.changes[key].new)
					) {
						const { removed, added } = compareArrays(
							addon.changes[key].old,
							addon.changes[key].new,
						);

						msgData.push(
							`<b>${keyNames[key]}</b>:${
								added.length > 0
									? `\n    - ${addKeyNames[key]}: ${added.map((version) => `<code>${version}</code>`).join(", ")}`
									: ""
							}${
								removed.length > 0
									? `\n    - ${removeKeyNames[key]}: ${removed.map((version) => `<code>${version}</code>`).join(", ")}`
									: ""
							}`,
						);
					} else {
						let oldValue = addon.changes[key].old;
						let newValue = addon.changes[key].new;

						if (["clientSide", "serverSide"].includes(key)) {
							oldValue = supportTypes[oldValue as keyof typeof supportTypes];
							newValue = supportTypes[newValue as keyof typeof supportTypes];
						}

						msgData.push(
							`<b>${keyNames[key]}</b>: ${oldValue} => ${key}: ${newValue}`,
						);
					}
				}

				const msg = msgData.join("\n");

				bot.api.sendMessage(chat.chatId, msg, {
					message_thread_id: chat.topicId
						? Number.parseInt(chat.topicId)
						: undefined,
					parse_mode: "HTML",
					reply_markup: addonUrlButton,
					link_preview_options: {
						is_disabled: true,
					},
				});
			}
		}
	}
});

bot.start();
