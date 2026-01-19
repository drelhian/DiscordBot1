const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'rob',
    aliases: ['robar'],
    description: 'Intenta robar monedas de la cartera de otro usuario.',
    async execute(message, args) {
        const ecoPath = path.join(__dirname, '../../economia.json');
        let ecoData = fs.existsSync(ecoPath) ? JSON.parse(fs.readFileSync(ecoPath, 'utf-8')) : {};

        const target = message.mentions.users.first();
        if (!target) return message.reply('⚠️ Menciona a alguien para robarle.');
        if (target.id === message.author.id) return message.reply('❌ No puedes robarte a ti mismo.');

        if (!ecoData[message.guild.id]) ecoData[message.guild.id] = {};
        
        // Aseguramos que ambos tengan perfil
        const ladron = ecoData[message.guild.id][message.author.id] || { coins: 0, banco: 0, lastRob: 0 };
        const victima = ecoData[message.guild.id][target.id] || { coins: 0, banco: 0 };

        const ahora = Date.now();
        const tiempoEspera = 3 * 60 * 60 * 1000;

        // 1. Validaciones
        if (ahora - (ladron.lastRob || 0) < tiempoEspera) {
            return message.reply(`🤫 Los guardias te vigilan. Espera un poco más.`);
        }

        // El ladrón debe tener al menos 200 en total (mano + banco) para responder por la multa
        if ((ladron.coins + ladron.banco) < 200) {
            return message.reply('❌ No tienes suficiente dinero (200 coins) para pagar una multa si te atrapan.');
        }

        // IMPORTANTE: Solo se roba lo que hay en CARTERA (coins)
        if (victima.coins < 100) {
            return message.reply(`⚠️ <@${target.id}> no tiene suficiente dinero en su **cartera**. ¡El dinero en el banco no puedes tocarlo!`);
        }

        const exito = Math.random() < 0.4;

        if (exito) {
            const porcentaje = Math.floor(Math.random() * 41) + 10; // 10% a 50%
            const botin = Math.floor((victima.coins * porcentaje) / 100);

            ladron.coins += botin;
            victima.coins -= botin;
            ladron.lastRob = ahora;

            message.channel.send({
                embeds: [new EmbedBuilder()
                    .setTitle("🥷 ¡Robo Exitoso!")
                    .setColor("#2ecc71")
                    .setDescription(`Le quitaste **${botin} coins** de la cartera a <@${target.id}>.`)
                ]
            });
        } else {
            const multa = Math.floor(Math.random() * 201) + 100; // 100 a 300

            // Lógica de pago de multa (Cartera -> Banco)
            if (ladron.coins >= multa) {
                ladron.coins -= multa;
            } else {
                const restante = multa - ladron.coins;
                ladron.coins = 0;
                ladron.banco -= restante; // El resto sale del banco
            }

            victima.coins += multa;
            ladron.lastRob = ahora;

            message.channel.send({
                embeds: [new EmbedBuilder()
                    .setTitle("👮 ¡Atrapado!")
                    .setColor("#e74c3c")
                    .setDescription(`Fallaste el robo. Como no tenías suficiente en mano, se usó tu banco para pagarle **${multa} coins** a <@${target.id}>.`)
                ]
            });
        }

        ecoData[message.guild.id][message.author.id] = ladron;
        ecoData[message.guild.id][target.id] = victima;
        fs.writeFileSync(ecoPath, JSON.stringify(ecoData, null, 2));
    },
};