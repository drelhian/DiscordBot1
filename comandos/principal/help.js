const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ComponentType 
} = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Muestra la lista de comandos organizada por categorías.',
    async execute(message, args) {
        // --- EMBED PRINCIPAL (BIENVENIDA) ---
        const mainEmbed = new EmbedBuilder()
            .setTitle('📚 Panel de Ayuda - LXT Bot')
            .setColor('#5865F2')
            .setDescription('Bienvenido al menú de ayuda. Selecciona una categoría en el menú desplegable de abajo para ver los comandos disponibles.')
            .addFields(
                { name: '📂 Estructura', value: 'Usa el prefijo `D!` antes de cada comando.' },
                { name: '🤖 Estado', value: 'Todos los sistemas operativos.' }
            )
            .setThumbnail(message.client.user.displayAvatarURL())
            .setFooter({ text: 'LXT Bot | 2026', iconURL: message.author.displayAvatarURL() });

        // --- DEFINICIÓN DEL MENÚ DESPLEGABLE ---
        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('help_menu')
                .setPlaceholder('Selecciona una categoría...')
                .addOptions([
                    { label: 'Interacción', description: 'Acciones, afecto y diversión social.', value: 'interaccion', emoji: '🎭' },
                    { label: 'Leaderboard', description: 'Tops globales de carisma y panes.', value: 'leaderboard', emoji: '🏆' },
                    { label: 'Minijuegos', description: 'Diversión y azar (8ball, ship, etc).', value: 'minijuegos', emoji: '🎮' },
                    { label: 'Moderación', description: 'Herramientas administrativas.', value: 'moderacion', emoji: '🛡️' },
                    { label: 'Música', description: 'Control de audio y voz.', value: 'musica', emoji: '🎶' },
                    { label: 'Principal', description: 'Comandos base del sistema.', value: 'principal', emoji: '🏠' },
                    { label: 'Utilidad', description: 'Información y herramientas útiles.', value: 'utilidad', emoji: '⚙️' }
                ])
        );

        const response = await message.reply({ embeds: [mainEmbed], components: [row] });

        // --- COLECTOR DE INTERACCIONES ---
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 60000 // 1 minuto activo
        });

        collector.on('collect', async (i) => {
            if (i.user.id !== message.author.id) {
                return i.reply({ content: '❌ Solo quien pidió la ayuda puede usar el menú.', ephemeral: true });
            }

            let categoryEmbed = new EmbedBuilder().setColor('#5865F2').setTimestamp();

            // Lógica según la carpeta seleccionada
            switch (i.values[0]) {
                case 'interaccion':
                    categoryEmbed.setTitle('🎭 Comandos de Interacción')
                        .setDescription('`hug`, `kiss`, `pat`, `slap`, `kill`, `shoot`, `punch`, `cry`, `dance`, `carisma`, `confess`, `ship` ');
                    break;
                case 'leaderboard':
                    categoryEmbed.setTitle('🏆 Comandos de Clasificación')
                        .setDescription('`topmigajeros`, `topcarisma`');
                    break;
                case 'minijuegos':
                    categoryEmbed.setTitle('🎮 Comandos de Minijuegos')
                        .setDescription('`8ball`, `migajear`');
                    break;
                case 'moderacion':
                    categoryEmbed.setTitle('🛡️ Comandos de Moderación')
                        .setDescription('`kick`, `ban`, `unban`, `clear`, `nuke`, `backup`');
                    break;
                case 'musica':
                    categoryEmbed.setTitle('🎶 Comandos de Música')
                        .setDescription('`play`, `skip`, `stop`, `queue`, `lyrics`, `volume`');
                    break;
                case 'principal':
                    categoryEmbed.setTitle('🏠 Comandos Principales')
                        .setDescription('`help`, `ping`');
                    break;
                case 'utilidad':
                    categoryEmbed.setTitle('⚙️ Comandos de Utilidad')
                        .setDescription('`avatar`, `userinfo`, `serverinfo`, `perfil`');
                    break;
            }

            await i.update({ embeds: [categoryEmbed] });
        });

        collector.on('end', () => {
            const disabledRow = new ActionRowBuilder().addComponents(
                row.components[0].setDisabled(true)
            );
            response.edit({ components: [disabledRow] }).catch(() => {});
        });
    },
};