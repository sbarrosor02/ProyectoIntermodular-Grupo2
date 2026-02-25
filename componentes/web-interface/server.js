
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const USERS_DB_PATH = path.join(__dirname, 'users.json');

// --- User Management ---
let users = [];
// Load users from file if it exists
if (fs.existsSync(USERS_DB_PATH)) {
    users = JSON.parse(fs.readFileSync(USERS_DB_PATH, 'utf8'));
}

function saveUsers() {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify(users, null, 2), 'utf8');
}

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // For parsing application/json

// --- Authentication Endpoints ---
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }
    if (users.find(u => u.username === username)) {
        return res.status(409).json({ message: 'Username already exists' });
    }
    users.push({ username, password });
    saveUsers();
    res.status(201).json({ message: 'User registered successfully' });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// --- Simulated Arduino Logic ---
// Client-side animation now drives detection, server will only log/respond
let isPersonDetected = false; // This will now be updated by client events
let detectionStartTime = null;
let buzzerActive = false;

// Remove the random simulation interval as client will drive detection
// function simulateDetection() {
//     setInterval(() => {
//         if (!isPersonDetected) {
//             isPersonDetected = true;
//             detectionStartTime = Date.now();
//             buzzerActive = true;
//             io.emit('detection', { detected: true, timestamp: detectionStartTime });
//             io.emit('buzzerStatus', { active: true });
//             console.log('Simulated: Person Detected!');
//             console.log('Simulated: Buzzer Active!');

//             setTimeout(() => {
//                 isPersonDetected = false;
//                 detectionStartTime = null;
//                 buzzerActive = false;
//                 io.emit('detection', { detected: false });
//                 io.emit('buzzerStatus', { active: false });
//                 console.log('Simulated: Person Not Detected Anymore.');
//                 console.log('Simulated: Buzzer Inactive.');
//             }, 5000); // Detection lasts for 5 seconds
//         }
//     }, Math.random() * 10000 + 10000); // Detect every 10-20 seconds
// }

// Initial call to start simulation, but with a delay to ensure client connects
// setTimeout(simulateDetection, 5000); // No longer need to call this

// --- Socket.IO Connection ---
io.on('connection', (socket) => {
    console.log('A user connected');

    // Send current state to newly connected client (for buzzer and initial detection status)
    socket.emit('detection', { detected: isPersonDetected, timestamp: detectionStartTime });
    socket.emit('buzzerStatus', { active: buzzerActive });

    socket.on('clientDetectionTriggered', (data) => {
        isPersonDetected = data.detected;
        if (data.detected) {
            detectionStartTime = Date.now();
            buzzerActive = true; // Activate buzzer on client detection
            io.emit('buzzerStatus', { active: true });
            console.log('Client triggered: Person Detected!');
            console.log('Client triggered: Buzzer Active!');
            // Simulate buzzer deactivation after a delay
            setTimeout(() => {
                buzzerActive = false;
                io.emit('buzzerStatus', { active: false });
                console.log('Client triggered: Buzzer Inactive.');
            }, 5000);
        } else {
            detectionStartTime = null;
            // Buzzer state is managed by the previous timeout
            console.log('Client triggered: Person Not Detected Anymore.');
        }
    });

    socket.on('reset', () => {
        // In a real scenario, this would send a command to Arduino
        console.log('Reset command received (simulated)');
        isPersonDetected = false;
        detectionStartTime = null;
        buzzerActive = false;
        io.emit('buzzerStatus', { active: false }); // Ensure buzzer is off on reset
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
});
