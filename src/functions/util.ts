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

	const ownerIds = process.env.OWNER_IDS?.split(",").map((id) => Number(id)) || [];

	if (ownerIds.includes(ctx.from?.id as number)) return true;

	if (
		ctx.chat?.type !== "private" &&
		["creator", "administrator"].includes(author.status)
	)
		return true;

	return false;
}

export function ownerOnly(ctx: Context) {
	const ownerIds = process.env.OWNER_IDS?.split(",").map((id) => Number(id)) || [];

	return ownerIds.includes(ctx.from?.id as number);
}

export function parse(message: Message) {
	return entitiesParser
		.parse({ message })
		.replaceAll(
			'<blockquote class="tg-expandable-blockquote">',
			'<blockquote expandable class="tg-blockquote">',
		);
}

function findConditionals(text: string) {
	const results: {
		variable: string;
		trueMsg: string;
		falseMsg: string;
		raw: string;
		start: number;
		end: number;
	}[] = [];

	let i = 0;
	while (i < text.length) {
		const start = text.indexOf("{{?", i);

		if (start === -1) break;

		let depth = 1;
		let j = start + 3;

		while (j < text.length && depth > 0) {
			if (text.startsWith("{{?", j)) {
				depth++;
				j += 3;
			} else if (text.startsWith("?}}", j)) {
				depth--;
				j += 3;
			} else {
				j++;
			}
		}

		if (depth === 0) {
			const raw = text.slice(start, j);
			const inner = raw.slice(3, -3);

			const colonIdx = inner.indexOf(":");
			const pipeIdx = inner.lastIndexOf("|");

			if (colonIdx !== -1 && pipeIdx !== -1 && pipeIdx > colonIdx) {
				const variable = inner.slice(0, colonIdx);
				const trueMsg = inner.slice(colonIdx + 1, pipeIdx);
				const falseMsg = inner.slice(pipeIdx + 1);

				results.push({
					variable,
					trueMsg,
					falseMsg,
					raw,
					start,
					end: j,
				});
			}

			i = j;
		} else {
			break;
		}
	}

	return results;
}

function parseConditional(
	_text: string,
	variables: Record<string, unknown>,
	locale = "en",
) {
	let text = _text;
	const conditionals = findConditionals(text);

	for (const conditional of conditionals) {
		const { variable, trueMsg, falseMsg, raw } = conditional;

		if (parseVariablePath(variable, variables, locale, true)) {
			text = text.replace(raw, parseConditional(trueMsg, variables, locale));
			continue;
		}

		text = text.replace(raw, parseConditional(falseMsg, variables, locale));
	}

	return text;
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
	const parts = path.split("/");
	let prevKey: string | null = null;
	let current: unknown = obj;

	for (let i = 0; i < parts.length; i++) {
		const key = parts[i];
		const prevObj = current as Record<string, unknown> | null;

		if (!prevObj) return null;

		if (
			["added", "removed", "authorsUrl"].every((item) => key !== item) &&
			!(key in prevObj)
		)
			return null;

		if (key === "authorsUrl") {
			current = prevObj.authors;
			prevKey = key;

			if (i === parts.length - 1) {
				return (current as WsAddonDataAuthor[])
					.filter(Boolean)
					.map((author) => `<a href="${author.url}">${author.name}</a>`)
					.join(", ");
			}

			continue;
		}

		if (Array.isArray(prevObj[key])) {
			if (key === "authors" || prevKey === "authors") {
				prevKey = key;

				return (prevObj[key] as WsAddonDataAuthor[])
					.filter(Boolean)
					.map((author) => author.name)
					.join(", ");
			}

			if (key === "authorsUrl" || prevKey === "authorsUrl") {
				prevKey = key;

				return (prevObj[key] as WsAddonDataAuthor[])
					.filter(Boolean)
					.map((author) => `<a href="${author.url}">${author.name}</a>`)
					.join(", ");
			}

			return (prevObj[key] as unknown[]).filter(Boolean).join(", ");
		}

		if (
			typeof prevObj === "object" &&
			prevObj !== null &&
			("new" in prevObj || "old" in prevObj) &&
			(Array.isArray((prevObj as { old?: unknown[]; new?: unknown[] }).old) ||
				Array.isArray((prevObj as { old?: unknown[]; new?: unknown[] }).new))
		) {
			const previousItem = prevObj as Record<
				"old" | "new",
				WsAddonDataAuthor[] | string[]
			>;

			if (key === "added" || key === "removed") {
				const comparedArrays = compareArrays(
					previousItem.old as unknown[],
					previousItem.new as unknown[],
				);

				if (prevKey === "authors") {
					prevKey = key;

					return (comparedArrays[key] as WsAddonDataAuthor[])
						.filter(Boolean)
						.map((author) => author.name)
						.join(", ");
				}

				if (prevKey === "authorsUrl") {
					prevKey = key;

					return (comparedArrays[key] as WsAddonDataAuthor[])
						.filter(Boolean)
						.map((author) => `<a href="${author.url}">${author.name}</a>`)
						.join(", ");
				}

				prevKey = key;

				return (comparedArrays[key] as unknown[]).filter(Boolean).join(", ");
			}

			if (key === "new" || key === "old") {
				if (prevKey === "authors") {
					prevKey = key;

					return (previousItem[key] as WsAddonDataAuthor[])
						.filter(Boolean)
						.map((author) => author.name)
						.join(", ");
				}

				if (prevKey === "authorsUrl") {
					prevKey = key;

					return (previousItem[key] as WsAddonDataAuthor[])
						.filter(Boolean)
						.map((author) => `<a href="${author.url}">${author.name}</a>`)
						.join(", ");
				}

				return (previousItem[key] as unknown[]).filter(Boolean).join(", ");
			}
		}

		if (
			((prevKey === "clientSide" || prevKey === "serverSide") &&
				(key === "old" || key === "new")) ||
			((key === "clientSide" || key === "serverSide") &&
				typeof prevObj[key] === "string")
		) {
			if (key === "clientSide" || key === "serverSide") {
				prevKey = key;

				return localize(
					locale,
					`websocket.variables.clientServerSide.${prevObj[key]}`,
				);
			}

			prevKey = key;

			return localize(
				locale,
				`websocket.variables.clientServerSide.${prevObj[key]}`,
			);
		}

		if (
			((prevKey === "created" || prevKey === "modified") &&
				(key === "old" || key === "new")) ||
			((key === "created" || key === "modified") &&
				typeof prevObj[key] === "string")
		) {
			if (key === "created" || key === "modified") {
				prevKey = key;

				return new Date(prevObj[key] as string).toLocaleString(locale ?? "en");
			}

			prevKey = key;

			return new Date(prevObj[key] as string).toLocaleString(locale ?? "en");
		}

		prevKey = key;
		current = prevObj[key];
	}

	if (!conditional && typeof current !== "string") return null;

	if (typeof current === "object" && Object.keys(current || {}).length <= 0)
		return null;
	if (Array.isArray(current) && current.length <= 0) return null;
	if (typeof current === "string" && current.trim().length <= 0) return null;

	return current as Conditional extends true ? unknown : string | null;
}
