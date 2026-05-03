import { localize } from "@/functions/localize";
import { type GrammyError, InlineKeyboard } from "grammy";
import type { Bot } from "@/bot";
import WebSocket from "ws";
import db from "@/db/db";
import type { Client } from "@/discord/structures/DiscordClient";
import { parseVariables } from "@/functions/util";
import {
	type CreateMessage,
	type PingMessage,
	type PongMessage,
	type UpdateMessage,
	type WSAddonData,
	WSEvents,
} from "@/types/addonsWS";
import {
	type DiscordAPIError,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	MessageFlags,
	WebhookClient,
} from "discord.js";
import { createAddonContainer } from "./discord";
import schemas from "@/db/schema";
import { eq } from "drizzle-orm";

const telegramErrorMessages = [
	"Forbidden: bot was blocked by the user",
	"Forbidden: bot was kicked from the group chat",
	"Forbidden: bot was kicked from the supergroup chat",
	"Forbidden: bot was kicked from the channel chat",
	"Forbidden: bot was kicked from the private chat",
	"Bad Request: message thread not found",
	"Bad Request: TOPIC_CLOSED",
];

const discordErrorMessages = [
	"DiscordAPIError[10015]",
	"Unknown Webhook",
	10015,
];

export function handleWS(
	telegramBot?: Bot | null,
	discordBot?: Client | null,
): void {
	const wsUrl = `ws${process.env.CREATE_ADDONS_SECURE === "true" ? "s" : ""}://${process.env.CREATE_ADDONS_BASE_URL}/ws`;

	const socket = new WebSocket(wsUrl);

	socket.on("open", () => {
		console.info("\x1b[32mConnected to the create addons WebSocket\x1b[0m");
	});

	socket.on("close", (code, reason) => {
		console.warn(
			`\x1b[31mDisconnected from the create addons WebSocket:\n - Code: \x1b[0;1m${code}\x1b[0;31m\n - Reason: \x1b[0;1m${reason}\x1b[0;31m\n\nRetrying to connect in 10 seconds\x1b[0m`,
		);

		setTimeout(() => {
			handleWS(telegramBot, discordBot);
		}, 10000);
	});

	socket.on("error", (error) => {
		console.error("\x1b[31mWebSocket Error:", error, "\x1b[0m");
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

			return socket.send(JSON.stringify(pong));
		}

		const chats = await db.query.chats.findMany();
		const guilds = await db.query.guilds.findMany();

		if (message.type === WSEvents.CREATE) {
			const data = message.data;

			if (telegramBot) {
				chat: for (const chat of chats) {
					if (!chat.enabled || !chat.events.includes("create")) continue;

					for (const addon of data) {
						const addonUrlButton = new InlineKeyboard();

						if (addon.modData.modrinth) {
							addonUrlButton
								.url(
									localize(chat.locale, "websocket.messages.openOnModrinth"),
									`https://modrinth.com/mod/${addon.modData.modrinth.slug}`,
								)
								.row();
						}

						if (addon.modData.curseforge) {
							addonUrlButton
								.url(
									localize(chat.locale, "websocket.messages.openOnCurseforge"),
									`https://curseforge.com/minecraft/mc-mods/${addon.modData.curseforge.slug}`,
								)
								.row();
						}

						const msg = parseVariables(
							chat.newAddonMessage,
							{
								platforms: addon.platforms,
								...addon.modData,
							},
							chat.locale,
							false,
						);

						try {
							await telegramBot.api.sendMessage(chat.chatId, msg, {
								message_thread_id: chat.topicId
									? Number.parseInt(chat.topicId, 10)
									: undefined,
								parse_mode: "HTML",
								reply_markup: addonUrlButton,
								link_preview_options: {
									is_disabled: true,
								},
							});
						} catch (_e) {
							const e = _e as GrammyError;

							if (telegramErrorMessages.includes(e.description)) {
								await db
									.delete(schemas.chats)
									.where(eq(schemas.chats.chatId, chat.chatId))
									.catch(() => {});

								console.info(
									`Deleted chat ${chat.chatId} (${chat.chatType}) because the bot was blocked`,
								);

								continue chat;
							}

							console.error(
								`Failed to send addon message to chat "${chat.chatId}":`,
								e,
							);
						}
					}
				}
			}

			if (discordBot) {
				guild: for (const guild of guilds) {
					if (!guild.enabled || !guild.events.includes("create")) continue;

					const webhookClient = new WebhookClient({
						url: guild.webhook,
					});

					for (const addon of data) {
						const addonUrlRow = new ActionRowBuilder<ButtonBuilder>();

						if (addon.modData.modrinth) {
							const button = new ButtonBuilder()
								.setLabel(
									await discordBot.localizeStringWithLocale(
										"websocket.messages.openOnModrinth",
										guild.locale,
									),
								)
								.setStyle(ButtonStyle.Link)
								.setEmoji({
									id: process.env.MODRINTH_EMOJI_ID,
									name: "modrinth",
								})
								.setURL(
									`https://modrinth.com/mod/${addon.modData.modrinth.slug}`,
								);

							addonUrlRow.addComponents(button);
						}

						if (addon.modData.curseforge) {
							const button = new ButtonBuilder()
								.setLabel(
									await discordBot.localizeStringWithLocale(
										"websocket.messages.openOnCurseforge",
										guild.locale,
									),
								)
								.setStyle(ButtonStyle.Link)
								.setEmoji({
									id: process.env.CURSEFORGE_EMOJI_ID,
									name: "curseforge",
								})
								.setURL(
									`https://curseforge.com/minecraft/mc-mods/${addon.modData.curseforge.slug}`,
								);

							addonUrlRow.addComponents(button);
						}

						const msg = parseVariables(
							guild.newAddonMessage,
							{
								platforms: addon.platforms,
								...addon.modData,
							},
							guild.locale,
							true,
						);

						const iconUrl =
							addon.modData.modrinth?.icon ?? addon.modData.curseforge?.icon;

						const container = await createAddonContainer(
							msg,
							addonUrlRow,
							"create",
							discordBot,
							guild.locale,
							guild.id,
							iconUrl,
							addon.modData.modrinth?.color ?? addon.modData.curseforge?.color,
						);

						try {
							await webhookClient.send({
								components: [container],
								flags: MessageFlags.IsComponentsV2,
							});
						} catch (_e) {
							const e = _e as DiscordAPIError;

							if (
								discordErrorMessages.includes(e.name) ||
								discordErrorMessages.includes(e.message) ||
								discordErrorMessages.includes(e.code)
							) {
								await db
									.delete(schemas.guilds)
									.where(eq(schemas.guilds.id, guild.id))
									.catch(() => {});

								console.info(
									`Deleted guild ${guild.id} because the webhook was deleted`,
								);

								continue guild;
							}

							console.error(
								`Failed to send addon message to guild "${guild.id}":`,
								e,
							);
						}
					}
				}
			}
		}

		if (message.type === WSEvents.UPDATE) {
			const data = message.data;

			if (telegramBot) {
				chat: for (const chat of chats) {
					if (!chat.enabled || !chat.events.includes("update")) continue;

					for (const addon of data) {
						const hasFilteredCurseforge =
							Object.keys(addon.changes.curseforge ?? {}).some((key) =>
								chat.filteredKeys.includes(key as keyof WSAddonData),
							) && addon.names.curseforge !== null;

						if (!hasFilteredCurseforge) addon.changes.curseforge = null;

						const hasFilteredModrinth =
							Object.keys(addon.changes.modrinth ?? {}).some((key) =>
								chat.filteredKeys.includes(key as keyof WSAddonData),
							) && addon.names.modrinth !== null;

						if (!hasFilteredModrinth) addon.changes.modrinth = null;

						if (!addon.changes.curseforge && !addon.changes.modrinth) continue;

						const addonUrlButton = new InlineKeyboard();

						if (addon.slugs.modrinth) {
							addonUrlButton
								.url(
									localize(chat.locale, "websocket.messages.openOnModrinth"),
									`https://modrinth.com/mod/${addon.slugs.modrinth}`,
								)
								.row();
						}

						if (addon.slugs.curseforge) {
							addonUrlButton
								.url(
									localize(chat.locale, "websocket.messages.openOnCurseforge"),
									`https://curseforge.com/minecraft/mc-mods/${addon.slugs.curseforge}`,
								)
								.row();
						}

						const msg = parseVariables(
							chat.updatedAddonMessage,
							{
								...addon.changes,
								names: addon.names,
							},
							chat.locale,
							false,
						);

						try {
							await telegramBot.api.sendMessage(chat.chatId, msg, {
								message_thread_id: chat.topicId
									? Number.parseInt(chat.topicId, 10)
									: undefined,
								parse_mode: "HTML",
								reply_markup: addonUrlButton,
								link_preview_options: {
									is_disabled: true,
								},
							});
						} catch (_e) {
							const e = _e as GrammyError;

							if (telegramErrorMessages.includes(e.description)) {
								await db
									.delete(schemas.chats)
									.where(eq(schemas.chats.chatId, chat.chatId))
									.catch(() => {});

								console.info(
									`Deleted chat ${chat.chatId} (${chat.chatType}) because the bot was blocked`,
								);

								continue chat;
							}

							console.error(
								`Failed to send addon message to chat "${chat.chatId}":`,
								e,
							);
						}
					}
				}
			}

			if (discordBot) {
				guild: for (const guild of guilds) {
					if (!guild.enabled || !guild.events.includes("update")) continue;

					const webhookClient = new WebhookClient({
						url: guild.webhook,
					});

					for (const addon of data) {
						const hasFilteredCurseforge =
							Object.keys(addon.changes.curseforge ?? {}).some((key) =>
								guild.filteredKeys.includes(key as keyof WSAddonData),
							) && addon.names.curseforge !== null;

						if (!hasFilteredCurseforge) addon.changes.curseforge = null;

						const hasFilteredModrinth =
							Object.keys(addon.changes.modrinth ?? {}).some((key) =>
								guild.filteredKeys.includes(key as keyof WSAddonData),
							) && addon.names.modrinth !== null;

						if (!hasFilteredModrinth) addon.changes.modrinth = null;

						if (!addon.changes.curseforge && !addon.changes.modrinth) continue;

						const addonUrlRow = new ActionRowBuilder<ButtonBuilder>();

						if (addon.slugs.modrinth) {
							const button = new ButtonBuilder()
								.setLabel(
									await discordBot.localizeStringWithLocale(
										"websocket.messages.openOnModrinth",
										guild.locale,
									),
								)
								.setStyle(ButtonStyle.Link)
								.setEmoji({
									id: process.env.MODRINTH_EMOJI_ID,
									name: "modrinth",
								})
								.setURL(`https://modrinth.com/mod/${addon.slugs.modrinth}`);

							addonUrlRow.addComponents(button);
						}

						if (addon.slugs.curseforge) {
							const button = new ButtonBuilder()
								.setLabel(
									await discordBot.localizeStringWithLocale(
										"websocket.messages.openOnCurseforge",
										guild.locale,
									),
								)
								.setStyle(ButtonStyle.Link)
								.setEmoji({
									id: process.env.CURSEFORGE_EMOJI_ID,
									name: "curseforge",
								})
								.setURL(
									`https://curseforge.com/minecraft/mc-mods/${addon.slugs.curseforge}`,
								);

							addonUrlRow.addComponents(button);
						}

						const msg = parseVariables(
							guild.updatedAddonMessage,
							{
								...addon.changes,
								names: addon.names,
							},
							guild.locale,
							true,
						);

						const iconUrl = addon.icons.modrinth ?? addon.icons.curseforge;

						const container = await createAddonContainer(
							msg,
							addonUrlRow,
							"update",
							discordBot,
							guild.locale,
							guild.id,
							iconUrl,
						);

						try {
							await webhookClient.send({
								components: [container],
								flags: MessageFlags.IsComponentsV2,
							});
						} catch (_e) {
							const e = _e as DiscordAPIError;

							if (
								discordErrorMessages.includes(e.name) ||
								discordErrorMessages.includes(e.message) ||
								discordErrorMessages.includes(e.code)
							) {
								await db
									.delete(schemas.guilds)
									.where(eq(schemas.guilds.id, guild.id))
									.catch(() => {});

								console.info(
									`Deleted guild ${guild.id} because the webhook was deleted`,
								);

								continue guild;
							}

							console.error(
								`Failed to send addon message to guild "${guild.id}":`,
								e,
							);
						}
					}
				}
			}
		}
	});
}
