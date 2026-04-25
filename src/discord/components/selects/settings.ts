import type { Client } from "@/discord/structures/DiscordClient";
import type { DBEvents } from "@/db/schemas/guilds";
import type { WSAddonData } from "@/types/addonsWS";
import { MessageFlags, type AnySelectMenuInteraction } from "discord.js";
import { eq } from "drizzle-orm";

export default async function (
	client: Client,
	interaction: AnySelectMenuInteraction,
) {
	if (!interaction.guildId) {
		return interaction.reply({
			content: await client.localizeStringWithLocale("discord.messages.general.serverOnly.select", interaction.locale),
			flags: MessageFlags.Ephemeral,
		});
	}

	const guildId = interaction.guildId;

	const currentSettings = await client.db.query.guilds.findFirst({
		where: eq(client.dbSchema.guilds.id, guildId),
	});

	if (!currentSettings) {
		return interaction.reply({
			content: await client.localizeString("discord.messages.general.unconfigured", guildId),
			flags: MessageFlags.Ephemeral,
		});
	}

	const selectType = interaction.customId.split("_")[1] as "events" | "keys" | "language";
	const selectedValues = interaction.values;

	switch (selectType) {
		case "events": {
			await client.db
				.update(client.dbSchema.guilds)
				.set({
					events: selectedValues as DBEvents,
				})
				.where(eq(client.dbSchema.guilds.id, guildId));

			await interaction.reply({
				content: await client.localizeString("discord.selects.settings.messages.success.events", guildId),
				flags: MessageFlags.Ephemeral,
			});

			break;
		}

		case "keys": {
			await client.db
				.update(client.dbSchema.guilds)
				.set({
					filteredKeys: selectedValues as (keyof WSAddonData)[],
				})
				.where(eq(client.dbSchema.guilds.id, guildId));

			await interaction.reply({
				content: await client.localizeString("discord.selects.settings.messages.success.values", guildId),
				flags: MessageFlags.Ephemeral,
			});

			break;
		}

		case "language": {
			await client.db
				.update(client.dbSchema.guilds)
				.set({
					locale: selectedValues[0],
				})
				.where(eq(client.dbSchema.guilds.id, guildId));

			await interaction.reply({
				content: await client.localizeString("discord.selects.settings.messages.success.language", guildId),
				flags: MessageFlags.Ephemeral,
			});

			break;
		}
	}
}
