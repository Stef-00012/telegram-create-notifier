import type { Client } from "@/discord/structures/DiscordClient";
import commands from "@/constants/commands";
import axios, { type AxiosError } from "axios";
import packageJson from "@/../package.json";

export default async function (client: Client) {
	console.log(`Logged in as ${client.user?.tag} (${client.user?.id})`);

	try {
		await axios.put(
			`https://discord.com/api/v10/applications/${client.user?.id}/commands`,
			commands,
			{
				headers: {
					Authorization: `Bot ${client.token}`,
					"Content-Type": "application/json; charset=UTF-8",
					"User-Agent": `DiscordBot (discord.js, ${packageJson.dependencies["discord.js"]} (modified))`,
				},
			},
		);
	} catch (err) {
		const error = err as AxiosError;

		console.error(JSON.stringify(error.response?.data, null, 2));
	}
}
