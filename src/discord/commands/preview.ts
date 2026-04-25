import { newAddon, updatedAddon } from "@/constants/previewData";
import { createAddonContainer } from "@/functions/discord";
import { parseVariables } from "@/functions/util";
import type { DiscordCommand } from "@/types/discord";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	MessageFlags,
} from "discord.js";
import { eq } from "drizzle-orm";

export default {
	name: "preview",

	async execute(client, interaction) {
		if (!interaction.guildId)
			return interaction.reply({
				content: await client.localizeStringWithLocale("discord.messages.general.serverOnly.command", interaction.locale),
				flags: MessageFlags.Ephemeral,
			});

		const guildId = interaction.guildId;

		const currentSettings = await client.db.query.guilds.findFirst({
			where: eq(client.dbSchema.guilds.id, guildId),
		});

		if (!currentSettings) {
			await interaction.reply({
				content: await client.localizeString("discord.messages.general.unconfigured", guildId),
				flags: MessageFlags.Ephemeral,
			});

			return null;
		}

		const type = interaction.options.getString("type", true) as
			| "create"
			| "update";

		let msg: string;
		const buttons = new ActionRowBuilder<ButtonBuilder>();
		let iconUrl: string | null | undefined;
		let color: number | undefined;

		if (type === "create") {
			msg = parseVariables(currentSettings.newAddonMessage, {
				platforms: newAddon.platforms,
				...newAddon.modData,
			});

			iconUrl =
				newAddon.modData.modrinth?.icon ?? newAddon.modData.curseforge?.icon;

			color =
				newAddon.modData.modrinth?.color ?? newAddon.modData.curseforge?.color;

			if (newAddon.modData.modrinth) {
				const button = new ButtonBuilder()
					.setLabel("Open on Modrinth")
					.setStyle(ButtonStyle.Link)
					.setEmoji({
						id: process.env.MODRINTH_EMOJI_ID,
						name: "modrinth",
					})
					.setURL(`https://modrinth.com/mod/${newAddon.modData.modrinth.slug}`);

				buttons.addComponents(button);
			}

			if (newAddon.modData.curseforge) {
				const button = new ButtonBuilder()
					.setLabel("Open on Curseforge")
					.setStyle(ButtonStyle.Link)
					.setEmoji({
						id: process.env.CURSEFORGE_EMOJI_ID,
						name: "curseforge",
					})
					.setURL(
						`https://curseforge.com/minecraft/mc-mods/${newAddon.modData.curseforge.slug}`,
					);

				buttons.addComponents(button);
			}
		} else {
			msg = parseVariables(currentSettings.updatedAddonMessage, {
				...updatedAddon.changes,
				names: updatedAddon.names,
			});

			iconUrl = updatedAddon.icons.modrinth ?? updatedAddon.icons.curseforge;

			if (updatedAddon.changes.modrinth) {
				const button = new ButtonBuilder()
					.setLabel("Open on Modrinth")
					.setStyle(ButtonStyle.Link)
					.setEmoji({
						id: process.env.MODRINTH_EMOJI_ID,
						name: "modrinth",
					})
					.setURL(`https://modrinth.com/mod/${updatedAddon.slugs.modrinth}`);

				buttons.addComponents(button);
			}

			if (updatedAddon.changes.curseforge) {
				const button = new ButtonBuilder()
					.setLabel("Open on Curseforge")
					.setStyle(ButtonStyle.Link)
					.setEmoji({
						id: process.env.CURSEFORGE_EMOJI_ID,
						name: "curseforge",
					})
					.setURL(
						`https://curseforge.com/minecraft/mc-mods/${updatedAddon.slugs.curseforge}`,
					);

				buttons.addComponents(button);
			}
		}

		const container = createAddonContainer(msg, buttons, type, iconUrl, color);

		await interaction.reply({
			components: [container],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
	},
} satisfies DiscordCommand;
