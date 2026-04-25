import { newAddon, updatedAddon } from "@/constants/previewData";
import { parseVariables } from "@/functions/util";
import type { TelegramCommand } from "@/types/handlers";

export default {
	name: "preview",
	description: "Display a preview of the new and updated addon messages",
	displaySuggestion: true,
	adminOnly: true,

	async execute(ctx) {
		const args = ctx.msg.text.split(" ");
		args.shift();

		if (!ctx.dbChat)
			return ctx.localizedReply("telegram.commands.preview.messages.notConfigured");

		if (args[0] === "new") {
			const msg = ctx.dbChat.newAddonMessage;

			if (args[1] === "raw") {
				return await ctx.reply(msg, {
					link_preview_options: {
						is_disabled: true,
					},
				});
			}

			const parsedMessage = parseVariables(
				msg,
				{
					platforms: newAddon.platforms,
					...newAddon.modData,
				},
				ctx.locale,
				false,
			);

			return await ctx.reply(parsedMessage, {
				parse_mode: "HTML",
				link_preview_options: {
					is_disabled: true,
				},
			});
		}

		if (args[0] === "update") {
			const msg = ctx.dbChat.updatedAddonMessage;

			if (args[1] === "raw") {
				return await ctx.reply(msg, {
					link_preview_options: {
						is_disabled: true,
					},
				});
			}

			const parsedMessage = parseVariables(
				msg,
				{
					...updatedAddon.changes,
					names: updatedAddon.names,
				},
				ctx.locale,
				false,
			);

			return await ctx.reply(parsedMessage, {
				parse_mode: "HTML",
				link_preview_options: {
					is_disabled: true,
				},
			});
		}

		return ctx.localizedReply("telegram.commands.preview.messages.invalidArgs");
	},
} satisfies TelegramCommand;
