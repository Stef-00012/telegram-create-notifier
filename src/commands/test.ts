import type { Command } from "@/types/handlers";

export default {
    name: "test",
    description: "test",
    displaySuggestion: false,

    async execute(ctx) {
        const allowed = await ctx.adminOnly(ctx)

        if (!allowed) return;

        ctx.reply("test")
    },
} satisfies Command;
