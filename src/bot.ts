import { Bot, InlineKeyboard, type Context as BaseContext } from "grammy";
import { adminOnly, compareArrays, ownerOnly } from "@/functions/util";
import type { Command, Event } from "@/types/handlers";
import { autoThread } from "@grammyjs/auto-thread";
import type { BotCommand } from "grammy/types";
import schemas from "@/db/schema";
import { config } from "$config";
import WebSocket from "ws";
import db from "@/db/db";
import fs from "node:fs";
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

export interface Context extends BaseContext {
	bot: Bot<Context>;
	db: typeof db;
	dbSchemas: typeof schemas;
	config: typeof config;

	adminOnly: (ctx: Context) => Promise<boolean>;
	ownerOnly: (ctx: Context) => boolean;
}

const bot = new Bot<Context>(config.token);

bot.catch((error) => {
	console.error(
		`\x1b[31mC'è stato un errore nel bot:\n - Nome: \x1b[0;1m${error.name}\x1b[31m\n - Messaggio: \x1b[0;1m${error.message}\x1b[31m\n - Causa: \x1b[0;1m${error.cause}\x1b[31m`,
		error.stack,
		"\x1b[0m",
	);
});

bot.use(autoThread());
bot.use(async (ctx, next) => {
	ctx.bot = bot;
	ctx.db = db;
	ctx.dbSchemas = schemas;
	ctx.config = config;

	ctx.adminOnly = adminOnly;
	ctx.ownerOnly = ownerOnly;

	await next();
});

const suggestedCommands: BotCommand[] = [];

const events = fs
	.readdirSync(`${__dirname}/events`)
	.filter((file) => file.endsWith(".ts"));

const commands = fs
	.readdirSync(`${__dirname}/commands`)
	.filter((file) => file.endsWith(".ts"));

for (const event of events) {
	const eventData = (await import(`${__dirname}/events/${event}`))
		.default as Event;

	bot.on(eventData.name, eventData.execute);

	console.log(
		`\x1b[34mCaricato l'evento "\x1b[0;1m${eventData.name}\x1b[0;34m"\x1b[0m`,
	);
}

for (const command of commands) {
	const commandData = (await import(`${__dirname}/commands/${command}`))
		.default as Command;

	if (commandData.displaySuggestion && commandData.description) {
		suggestedCommands.push({
			command: commandData.name,
			description: commandData.description,
		});
	}

	bot.command(commandData.name, commandData.execute);

	console.log(
		`\x1b[36mCaricato il comando "\x1b[0;1m${commandData.name}\x1b[0;36m"\x1b[0m`,
	);
}

bot.api.setMyCommands(suggestedCommands);

handleWS();

bot.start();

function handleWS() {
	const socket = new WebSocket(config.createAddonsWSURI);

	socket.on("open", () => {
		console.info(
			"\x1b[32mConnesso al WebSocket per gli addon della create\x1b[0m",
		);
	});

	socket.on("close", (code, reason) => {
		console.warn(
			`\x1b[31mDisconnesso dal WebSocket per gli addon della create:\n - Codice: \x1b[0;1m${code}\x1b[0;31m\n - Reason: \x1b[0;1m${reason}\x1b[0;31m\n\nTentativo di riconnessione fra 10 secondi\x1b[0m`,
		);

		setTimeout(handleWS, 10000);
	});

	socket.on("error", (error) => {
		console.error("\x1b[31mErrore del WebSocket:", error, "\x1b[0m");
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
						`<b>Data di Creazione</b>: ${new Date(addon.created).toLocaleString("it")}`,
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
					if (
						Object.keys(addon.changes).every(
							(key) => !chat.filteredKeys.includes(key as keyof WSAddon),
						)
					)
						continue;

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
							
							if (["created", "modified"].includes(key)) {
							    oldValue = new Date(oldValue).toLocaleString("it")
							    newValue = new Date(newValue).toLocaleString("it")
							}
							
							if (key === "icon") {
							    oldValue = `<a href="${oldValue}">Vecchia</a>`
							    newValue = `<a href="${newValue}">Nuova</a>`
							}

							msgData.push(
								`<b>${keyNames[key]}</b>: ${oldValue} => ${newValue}`,
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
}
