import path from "node:path";
import fs from "node:fs";

const localesDir = path.join(__dirname, "../locales");

export async function localize(locale: string, key: string): Promise<string> {
	try {
		if (!fs.existsSync(`${localesDir}/${locale}.json`)) {
			return `<Unknown locale "${locale}">`;
		}

		const localeData: Record<string, string> = await import(
			`${localesDir}/${locale}.json`
		);

		if (localeData[key]) return localeData[key];

		return `<Missing translation for "${key}">`;
	} catch (e) {
		return `<Unknown locale "${locale}">`;
	}
}
