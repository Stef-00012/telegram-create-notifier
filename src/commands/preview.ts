import { parseVariables } from "@/functions/util";
import type { CreateMessage, UpdateMessage } from "@/types/addonsWS";
import type { Command } from "@/types/handlers";

const newAddon: CreateMessage["data"][0] = {
	platforms: ["modrinth", "curseforge"],
	modData: {
		curseforge: {
			slug: "create",
			authors: [
				{
					name: "simibubi",
					url: "https://www.curseforge.com/members/simibubi",
				},
			],
			downloads: 4160282,
			description: "Aesthetic Technology that empowers the Player",
			icon: "https://cdn.modrinth.com/data/LNytGWDc/61d716699bcf1ec42ed4926a9e1c7311be6087e2_96.webp",
			name: "Create",
			version: "1.21.1",
			versions: ["1.18.2", "1.19.2", "1.20.1", "1.21.1"],
			categories: ["decoration", "technology", "utility"],
			follows: 3327,
			created: "2022-07-07T21:24:43.018879Z",
			modified: "2025-03-19T20:01:47.053628Z",
			color: 6639722,
			license: "MIT",
			clientSide: "required",
			serverSide: "required",
			modloaders: ["forge", "neoforge"],
			id: "aa",
		},
		modrinth: {
			slug: "create",
			authors: [
				{
					name: "simibubi",
					url: "https://modrinth.com/user/simibubi",
				},
			],
			downloads: 4160282,
			description: "Aesthetic Technology that empowers the Player",
			icon: "https://cdn.modrinth.com/data/LNytGWDc/61d716699bcf1ec42ed4926a9e1c7311be6087e2_96.webp",
			name: "Create",
			version: "1.21.1",
			versions: ["1.18.2", "1.19.2", "1.20.1", "1.21.1"],
			categories: ["decoration", "technology", "utility"],
			follows: 3327,
			created: "2022-07-07T21:24:43.018879Z",
			modified: "2025-03-19T20:01:47.053628Z",
			color: 6639722,
			license: "MIT",
			clientSide: "required",
			serverSide: "required",
			modloaders: ["forge", "neoforge"],
			id: "aa",
		},
	},
};

const updatedAddon: UpdateMessage["data"][0] = {
	name: "Create",
	platforms: ["modrinth", "curseforge"],
	slugs: {
		curseforge: "create",
		modrinth: "create",
	},
	changes: {
		curseforge: {
			name: {
				old: "Create",
				new: "Create Reimagined",
			},
			description: {
				old: "Aesthetic Technology that empowers the Player",
				new: "Aesthetic Technology that empowers the Player with new features",
			},
			versions: {
				old: ["1.18.2", "1.19.2", "1.20.1", "1.21.1"],
				new: ["1.18.2", "1.19.2", "1.20.1", "1.21.1", "1.22.0"],
			},
			categories: {
				old: ["decoration", "technology", "utility"],
				new: ["decoration", "technology", "utility", "performance"],
			},
			follows: {
				old: 3327,
				new: 3500,
			},
			downloads: {
				old: 4160282,
				new: 4200000,
			},
			created: {
				old: "2022-07-07T21:24:43.018879Z",
				new: "2024-12-097T18:37:41.018879Z",
			},
			modloaders: {
				old: ["forge", "neoforge"],
				new: ["forge", "neoforge", "fabric"],
			},
			clientSide: {
				old: "required",
				new: "optional",
			},
			serverSide: {
				old: "required",
				new: "unsupported",
			},
			icon: {
				old: "https://cdn.modrinth.com/data/LNytGWDc/61d716699bcf1ec42ed4926a9e1c7311be6087e2_96.webp",
				new: "https://cdn.modrinth.com/data/LNytGWDc/61d716699bcf1ec42ed4926a9e1c7311be6087e2_128.webp",
			},
			modified: {
				old: "2025-03-19T20:01:47.053628Z",
				new: "2025-03-20T10:00:00.000000Z",
			},
			color: {
				old: 6639722,
				new: 16777215,
			},
			license: {
				old: "MIT",
				new: "Apache-2.0",
			},
		},
		modrinth: {
			name: {
				old: "Create",
				new: "Create Reimagined",
			},
			description: {
				old: "Aesthetic Technology that empowers the Player",
				new: "Aesthetic Technology that empowers the Player with new features",
			},
			versions: {
				old: ["1.18.2", "1.19.2", "1.20.1", "1.21.1"],
				new: ["1.18.2", "1.19.2", "1.20.1", "1.21.1", "1.22.0"],
			},
			categories: {
				old: ["decoration", "technology", "utility"],
				new: ["decoration", "technology", "utility", "performance"],
			},
			follows: {
				old: 3327,
				new: 3500,
			},
			downloads: {
				old: 4160282,
				new: 4200000,
			},
			created: {
				old: "2022-07-07T21:24:43.018879Z",
				new: "2024-12-097T18:37:41.018879Z",
			},
			modloaders: {
				old: ["forge", "neoforge"],
				new: ["forge", "neoforge", "fabric"],
			},
			clientSide: {
				old: "required",
				new: "optional",
			},
			serverSide: {
				old: "required",
				new: "unsupported",
			},
			icon: {
				old: "https://cdn.modrinth.com/data/LNytGWDc/61d716699bcf1ec42ed4926a9e1c7311be6087e2_96.webp",
				new: "https://cdn.modrinth.com/data/LNytGWDc/61d716699bcf1ec42ed4926a9e1c7311be6087e2_128.webp",
			},
			modified: {
				old: "2025-03-19T20:01:47.053628Z",
				new: "2025-03-20T10:00:00.000000Z",
			},
			color: {
				old: 6639722,
				new: 16777215,
			},
			license: {
				old: "MIT",
				new: "Apache-2.0",
			},
		},
	},
};

export default {
	name: "preview",
	description: "Display a preview of the new and updated addon messages",
	displaySuggestion: true,
	adminOnly: true,

	async execute(ctx) {
		const args = ctx.msg.text.split(" ");
		args.shift();

		if (!ctx.dbChat)
			return ctx.localizedReply("commands.preview.messages.notConfigured");

		if (args[0] === "new") {
			const msg = ctx.dbChat.newAddonMessage;

			const parsedMessage = parseVariables(
				msg,
				{
					platforms: newAddon.platforms,
					...newAddon.modData,
				},
				ctx.locale,
			);

			return await ctx.reply(parsedMessage, {
				parse_mode: "HTML",
			});
		}

		if (args[0] === "update") {
			const msg = ctx.dbChat.updatedAddonMessage;

			const parsedMessage = parseVariables(
				msg,
				{
					...updatedAddon.changes,
					name: updatedAddon.name,
				},
				ctx.locale,
			);

			return await ctx.reply(parsedMessage, {
				parse_mode: "HTML",
			});
		}

		return ctx.localizedReply("commands.preview.messages.invalidArgs");
	},
} satisfies Command;
