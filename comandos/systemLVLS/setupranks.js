const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'setupranks',
    description: 'Configuración completa del sistema de niveles',
    async execute(message, args) {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('❌ Solo administradores pueden configurar el sistema.');
        }

        const fullArgs = args.join(" ");
        const partes = fullArgs.split('--').map(p => p.trim());
        
        // Uso: D!setupranks #canal --100
        const canal = message.mentions.channels.first();
        const maxNivel = parseInt(partes[1]) || 100;

        if (!canal || isNaN(maxNivel)) {
            return message.reply('⚠️ **Uso:** `D!setupranks #canal --[Nivel Máximo]`\nEjemplo: `D!setupranks #chat --50` (Máximo 1000)');
        }

        if (maxNivel > 1000) return message.reply('❌ El nivel máximo permitido es 1000.');

        const configPath = path.join(__dirname, '../../config.json');
        let config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf-8')) : {};

        message.channel.send("⏳ **Configurando sistema y creando roles...** (Esto puede tardar un poco)");

        // Lógica de creación de roles (10 en 10 hasta 100, luego de 100 en 100)
        let rolesCreados = [];
        for (let i = 10; i <= maxNivel; i += (i < 100 ? 10 : 100)) {
            let roleName = `Nivel ${i}`;
            let existingRole = message.guild.roles.cache.find(r => r.name === roleName);
            
            if (!existingRole) {
                try {
                    await message.guild.roles.create({
                        name: roleName,
                        color: '#3498db',
                        reason: 'Sistema de niveles auto-setup'
                    });
                    rolesCreados.push(roleName);
                } catch (e) { console.error(`No pude crear el rol ${roleName}`); }
            }
        }

        config[message.guild.id] = {
            rankChannel: canal.id,
            maxLevel: maxNivel,
            rolesAuto: true
        };

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        message.channel.send(`✅ **Setup Completado**\n📍 Canal: ${canal}\n🆙 Nivel Máximo: ${maxNivel}\n🎭 Roles verificados/creados correctamente.`);
    },
};