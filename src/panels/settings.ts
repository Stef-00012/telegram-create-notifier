import { settingKeyNames } from "@/constants/keys";
import type { DBEvents } from "@/db/schemas/chats";
import type { WSAddonKeys } from "@/types/addonsWS";
import { InlineKeyboard } from "grammy";

interface Data {
    filteredKeys: WSAddonKeys[];
    enabled: boolean;
    events: DBEvents
}

export type Sections = "home" | "filters" | "events"

export async function getSettingsPanel(section: Sections = "home", data?: Partial<Data>) {
    const settingsPanel = new InlineKeyboard()
    
    if (section === "home") {
        settingsPanel
            .text("Filtri", "go__filters").row()
            .text("Eventi", "go__events").row()
            .text(`${data?.enabled ? "✔️ " : ""}Notifiche Attive`, "settingstoggle_enabled")
    } else if (section === "filters") {
        let count = 0;

        for (const [_key, value] of Object.entries(settingKeyNames)) {
            const key = _key as WSAddonKeys

            settingsPanel.text(`${data?.filteredKeys?.includes(key) ? "✔️ " : ""}${value}`, `filters_${key}`);
            count++;

            if (count % 2 === 0) {
                settingsPanel.row();
            } else if (count === Object.keys(settingKeyNames).length) {
                settingsPanel.row()
            }
        }

        settingsPanel.text("Indietro", "go__home")
    } else if (section === "events") {
        settingsPanel
            .text(`${data?.events?.includes("create") ? "✔️ " : ""}Nuovo Addon`, "events_create")
            .text(`${data?.events?.includes("update") ? "✔️ " : ""}Addon Aggiornato`, "events_update").row()
            .text("Indietro", "go__home")
    }

    return settingsPanel;
}