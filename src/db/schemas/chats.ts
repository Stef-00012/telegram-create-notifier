import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const chats = sqliteTable("chats", {
	chatId: text("chat_id").notNull().primaryKey(),
	chatType: text("chat_type").notNull().$type<"channel" | "private" | "group" | "supergroup">(),
	topicId: text("topic_id"),
	enabled: integer("enabled", {
		mode: "boolean"
	}).notNull().default(true),
});
