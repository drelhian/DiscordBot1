// 1. IMPORTACIONES
const { Client, GatewayIntentBits, Collection, ActivityType, Partials } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers,   
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction] 
});

client.commands = new Collection();
// Vinculamos la colección de invitaciones al cliente para que sea accesible en los eventos
client.invites = new Collection();

// Función para actualizar caché de un servidor
const updateInvites = async (guild) => {
    try {
        const guildInvites = await guild.invites.fetch();
        client.invites.set(guild.id, new Map(guildInvites.map((inv) => [inv.code, inv.uses])));
    } catch (e) {
        console.log(`⚠️ No pude leer invitaciones en ${guild.name}`);
    }
};

// 3. CARGADOR DE COMANDOS
const foldersPath = path.join(__dirname, 'comandos');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('name' in command && 'execute' in command) {
            client.commands.set(command.name.toLowerCase(), command);
            console.log(`✅ Comando Cargado: ${command.name}`);
        }
    }
}

// 4. CARGADOR DE EVENTOS
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        console.log(`✨ Evento Cargado: ${event.name}`);
    }
}

// 5. READY Y ESTADOS
client.once('ready', async () => {

    // Dentro de client.once('ready', async () => { ...
setInterval(() => {
    client.guilds.cache.forEach(guild => {
        const { updateServerStats } = require('./utilidades/statsManager.js');
        updateServerStats(guild);
    });
    console.log("🔄 Estadísticas actualizadas (Ciclo de 10 min)");
}, 600000); // 600,000 ms = 10 minutos

    console.log(`🚀 Sistema cargado. Bot online como ${client.user.tag}`);
    

    // Cargar invitaciones de todos los servidores al iniciar
    for (const guild of client.guilds.cache.values()) {
        await updateInvites(guild);
    }

    const estados = [
        { texto: 'Usa D!help para info', tipo: ActivityType.Listening, status: 'dnd', tiempo: 10000 },
        { texto: 'Sorteos activos 🎁', tipo: ActivityType.Watching, status: 'dnd', tiempo: 4000 },
        { texto: 'Gestionando Niveles 📈', tipo: ActivityType.Streaming, url: 'https://twitch.tv/discord', status: 'dnd', tiempo: 12000 }
    ];

    let indice = 0;
    const rotarEstado = () => {
        const actual = estados[indice];
        client.user.setPresence({
            activities: [{ name: actual.texto, type: actual.tipo, url: actual.url || undefined }],
            status: actual.status,
        });
        indice = (indice + 1) % estados.length;
        setTimeout(rotarEstado, actual.tiempo);
    };
    rotarEstado();
});

// Mantener el caché de invitaciones actualizado
client.on('inviteCreate', async (invite) => await updateInvites(invite.guild));
client.on('inviteDelete', async (invite) => await updateInvites(invite.guild));

// 6. EJECUCIÓN DE COMANDOS Y SISTEMA DE NIVELES
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.guild) return;

    const configPath = path.join(__dirname, './config.json');
    const nivelesPath = path.join(__dirname, './niveles.json');
    let config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf-8')) : {};
    
    const serverPrefix = config[message.guild.id]?.prefix || "D!";
    const serverConf = config[message.guild.id];

    if (serverConf && message.channel.id === serverConf.rankChannel) {
        let niveles = fs.existsSync(nivelesPath) ? JSON.parse(fs.readFileSync(nivelesPath, 'utf-8')) : {};
        
        if (!niveles[message.guild.id]) niveles[message.guild.id] = {};
        if (!niveles[message.guild.id][message.author.id]) {
            niveles[message.guild.id][message.author.id] = { xp: 0, nivel: 0, mensajes: 0, lastXp: 0 };
        }

        const userData = niveles[message.guild.id][message.author.id];
        userData.mensajes += 1;

        if (Date.now() - userData.lastXp > 5000) { 
            const xpGanada = Math.floor(Math.random() * 10) + 10; 
            
            if (userData.nivel < (serverConf.maxLevel || 100)) {
                userData.xp += xpGanada;
                userData.lastXp = Date.now();
                const xpNecesaria = (userData.nivel * 500) + 500;

                if (userData.xp >= xpNecesaria) {
                    userData.nivel += 1;
                    userData.xp = 0;

                    let debeTenerRol = false;
                    if (userData.nivel <= 100 && userData.nivel % 10 === 0) debeTenerRol = true;
                    if (userData.nivel > 100 && userData.nivel % 100 === 0) debeTenerRol = true;

                    if (debeTenerRol) {
                        const nombreRol = `Nivel ${userData.nivel}`;
                        const rolObj = message.guild.roles.cache.find(r => r.name === nombreRol);
                        if (rolObj) message.member.roles.add(rolObj).catch(() => {});
                    }

                    message.channel.send(`🎊 ¡Felicidades ${message.author}! Has alcanzado el **Nivel ${userData.nivel}**`)
                        .then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
                }
            }
        }
        fs.writeFileSync(nivelesPath, JSON.stringify(niveles, null, 2));
    }

    if (!message.content.startsWith(serverPrefix)) return;

    const args = message.content.slice(serverPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    const command = client.commands.get(commandName) || 
                    client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    try {
        await command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('❌ Hubo un error al ejecutar ese comando.');
    }
});


// 7. ANTI-CRASH
process.on('unhandledRejection', error => {
    console.error('🚨 Error no manejado (Rejection):', error);
});

process.on('uncaughtException', error => {
    console.error('🚨 Error no manejado (Exception):', error);
});

client.login('process.env.DISCORD_TOKEN');
