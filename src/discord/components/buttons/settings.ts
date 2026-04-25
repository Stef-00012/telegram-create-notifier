import type { Client } from "@/discord/structures/DiscordClient";
import { generateSettingsContainer } from "@/discord/commands/settings";
import {
	LabelBuilder,
	MessageFlags,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	type ButtonInteraction,
} from "discord.js";
import { eq } from "drizzle-orm";

export default async function (client: Client, interaction: ButtonInteraction) {
	if (!interaction.guildId) {
		return interaction.reply({
			content: await client.localizeStringWithLocale("discord.messages.general.serverOnly.button", interaction.locale),
			flags: MessageFlags.Ephemeral,
		});
	}

	const currentSettings = await client.db.query.guilds.findFirst({
		where: eq(client.dbSchema.guilds.id, interaction.guildId),
	});

	const guildId = interaction.guildId;

	if (!currentSettings) {
		return interaction.reply({
			content: await client.localizeString("discord.messages.general.unconfigured", guildId),
			flags: MessageFlags.Ephemeral,
		});
	}

	const buttonType = interaction.customId.split("_")[1] as
		| "toggle"
		| "messageUpdate"
		| "messageCreate";

	switch (buttonType) {
		case "toggle": {
			const newEnabledState = !currentSettings.enabled;

			await client.db
				.update(client.dbSchema.guilds)
				.set({ enabled: newEnabledState })
				.where(eq(client.dbSchema.guilds.id, guildId));

			const container = await generateSettingsContainer(client, interaction);

			if (!container) return;

			try {
				await interaction.update({
					components: [container],
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (e) {
				console.log(e);
			}

			break;
		}

		case "messageCreate": {
			const modal = new ModalBuilder()
				.setTitle(await client.localizeString("discord.modals.settings.editNewAddonMessage.title", guildId))
				.setCustomId("settings_messageCreate");

			const input = new TextInputBuilder()
				.setCustomId("message")
				.setStyle(TextInputStyle.Paragraph)
				.setRequired(true)
				.setValue(currentSettings.newAddonMessage)
				.setMaxLength(3000);

			const label = new LabelBuilder()
				.setLabel(await client.localizeString("discord.modals.settings.options.newMessage", guildId))
				.setTextInputComponent(input);

			modal.addLabelComponents(label);

			await interaction.showModal(modal);

			break;
		}

		case "messageUpdate": {
			const modal = new ModalBuilder()
				.setTitle(await client.localizeString("discord.modals.settings.editUpdatedAddonMessage.title", guildId))
				.setCustomId("settings_messageUpdate");

			const input = new TextInputBuilder()
				.setCustomId("message")
				.setStyle(TextInputStyle.Paragraph)
				.setRequired(true)
				.setValue(currentSettings.updatedAddonMessage)
				.setMaxLength(3000);

			const label = new LabelBuilder()
				.setLabel(await client.localizeString("discord.modals.settings.options.newMessage", guildId))
				.setTextInputComponent(input);

			modal.addLabelComponents(label);

			await interaction.showModal(modal);

			break;
		}
	}
}
