const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'shop-add',
    description: 'Añade un rol a la tienda con stock y tiempo limitado.',
    async execute(message, args) {
        if (!message.member.permissions.has('Administrator')) return message.reply('❌ No tienes permisos.');

        // Separamos por " -- " para obtener: [Comando y Precio] -- [Stock] -- [Tiempo]
        const partes = message.content.split(' -- ');
        const argumentosPrincipales = partes[0].split(' '); // D!shop-add, @rol, precio
        
        const rol = message.mentions.roles.first() || message.guild.roles.cache.get(argumentosPrincipales[1]);
        const precio = parseInt(argumentosPrincipales[2]);
        
        // Opcionales: Stock y Tiempo (si no se ponen, son infinitos)
        const stockInput = partes[1] ? parseInt(partes[1]) : -1; // -1 significa infinito
        const tiempoInput = partes[2] ? partes[2].trim().toLowerCase() : null; 

        if (!rol || isNaN(precio) || precio <= 0) {
            return message.reply('⚠️ Uso: `D!shop-add @rol [precio] -- [stock] -- [tiempo]`\nEjemplo: `D!shop-add @VIP 5000 -- 10 -- 1d`');
        }

        // Calcular expiración si existe tiempoInput (ej: 1d, 2h, 30m)
        let fechaExpiracion = 0;
        if (tiempoInput) {
            const valor = parseInt(tiempoInput);
            const unidad = tiempoInput.slice(-1);
            const ahora = Date.now();

            if (unidad === 'm') fechaExpiracion = ahora + (valor * 60 * 1000);
            else if (unidad === 'h') fechaExpiracion = ahora + (valor * 60 * 60 * 1000);
            else if (unidad === 'd') fechaExpiracion = ahora + (valor * 24 * 60 * 60 * 1000);
            else return message.reply('❌ Formato de tiempo inválido. Usa `m`, `h` o `d`.');
        }

        const shopPath = path.join(__dirname, '../../tienda.json');
        let shopData = fs.existsSync(shopPath) ? JSON.parse(fs.readFileSync(shopPath, 'utf-8')) : {};

        if (!shopData[message.guild.id]) shopData[message.guild.id] = [];

        // Evitar duplicados
        if (shopData[message.guild.id].find(i => i.rolID === rol.id)) {
            return message.reply('❌ Ese rol ya está en la tienda.');
        }

        // Guardamos la nueva estructura
        shopData[message.guild.id].push({
            rolID: rol.id,
            nombre: rol.name,
            precio: precio,
            stock: stockInput,
            expira: fechaExpiracion,
            tiempoOriginal: tiempoInput || "Infinito"
        });

        fs.writeFileSync(shopPath, JSON.stringify(shopData, null, 2));

        const embed = new EmbedBuilder()
            .setTitle('🛒 Producto Añadido')
            .setColor('#2ecc71')
            .addFields(
                { name: 'Rol', value: `${rol}`, inline: true },
                { name: 'Precio', value: `\`${precio}\``, inline: true },
                { name: 'Stock', value: stockInput === -1 ? '♾️ Infinito' : `📦 ${stockInput}`, inline: true },
                { name: 'Duración', value: tiempoInput ? `⏳ ${tiempoInput}` : '♾️ Permanente', inline: true }
            );

        message.reply({ embeds: [embed] });
    }
};