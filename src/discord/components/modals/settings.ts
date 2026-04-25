import type { Client } from "@/discord/structures/DiscordClient";
import { MessageFlags, type ModalSubmitInteraction } from "discord.js";
import { eq } from "drizzle-orm";

export default async function (
	client: Client,
	interaction: ModalSubmitInteraction,
) {
	if (!interaction.guildId) {
		return interaction.reply({
			content: await client.localizeStringWithLocale("discord.messages.general.serverOnly.modal", interaction.locale),
			flags: MessageFlags.Ephemeral,
		});
	}

	const guildId = interaction.guildId;

	const modalType = interaction.customId.split("_")[1] as
		| "messageUpdate"
		| "messageCreate";
	const message = interaction.fields.getTextInputValue("message");

	switch (modalType) {
		case "messageCreate": {
			await client.db
				.update(client.dbSchema.guilds)
				.set({
					newAddonMessage: message,
				})
				.where(eq(client.dbSchema.guilds.id, guildId));

			await interaction.reply({
				content: await client.localizeString("discord.modals.settings.messages.success.new", guildId),
				flags: MessageFlags.Ephemeral,
			});

			break;
		}

		case "messageUpdate": {
			await client.db
				.update(client.dbSchema.guilds)
				.set({
					updatedAddonMessage: message,
				})
				.where(eq(client.dbSchema.guilds.id, guildId));

			await interaction.reply({
				content: await client.localizeString("discord.modals.settings.messages.success.updated", guildId),
				flags: MessageFlags.Ephemeral,
			});

			break;
		}
	}
}
