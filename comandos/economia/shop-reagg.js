const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'shop-reagg',
    aliases: ['remove-salary', 'quitar-salario'],
    description: 'Elimina la producción de dinero de un rol (Solo Admins)',
    async execute(message, args) {
        // 1. Verificar Permisos
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('❌ No tienes permisos para gestionar los salarios.');
        }

        // 2. Obtener el rol (por mención o ID)
        const rol = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);

        if (!rol) {
            return message.reply('⚠️ Uso: `D!shop-reagg @rol` o `D!shop-reagg [ID_DEL_ROL]`');
        }

        const salariesPath = path.join(__dirname, '../../salarios.json');
        
        // Verificar si el archivo existe
        if (!fs.existsSync(salariesPath)) {
            return message.reply('❌ No hay ningún salario configurado en este servidor.');
        }

        let salariesData = JSON.parse(fs.readFileSync(salariesPath, 'utf-8'));

        // 3. Verificar si el rol existe en la base de datos de salarios
        if (!salariesData[message.guild.id] || !salariesData[message.guild.id][rol.id]) {
            return message.reply(`⚠️ El rol **${rol.name}** no tiene ningún salario asignado actualmente.`);
        }

        // 4. Eliminar el salario
        const datosEliminados = salariesData[message.guild.id][rol.id];
        delete salariesData[message.guild.id][rol.id];

        // Guardar los cambios
        fs.writeFileSync(salariesPath, JSON.stringify(salariesData, null, 2));

        const embed = new EmbedBuilder()
            .setTitle('🗑️ Salario Eliminado')
            .setColor('#e74c3c')
            .setDescription(`Se ha eliminado la producción de dinero para el rol **${rol.name}**.`)
            .addFields(
                { name: '💰 Antes generaba', value: `\`${datosEliminados.puntos}\` cada \`${datosEliminados.tiempoTexto}\`` }
            )
            .setFooter({ text: `Acción realizada por ${message.author.username}` })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};