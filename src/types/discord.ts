import type { Client } from "@/discord/structures/DiscordClient";
import type {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
} from "discord.js";

type BaseCommand = {
	name: string;
};

export type DiscordCommand = BaseCommand & {
	execute: (
		client: Client,
		interaction: ChatInputCommandInteraction,
	) => unknown;
	autocomplete?: (
		client: Client,
		interaction: AutocompleteInteraction,
	) => unknown;
};

export type AutocompleteModsResult = {
	name: string;
	slug: string;
};

export type SortOrders =
	| "name"
	| "downloads"
	| "followers"
	| "lastUpdated"
	| "created";