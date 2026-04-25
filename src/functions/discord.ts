import {
	type ActionRowBuilder,
	type ButtonBuilder,
	ContainerBuilder,
	SectionBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	ThumbnailBuilder,
} from "discord.js";

export function createAddonContainer(
	text: string,
	buttons: ActionRowBuilder<ButtonBuilder>,
	type: "create" | "update",
	iconUrl?: string | null,
	color?: number,
) {
	const mainTitleTextDisplay = new TextDisplayBuilder().setContent(
		`## ${type === "create" ? "New Addon Created" : "Addon Updated"}`,
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
