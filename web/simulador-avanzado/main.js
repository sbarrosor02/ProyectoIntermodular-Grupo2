/**
 * SIMULADOR AVANZADO: ARDUINO + DB + AVATAR
 */

// --- CLASE 1: BASE DE DATOS LOCAL (localStorage) ---
class LocalDB {
    constructor(dbName = 'iot_residence_db') {
        this.dbName = dbName;
    }

    // Guardar nuevo log
    insertLog(message) {
        const timestamp = new Date().toLocaleTimeString();
        const entry = `${timestamp} - ${message}`;
        
        // Obtener historial actual
        let history = this.getAllLogs();
        history.unshift(entry); // Añadir al principio
        
        // Limitar a 50 registros para no saturar memoria
        if (history.length > 50) history.pop();

        // Guardar
        localStorage.setItem(this.dbName, JSON.stringify(history));
        return history;
    }

    // Leer logs
    getAllLogs() {
        const data = localStorage.getItem(this.dbName);
        return data ? JSON.parse(data) : [];
    }

    // Borrar todo
    clear() {
        localStorage.removeItem(this.dbName);
    }
}

// --- CLASE 2: ARDUINO VIRTUAL ---
class VirtualArduino {
    constructor() {
        this.db = new LocalDB();
        
        // Sensores
        this.pinHall = false;
        this.pinPir = false;
        
        // Estado
        this.authorized = false;
        this.lastHallState = false;
        this.authTimer = null;
        this.alarmActive = false;
        
        // Cargar logs persistentes al inicio
        this.logs = this.db.getAllLogs();
        
        setInterval(() => this.loop(), 100);
    }

    loop() {
        this.checkSensors();
    }

    checkSensors() {
        const doorOpen = this.pinHall;

        // Lógica de Alarma
        if (doorOpen && !this.authorized) {
            if (!this.lastHallState) {
                this.logEvent("ALERTA: Puerta Forzada");
                this.setMatrix("❌");
                updateAvatarState('forcing'); // Avatar fuerza la puerta
            }
            this.alarmActive = true;
        } 
        else if (doorOpen && this.authorized) {
            if (!this.lastHallState) {
                this.logEvent("Puerta abierta (Autorizada)");
                // Avatar ya está autorizado, no cambia estado específico aquí
            }
            this.alarmActive = false;
        } 
        else {
            // Puerta Cerrada
            if (this.lastHallState) {
                this.logEvent("Puerta cerrada");
                if (!this.authorized) {
                    this.setMatrix("🔒");
                    updateAvatarState('idle'); // Avatar vuelve al centro
                }
            }
            this.alarmActive = false;
        }

        this.lastHallState = doorOpen;
        this.updateHardwareUI();
    }

    scanCard() {
        this.authorized = true;
        this.logEvent("Acceso Autorizado (RFID)");
        this.setMatrix("🔓");
        updateAvatarState('rfid'); // Avatar va al lector

        if (this.authTimer) clearTimeout(this.authTimer);
        this.authTimer = setTimeout(() => {
            this.authorized = false;
            this.logEvent("Acceso Expirado");
            this.setMatrix("🔒");
            updateAvatarState('idle');
            this.updateHardwareUI();
        }, 10000);

        this.updateHardwareUI();
    }

    logEvent(msg) {
        // Guardar en DB persistente
        this.logs = this.db.insertLog(msg);
    }

    setMatrix(icon) {
        document.getElementById('matrix-display').innerText = icon;
    }

    updateHardwareUI() {
        const buzzer = document.getElementById('phys-buzzer');
        buzzer.className = this.alarmActive ? "buzzer alarm" : "buzzer";

        const ledRfid = document.getElementById('led-rfid');
        ledRfid.className = this.authorized ? "led active" : "led";
    }

    getJSON() {
        return {
            hall: this.pinHall,
            pir: this.pinPir,
            authorized: this.authorized,
            logs: this.logs
        };
    }
}

const myArduino = new VirtualArduino();


// --- CONTROLADORES DE ANIMACIÓN Y UI ---

const avatar = document.getElementById('avatar');

function updateAvatarState(state) {
    // Resetear clases
    avatar.className = 'avatar';
    
    // Añadir nueva clase de estado
    if (state === 'idle') avatar.classList.add('state-idle');
    if (state === 'rfid') avatar.classList.add('state-rfid');
    if (state === 'forcing') avatar.classList.add('state-forcing');
    if (state === 'pir') avatar.classList.add('state-pir');
}

// Botones
function simDoorToggle() {
    const doorEl = document.getElementById('phys-door');
    const btn = document.getElementById('btn-door');
    
    myArduino.pinHall = !myArduino.pinHall;
    
    if (myArduino.pinHall) {
        doorEl.classList.add('open');
        btn.innerText = "Cerrar Puerta";
        // Si no está autorizado, la lógica del loop pondrá al avatar en 'forcing'
    } else {
        doorEl.classList.remove('open');
        btn.innerText = "Abrir Puerta";
        updateAvatarState('idle');
    }
}

function simScanCard() {
    myArduino.scanCard();
}

function simMotion() {
    const pirEl = document.getElementById('phys-pir');
    
    myArduino.pinPir = true;
    pirEl.classList.add('detecting');
    
    // Mover avatar al PIR
    updateAvatarState('pir');

    // Efecto visual de rayo en la pierna (definido en CSS .state-pir .leg)
    
    setTimeout(() => {
        myArduino.pinPir = false;
        pirEl.classList.remove('detecting');
        updateAvatarState('idle'); // Volver al sitio
    }, 2000);
}

function clearDB() {
    myArduino.db.clear();
    myArduino.logs = [];
    alert("Base de datos borrada.");
}


// --- SIMULACIÓN DASHBOARD WEB ---

function updateDashboard() {
    const data = myArduino.getJSON();

    document.getElementById('json-preview').innerText = JSON.stringify(data, null, 2);

    // Actualizar tarjetas UI
    const hallEl = document.getElementById('dash-hall');
    hallEl.innerText = data.hall ? "ABIERTA" : "CERRADA";
    hallEl.className = data.hall ? "status alert" : "status ok";

    const pirEl = document.getElementById('dash-pir');
    pirEl.innerText = data.pir ? "DETECTADO" : "INACTIVO";
    pirEl.className = data.pir ? "status alert" : "status ok";

    const authEl = document.getElementById('dash-auth');
    if (data.authorized) {
        authEl.innerText = "AUTORIZADO";
        authEl.className = "status auth";
    } else {
        authEl.innerText = "BLOQUEADO";
        authEl.className = "status alert";
    }

    // Actualizar Logs desde la DB
    const logContainer = document.getElementById('dash-log');
    let logHtml = "";
    data.logs.forEach(l => logHtml += `<div class='log-entry'>${l}</div>`);
    logContainer.innerHTML = logHtml;
}

setInterval(updateDashboard, 500);
updateDashboard();