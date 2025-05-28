import { locales } from "@/bot";

export function localize(locale: string, key: string): string {
	if (!(locale in locales))
		return `<Unknown locale "${locale}" (key: "${key}")>`;

	return (
		locales[locale][key] ??
		`<Missing translation for "${key}" (locale: "${locale}")>`
	);
}
