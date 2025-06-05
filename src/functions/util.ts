import type { BotContext as Context } from "@/bot";
import { EntitiesParser } from "@qz/telegram-entities-parser";
import type { Message } from "@qz/telegram-entities-parser/types";
import { localize } from "@/functions/localize";
import type { WsAddonDataAuthor } from "@/types/addonsWS";

type Result<T> = { removed: T[]; added: T[] };

const entitiesParser = new EntitiesParser();

export function compareArrays<T>(oldArray: T[], newArray: T[]): Result<T> {
	function isObject(item: unknown): item is Record<string, unknown> {
		return typeof item === "object" && item !== null;
	}

	function findIndex(arr: T[], target: T): number {
		if (isObject(target)) {
			const targetStr = JSON.stringify(target);
			return arr.findIndex((item) =>
				isObject(item) ? JSON.stringify(item) === targetStr : false,
			);
		}
		return arr.indexOf(target);
	}

	const removed = oldArray.filter((item) => findIndex(newArray, item) === -1);
	const added = newArray.filter((item) => findIndex(oldArray, item) === -1);

	return {
		removed,
		added,
	};
}

export async function adminOnly(ctx: Context) {
	const author = await ctx.getAuthor();

	if (ctx.config.ownerIds.includes(ctx.from?.id as number)) return true;

	if (
		ctx.chat?.type !== "private" &&
		["creator", "administrator"].includes(author.status)
	)
		return true;

	return false;
}

export function ownerOnly(ctx: Context) {
	return ctx.config.ownerIds.includes(ctx.from?.id as number);
}

export function parse(message: Message) {
	return entitiesParser
		.parse({ message })
		.replaceAll(
			'<blockquote class="tg-expandable-blockquote">',
			'<blockquote expandable class="tg-blockquote">',
		);
}

function parseConditional(
	text: string,
	variables: Record<string, unknown>,
	locale = "en",
) {
	const conditionalRegex =
		/{{\?(?<variable>.+?):(?<trueMsg>.*?)\|(?<falseMsg>.*?)\?}}/gims;

	return text.replace(
		conditionalRegex,
		(_match, variable, trueMsg, falseMsg) => {
		    console.debug("cond", variable, parseVariablePath(variable, variables, locale, true), parseVariablePath(variable, variables, locale))
			if (parseVariablePath(variable, variables, locale, true)) return parseConditional(trueMsg, variables, locale);

			return parseConditional(falseMsg, variables, locale);
		},
	);
}

export function parseVariables(
	_text: string,
	variables: Record<string, unknown>,
	locale = "en",
) {
	const variableRegex = /{{(?<variable>[^}]+?)}}/gim;

	const text = parseConditional(_text, variables);

	const parsedText = text.replace(variableRegex, (match, variable) => {
		return parseVariablePath(variable, variables, locale) || match;
	});

	const urlRegex =
		/\[(?<text>[^\]]+)\]\((?<url>http(s)?:\/\/([\w-])+\.([\w-]+[^)]*)+)\)/gim;

	return parsedText.replace(urlRegex, (match, text, url) => {
		if (text && url) return `<a href="${url}">${text}</a>`;

		return match;
	});
}

function parseVariablePath<Conditional extends boolean = false>(
	path: string,
	obj: Record<string, unknown>,
	locale = "en",
	conditional = false as Conditional,
): Conditional extends true ? unknown : string | null {
	const keys = path.split("/");
	let current: unknown = obj;
	let previousKey: string | null = null;
	let currentKey: string | null = null;

	for (const key of keys) {
		if (!conditional && (typeof current !== "object" || current === null))
			return null;

		if (key === "authorsUrl") {
			previousKey = currentKey;
			currentKey = key;
			current = (current as Record<string, unknown>).authors;

			continue;
		}

		if (
			(key === "added" || key === "removed") &&
			Array.isArray(
				(
					current as {
						old: string[] | WsAddonDataAuthor[];
						new: string[] | WsAddonDataAuthor[];
					}
				).new,
			) &&
			Array.isArray(
				(
					current as {
						old: string[] | WsAddonDataAuthor[];
						new: string[] | WsAddonDataAuthor[];
					}
				).old,
			)
		) {
			const { added, removed } = compareArrays(
				(
					current as {
						old: string[] | WsAddonDataAuthor[];
						new: string[] | WsAddonDataAuthor[];
					}
				).old as unknown[],
				(
					current as {
						old: string[] | WsAddonDataAuthor[];
						new: string[] | WsAddonDataAuthor[];
					}
				).new as unknown[],
			);

			previousKey = currentKey;
			currentKey = key;
			current =
				key === "added" ? added.filter(Boolean) : removed.filter(Boolean);

			continue;
		}

		if (!conditional && !(key in (current as Record<string, unknown>)))
			return null;

		previousKey = currentKey;
		currentKey = key;
		current = (current as Record<string, unknown>)[key];
	}

	if (Array.isArray(current)) {
		if (!conditional && (currentKey === "authors" || previousKey === "authors"))
			return current
				.filter(Boolean)
				.map((author: WsAddonDataAuthor) => author.name)
				.join(", ");

		if (
			!conditional &&
			(currentKey === "authorsUrl" || previousKey === "authorsUrl")
		)
			return current
				.filter(Boolean)
				.map((author: WsAddonDataAuthor) => `[${author.name}](${author.url})`)
				.join(", ");

		return current.filter(Boolean).every((item) => typeof item === "string")
			? current.join(", ")
			: null;
	}

	if (
		!conditional &&
		(currentKey === "clientSide" ||
			previousKey === "clientSide" ||
			currentKey === "serverSide" ||
			previousKey === "serverSide")
	) {
		current = localize(
			locale,
			`websocket.variables.clientServerSide.${current}`,
		);
	}

	if (conditional) {
		if (
			current &&
			typeof current === "object" &&
			Object.keys(current).length <= 0
		)
			return null;

		if (Array.isArray(current) && current.every((item) => !item)) return null;

		if (current) return current as Conditional extends true ? unknown : never;

		return null;
	}

	return typeof current === "string" ? current : null;
}
