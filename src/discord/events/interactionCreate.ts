import type { Client } from "@/discord/structures/DiscordClient";
import { MessageFlags, type Interaction } from "discord.js";
import fs from "node:fs";

export default async function (client: Client, interaction: Interaction) {
	if (interaction.isChatInputCommand()) {
		const command = client.commands.get(interaction.commandName);

		if (!command) {
			return interaction.reply({
				content: "Unknown command",
				flags: MessageFlags.Ephemeral,
			});
		}

		try {
			await command.execute(client, interaction);
		} catch (e) {
			console.error(e);

			if (interaction.replied) {
				return interaction.followUp({
					content: "An error occurred while executing the command",
					flags: MessageFlags.Ephemeral,
				});
			}

			if (interaction.deferred) {
				return interaction.editReply({
					content: "An error occurred while executing the command",
				});
			}

			return interaction.reply({
				content: "An error occurred while executing the command",
				flags: MessageFlags.Ephemeral,
			});
		}
	}

	if (interaction.isAutocomplete()) {
		const command = client.commands.get(interaction.commandName);

		if (!command || !command.autocomplete) return interaction.respond([]);

		await command.autocomplete(client, interaction);
	}

	if (
		interaction.isButton() ||
		interaction.isAnySelectMenu() ||
		interaction.isModalSubmit()
	) {
		if (interaction.customId.startsWith("coll_")) return;

		let _type: "buttons" | "selects" | "modals" = "buttons";
		let type: "button" | "select menu" | "modal" = "button";

		if (interaction.isButton()) {
			_type = "buttons";
			type = "button";
		} else if (interaction.isAnySelectMenu()) {
			_type = "selects";
			type = "select menu";
		} else if (interaction.isModalSubmit()) {
			_type = "modals";
			type = "modal";
		}

		const fileName = interaction.customId.split("_")[0];
		const filePath = `${__dirname}/../components/${_type}/${fileName}.ts`;

		if (!fs.existsSync(filePath))
			return await interaction.reply({
				content: `Unknown ${type}`,
				flags: MessageFlags.Ephemeral,
			});

		const fileData = (await import(filePath)).default;

		if (fileData) {
			try {
				await fileData(client, interaction);
			} catch (_e) {
				console.error(_e);

				if (interaction.replied) {
					return interaction.followUp({
						content: `An error occurred while executing the ${type}`,
						flags: MessageFlags.Ephemeral,
					});
				}

				if (interaction.deferred) {
					return interaction.editReply({
						content: `An error occurred while executing the ${type}`,
					});
				}

				return interaction.reply({
					content: `An error occurred while executing the ${type}`,
					flags: MessageFlags.Ephemeral,
				});
			}
		}
	}
}
