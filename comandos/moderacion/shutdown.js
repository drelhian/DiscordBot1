module.exports = {
    name: 'shutdown',
    description: 'Apaga el bot de forma segura',
    async execute(message, args) {
        // Pon aquí TU ID de usuario de Discord para que nadie más lo apague
        if (message.author.id !== '742090800191504464') {
            return message.reply('❌ Solo mi creador puede apagarme.');
        }

        await message.reply('👋 Apagando sistema... ¡Hasta pronto!');
        process.exit(); // Esto cierra el proceso de Node.js por completo
    },
};