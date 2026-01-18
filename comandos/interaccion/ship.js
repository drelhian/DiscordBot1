const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ship',
    description: 'Calcula la compatibilidad amorosa entre dos usuarios.',
    async execute(message, args) {
        // 1. Obtener a los usuarios
        const user1 = message.mentions.users.first();
        const user2 = message.mentions.users.at(1) || message.author;

        if (!user1) {
            return message.reply('❤️ Debes mencionar al menos a una persona para calcular el amor.');
        }

        if (user1.id === user2.id) {
            return message.reply('¿En serio? El amor propio es importante, pero esto es un poco triste... 😶');
        }

        // 2. Generar porcentaje y barra de progreso
        const lovePercentage = Math.floor(Math.random() * 101);
        const filledBuckets = Math.round(lovePercentage / 10);
        const emptyBuckets = 10 - filledBuckets;
        
        // Creamos la barra visual con emojis
        const progressBar = '❤️'.repeat(filledBuckets) + '🖤'.repeat(emptyBuckets);

        // 3. Comentarios personalizados según el porcentaje
        let comentario = "";
        if (lovePercentage < 20) {
            comentario = "💔 **Zona de peligro.** Aquí no hay amor, solo ganas de migajear.";
        } else if (lovePercentage < 50) {
            comentario = "⚠️ **Amigos... por ahora.** Hay una chispa, pero cuidado con el fantasma de la ex.";
        } else if (lovePercentage < 80) {
            comentario = "💘 **¡Hay química!** Deberían intentarlo antes de que alguien termine en el comando `D!bonk`.";
        } else if (lovePercentage < 95) {
            comentario = "💖 **Pareja ideal.** El amor está en el aire, ¡vivan los novios!";
        } else {
            comentario = "💎 **ALMAS GEMELAS.** Ni el destino ni un mal baneo podrán separarlos.";
        }

        // 4. Crear el Embed
        const embed = new EmbedBuilder()
            .setTitle('💘 Calculadora de Amor')
            .setColor(lovePercentage > 50 ? '#ff4d6d' : '#2b2d31')
            .setDescription(`Calculando la compatibilidad entre **${user1.username}** y **${user2.username}**...\n\n**Resultado:** ${lovePercentage}%\n${progressBar}\n\n${comentario}`)
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/2589/2589175.png')
            .setFooter({ text: `Consultado por ${message.author.username}` })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    },
};