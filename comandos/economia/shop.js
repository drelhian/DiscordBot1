const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'shop',
    aliases: ['tienda'],
    description: 'Mira la tienda o compra un rol con stock y tiempo limitado',
    async execute(message, args) {
        const shopPath = path.join(__dirname, '../../tienda.json');
        const ecoPath = path.join(__dirname, '../../economia.json');

        let shopData = fs.existsSync(shopPath) ? JSON.parse(fs.readFileSync(shopPath, 'utf-8')) : {};
        let ecoData = fs.existsSync(ecoPath) ? JSON.parse(fs.readFileSync(ecoPath, 'utf-8')) : {};

        let items = shopData[message.guild.id] || [];
        const ahora = Date.now();

        // 1. FILTRAR OBJETOS EXPIRADOS (Se eliminan de la lista si el tiempo pasó)
        const itemsOriginales = items.length;
        items = items.filter(it => it.expira === 0 || it.expira > ahora);
        
        // Si hubo cambios por expiración, guardamos el archivo
        if (items.length !== itemsOriginales) {
            shopData[message.guild.id] = items;
            fs.writeFileSync(shopPath, JSON.stringify(shopData, null, 2));
        }

        // --- LÓGICA DE COMPRA ---
        if (args[0] === 'buy') {
            const index = parseInt(args[1]) - 1;
            const item = items[index];

            if (!item) return message.reply('❌ Ítem no válido. Usa `D!shop` para ver la lista.');

            // VALIDACIÓN DE STOCK
            if (item.stock !== -1 && item.stock <= 0) {
                return message.reply('❌ ¡Este producto está **AGOTADO**!');
            }

            const userData = ecoData[message.guild.id]?.[message.author.id] || { coins: 0, banco: 0 };

            if (userData.coins < item.precio) {
                return message.reply(`❌ No tienes suficientes coins en mano (Necesitas ${item.precio}).`);
            }

            const role = message.guild.roles.cache.get(item.rolID);
            if (!role) return message.reply('❌ El rol ya no existe en el servidor.');
            if (message.member.roles.cache.has(role.id)) return message.reply('⚠️ Ya tienes este rol.');

            try {
                await message.member.roles.add(role);
                
                // RESTAR DINERO
                userData.coins -= item.precio;
                
                // RESTAR STOCK (Si no es infinito)
                if (item.stock !== -1) {
                    item.stock -= 1;
                }

                ecoData[message.guild.id][message.author.id] = userData;
                shopData[message.guild.id] = items; // Actualizamos la lista con el nuevo stock

                fs.writeFileSync(ecoPath, JSON.stringify(ecoData, null, 2));
                fs.writeFileSync(shopPath, JSON.stringify(shopData, null, 2));
                
                return message.reply(`🎉 ¡Felicidades! Has comprado **${role.name}**. Quedan \`${item.stock === -1 ? '♾️' : item.stock}\` en stock.`);
            } catch (e) {
                return message.reply('❌ Error: Asegúrate de que mi rol esté por encima del que intentas comprar.');
            }
        }

        // --- MOSTRAR TIENDA ---
        if (items.length === 0) return message.reply('🛍️ La tienda está vacía o los productos expiraron.');

        const listaTienda = items.map((it, i) => {
            const stockTexto = it.stock === -1 ? '♾️' : (it.stock <= 0 ? '**AGOTADO**' : it.stock);
            
            // Calcular tiempo restante si expira
            let tiempoRestante = '';
            if (it.expira > 0) {
                const diff = it.expira - ahora;
                const horas = Math.floor(diff / (1000 * 60 * 60));
                const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                tiempoRestante = ` | ⏳ Termina en: \`${horas}h ${mins}m\``;
            }

            return `**${i + 1}.** <@&${it.rolID}>\n> 💰 Precio: \`${it.precio}\` | 📦 Stock: \`${stockTexto}\`${tiempoRestante}`;
        }).join('\n\n');

        const embed = new EmbedBuilder()
            .setTitle(`🛍️ Tienda de ${message.guild.name}`)
            .setColor('#9b59b6')
            .setDescription(listaTienda)
            .setFooter({ text: 'Usa D!shop buy [número] para comprar' })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};