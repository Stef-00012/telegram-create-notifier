import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import type { WSAddonKeys } from "@/types/addonsWS";

export type DBEvents = ("create" | "update")[];

export const chats = sqliteTable("chats", {
	chatId: text("chat_id").notNull().primaryKey(),
	chatType: text("chat_type")
		.notNull()
		.$type<"channel" | "private" | "group" | "supergroup">(),
	topicId: text("topic_id"),
	enabled: integer("enabled", {
		mode: "boolean",
	})
		.notNull()
		.default(true),
	filteredKeys: text("filtered_keys", {
		mode: "json",
	})
		.notNull()
		.$type<WSAddonKeys[]>()
		.default(["versions"]),
	events: text("events", {
		mode: "json",
	})
		.notNull()
		.$type<DBEvents>()
		.default(["create", "update"]),
});
