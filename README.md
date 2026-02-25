# Residencia IoT — Grupo 2

Sistema de seguridad doméstica con Arduino, sensores PIR/RFID y panel web en tiempo real.
Proyecto Intermodular — Ciclo Formativo.

---

## Estructura del proyecto

```
ProyectoIntermodular-Grupo2/
├── hardware/               # Código Arduino
│   ├── Residencia_IoT.ino  # Sistema completo (R4 WiFi + RFID)
│   ├── detector.ino        # Detector básico PIR + Buzzer (Uno)
│   ├── web_index.h         # HTML embebido en el Arduino
│   ├── arduino_secrets.h   # Credenciales WiFi (NO subir al repo)
│   └── ejemplos/           # Sketches de componentes individuales
│       ├── detector_avanzado.ino
│       ├── flow_control.ino
│       ├── SensorPIR.ino
│       └── SensorHall.ino
│
├── web/
│   ├── landing/            # Páginas estáticas (abrir directamente en el navegador)
│   │   ├── index.html      # Landing page del proyecto
│   │   ├── simulador.html  # Simulador PIR standalone
│   │   └── presupuesto.html
│   ├── app/                # App web con login + simulador PIR (Node.js + Socket.IO)
│   │   ├── server.js
│   │   ├── package.json
│   │   └── public/
│   ├── servidor/           # Servidor con MongoDB + WebSocket + SerialPort (Arduino real)
│   │   ├── index.js
│   │   └── package.json
│   └── simulador-avanzado/ # Simulador con avatar 3D CSS (standalone)
│       └── index.html
│
└── docs/                   # Toda la documentación
    ├── MANUAL_USUARIO.md
    ├── MANUAL_DEMOSTRACION.md
    ├── GUIA_IMPLEMENTACION.md
    └── ...
```

---

## Quick Start

### Simulador PIR (sin servidor)
Abre directamente en el navegador:
```
web/landing/simulador.html
web/simulador-avanzado/index.html
```

### App web con login (Node.js)
```bash
cd web/app
npm install
npm start
# → http://localhost:3000
# Credenciales por defecto: admin / admin
```

### Servidor con Arduino real (requiere MongoDB + hardware)
```bash
cd web/servidor
npm install
# Editar ARDUINO_PORT en index.js (ej. COM3)
node index.js
```

### Hardware Arduino
1. Copia `hardware/arduino_secrets.h` y rellena tus credenciales WiFi.
2. Abre `hardware/Residencia_IoT.ino` en el IDE de Arduino.
3. Para el detector simple: usa `hardware/detector.ino` (sin librerías extra).

Consulta `docs/GUIA_IMPLEMENTACION.md` para instrucciones detalladas.
