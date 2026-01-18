// 1. IMPORTACIONES
const { Client, GatewayIntentBits, Collection, ActivityType, Partials } = require('discord.js');
const ffmpegPath = require('ffmpeg-static');
const { DisTube } = require('distube');
const { YouTubePlugin } = require('@distube/youtube');
const fs = require('fs');
const path = require('path');

console.log(`🛠️ Ruta de FFmpeg detectada: ${ffmpegPath}`);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers,   
        GatewayIntentBits.GuildModeration,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction] 
});

client.commands = new Collection();
const prefix = "D!";

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
client.once('ready', () => {
    console.log(`🚀 Sistema cargado. Bot online como ${client.user.tag}`);

    const estados = [
        { texto: 'Usa D!help para info', tipo: ActivityType.Listening, status: 'dnd', tiempo: 10000 },
        { texto: 'En construcción 🛠️', tipo: ActivityType.Watching, status: 'dnd', tiempo: 4000 },
        { texto: 'En directo 🚀', tipo: ActivityType.Streaming, url: 'https://twitch.tv/discord', status: 'dnd', tiempo: 12000 }
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

// 6. EJECUCIÓN DE COMANDOS
client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);

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

client.login(process.env.DISCORD_TOKEN);


