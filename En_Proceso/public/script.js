const socket = io();

const statusCard = document.getElementById('status-card');
const statusText = document.getElementById('status-text');
const lastUpdate = document.getElementById('last-update');
const serialOutput = document.getElementById('serial-output');
const logList = document.getElementById('log-list');

// Escuchar datos del servidor
socket.on('arduino-data', (data) => {
    // Actualizar Consola
    const line = document.createElement('div');
    line.textContent = `[${data.timestamp}] ${data.raw}`;
    serialOutput.appendChild(line);
    serialOutput.scrollTop = serialOutput.scrollHeight;

    // Actualizar Estado Visual
    if (data.estado === 'detectado') {
        statusCard.className = 'card status-detectado';
        statusText.textContent = '¡MOVIMIENTO DETECTADO!';
        cargarLogs(); // Recargar lista de DB
    } else {
        // Volver a reposo después de un momento si no hay nuevos datos de detección
        setTimeout(() => {
            statusCard.className = 'card status-reposo';
            statusText.textContent = 'SISTEMA EN VIGILANCIA';
        }, 3000);
    }

    lastUpdate.textContent = `Última actualización: ${data.timestamp}`;
});

// Cargar logs iniciales
async function cargarLogs() {
    const response = await fetch('/api/logs');
    const logs = await response.json();
    logList.innerHTML = '';
    logs.forEach(log => {
        const li = document.createElement('li');
        li.textContent = `${log.fecha} - ${log.evento}`;
        logList.appendChild(li);
    });
}

cargarLogs();
