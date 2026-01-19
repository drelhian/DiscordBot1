const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'ticket-setup',
    description: 'Configura el panel de tickets en un canal específico.',
    async execute(message, args) {
        // 1. Verificar permisos
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ No tienes permisos para configurar tickets.');
        }

        // 2. Detectar el canal mencionado
        const canalTicket = message.mentions.channels.first();
        if (!canalTicket) {
            return message.reply('⚠️ Debes mencionar el canal donde quieres enviar el panel.\nUso: `D!ticket-setup #canal -- imagen -- titulo -- descripcion`');
        }

        // 3. Gestión del Rol "Ticket"
        let ticketRole = message.guild.roles.cache.find(r => r.name === 'Ticket');
        if (!ticketRole) {
            ticketRole = await message.guild.roles.create({
                name: 'Ticket',
                color: '#3498db',
                reason: 'Rol necesario para el sistema de soporte'
            });
        }

        // 4. Parsear argumentos (ignorar el canal mencionado para los textos)
        const contentWithoutChannel = message.content.replace(/<#\d+>/, '').trim();
        const partes = contentWithoutChannel.split(' -- ');
        
        const imagen = partes[1]?.trim() || null;
        const titulo = partes[2]?.trim() || "📩 Centro de Soporte";
        const descripcion = partes[3]?.trim() || "Si necesitas ayuda o quieres reportar algo, abre un ticket presionando el botón de abajo.";

        // 5. Guardar configuración en config.json
        const configPath = path.join(__dirname, '../../config.json');
        let config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf-8')) : {};
        
        if (!config[message.guild.id]) config[message.guild.id] = {};
        config[message.guild.id].ticketRole = ticketRole.id;

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        // 6. Preparar y enviar el panel al canal especificado
        const embed = new EmbedBuilder()
            .setTitle(titulo)
            .setDescription(descripcion)
            .setColor('#3498db')
            .setFooter({ text: 'Sistema de Soporte Activo' });
        
        if (imagen && imagen.startsWith('http')) embed.setImage(imagen);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('create_ticket')
                .setLabel('Abrir Ticket')
                .setEmoji('📩')
                .setStyle(ButtonStyle.Primary)
        );

        try {
            await canalTicket.send({ embeds: [embed], components: [row] });
            message.reply(`✅ Panel de tickets enviado con éxito a ${canalTicket}. El staff con el rol <@&${ticketRole.id}> será notificado.`);
        } catch (error) {
            message.reply('❌ No pude enviar el mensaje a ese canal. Revisa mis permisos.');
        }
    }
};