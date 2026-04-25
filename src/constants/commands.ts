import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ChannelType,
	type APIApplicationCommand,
} from "discord.js";
import { locales } from "@/bot";

export default [
	{
		name: "setchannel",
		name_localizations: getLocalization("discord.commands.setchannel.name"),
		description:
			"Set the channel where the bot will send the notifications for the addons",
		description_localizations: getLocalization("discord.commands.setchannel.description"),
		type: ApplicationCommandType.ChatInput,
		options: [
			{
				type: ApplicationCommandOptionType.Channel,
				name: "channel",
				name_localizations: getLocalization("discord.commands.setchannel.options.channel.name"),
				description: "The channel to set for the notifications",
				description_localizations: getLocalization("discord.commands.setchannel.options.channel.description"),
				required: true,
				channel_types: [ChannelType.GuildText],
			},
		],
	},
	{
		name: "settings",
		name_localizations: getLocalization("discord.commands.settings.name"),
		description: "Manage the bot's settings",
		description_localizations: getLocalization("discord.commands.settings.description"),
		type: ApplicationCommandType.ChatInput,
	},
	{
		name: "preview",
		name_localizations: getLocalization("discord.commands.preview.name"),
		description: "Preview the new or updated addon message",
		description_localizations: getLocalization("discord.commands.preview.description"),
		type: ApplicationCommandType.ChatInput,
		options: [
			{
				type: ApplicationCommandOptionType.String,
				name: "type",
				name_localizations: getLocalization("discord.commands.preview.options.type.name"),
				description: "The type of message to preview",
				description_localizations: getLocalization("discord.commands.preview.options.type.description"),
				required: true,
				choices: [
					{ 
						name: "New Addon", 
						name_localizations: getLocalization("discord.commands.preview.options.type.choices.new"),
						value: "create",
					},
					{ 
						name: "Updated Addon",
						name_localizations: getLocalization("discord.commands.preview.options.type.choices.update"),
						value: "update" 
					},
				],
			},
		],
	},
	{
		name: "help",
		name_localizations: getLocalization("discord.commands.help.name"),
		description: "List the bot's commands",
		description_localizations: getLocalization("discord.commands.help.description"),
		type: ApplicationCommandType.ChatInput,
	},
	{
		name: "mod",
		name_localizations: getLocalization("discord.commands.mod.name"),
		description: "Get the info about a specific mod",
		description_localizations: getLocalization("discord.commands.mod.description"),
		type: ApplicationCommandType.ChatInput,
		options: [
			{
				name: "platform",
				name_localizations: getLocalization("discord.commands.mod.options.platform.name"),
				description: "The platform of the mod",
				description_localizations: getLocalization("discord.commands.mod.options.platform.description"),
				type: ApplicationCommandOptionType.String,
				required: true,
				choices: [
					{
						name: "Modrinth",
						name_localizations: getLocalization("discord.commands.mod.options.platform.choices.modrinth"),
						value: "modrinth"
					},
					{
						name: "Curseforge",
						name_localizations: getLocalization("discord.commands.mod.options.platform.choices.curseforge"),
						value: "curseforge"
					},
				],
			},
			{
				name: "id",
				name_localizations: getLocalization("discord.commands.mod.options.id.name"),
				description: "The ID of the mod",
				description_localizations: getLocalization("discord.commands.mod.options.id.description"),
				type: ApplicationCommandOptionType.String,
				required: true,
				autocomplete: true,
			},
		],
	},
	{
		name: "search",
		name_localizations: getLocalization("discord.commands.search.name"),
		description: "Search for create addons",
		description_localizations: getLocalization("discord.commands.search.description"),
		type: ApplicationCommandType.ChatInput,
		options: [
			{
				name: "query",
				name_localizations: getLocalization("discord.commands.search.options.query.name"),
				description:
					"A search term to filter addons by name, description, or slug",
				description_localizations: getLocalization("discord.commands.search.options.query.description"),
				type: ApplicationCommandOptionType.String,
				required: false,
			},
			{
				name: "modloader",
				name_localizations: getLocalization("discord.commands.search.options.modloader.name"),
				description: "The modloader to filter addons by",
				description_localizations: getLocalization("discord.commands.search.options.modloader.description"),
				type: ApplicationCommandOptionType.String,
				required: false,
				choices: [
					{
						name: "Quilt",
						name_localizations: getLocalization("discord.commands.search.options.modloader.choices.quilt"),
						value: "quilt"
					},
					{
						name: "Fabric",
						name_localizations: getLocalization("discord.commands.search.options.modloader.choices.fabric"),
						value: "fabric"
					},
					{
						name: "Forge",
						name_localizations: getLocalization("discord.commands.search.options.modloader.choices.forge"),
						value: "forge"
					},
					{
						name: "NeoForge",
						name_localizations: getLocalization("discord.commands.search.options.modloader.choices.neoforge"),
						value: "neoforge"
					},
					{
						name: "LiteLoader",
						name_localizations: getLocalization("discord.commands.search.options.modloader.choices.liteloader"),
						value: "liteloader"
					},
					{
						name: "Rift",
						name_localizations: getLocalization("discord.commands.search.options.modloader.choices.rift"),
						value: "rift"
					},
					{
						name: "Cauldron",
						name_localizations: getLocalization("discord.commands.search.options.modloader.choices.cauldron"),
						value: "cauldron"
					},
				],
			},
			{
				name: "version",
				name_localizations: getLocalization("discord.commands.search.options.version.name"),
				description: "The Minecraft version to filter addons by",
				description_localizations: getLocalization("discord.commands.search.options.version.description"),
				type: ApplicationCommandOptionType.String,
				required: false,
				autocomplete: true,
			},
			{
				name: "platform",
				name_localizations: getLocalization("discord.commands.search.options.platform.name"),
				description: "The platform to filter addons by",
				description_localizations: getLocalization("discord.commands.search.options.platform.description"),
				type: ApplicationCommandOptionType.String,
				required: false,
				choices: [
					{ name: "Modrinth", value: "modrinth" },
					{ name: "Curseforge", value: "curseforge" },
				],
			},
			{
				name: "sort",
				name_localizations: getLocalization("discord.commands.search.options.sort.name"),
				description: "The sorting order for the results",
				description_localizations: getLocalization("discord.commands.search.options.sort.description"),
				type: ApplicationCommandOptionType.String,
				required: false,
				choices: [
					{
						name: "Downloads",
						name_localizations: getLocalization("discord.commands.search.options.sort.choices.downloads"),
						value: "downloads"
					},
					{
						name: "Name",
						name_localizations: getLocalization("discord.commands.search.options.sort.choices.name"),
						value: "name"
					},
					{
						name: "Created",
						name_localizations: getLocalization("discord.commands.search.options.sort.choices.created"),
						value: "created"
					},
					{
						name: "Followers",
						name_localizations: getLocalization("discord.commands.search.options.sort.choices.followers"),
						value: "followers"
					},
					{
						name: "Last Updated",
						name_localizations: getLocalization("discord.commands.search.options.sort.choices.lastUpdated"),
						value: "lastUpdated"
					},
				],
			},
			{
				name: "page",
				name_localizations: getLocalization("discord.commands.search.options.page.name"),
				description: "The page number of the results to display",
				description_localizations: getLocalization("discord.commands.search.options.page.description"),
				type: ApplicationCommandOptionType.Integer,
				required: false,
				min_value: 1,
			},
			{
				name: "ephemeral",
				name_localizations: getLocalization("discord.commands.search.options.ephemeral.name"),
				description: "Whether to send the response as ephemeral",
				description_localizations: getLocalization("discord.commands.search.options.ephemeral.description"),
				type: ApplicationCommandOptionType.Boolean,
				required: false,
			},
		],
	},
] as APIApplicationCommand[];

function getLocalization(key: string) {
    return Object.entries(locales).reduce((acc, [locale, translations]) => {
        const translation = translations[key];

        if (translation) acc[locale] = translation;

        return acc;
    }, {} as Record<string, string>);
}