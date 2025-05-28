import { localize } from "@/functions/localize";
import { InlineKeyboard } from "grammy";
import type { Bot } from "@/bot";
import { config } from "$config";
import WebSocket from "ws";
import db from "@/db/db";
import {
	getNewAddonVariables,
	getUpdatedAddonVariables,
	parseVariables,
} from "@/functions/util";
import {
	type CreateMessage,
	type PingMessage,
	type PongMessage,
	type UpdateMessage,
	type WSAddon,
	WSEvents,
} from "@/types/addonsWS";

export function handleWS(bot: Bot): void {
	const socket = new WebSocket(config.createAddonsWSURI);

	socket.on("open", () => {
		console.info("\x1b[32mConnected to the create addons WebSocket\x1b[0m");
	});

	socket.on("close", (code, reason) => {
		console.warn(
			`\x1b[31mDisconnected from the create addons WebSocket:\n - Code: \x1b[0;1m${code}\x1b[0;31m\n - Reason: \x1b[0;1m${reason}\x1b[0;31m\n\nRetrying to connect in 10 seconds\x1b[0m`,
		);

		setTimeout(handleWS, 10000);
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
						.url(
							localize(chat.locale, "websocket.messages.openOnModrinth"),
							addonUrl,
						)
						.row();

					const variables = await getNewAddonVariables(addon, chat.locale);

					const msg = parseVariables(chat.newAddonMessage, variables);

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
						.url(
							localize(chat.locale, "websocket.messages.openOnModrinth"),
							addonUrl,
						)
						.row();

					const variables = await getUpdatedAddonVariables(addon, chat.locale);

					const msg = parseVariables(chat.updatedAddonMessage, variables);

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
