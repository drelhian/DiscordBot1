const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'setrank',
    description: 'Establece un nivel específico a un usuario (Solo Owner)',
    async execute(message, args) {
        // Validación estricta: Solo el dueño del servidor
        if (message.author.id !== message.guild.ownerId) {
            return message.reply('❌ Este comando es tan potente que solo el **Owner del Servidor** puede usarlo.');
        }

        const target = message.mentions.members.first();
        const nuevoNivel = parseInt(args[1]);

        if (!target || isNaN(nuevoNivel)) {
            return message.reply('⚠️ **Uso:** `D!setrank @usuario [nivel]`\nEjemplo: `D!setrank @Gemini 50`');
        }

        const configPath = path.join(__dirname, '../../config.json');
        const nivelesPath = path.join(__dirname, '../../niveles.json');
        
        let config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        const maxServerLevel = config[message.guild.id]?.maxLevel || 1000;

        if (nuevoNivel > maxServerLevel) {
            return message.reply(`❌ No puedes asignar un nivel superior al máximo del servidor (${maxServerLevel}).`);
        }

        let niveles = fs.existsSync(nivelesPath) ? JSON.parse(fs.readFileSync(nivelesPath, 'utf-8')) : {};
        if (!niveles[message.guild.id]) niveles[message.guild.id] = {};

        // Actualizamos o creamos la entrada del usuario
        niveles[message.guild.id][target.id] = {
            xp: 0,
            nivel: nuevoNivel,
            mensajes: niveles[message.guild.id][target.id]?.mensajes || 0,
            lastXp: Date.now()
        };

        fs.writeFileSync(nivelesPath, JSON.stringify(niveles, null, 2));

        // Lógica de roles: Al setear el nivel, verificamos si le toca un rol nuevo
        let debeTenerRol = false;
        if (nuevoNivel <= 100 && nuevoNivel % 10 === 0) debeTenerRol = true;
        if (nuevoNivel > 100 && nuevoNivel % 100 === 0) debeTenerRol = true;

        if (debeTenerRol) {
            const nombreRol = `Nivel ${nuevoNivel}`;
            const rolObj = message.guild.roles.cache.find(r => r.name === nombreRol);
            if (rolObj) target.roles.add(rolObj).catch(() => {});
        }

        message.channel.send(`✅ Se ha establecido el nivel de **${target.user.username}** en **${nuevoNivel}**.`);
    }
};