const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- CONFIGURACIÓN BASE DE DATOS ---
const db = new sqlite3.Database('./detecciones.db', (err) => {
    if (err) console.error('Error al abrir DB:', err);
    console.log('Conectado a SQLite');
});

db.run(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha TEXT DEFAULT CURRENT_TIMESTAMP,
    evento TEXT
)`);

// --- CONFIGURACIÓN SERIAL ---
// IMPORTANTE: Cambia 'COM3' por el puerto donde esté tu Arduino
const portPath = 'COM3'; 
const port = new SerialPort({ path: portPath, baudRate: 9600 }, (err) => {
    if (err) console.log('Error al abrir puerto (asegúrate de que no esté el Monitor Serie abierto):', err.message);
});

const parser = port.pipe(new ReadlineParser({ delimiter: '
' }));

// --- LÓGICA DE DATOS ---
parser.on('data', (data) => {
    console.log('Arduino dice:', data);
    
    let estado = "reposo";
    if (data.includes("Movimiento detectado")) {
        estado = "detectado";
        // Guardar en DB
        db.run('INSERT INTO logs (evento) VALUES (?)', ['Movimiento Detectado']);
    }

    // Enviar a la web en tiempo real
    io.emit('arduino-data', {
        raw: data,
        estado: estado,
        timestamp: new Date().toLocaleTimeString()
    });
});

// --- RUTAS ---
app.use(express.static('public'));

app.get('/api/logs', (req, res) => {
    db.all('SELECT * FROM logs ORDER BY id DESC LIMIT 20', (err, rows) => {
        res.json(rows);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor web en http://localhost:${PORT}`);
    console.log(`Buscando Arduino en ${portPath}...`);
});
