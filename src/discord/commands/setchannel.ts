import type { DiscordCommand } from "@/types/discord";
import { ChannelType, MessageFlags, PermissionFlagsBits } from "discord.js";

export default {
    name: "setchannel",

    async execute(client, interaction) {
        if (!interaction.guildId) return interaction.reply({
            content: await client.localizeStringWithLocale("discord.messages.general.serverOnly.command", interaction.locale),
            flags: MessageFlags.Ephemeral
        })

        const guildId = interaction.guildId || interaction.guild?.id || "";
        
        if (!interaction.guild?.members.me?.permissions.has(PermissionFlagsBits.ManageWebhooks)) return interaction.reply({
            content: await client.localizeString("discord.commands.setchannel.messages.error.missingPermission", guildId),
            flags: MessageFlags.Ephemeral
        })
        
        const channel = interaction.options.getChannel("channel", true, [ChannelType.GuildText]);
        
        if (!channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.ManageWebhooks)) {
            return interaction.reply({
                content: await client.localizeString("discord.commands.setchannel.messages.error.missingPermissionChannel", guildId, { 
                    channel: channel.toString() 
                }),
                flags: MessageFlags.Ephemeral
            })
        }
        
        let webhookUrl: string;
        
        try {
            const webhook = await channel.createWebhook({
                name: client.user?.displayName || client.user?.username || "Create Addons Notifier",
                avatar: client.user?.displayAvatarURL(),
                reason: `Create Addons Notification channel set by ${interaction.user.username} (${interaction.user.id})`
            })
            
            webhookUrl = webhook.url;
        } catch(_e) {
            return await interaction.reply({
                content: await client.localizeString("discord.commands.setchannel.messages.error.createWebhook", guildId),
                flags: MessageFlags.Ephemeral
            })
        }

        await client.db
            .insert(client.dbSchema.guilds)
            .values({
                id: interaction.guildId,
                webhook: webhookUrl,
                channel: channel.id,
            })
            .onConflictDoUpdate({
                target: [client.dbSchema.guilds.id],
                set: {
                    webhook: webhookUrl,
                    channel: channel.id,
                },
            })

        await interaction.reply({
            content: await client.localizeString("discord.commands.setchannel.messages.success", guildId, {
                channel: channel.toString()
            }),
            flags: MessageFlags.Ephemeral
        })
    }
} satisfies DiscordCommand;