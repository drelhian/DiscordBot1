const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'set-prefix',
    aliases: ['prefix', 'cambiar-prefijo'],
    description: 'Cambia el prefijo del bot en este servidor.',
    async execute(message, args) {
        // 1. Verificar permisos (Solo administradores)
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ No tienes permisos para cambiar el prefijo.');
        }

        const nuevoPrefix = args[0];

        // 2. Validar el nuevo prefijo
        if (!nuevoPrefix) {
            return message.reply('⚠️ Debes indicar el nuevo prefijo. Ejemplo: `D!set-prefix $`');
        }

        if (nuevoPrefix.length > 3) {
            return message.reply('❌ El prefijo no puede tener más de 3 caracteres.');
        }

        const configPath = path.join(__dirname, '../../config.json');
        let configData = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf-8')) : {};

        // 3. Guardar el prefijo bajo la ID del servidor
        if (!configData[message.guild.id]) configData[message.guild.id] = {};
        configData[message.guild.id].prefix = nuevoPrefix;

        fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));

        const embed = new EmbedBuilder()
            .setTitle('⚙️ Configuración Actualizada')
            .setColor('#2ecc71')
            .setDescription(`El prefijo para **${message.guild.name}** ahora es: \`${nuevoPrefix}\``)
            .setFooter({ text: `Ahora usa: ${nuevoPrefix}help para ver los comandos.` })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};