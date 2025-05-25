import type { WSAddonKeys } from "@/types/addonsWS";
import type { DBEvents } from "@/db/schemas/chats";
import { localize } from "@/functions/localize";
import { settingKeys } from "@/constants/keys";
import { InlineKeyboard } from "grammy";
import type { Context, Conversation } from "@/types/grammy";
import type { Context as BaseContext } from "grammy";
import type { ConversationFlavor } from "@grammyjs/conversations";
import { eq } from "drizzle-orm";
import path from "node:path";
import fs from "node:fs";
import db from "@/db/db";
import dbSchemas from "@/db/schema"
interface Data {
	filteredKeys: WSAddonKeys[];
	enabled: boolean;
	events: DBEvents;
}

export type Sections = "home" | "filters" | "events" | "locales" | "messages";

const localesDir = path.join(__dirname, "../locales")

export async function getSettingsPanel(
	section: Sections = "home",
	locale = "en",
	data?: Partial<Data>,
) {
	const settingsPanel = new InlineKeyboard();

	if (section === "home") {
		settingsPanel
			.text(
				await localize(locale, "panels.settings.buttons.goFilters"),
				"settings__go_filters",
			)
			.row()
			.text(
				await localize(locale, "panels.settings.buttons.goEvents"),
				"settings__go_events",
			)
			.row()
			.text(
				await localize(locale, "panels.settings.buttons.goLocales"),
				"settings__go_locales",
			)
			.row()
			.text(
				await localize(locale, "panels.settings.buttons.changeMessages"),
				"settings__go_messages"
			)
			.row()
			.text(
				`${data?.enabled ? "✔️ " : ""}${await localize(
					locale,
					"panels.settings.buttons.notifications",
				)}`,
				"settings__toggle_enabled",
			);
	} else if (section === "filters") {
		let count = 0;

		for (const key of settingKeys) {
			settingsPanel.text(
				`${data?.filteredKeys?.includes(key) ? "✔️ " : ""}${await localize(
					locale,
					`panels.settings.buttons.filters.${key}`,
				)}`,
				`settings__filters_${key}`,
			);
			count++;

			if (count % 2 === 0) {
				settingsPanel.row();
			} else if (count === settingKeys.length) {
				settingsPanel.row();
			}
		}

		settingsPanel.text(
			await localize(locale, "panels.buttons.back"),
			"settings__go_home",
		);
	} else if (section === "events") {
		settingsPanel
			.text(
				`${data?.events?.includes("create") ? "✔️ " : ""}${await localize(
					locale,
					"panels.settings.buttons.events.newAddon",
				)}`,
				"settings__events_create",
			)
			.text(
				`${data?.events?.includes("update") ? "✔️ " : ""}${await localize(
					locale,
					"panels.settings.buttons.events.updatedAddon",
				)}`,
				"settings__events_update",
			)
			.row()
			.text(await localize(locale, "panels.buttons.back"), "settings__go_home");
	} else if (section === "locales") {
		const locales = fs
			.readdirSync(localesDir)
			.filter((file) => file.endsWith(".json"))
			.map((file) => file.split(".")[0])

		let count = 0;

		for (const key of locales) {
			settingsPanel.text(
				`${locale === key ? "✔️ " : ""}${key.toUpperCase()}`,
				`settings__locales_${key}`,
			);
			count++;

			if (count % 2 === 0) {
				settingsPanel.row();
			} else if (count === locales.length) {
				settingsPanel.row();
			}
		}

		settingsPanel.text(
			await localize(locale, "panels.buttons.back"),
			"settings__go_home",
		);
	} else if (section === "messages") {
		settingsPanel
			.text(
				await localize(
					locale,
					"panels.settings.buttons.changeMessages.newAddon",
				),
				"settings__messages_newAddonMessage",
			)
			.text(
				await localize(
					locale,
					"panels.settings.buttons.changeMessages.updatedAddon",
				),
				"settings__messages_updatedAddonMessage",
			)
			.row()
			.text(await localize(locale, "panels.buttons.back"), "settings__go_home");
	}

	return settingsPanel;
}

