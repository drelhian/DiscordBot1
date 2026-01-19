const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'set-invites',
    description: 'Configura el log de invitaciones con estilo personalizado',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ No tienes permisos.');

        // Formato: D!set-invites #canal -- URL_IMAGEN -- TITULO -- SUBTITULO
        const partes = message.content.split(' -- ');
        const canal = message.mentions.channels.first();
        
        const imagen = partes[1] || "https://i.imgur.com/83p7389.png";
        const titulo = partes[2] || "¡Nuevo Miembro Invitado!";
        const subtitulo = partes[3] || "✨ {inviter} ha traído a {user} al servidor.\n📈 ¡Ya tiene {invites} invitaciones!";

        if (!canal) {
            return message.reply('⚠️ **Uso correcto:**\n`D!set-invites #canal -- Imagen -- Título -- Subtítulo`\n\nVariables: `{inviter}`, `{user}`, `{invites}`');
        }

        const configPath = path.join(__dirname, '../../config.json');
        let config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf-8')) : {};

        if (!config[message.guild.id]) config[message.guild.id] = {};
        
        config[message.guild.id].inviteLog = {
            channel: canal.id,
            image: imagen,
            title: titulo,
            subtitle: subtitulo
        };

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        const preview = new EmbedBuilder()
            .setTitle(titulo)
            .setDescription(subtitulo.replace('{inviter}', 'Persona1').replace('{user}', 'Persona2').replace('{invites}', '10'))
            .setImage(imagen)
            .setColor('#3498db');

        message.reply({ content: '✅ **Configuración de Invitaciones actualizada:**', embeds: [preview] });
    }
};