const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'backupdelete',
    description: 'Elimina un backup específico por su ID',
    async execute(message, args) {
        // 1. Verificación de Seguridad
        if (message.author.id !== message.guild.ownerId) {
            return message.reply('❌ Solo el **Dueño del Servidor** puede borrar copias de seguridad.');
        }

        // 2. Validar argumento
        const targetId = parseInt(args[0]);
        if (!targetId) {
            return message.reply('⚠️ Indica la ID del backup que quieres borrar. Ejemplo: `D!backupdelete 1`');
        }

        const ownerId = message.author.id;
        const backupPath = path.join(__dirname, '../../backups', `${ownerId}.json`);

        // 3. Verificar si el archivo existe
        if (!fs.existsSync(backupPath)) {
            return message.reply('📂 No tienes ningún backup guardado en este momento.');
        }

        try {
            // Leer y parsear de forma segura
            const data = fs.readFileSync(backupPath, 'utf-8');
            let userBackups = data ? JSON.parse(data) : [];

            // 4. Buscar el backup
            // Buscamos por la propiedad .id que guardamos en backupcreate
            const backupIndex = userBackups.findIndex(b => b.id === targetId);

            if (backupIndex === -1) {
                return message.reply(`❌ No se encontró ningún backup con la ID: \`${targetId}\`. Usa \`D!backuplist\` para verificar.`);
            }

            // Nombre del servidor del backup para el mensaje de confirmación
            const deletedServerName = userBackups[backupIndex].serverName;

            // 5. Eliminar el backup
            userBackups.splice(backupIndex, 1);

            // 6. Opcional: Re-indexar IDs del 1 al 4
            // Esto hace que la lista sea más limpia para el usuario
            userBackups = userBackups.map((backup, index) => {
                backup.id = index + 1;
                return backup;
            });

            // 7. Guardar cambios
            // Si después de borrar no quedan backups, podemos borrar el archivo o dejarlo como []
            if (userBackups.length === 0) {
                fs.writeFileSync(backupPath, JSON.stringify([], null, 2));
            } else {
                fs.writeFileSync(backupPath, JSON.stringify(userBackups, null, 2));
            }

            message.reply(`🗑️ **Backup eliminado con éxito.**\nSe eliminó el registro de: \`${deletedServerName}\`. Tus backups restantes han sido re-enumerados.`);

        } catch (error) {
            console.error('Error en backupdelete:', error);
            message.reply('❌ Hubo un error al intentar procesar el archivo de backups.');
        }
    },
};