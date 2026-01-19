const { PollLayoutType } = require('discord.js');

module.exports = {
    name: 'poll',
    description: 'Crea una encuesta con tiempo personalizado usando --',
    execute(message, args) {
        const contenidoCompleto = args.join(" ");

        // 1. Separar el contenido del timer (busca el "--")
        const partesTimer = contenidoCompleto.split('--');
        const contenidoEncuesta = partesTimer[0].trim();
        const configTimer = partesTimer[1] ? partesTimer[1].trim().toLowerCase() : null;

        // 2. Separar pregunta y opciones por comas
        const secciones = contenidoEncuesta.split(',').map(s => s.trim());
        const pregunta = secciones[0];
        const opciones = secciones.slice(1);

        if (!pregunta || opciones.length < 2) {
            return message.reply("⚠️ **Uso:** `D!poll Pregunta, Op1, Op2 --7 dias` o `--10 horas` o `--30 minutos`.");
        }

        // 3. Lógica para procesar el Timer (--7 dias, --10 horas, etc.)
        let duracionHoras = 24; // Tiempo por defecto (1 día)

        if (configTimer) {
            const [valor, unidad] = configTimer.split(" ");
            const numero = parseInt(valor);

            if (!isNaN(numero)) {
                if (unidad && (unidad.includes("dia") || unidad.includes("d"))) {
                    duracionHoras = numero * 24;
                } else if (unidad && (unidad.includes("hora") || unidad.includes("h"))) {
                    duracionHoras = numero;
                } else if (unidad && (unidad.includes("minuto") || unidad.includes("m"))) {
                    // Discord usa horas enteras, si ponen minutos redondeamos a 1 hora mínimo
                    duracionHoras = Math.max(1, Math.round(numero / 60));
                }
            }
        }

        // Discord tiene un límite máximo de 7 días (168 horas)
        if (duracionHoras > 168) duracionHoras = 168;
        if (duracionHoras < 1) duracionHoras = 1;

        // 4. Enviar la encuesta nativa
        message.channel.send({
            poll: {
                question: { text: pregunta },
                answers: opciones.map(opt => ({ text: opt.slice(0, 80) })), // Límite de 80 caracteres por opción
                duration: duracionHoras,
                allowMultiselect: false,
                layoutType: PollLayoutType.Default
            }
        }).catch(err => {
            console.error(err);
            message.reply("❌ No pude crear la encuesta. Revisa que el bot tenga permisos.");
        });
    },
};