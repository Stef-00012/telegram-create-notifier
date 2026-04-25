import type { WSAddonDataKeys } from "@/types/addonsWS";
import {
	discordDefaultNewAddonMessage,
	discordDefaultUpdatedAddonMessage,
} from "@/constants/defaults";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export type DBEvents = ("create" | "update")[];

export const guilds = sqliteTable("guilds", {
	id: text("guild_id").notNull().primaryKey(),
	webhook: text("webhook_url").notNull(),
	channel: text("channel_id").notNull(),
	enabled: integer("enabled", {
		mode: "boolean",
	})
		.notNull()
		.default(true),

	filteredKeys: text("filtered_keys", {
		mode: "json",
	})
		.notNull()
		.$type<WSAddonDataKeys[]>()
		.default(["versions"]),

	events: text("events", {
		mode: "json",
	})
		.notNull()
		.$type<DBEvents>()
		.default(["create", "update"]),

	newAddonMessage: text("new_addon_message")
		.notNull()
		.default(discordDefaultNewAddonMessage),

	updatedAddonMessage: text("updated_addon_message")
		.notNull()
		.default(discordDefaultUpdatedAddonMessage),

	locale: text("locale").notNull().default("en-US"),
});
