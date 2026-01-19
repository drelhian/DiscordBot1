const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'set-goodbye',
    aliases: ['set-despedida'],
    description: 'Configura la despedida con Título y Subtítulo',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ No tienes permisos.');

        // Formato: D!set-goodbye #canal -- URL_IMAGEN -- TITULO -- SUBTITULO
        const partes = message.content.split(' -- ');
        const canal = message.mentions.channels.first();
        
        const imagen = partes[1] || "https://i.imgur.com/83p7389.png"; // Imagen de despedida por defecto
        const titulo = partes[2] || "¡Adiós de {server}!";
        const subtitulo = partes[3] || "{username} ha dejado el servidor. ¡Esperamos volver a verte!";

        if (!canal) {
            return message.reply('⚠️ **Uso correcto:**\n`D!set-goodbye #canal -- URL_IMAGEN -- Título -- Subtítulo`\n\n*Variables: {username}, {server}, {count}*');
        }

        const configPath = path.join(__dirname, '../../config.json');
        let config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf-8')) : {};

        if (!config[message.guild.id]) config[message.guild.id] = {};
        
        config[message.guild.id].goodbye = {
            channel: canal.id,
            image: imagen,
            title: titulo,
            subtitle: subtitulo
        };

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        const preview = new EmbedBuilder()
            .setTitle(titulo.replace('{server}', message.guild.name))
            .setDescription(subtitulo.replace('{username}', message.author.username).replace('{count}', message.guild.memberCount))
            .setImage(imagen)
            .setColor('#e74c3c'); // Rojo para despedidas

        message.reply({ content: '✅ **Configuración de Despedida actualizada:**', embeds: [preview] });
    }
};