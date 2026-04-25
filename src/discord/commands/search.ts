import type { DiscordCommand, SortOrders } from "@/types/discord";
import type { Modloaders, Platforms, WSAddon } from "@/types/addonsWS";
import axios from "axios";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction,
	ComponentType,
	ContainerBuilder,
	MessageFlags,
	SectionBuilder,
	TextDisplayBuilder,
	ThumbnailBuilder,
} from "discord.js";
import type { Client } from "@/discord/structures/DiscordClient";

export default {
	name: "search",

	async autocomplete(_client, interaction) {
		const version = interaction.options.getFocused();

		const versionsUrl = `http${process.env.CREATE_ADDONS_SECURE === "true" ? "s" : ""}://${process.env.CREATE_ADDONS_BASE_URL}/api/versions`;
		
		try {
			const res = await axios.get(versionsUrl)

			const versions = res.data as string[];

			return await interaction.respond(versions.filter((ver) => ver.startsWith(version)).map((ver) => ({
				name: ver,
				value: ver,
			})).slice(0, 25))
		} catch(_e) {
			return await interaction.respond([]);
		}
	},

	async execute(client, interaction) {
		const query = interaction.options.getString("query");
		const modloader = interaction.options.getString("modloader",) as Modloaders | null;
		const version = interaction.options.getString("version");
		const platform = interaction.options.getString("platform",) as Platforms | null;
		const sort = interaction.options.getString("sort") as SortOrders | null;
		const ephemeral = interaction.options.getBoolean("ephemeral") ?? false;
		const page = interaction.options.getInteger("page") ?? 1;

		await interaction.deferReply({
			flags: ephemeral ? MessageFlags.Ephemeral : undefined,
		});

		const searchParams = new URLSearchParams();

		if (query) searchParams.append("search", encodeURIComponent(query));
		if (modloader)
			searchParams.append("modloader", encodeURIComponent(modloader));
		if (version) searchParams.append("version", encodeURIComponent(version));
		if (platform) searchParams.append("platform", encodeURIComponent(platform));
		if (sort) searchParams.append("sort", encodeURIComponent(sort));
		if (typeof page === "number")
			searchParams.append("page", encodeURIComponent((page - 1).toString()));

		const addonsUrl = `http${process.env.CREATE_ADDONS_SECURE === "true" ? "s" : ""}://${process.env.CREATE_ADDONS_BASE_URL}/api/addons?${searchParams}`;

		const guildId = interaction.guildId || interaction.guild?.id || "";

		try {
			const res = await axios.get(addonsUrl);

			const data = res.data.mods as WSAddon[];
			const totalPages = res.data.totalPages as number;

			if (data.length === 0) {
				return interaction.editReply({
					content: await client.localizeString("discord.commands.search.messages.noResults", guildId),
				});
			}

			let localPage = 0;

			const mods = await Promise.all(
				data.map(async (addon) => {
					const buttons = new ActionRowBuilder<ButtonBuilder>();

					const modrinthUrl =
						addon.modData.modrinth?.slug &&
						`https://modrinth.com/${addon.modData.modrinth.slug}`;
					const curseforgeUrl =
						addon.modData.curseforge?.slug &&
						`https://www.curseforge.com/minecraft/mc-mods/${addon.modData.curseforge.slug}`;

					if (modrinthUrl) {
						const button = new ButtonBuilder()
							.setLabel(
								await client.localizeString("websocket.messages.openOnModrinth", guildId),
							)
							.setStyle(ButtonStyle.Link)
							.setEmoji({
								id: process.env.MODRINTH_EMOJI_ID,
								name: "modrinth",
							})
							.setURL(modrinthUrl);

						buttons.addComponents(button);
					}

					if (curseforgeUrl) {
						const button = new ButtonBuilder()
							.setLabel(
								await client.localizeString("websocket.messages.openOnCurseforge", guildId),
							)
							.setStyle(ButtonStyle.Link)
							.setEmoji({
								id: process.env.CURSEFORGE_EMOJI_ID,
								name: "curseforge",
							})
							.setURL(curseforgeUrl);

						buttons.addComponents(button);
					}

					return {
						text: `## **${addon.modData.modrinth?.name ?? addon.modData.curseforge?.name}**\n${addon.modData.modrinth?.description ?? addon.modData.curseforge?.description}`,
						buttons,
						icon: (addon.modData.modrinth?.icon ??
							addon.modData.curseforge?.icon) as string,
					};
				})
			);

			const pages = Array.from({ length: Math.ceil(mods.length / 5) }, (_, i) =>
				mods.slice(i * 5, (i + 1) * 5),
			);

			const components = await generateComponents(
				client,
				interaction,
				page,
				totalPages,
				localPage,
				query,
				false,
				pages,
			);

			const msg = await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});

			const collector = msg.createMessageComponentCollector({
				componentType: ComponentType.Button,
				time: 3 * 60 * 1000, // 3 minutes
			});

			collector.on("collect", async (int) => {
				const buttonId = int.customId as
					| "coll_first"
					| "coll_prev"
					| "coll_next"
					| "coll_last";

				if (int.user.id !== interaction.user.id) {
					return await int.reply({
						content: await client.localizeString("discord.commands.search.buttons.unauthorized", guildId),
						flags: MessageFlags.Ephemeral,
					});
				}

				switch (buttonId) {
					case "coll_first": {
						localPage = 0;

						const components = await generateComponents(
							client,
							interaction,
							page,
							totalPages,
							localPage,
							query,
							false,
							pages,
						);

						await int.update({
							components,
							flags: MessageFlags.IsComponentsV2,
						});

						break;
					}

					case "coll_prev": {
						if (localPage > 0) {
							localPage--;
						}

						const components = await generateComponents(
							client,
							interaction,
							page,
							totalPages,
							localPage,
							query,
							false,
							pages,
						);

						await int.update({
							components,
							flags: MessageFlags.IsComponentsV2,
						});

						break;
					}

					case "coll_next": {
						if (localPage < pages.length - 1) {
							localPage++;
						}

						const components = await generateComponents(
							client,
							interaction,
							page,
							totalPages,
							localPage,
							query,
							false,
							pages,
						);

						await int.update({
							components,
							flags: MessageFlags.IsComponentsV2,
						});

						break;
					}

					case "coll_last": {
						localPage = pages.length - 1;

						const components = await generateComponents(
							client,
							interaction,
							page,
							totalPages,
							localPage,
							query,
							false,
							pages,
						);

						await int.update({
							components,
							flags: MessageFlags.IsComponentsV2,
						});

						break;
					}
				}
			});

			collector.on("end", async () => {
				if (msg.editable) {
					const components = await generateComponents(
							client,
							interaction,
						page,
						totalPages,
						localPage,
						query,
						true,
						pages,
					);

					await msg.edit({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
			});
		} catch (_e) {
			return await interaction.editReply({
				content: await client.localizeString("discord.commands.search.messages.error", guildId),
			});
		}
	},
} satisfies DiscordCommand;

async function generateComponents(
	client: Client,
	interaction: ChatInputCommandInteraction,
	page: number,
	totalPages: number,
	localPage: number,
	query: string | null,
	disabled: boolean,
	pages: {
		text: string;
		buttons: ActionRowBuilder<ButtonBuilder>;
		icon: string;
	}[][],
) {
	const guildId = interaction.guildId || interaction.guild?.id || "";

	const titleContent = query ?
		await client.localizeString("discord.commands.search.messages.title.resultsFor", guildId, {
			query: query,
		}) :
		await client.localizeString("discord.commands.search.messages.title.results", guildId);

	const title = new TextDisplayBuilder().setContent(
		`# ${titleContent}`,
	);

	const container = new ContainerBuilder().addTextDisplayComponents(title);

	for (const mod of pages[localPage]) {
		const name = new TextDisplayBuilder().setContent(mod.text);
		const thumbnail = new ThumbnailBuilder().setURL(mod.icon);

		const section = new SectionBuilder()
			.addTextDisplayComponents(name)
			.setThumbnailAccessory(thumbnail);

		container.addSectionComponents(section).addActionRowComponents(mod.buttons);
	}

	const footer = new TextDisplayBuilder().setContent(
		`-# ${await client.localizeString("discord.commands.search.messages.footer.page", guildId)} ${page}/${totalPages}`,
	);

	container.addTextDisplayComponents(footer);

	const paginationRow = new ActionRowBuilder<ButtonBuilder>();

	const firstButton = new ButtonBuilder()
		.setCustomId("coll_first")
		.setLabel("<<")
		.setStyle(ButtonStyle.Secondary)
		.setDisabled(disabled || localPage === 0);

	const prevButton = new ButtonBuilder()
		.setCustomId("coll_prev")
		.setLabel("<")
		.setStyle(ButtonStyle.Secondary)
		.setDisabled(disabled || localPage === 0);

	const selectButton = new ButtonBuilder()
		.setCustomId("coll_select")
		.setLabel(`${localPage + 1}/${pages.length}`)
		.setStyle(ButtonStyle.Secondary)
		.setDisabled(true);

	const nextButton = new ButtonBuilder()
		.setCustomId("coll_next")
		.setLabel(">")
		.setStyle(ButtonStyle.Secondary)
		.setDisabled(disabled || localPage === pages.length - 1);

	const lastButton = new ButtonBuilder()
		.setCustomId("coll_last")
		.setLabel(">>")
		.setStyle(ButtonStyle.Secondary)
		.setDisabled(disabled || localPage === pages.length - 1);

	paginationRow.addComponents(
		firstButton,
		prevButton,
		selectButton,
		nextButton,
		lastButton,
	);

	return [container, paginationRow];
}