export async function handleSettingsPanel(
	ctx: ConversationFlavor<Context>,
	value: string,
	locale = "en",
	chatId?: string,
) {
	if (!ctx.isAdmin) return ctx.localizedAnswerCallbackQuery("panels.messages.unauthorized")

	if (!chatId) return ctx.localizedAnswerCallbackQuery("messages.error");
	
	const oldChat = ctx.dbChat
	
	if (!oldChat) return ctx.localizedAnswerCallbackQuery("messages.error");

	if (value.startsWith("go_")) {
		const section = value.replace("go_", "") as Sections;

		const settingsPanel = await getSettingsPanel(section, locale, {
			filteredKeys: oldChat.filteredKeys,
			enabled: oldChat.enabled,
			events: oldChat.events,
		});

		return ctx.editMessageReplyMarkup({
			reply_markup: settingsPanel,
		});
	}

	if (value.startsWith("filters_")) {
		const setting = value.replace("filters_", "") as WSAddonKeys;

		let newFilteredKeys = oldChat.filteredKeys;

		if (newFilteredKeys.includes(setting))
			newFilteredKeys = newFilteredKeys.filter((key) => key !== setting);
		else newFilteredKeys.push(setting);

		await ctx.db
			.update(ctx.dbSchemas.chats)
			.set({
				filteredKeys: newFilteredKeys,
			})
			.where(eq(ctx.dbSchemas.chats.chatId, chatId));

		const newSettingsPanel = await getSettingsPanel("filters", locale, {
			filteredKeys: newFilteredKeys,
		});

		await ctx.localizedAnswerCallbackQuery("panels.settings.messages.successUpdate")

		return ctx.editMessageReplyMarkup({
			reply_markup: newSettingsPanel,
		});
	}

	if (value.startsWith("toggle_")) {
		const setting = value.replace("toggle_", "") as keyof typeof oldChat;

		const [newChat] = await ctx.db
			.update(ctx.dbSchemas.chats)
			.set({
				[setting]: !oldChat[setting],
			})
			.where(eq(ctx.dbSchemas.chats.chatId, chatId))
			.returning({
			[setting]: ctx.dbSchemas.chats[setting],
			});

		const newSettingsPanel = await getSettingsPanel("home", locale, {
			[setting]: newChat[setting],
		});

		await ctx.localizedAnswerCallbackQuery(`panels.settings.messages.toggles.${setting}.${newChat.enabled ? "on" : "off"}`)

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

		await ctx.db
			.update(ctx.dbSchemas.chats)
			.set({
				events: newEvents,
			})
			.where(eq(ctx.dbSchemas.chats.chatId, chatId));

		const newSettingsPanel = await getSettingsPanel("events", locale, {
			events: newEvents,
		});

		await ctx.localizedAnswerCallbackQuery("panels.settings.messages.successUpdate")

		return ctx.editMessageReplyMarkup({
			reply_markup: newSettingsPanel,
		});
	}

	if (value.startsWith("locales_")) {
		const locale = value.replace("locales_", "");

		await ctx.db
			.update(ctx.dbSchemas.chats)
			.set({
				locale: locale,
			})
			.where(eq(ctx.dbSchemas.chats.chatId, chatId));

		const newSettingsPanel = await getSettingsPanel("locales", locale, {
			enabled: oldChat.enabled,
			filteredKeys: oldChat.filteredKeys,
			events: oldChat.events,
		});

		await ctx.localizedAnswerCallbackQuery("panels.settings.messages.successUpdate", locale)

		return ctx.editMessageReplyMarkup({
			reply_markup: newSettingsPanel,
		});
	}

	if (value.startsWith("messages_")) {
		await ctx.conversation.enter(conversationId)
	}
}

export const conversationId = "settings_message_update"

export async function handleMessageConversation(conversation: Conversation, ctx: BaseContext) {
	const chat = await conversation.external((ctx) => {
		if (!ctx.chatId) return undefined;

		return db.query.chats.findFirst({
			where: eq(dbSchemas.chats.chatId, ctx.chatId.toString())
		})
	})

	if (!chat) {
		await ctx.reply("Something went wrong");

		return await conversation.halt()
	}
	
	if (!ctx.from?.id || !ctx.callbackQuery?.data) return await ctx.reply(
		await localize(chat.locale, "messages.error")
	);

	const messageType = ctx.callbackQuery.data.replace("settings__messages_", "")

	await ctx.answerCallbackQuery(
		await localize(chat.locale, `panels.settings.messages.changeMessages.${messageType}`)
	)
	
	const {
		msg: {
			text,
			entities
		}
	} = await conversation.waitFor("message:text", {
		maxMilliseconds: 60000 // 1 minute
	}).andFrom(ctx.from.id)

	console.log(text, entities)
	
	// await conversation.external((ctx) => {
	// 	if (!ctx.chatId) return undefined;

	// 	return db
	// 		.update(dbSchemas.chats)
	// 		.set({
	// 			[messageType]: text,
	// 		})
	// 		.where(
	// 			eq(dbSchemas.chats.chatId, ctx.chatId.toString())
	// 		)
	// })

	// await ctx.reply(
	// 	await localize(chat.locale, `panels.settings.messages.changeMessages.${messageType}.success`)
	// );

	// return await conversation.halt();
}