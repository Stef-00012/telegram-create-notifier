import { locales } from "@/bot";

export function localize(_locale: string, key: string, variables?: Record<string, string>): string {
	let locale = _locale;
	
	if (!(locale in locales)) locale = "en-US"; 

	const translation = locales[locale][key];

	if (!translation) {
		console.error(`\x1b[31mMissing translation for \x1b[0m"${key}" \x1b[31m(locale: \x1b[0m"${locale}"\x1b[31m)\x1b[0m`);

		return `<Missing Translation>`;
	}

	if (variables) {
		return Object.keys(variables).reduce((string, variableKey) => {
			const varValue = variables[variableKey];
			return string.replace(new RegExp(`{{${variableKey}}}`, "g"), varValue);
		}, translation);
	}

	return translation;
}
