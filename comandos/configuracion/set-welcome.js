const { PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'set-welcome',
    description: 'Configura la bienvenida con Título y Subtítulo',
    async execute(message, args) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) return message.reply('❌ No tienes permisos.');

        // Formato: D!set-welcome #canal -- URL_IMAGEN -- TITULO -- SUBTITULO
        const partes = message.content.split(' -- ');
        const canal = message.mentions.channels.first();
        
        const imagen = partes[1] || "https://i.imgur.com/L9I7NIn.png";
        const titulo = partes[2] || "¡Bienvenido/a a {server}!";
        const subtitulo = partes[3] || "Hola {user}, esperamos que te diviertas. Eres el miembro #{count}.";

        if (!canal) {
            return message.reply('⚠️ **Uso correcto:**\n`D!set-welcome #canal -- URL_IMAGEN -- Título -- Subtítulo`\n\n*Puedes usar: {user}, {server}, {count}*');
        }

        const configPath = path.join(__dirname, '../../config.json');
        let config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf-8')) : {};

        if (!config[message.guild.id]) config[message.guild.id] = {};
        
        config[message.guild.id].welcome = {
            channel: canal.id,
            image: imagen,
            title: titulo,
            subtitle: subtitulo
        };

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        // Vista previa
        const preview = new EmbedBuilder()
            .setTitle(titulo.replace('{server}', message.guild.name))
            .setDescription(subtitulo.replace('{user}', message.author.username).replace('{count}', message.guild.memberCount))
            .setImage(imagen)
            .setColor('#ff99cc');

        message.reply({ content: '✅ **Configuración de Bienvenida actualizada:**', embeds: [preview] });
    }
};