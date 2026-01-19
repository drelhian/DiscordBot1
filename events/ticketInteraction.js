const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'create_ticket') {
            const { guild, user } = interaction;

            // Cargar ID del rol desde config
            const configPath = path.join(__dirname, '../config.json');
            const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf-8')) : {};
            const roleId = config[guild.id]?.ticketRole;

            const yaTieneTicket = guild.channels.cache.find(c => c.name === `ticket-${user.username.toLowerCase()}`);
            if (yaTieneTicket) {
                return interaction.reply({ content: '⚠️ Ya tienes un ticket abierto: ' + `<#${yaTieneTicket.id}>`, ephemeral: true });
            }

            // Permisos iniciales
            const permissionOverwrites = [
                { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
                { id: user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
            ];

            // Si existe el rol "Ticket", darle permiso de ver el canal
            if (roleId) {
                permissionOverwrites.push({
                    id: roleId,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                });
            }

            const channel = await guild.channels.create({
                name: `ticket-${user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: permissionOverwrites,
            });

            const embedTicket = new EmbedBuilder()
                .setTitle('🎫 Nuevo Ticket')
                .setDescription(`Hola ${user}, el personal de <@&${roleId || ""}> ha sido notificado y te atenderá pronto.`)
                .setColor('#2ecc71')
                .setTimestamp();

            const rowClose = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('Cerrar')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Danger)
            );

            // Mención al rol de soporte al abrir el ticket
            await channel.send({ 
                content: `${user} | ${roleId ? `<@&${roleId}>` : "Staff"}`, 
                embeds: [embedTicket], 
                components: [rowClose] 
            });
            
            interaction.reply({ content: `✅ Ticket abierto en ${channel}`, ephemeral: true });
        }

        if (interaction.customId === 'close_ticket') {
            await interaction.reply('🔒 Cerrando en 5 segundos...');
            setTimeout(() => { interaction.channel.delete().catch(() => {}); }, 5000);
        }
    }
};