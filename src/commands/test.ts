import { defaultUpdatedAddonMessage } from "@/constants/defaults";
import { replaceVariables } from "@/functions/util";
import type { Command } from "@/types/handlers";

export default {
	name: "test",
	displaySuggestion: false,

	async execute(ctx) {
		await ctx.reply("default:");
		await ctx.reply(defaultUpdatedAddonMessage.text, {
			entities: defaultUpdatedAddonMessage.entities,
		});

        const replaced = replaceVariables(
            defaultUpdatedAddonMessage,
            {
                oldColor: "red",
                oldVersions: "1.18.2, 1.19.1",
                newVersions: "1.20, 1.20.1",
                oldModloaders: "Fabric, Quilt",
                newModloaders: "Fabric, Quilt",
            }
        )

		await ctx.reply("after variable replacement:");
		await ctx.reply(replaced.text, {
			entities: replaced.entities,
		});
	},
} satisfies Command;
