const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: '8ball',
    description: 'Pregúntale algo a la bola mágica y recibe una respuesta.',
    async execute(message, args) {
        // 1. Validar que el usuario haya hecho una pregunta
        const pregunta = args.join(' ');
        if (!pregunta) {
            return message.reply('🔮 Debes hacerme una pregunta. Ejemplo: `D!8ball ¿Me extraña mi ex?`');
        }

        // 2. Lista de respuestas (Positivas, Neutras y Negativas)
        const respuestas = [
            // Positivas
            "En mi opinión, sí. ✅",
            "Es cierto. 💎",
            "Es decididamente así. 🌟",
            "Sin duda. ✨",
            "Puedes confiar en ello. 👍",
            
            // Neutras
            "Respuesta vaga, intenta otra vez. 🌫️",
            "Pregunta en otro momento. ⏳",
            "No puedo predecirlo ahora. 🔮",
            "Concéntrate y pregunta otra vez. 🧘",
            
            // Negativas (Al estilo de tu bot)
            "No cuentes con ello. ❌",
            "Mi respuesta es no. 🚫",
            "Mis fuentes dicen que no. 📉",
            "Las perspectivas no son muy buenas. 💀",
            "Olvídalo, ni en tus sueños. 🤡",
            "Definitivamente no, deja de migajear. 🍞"
        ];

        // 3. Selección aleatoria
        const respuestaFinal = respuestas[Math.floor(Math.random() * respuestas.length)];

        // 4. Construcción del Embed
        const embed = new EmbedBuilder()
            .setTitle('🔮 La Bola 8 Mágica')
            .setColor('#2b2d31')
            .addFields(
                { name: '❓ Tu Pregunta:', value: `\`${pregunta}\`` },
                { name: '🎱 Mi Respuesta:', value: `**${respuestaFinal}**` }
            )
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/1001/1001308.png') // Icono de bola 8
            .setFooter({ text: `Consultado por ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    },
};