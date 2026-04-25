import { type ClientOptions, Client as DiscordClient } from "discord.js";
import type { DiscordCommand } from "@/types/discord";
import db from "@/db/db";
import schema from "@/db/schema";
import { localize } from "@/functions/localize";
import { eq } from "drizzle-orm";

export class Client extends DiscordClient {
	commands: Map<string, DiscordCommand>;
	db: typeof db;
	dbSchema: typeof schema;

	constructor(options: ClientOptions) {
		super(options);

		this.commands = new Map();
		this.db = db;
		this.dbSchema = schema;
	}

	async localizeString(key: string, guildId: string, variables?: Record<string, string>): Promise<string> {
		const locale = await this.getGuildLocale(guildId) || "en-US";

		return localize(locale, key, variables)
	}

	async localizeStringWithLocale(key: string, locale: string, variables?: Record<string, string>): Promise<string> {
		return localize(locale, key, variables)
	}

	private async getGuildLocale(guildId: string): Promise<string> {
		const guild = await db.query.guilds.findFirst({
			where: eq(schema.guilds.id, guildId),
		})

		return guild?.locale || "en-US";
	}
}
