import type { Context } from "@/bot";
import type {
	FilterQuery,
	Filter,
	Middleware,
	CommandMiddleware,
} from "grammy";

export interface Command {
	name: string;
	description?: string;
	displaySuggestion?: boolean;
	execute: CommandMiddleware<Context>;
}

export interface Event<T extends FilterQuery = FilterQuery> {
	name: T;
	execute: Middleware<Filter<Context, T>>;
}
