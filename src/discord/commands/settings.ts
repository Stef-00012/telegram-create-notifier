import type { Client } from "@/discord/structures/DiscordClient";
import type { DiscordCommand } from "@/types/discord";
import type { WSAddonDataKeys } from "@/types/addonsWS";
import {
	ActionRowBuilder,
	ButtonBuilder,
	type ButtonInteraction,
	ButtonStyle,
	type ChatInputCommandInteraction,
	ContainerBuilder,
	MessageFlags,
	SectionBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	StringSelectMenuBuilder,
	TextDisplayBuilder,
} from "discord.js";
import { eq } from "drizzle-orm";
import { locales } from "@/bot";

const settingKeys: WSAddonDataKeys[] = [
	"categories",
	"description",
	"icon",
	"name",
	"versions",
	"clientSide",
	"license",
	"serverSide",
	"modloaders",
	"slug",
];

export default {
	name: "settings",
	async execute(client, interaction) {
		if (!interaction.guildId) {
			return interaction.reply({
				content: await client.localizeStringWithLocale("discord.messages.general.serverOnly.command", interaction.locale),
				flags: MessageFlags.Ephemeral,
			});
		}

		const container = await generateSettingsContainer(client, interaction);

		if (!container) return;

		try {
			await interaction.reply({
				components: [container],
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		} catch (e) {
			console.log(e);
		}
	},
} satisfies DiscordCommand;

export async function generateSettingsContainer(
	client: Client,
	interaction: ChatInputCommandInteraction | ButtonInteraction,
) {
	const type = interaction.isChatInputCommand() ? "command" : "button";

	if (!interaction.guildId) {
		await interaction.reply({
			content: await client.localizeStringWithLocale(`discord.messages.general.serverOnly.${type}`, interaction.locale),
			flags: MessageFlags.Ephemeral,
		});

		return null;
	}

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

	const container = new ContainerBuilder();

	const titleTextDisplay = new TextDisplayBuilder().setContent(`# ${await client.localizeString("discord.commands.settings.messages.title", guildId)}`);

	container
		.addTextDisplayComponents(titleTextDisplay)
		.addSeparatorComponents(
			new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large),
		);

	const toggleTextDisplay = new TextDisplayBuilder().setContent(
		`### ${
			await client.localizeString("discord.commands.settings.messages.content.general.title", guildId)
		}\n${
			await client.localizeString("discord.commands.settings.messages.content.general.description", guildId)
		}`,
	);

	const toggleButton = new ButtonBuilder()
		.setCustomId("settings_toggle")
		.setLabel(currentSettings.enabled ? 
			await client.localizeString("discord.commands.settings.buttons.disable", guildId)
			: await client.localizeString("discord.commands.settings.buttons.enable", guildId)
		)
		.setStyle(
			currentSettings.enabled ? ButtonStyle.Danger : ButtonStyle.Success,
		);

	const toggleSection = new SectionBuilder()
		.setButtonAccessory(toggleButton)
		.addTextDisplayComponents(toggleTextDisplay);

	container
		.addSectionComponents(toggleSection)
		.addSeparatorComponents(new SeparatorBuilder().setDivider(true));

	const eventsTextDisplay = new TextDisplayBuilder().setContent(
		`### ${
			await client.localizeString("discord.commands.settings.messages.content.events.title", guildId)
		}\n${
			await client.localizeString("discord.commands.settings.messages.content.events.description", guildId)
		}`,
	);

	container.addTextDisplayComponents(eventsTextDisplay);

	const eventSelect = new StringSelectMenuBuilder()
		.setCustomId("settings_events")
		.setPlaceholder(await client.localizeString("discord.commands.settings.selects.events.placeholder", guildId))
		.setMaxValues(2)
		.addOptions([
			{
				label: await client.localizeString("discord.commands.settings.selects.events.options.new.label", guildId),
				value: "create",
				default: currentSettings.events.includes("create"),
				description: await client.localizeString("discord.commands.settings.selects.events.options.new.description", guildId),
			},
			{
				label: await client.localizeString("discord.commands.settings.selects.events.options.update.label", guildId),
				value: "update",
				default: currentSettings.events.includes("update"),
				description: await client.localizeString("discord.commands.settings.selects.events.options.update.description", guildId),
			},
		]);

	const eventRow =
		new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(eventSelect);

	container
		.addActionRowComponents(eventRow)
		.addSeparatorComponents(new SeparatorBuilder().setDivider(true));

		const keysTextDisplay = new TextDisplayBuilder().setContent(
		`### ${
			await client.localizeString("discord.commands.settings.messages.content.values.title", guildId)
		}\n${
			await client.localizeString("discord.commands.settings.messages.content.values.description", guildId)
		}`,
	);

	container.addTextDisplayComponents(keysTextDisplay);

	const keysSelect = new StringSelectMenuBuilder()
		.setCustomId("settings_keys")
		.setPlaceholder(await client.localizeString("discord.commands.settings.selects.values.placeholder", guildId))
		.setMaxValues(settingKeys.length)
		.addOptions(
			await Promise.all(
				settingKeys.map(async (key) => ({
				label: key.charAt(0).toUpperCase() + key.slice(1),
				value: key,
				default: currentSettings.filteredKeys.includes(key),
				description: await client.localizeString(`discord.commands.settings.selects.values.options.description`, guildId, {
					key: key
				}),
			}))
			),
		);

	const keysRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
		keysSelect,
	);

	container
		.addActionRowComponents(keysRow)
		.addSeparatorComponents(new SeparatorBuilder());


	const languageTextDisplay = new TextDisplayBuilder().setContent(
		`### ${
			await client.localizeString("discord.commands.settings.messages.content.language.title", guildId)
		}\n${
			await client.localizeString("discord.commands.settings.messages.content.language.description", guildId)
		}`,
	);

	container.addTextDisplayComponents(languageTextDisplay);

	const languageSelect = new StringSelectMenuBuilder()
		.setCustomId("settings_language")
		.setPlaceholder(await client.localizeString("discord.commands.settings.selects.language.placeholder", guildId))
		.setMaxValues(1)
		.addOptions(
			Object.keys(locales).map(locale => ({
				label: locale,
				value: locale,
				default: currentSettings.locale === locale,
			}))
		);

	const languageRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
		languageSelect,
	);

	container
		.addActionRowComponents(languageRow)
		.addSeparatorComponents(new SeparatorBuilder());

	const messagesTextDisplay = new TextDisplayBuilder()
		.setContent(
			`### ${
				await client.localizeString("discord.commands.settings.messages.content.messages.title", guildId)
			}\n${
				await client.localizeString("discord.commands.settings.messages.content.messages.description", guildId)
			}`,
		);

	container.addTextDisplayComponents(messagesTextDisplay);

	const editNewMessageButton = new ButtonBuilder()
		.setCustomId("settings_messageCreate")
		.setLabel(await client.localizeString("discord.commands.settings.buttons.editNewAddonMessage", guildId))
		.setStyle(ButtonStyle.Secondary)

	const editUpdateMessageButton = new ButtonBuilder()
		.setCustomId("settings_messageUpdate")
		.setLabel(await client.localizeString("discord.commands.settings.buttons.editUpdatedAddonMessage", guildId))
		.setStyle(ButtonStyle.Secondary)

	const messagesRow = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(editNewMessageButton, editUpdateMessageButton);

	container.addActionRowComponents(messagesRow);

	return container;
}
