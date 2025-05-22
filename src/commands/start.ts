import type { Command } from "@/types/handlers";
import { InlineKeyboard } from "grammy";

export default {
    name: "start",
    description: "Mostra un messaggio di benvenuto",
    displaySuggestion: true,

    async execute(ctx) {
        const allowed = await ctx.adminOnly(ctx);

        if (!allowed) return;

        const openSourceButton = new InlineKeyboard()
            .url("Visualizza il Codice", "https://github.com/Stef-00012/telegram-create-notifier")
            .row()

        const msgData = [
            'Benvenuto! Questo bot ti permette di ricevere notifiche quando viene creato un nuovo addon per la mod "Create" di Minecraft.',
            "I miei comandi sono:",
            "",
            "- <code>/setcanale</code> - Setta il canale in cui mandare le notifiche delle mod.",
            "- <code>/impostazioni</code> - Gestisci le impostazioni del bot, fra cui quali messaggi mandare (nuovi addon, addon aggiornati o entrambi), filtrare quando mandare il messaggio di un addon aggiornato (se attivo) e attivate/disattivare le notifiche del bot.",
            "",
            'Creato da @Stef_DP e pubblicato su GitHub.'
        ]

        return await ctx.reply(msgData.join("\n"), {
            reply_markup: openSourceButton,
            parse_mode: "HTML",
        });
    },
} satisfies Command;
