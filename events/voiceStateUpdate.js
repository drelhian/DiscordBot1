const { updateServerStats } = require('../utilidades/statsManager.js');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        // Obtenemos la guild de cualquiera de los dos estados
        const guild = newState.guild || oldState.guild;
        if (!guild) return;

        // Solo disparamos la actualización si:
        // 1. Entró a un canal (oldState.channelId es null)
        // 2. Salió de un canal (newState.channelId es null)
        // 3. Cambió de un canal a otro
        if (oldState.channelId !== newState.channelId) {
            try {
                await updateServerStats(guild);
            } catch (error) {
                console.error('Error al actualizar stats por cambio de voz:', error);
            }
        }
    }
};