import type { AutocompleteModsResult } from "@/types/discord";
import type { DiscordCommand } from "@/types/discord";
import type { Platforms, WSAddon, WSAddonData } from "@/types/addonsWS";
import axios from "axios";
import {
	ContainerBuilder,
	MessageFlags,
	SectionBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	ThumbnailBuilder,
} from "discord.js";

export default {
	name: "mod",

	async autocomplete(_client, interaction) {
		const autocompleteUrl = `http${process.env.CREATE_ADDONS_SECURE === "true" ? "s" : ""}://${process.env.CREATE_ADDONS_BASE_URL}/api/addons/autocomplete`;

		const platform = interaction.options.getString("platform", true);
		const query = interaction.options.getFocused();

		try {
			const res = await axios.get(
				`${autocompleteUrl}?platform=${platform}&query=${query}`,
			);

			const data = res.data as AutocompleteModsResult[];

			const choices = data
				.map((addon) => ({
					name: addon.name,
					value: addon.slug,
				}))
				.slice(0, 25);

			await interaction.respond(choices);
		} catch (_e) {
			await interaction.respond([]);
		}
	},

	async execute(client, interaction) {
		const id = interaction.options.getString("id", true);
		const platform = interaction.options.getString(
			"platform",
			true,
		) as Platforms;

		const guildId = interaction.guildId || interaction.guild?.id || "";

		const modUrl = `http${process.env.CREATE_ADDONS_SECURE === "true" ? "s" : ""}://${process.env.CREATE_ADDONS_BASE_URL}/api/addons/${id}`;

		try {
			const res = await axios.get(modUrl);
			const data = res.data as WSAddon;

			const platformData = data.modData[platform] as WSAddonData;

			const container = new ContainerBuilder().setAccentColor(
				platformData.color,
			);

			const title = new TextDisplayBuilder().setContent(
				`## ${platformData.name}`,
			);

			const thumbnail = new ThumbnailBuilder().setURL(platformData.icon);

			const modData = [
				`**${await client.localizeString("discord.commands.mod.messages.success.platform", guildId)}**: ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
				`**${await client.localizeString("discord.commands.mod.messages.success.description", guildId)}**: ${platformData.description}`,
				`**${await client.localizeString("discord.commands.mod.messages.success.authors", guildId)}**: ${platformData.authors.map((author) => `[${author.name}](<${author.url}>)`).join(", ")}`,
				`**${await client.localizeString("discord.commands.mod.messages.success.versions", guildId)}**: ${platformData.versions.map((version) => `\`${version}\``).join(", ")}`,
				`**${await client.localizeString("discord.commands.mod.messages.success.categories", guildId)}**: ${platformData.categories.join(", ")}`,
				`**${await client.localizeString("discord.commands.mod.messages.success.clientSide", guildId)}**: ${await client.localizeString(`websocket.variables.clientServerSide.${platformData.clientSide}`, guildId)}`,
				`**${await client.localizeString("discord.commands.mod.messages.success.serverSide", guildId)}**: ${await client.localizeString(`websocket.variables.clientServerSide.${platformData.serverSide}`, guildId)}`,
				`**${await client.localizeString("discord.commands.mod.messages.success.modloaders", guildId)}**: ${platformData.modloaders.map((loader) => loader.charAt(0).toUpperCase() + loader.slice(1)).join(", ")}`,
				`**${await client.localizeString("discord.commands.mod.messages.success.downloads", guildId)}**: ${platformData.downloads}`,
				`**${await client.localizeString("discord.commands.mod.messages.success.follows", guildId)}**: ${platformData.follows}`,
				`**${await client.localizeString("discord.commands.mod.messages.success.creationDate", guildId)}**: <t:${Math.floor(new Date(platformData.created).getTime() / 1000)}> (<t:${Math.floor(new Date(platformData.created).getTime() / 1000)}:R>)`,
				`**${await client.localizeString("discord.commands.mod.messages.success.lastUpdated", guildId)}**: <t:${Math.floor(new Date(platformData.modified).getTime() / 1000)}> (<t:${Math.floor(new Date(platformData.modified).getTime() / 1000)}:R>)`,
				`**${await client.localizeString("discord.commands.mod.messages.success.slug", guildId)}**: \`${platformData.slug}\``,
			];

			const dataText = new TextDisplayBuilder().setContent(modData.join("\n"));

			const section = new SectionBuilder()
				.setThumbnailAccessory(thumbnail)
				.addTextDisplayComponents(title, dataText);

			container
				.addSectionComponents(section)
				.addSeparatorComponents(new SeparatorBuilder());

			const idText = new TextDisplayBuilder().setContent(
				`-# **${await client.localizeString("discord.commands.mod.messages.success.id", guildId)}**: \`${platformData.id}\``,
			);

			container.addTextDisplayComponents(idText);

			await interaction.reply({
				components: [container],
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (_e) {
			await interaction.reply({
				content: await client.localizeString("discord.commands.mod.messages.error", guildId),
				flags: MessageFlags.Ephemeral,
			});
			return;
		}
	},
} satisfies DiscordCommand;
