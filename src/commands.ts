import type { BotCommand } from "grammy/types";

export const commands: BotCommand[] = [
	{
		command: "setcanale",
		description: "Setta il canale in cui mandare le notifiche delle mod",
	},
	// {
	// 	command: "unsetcanale",
	// 	description: "Setta il canale in cui mandare le notifiche delle mod",
	// },
	{
		command: "toggle",
		description: "Abilita o disabilita le notifiche per la chat",
	},

];
