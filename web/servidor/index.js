const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const SerialPort = require('serialport').SerialPort;
const { ReadlineParser } = require('@serialport/parser-readline');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// --- ESTADO DEL MONITOR EN TIEMPO REAL ---
const stats = {
    totalDetections: 0,
    totalAlerts: 0,
    totalAccess: 0,
    lastDetected: null,
    recentEvents: []
};

function classifyEvent(msg) {
    const lower = msg.toLowerCase();
    if (lower.includes('tarjeta') || lower.includes('rfid') || lower.includes('acceso concedido') ||
        (lower.includes('autorizado') && !lower.includes('sin autorización'))) return 'access';
    if (lower.includes('alerta') || lower.includes('sin autorización') || lower.includes('forzada')) return 'alert';
    if (lower.includes('movimiento') || lower.includes('motion') || lower.includes('presencia')) return 'detection';
    if (lower.includes('standby') || lower.includes('no esta pasando') || lower.includes('libre')) return 'clear';
    return 'log';
}

function broadcastEvent(event) {
    const payload = JSON.stringify(event);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(payload);
    });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../landing/'))); // Serve static files from web/landing/

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/arduino_logs')
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error(err));

// Define Log Schema
const logSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    message: String,
});
const Log = mongoose.model('Log', logSchema);

const BAUD_RATE = 115200;

// VendorIDs conocidos de Arduino y chips USB-serie habituales
const ARDUINO_VENDOR_IDS = [
    '2341', // Arduino LLC (oficial)
    '2a03', // Arduino (variante)
    '1a86', // CH340/CH341 (clones chinos)
    '0403', // FTDI FT232
    '10c4', // Silicon Labs CP210x
];

async function findArduinoPort() {
    const ports = await SerialPort.list();
    console.log('Puertos detectados:', ports.map(p => `${p.path} (${p.manufacturer || 'desconocido'})`).join(', ') || 'ninguno');

    const found = ports.find(p => {
        const vid = (p.vendorId || '').toLowerCase();
        const mfr = (p.manufacturer || '').toLowerCase();
        return ARDUINO_VENDOR_IDS.includes(vid) ||
               mfr.includes('arduino') ||
               mfr.includes('ch340') ||
               mfr.includes('ftdi') ||
               mfr.includes('silicon');
    });

    return found ? found.path : null;
}

async function initSerialPort() {
    const portPath = await findArduinoPort();

    if (!portPath) {
        console.warn('No se encontró ningún Arduino conectado. El monitor funcionará sin datos de hardware.');
        return;
    }

    console.log(`Arduino detectado en: ${portPath}`);

    try {
        const serialPort = new SerialPort({ path: portPath, baudRate: BAUD_RATE });
        const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

        serialPort.on('open', () => console.log(`Puerto ${portPath} abierto correctamente`));
        serialPort.on('error', err => console.error('Error de puerto serie:', err.message));

        parser.on('data', data => {
            const msg = data.trim();
            console.log('Arduino:', msg);

            const type = classifyEvent(msg);
            const timestamp = new Date().toISOString();

            if (type === 'detection') { stats.totalDetections++; stats.lastDetected = timestamp; }
            else if (type === 'alert') { stats.totalAlerts++; stats.lastDetected = timestamp; }
            else if (type === 'access') stats.totalAccess++;

            const eventEntry = { type, message: msg, timestamp };
            stats.recentEvents.unshift(eventEntry);
            if (stats.recentEvents.length > 50) stats.recentEvents.pop();

            const logEntry = new Log({ message: msg });
            logEntry.save().catch(err => console.error('Error guardando en DB:', err));

            broadcastEvent({
                ...eventEntry,
                stats: {
                    totalDetections: stats.totalDetections,
                    totalAlerts: stats.totalAlerts,
                    totalAccess: stats.totalAccess,
                    lastDetected: stats.lastDetected
                }
            });
        });
    } catch (error) {
        console.error(`No se pudo abrir ${portPath}: ${error.message}`);
    }
}


// WebSocket Server
wss.on('connection', ws => {
    console.log('Cliente conectado al monitor');
    ws.on('message', message => console.log(`WS recibido: ${message}`));
    ws.on('close', () => console.log('Cliente desconectado del monitor'));
    // Enviar estado actual al conectar para que el cliente pueda cargar el historial
    ws.send(JSON.stringify({ type: 'welcome', stats: { ...stats } }));
});

// API Route to get historical logs
app.get('/api/logs', async (req, res) => {
    try {
        const logs = await Log.find().sort({ timestamp: -1 }).limit(100); // Get last 100 logs
        res.json(logs);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../landing/index.html'));
});

// API de estadísticas del monitor
app.get('/api/stats', (req, res) => {
    res.json(stats);
});

// Panel de monitoreo en tiempo real
app.get('/monitor', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/monitor.html'));
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Monitor en tiempo real: http://localhost:${PORT}/monitor`);
    initSerialPort();
});

