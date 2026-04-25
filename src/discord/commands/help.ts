import type { DiscordCommand } from "@/types/discord";
import { EmbedBuilder, MessageFlags } from "discord.js";

export default {
	name: "help",

	async execute(client, interaction) {
		const guildId = interaction.guildId || interaction.guild?.id || "";

		const commands = [
			`\`/help\` - ${await client.localizeString("discord.commands.help.description", guildId)}`,
			`\`/setchannel <channel>\` - ${await client.localizeString("discord.commands.setchannel.description", guildId)}`,
			`\`/mod <id> <platform>\` - ${await client.localizeString("discord.commands.mod.description", guildId)}`,
			`\`/search [query] [modloader] [version] [platform] [sort] [page]\` - ${await client.localizeString("discord.commands.search.description", guildId)}`,
			`\`/preview <type>\` - ${await client.localizeString("discord.commands.preview.description", guildId)}`,
			`\`/settings\` - ${await client.localizeString("discord.commands.settings.description", guildId)}`,
			"",
			`-# ${await client.localizeString("discord.commands.help.footer", guildId, {
				link: process.env.TELEGRAM_INVITE_URL || "https://t.me/CreateAddonsNotifierBot",
			})}`,
		];

		const embed = new EmbedBuilder()
			.setTitle("Help")
			.setDescription(commands.join("\n"));

		await interaction.reply({
			embeds: [embed],
			flags: MessageFlags.Ephemeral,
		});
	},
} satisfies DiscordCommand;
