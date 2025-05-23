import { settingKeyNames } from "@/constants/keys";
import type { WSAddonKeys } from "@/types/addonsWS";
import type { DBEvents } from "@/db/schemas/chats";
import { InlineKeyboard } from "grammy";
import type { Context } from "@/bot";
import { eq } from "drizzle-orm";

interface Data {
	filteredKeys: WSAddonKeys[];
	enabled: boolean;
	events: DBEvents;
}

export type Sections = "home" | "filters" | "events";

export async function getSettingsPanel(
	section: Sections = "home",
	data?: Partial<Data>,
) {
	const settingsPanel = new InlineKeyboard();

	if (section === "home") {
		settingsPanel
			.text("Filtri", "settings__go_filters")
			.row()
			.text("Eventi", "settings__go_events")
			.row()
			.text(
				`${data?.enabled ? "✔️ " : ""}Notifiche Attive`,
				"settings__toggle_enabled",
			);
	} else if (section === "filters") {
		let count = 0;

		for (const [_key, value] of Object.entries(settingKeyNames)) {
			const key = _key as WSAddonKeys;

			settingsPanel.text(
				`${data?.filteredKeys?.includes(key) ? "✔️ " : ""}${value}`,
				`settings__filters_${key}`,
			);
			count++;

			if (count % 2 === 0) {
				settingsPanel.row();
			} else if (count === Object.keys(settingKeyNames).length) {
				settingsPanel.row();
			}
		}

		settingsPanel.text("Indietro", "settings__go_home");
	} else if (section === "events") {
		settingsPanel
			.text(
				`${data?.events?.includes("create") ? "✔️ " : ""}Nuovo Addon`,
				"settings__events_create",
			)
			.text(
				`${data?.events?.includes("update") ? "✔️ " : ""}Addon Aggiornato`,
				"settings__events_update",
			)
			.row()
			.text("Indietro", "settings__go_home");
	}

	return settingsPanel;
}

export async function handleSettingsPanel(
	ctx: Context,
	value: string,
	chatId?: string,
) {
	const allowed = await ctx.adminOnly(ctx);

	if (!allowed) return ctx.answerCallbackQuery("Non Autorizzato");

	if (!chatId) return ctx.answerCallbackQuery("Qualcosa è andato storto");

	const oldChat = await ctx.db.query.chats.findFirst({
		where: eq(ctx.dbSchemas.chats.chatId, chatId),
	});

	if (!oldChat) return ctx.reply("Qualcosa è andato storto");

	if (value.startsWith("go_")) {
		const section = value.replace("go_", "") as Sections;

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

		const newSettingsPanel = await getSettingsPanel("filters", {
			filteredKeys: newFilteredKeys,
		});

		await ctx.answerCallbackQuery("Impostazione aggiornata");

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
				enabled: ctx.dbSchemas.chats.enabled,
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

		await ctx.db
			.update(ctx.dbSchemas.chats)
			.set({
				events: newEvents,
			})
			.where(eq(ctx.dbSchemas.chats.chatId, chatId));

		const newSettingsPanel = await getSettingsPanel("events", {
			events: newEvents,
		});

		await ctx.answerCallbackQuery("Impostazione aggiornata");

		return ctx.editMessageReplyMarkup({
			reply_markup: newSettingsPanel,
		});
	}
}
