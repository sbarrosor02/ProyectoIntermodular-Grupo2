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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../'))); // Serve static files from the root of the project

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

// Serial Port Setup (Replace with your Arduino's serial port)
// You might need to list available ports first.
// On Windows: 'COM1', 'COM2', etc.
// On Linux: '/dev/ttyUSB0', '/dev/ttyACM0', etc.
// On macOS: '/dev/cu.usbmodemXXXX'
const ARDUINO_PORT = 'COM3'; // <<<--- CHANGE THIS TO YOUR ARDUINO'S PORT
const BAUD_RATE = 9600;

let serialPort;
try {
    serialPort = new SerialPort({ path: ARDUINO_PORT, baudRate: BAUD_RATE });
    const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

    serialPort.on('open', () => console.log(`Serial port ${ARDUINO_PORT} opened`));
    serialPort.on('error', err => console.error('Serial port error:', err.message));

    parser.on('data', data => {
        console.log('Arduino:', data);
        const logEntry = new Log({ message: data });
        logEntry.save().catch(err => console.error('Error saving log to DB:', err));

        // Send data to all connected WebSocket clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });
} catch (error) {
    console.error(`Could not open serial port ${ARDUINO_PORT}: ${error.message}`);
    console.warn('Serial port functionality will be disabled. Please check ARDUINO_PORT constant.');
}


// WebSocket Server
wss.on('connection', ws => {
    console.log('Client connected via WebSocket');
    ws.on('message', message => {
        console.log(`Received: ${message}`);
    });
    ws.on('close', () => {
        console.log('Client disconnected from WebSocket');
    });
    ws.send('Welcome to the Arduino Log Server!');
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
    res.sendFile(path.join(__dirname, '../proyecto_info.html'));
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

