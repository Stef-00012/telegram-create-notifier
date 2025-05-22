import type { Context, Bot } from "grammy";

interface Command {
    name: string;
    description?: string;
    displaySuggestion?: boolean;
    adminOnly?: boolean;
    execute: (
        bot: Bot,
        ctx: Context
    ) => Promise<unknown> | unknown;
}

interface Event {
    name: string; // todo: use correct type
    execute: (bot: Bot, ctx: Context) => Promise<unknown> | unknown;
}