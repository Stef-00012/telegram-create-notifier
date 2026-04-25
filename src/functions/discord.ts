import type { Client } from "@/discord/structures/DiscordClient";
import {
	type ActionRowBuilder,
	type ButtonBuilder,
	ContainerBuilder,
	SectionBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	ThumbnailBuilder,
} from "discord.js";

export async function createAddonContainer(
	text: string,
	buttons: ActionRowBuilder<ButtonBuilder>,
	type: "create" | "update",
	client: Client,
	locale: string | null = "en-US",
	guildId?: string | null,
	iconUrl?: string | null,
	color?: number,
) {
	const createdTitle = locale 
		? await client.localizeStringWithLocale("websocket.messages.discord.addonCreated", locale)
		: guildId
			? await client.localizeString("websocket.messages.discord.addonCreated", guildId)
			: "New Addon Created";

	const updatedTitle = locale
		? await client.localizeStringWithLocale("websocket.messages.discord.addonUpdated", locale)
		: guildId
			? await client.localizeString("websocket.messages.discord.addonUpdated", guildId)
			: "Addon Updated";

	const mainTitleTextDisplay = new TextDisplayBuilder().setContent(
		`## ${type === "create" 
			? createdTitle 
			: updatedTitle
		}`,
	);

	const mainTextDisplay = new TextDisplayBuilder().setContent(text);

	const container = new ContainerBuilder().setAccentColor(color);

	if (iconUrl) {
		const thumbnail = new ThumbnailBuilder().setURL(iconUrl);

		const section = new SectionBuilder()
			.addTextDisplayComponents(mainTitleTextDisplay, mainTextDisplay)
			.setThumbnailAccessory(thumbnail);

		container.addSectionComponents(section);
	} else {
		container.addTextDisplayComponents(mainTitleTextDisplay, mainTextDisplay);
	}

	const platformsTitle = new TextDisplayBuilder().setContent("### Platforms");

	container
		.addSeparatorComponents(new SeparatorBuilder())
		.addTextDisplayComponents(platformsTitle)
		.addActionRowComponents(buttons);

	return container;
}
