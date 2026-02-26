# Residencia IoT — Grupo 2

Sistema de seguridad doméstica con Arduino, sensores PIR/RFID y panel web de monitoreo en tiempo real.
Proyecto Intermodular — Ciclo Formativo de Desarrollo de Aplicaciones Web.

---

## Descripción general

El sistema permite monitorear en tiempo real una residencia mediante:

- **Sensor PIR** — detecta movimiento/presencia y activa un buzzer de alarma.
- **Sensor Hall** — detecta si una puerta está abierta o cerrada (mediante imán).
- **Módulo RFID** — controla el acceso mediante tarjetas autorizadas.
- **Panel web** — muestra el estado del sistema en vivo, con contadores, historial de eventos y alertas visuales.

La comunicación entre el Arduino y el servidor web se realiza por **puerto serie (USB)**, y los datos se envían al navegador mediante **WebSockets** para que la pantalla se actualice al instante sin recargar la página.

---

## Estructura del proyecto

```
ProyectoIntermodular-Grupo2/
├── hardware/
│   ├── Residencia_IoT.ino       # Sistema completo: WiFi + PIR + Hall + RFID (Arduino R4)
│   ├── detector.ino             # Detector básico PIR + Buzzer (Arduino Uno)
│   ├── web_index.h              # HTML del panel embebido en el Arduino
│   ├── arduino_secrets.h        # Credenciales WiFi — NO subir al repo
│   └── ejemplos/
│       ├── detector_avanzado/
│       │   └── detector_avanzado.ino  # PIR + Buzzer con timestamps y cambio de estado
│       ├── SensorPIR.ino
│       ├── SensorHall.ino
│       └── flow_control.ino
│
├── web/
│   ├── landing/                 # Páginas estáticas — abrir directamente en el navegador
│   │   ├── index.html           # Landing page del proyecto
│   │   ├── simulador.html       # Simulador PIR standalone
│   │   └── presupuesto.html     # Presupuesto del hardware
│   │
│   ├── app/                     # App con login + simulador PIR (Node.js + Socket.IO)
│   │   ├── server.js
│   │   ├── users.json           # Usuarios — NO subir al repo
│   │   └── public/
│   │       ├── index.html
│   │       ├── script.js
│   │       └── style.css
│   │
│   ├── servidor/                # Servidor principal: MongoDB + WebSocket + SerialPort
│   │   ├── index.js
│   │   ├── package.json
│   │   └── public/
│   │       └── monitor.html     # Panel de monitoreo en tiempo real
│   │
│   └── simulador-avanzado/      # Simulador con avatar 3D CSS (standalone)
│       ├── index.html
│       ├── main.js
│       └── style.css
│
└── docs/                        # Documentación del proyecto
```

---

## Cómo arrancar cada parte

### Opción 1 — Simuladores (sin servidor, sin Arduino)

Abre directamente en el navegador, no requieren instalación:

```
web/landing/simulador.html
web/simulador-avanzado/index.html
```

---

### Opción 2 — App web con login

Sistema con autenticación y simulador PIR interactivo.

```bash
cd web/app
npm install       # solo la primera vez
npm start
```

Abre **http://localhost:3000**
Credenciales por defecto: `admin` / `admin`

---

### Opción 3 — Servidor completo con Arduino real

Requiere: **MongoDB** corriendo en `localhost:27017` y el **Arduino conectado por USB**.

```bash
cd web/servidor
npm install       # solo la primera vez
npm start
```

El servidor:
1. **Detecta automáticamente** el puerto COM del Arduino (busca por fabricante y VendorID).
2. Se conecta a MongoDB para guardar el historial de eventos.
3. Arranca el panel web en **http://localhost:3000/monitor**.

> Si hay varios dispositivos serie conectados y detecta el equivocado, edita manualmente `ARDUINO_PORT` en `web/servidor/index.js`.

---

## Panel de monitoreo en tiempo real

Accesible en **http://localhost:3000/monitor** cuando el servidor está corriendo.

El panel muestra:

| Elemento | Descripción |
|---|---|
| **Estado actual** | Indicador grande: 🟢 ZONA LIBRE / 🔴 MOVIMIENTO DETECTADO / ⚠️ ALERTA |
| **Contadores** | Total de detecciones, alertas y accesos RFID de la sesión |
| **Registro en vivo** | Historial de eventos con hora, mensaje y tipo (color por categoría) |
| **Indicador WebSocket** | Muestra si la conexión con el servidor está activa |

El panel clasifica automáticamente los mensajes del Arduino:

| Tipo | Ejemplos de mensaje |
|---|---|
| **Detección** | `¡Movimiento detectado!` |
| **Alerta** | `ALERTA: Puerta abierta sin autorización` |
| **Acceso** | `TARJETA DETECTADA → ACCESO CONCEDIDO` |
| **Libre** | `No esta pasando nadie (Standby)` |
| **Sistema** | `Sistema iniciado`, `Acceso expirado` |

Si la conexión se pierde, el panel se **reconecta automáticamente**.

---

## Hardware

### Sketches de Arduino

| Archivo | Placa | Descripción |
|---|---|---|
| `Residencia_IoT.ino` | Arduino R4 WiFi | Sistema completo con panel web propio, RFID y WiFi |
| `detector.ino` | Arduino Uno | Detector básico PIR + buzzer |
| `detector_avanzado.ino` | Arduino Uno | Detector PIR + buzzer con log serial y control de estado |

### Pines (detector_avanzado / detector)

| Pin | Componente |
|---|---|
| `3` | Sensor PIR (señal) |
| `8` | Buzzer |
| `GND` | GND de sensor y buzzer |
| `5V` | VCC del sensor PIR |

### Pines (Residencia_IoT)

| Pin | Componente |
|---|---|
| `2` | Sensor PIR |
| `3` | Sensor Hall (puerta) |
| `4` | Buzzer |
| `9` | RFID RST |
| `10` | RFID SS (SDA) |
| `11-13` | RFID SPI (MOSI/MISO/SCK) |

### Ajustes del sensor PIR (HC-SR501)

El sensor tiene dos potenciómetros en la parte trasera:

- **`Sx`** (sensibilidad) — gíralo a la derecha para detectar antes y a mayor distancia.
- **`Tx`** (tiempo de retención) — gíralo al mínimo (izquierda) para que libere la señal rápido tras dejar de detectar.

> El sensor necesita **15 segundos de calibración** al encenderse. El sketch muestra una cuenta atrás por el monitor serie durante este periodo.

---

## Dependencias

### web/servidor

```json
express, ws, mongoose, serialport, cors
```

### web/app

```json
express, socket.io
```

Instalar en cada carpeta con `npm install`.

---

## Variables de entorno y archivos excluidos

Los siguientes archivos están en `.gitignore` y **no se suben al repositorio**:

| Archivo | Motivo |
|---|---|
| `hardware/arduino_secrets.h` | Credenciales WiFi |
| `web/app/users.json` | Contraseñas de usuarios |
| `**/node_modules/` | Dependencias de Node.js |

Para usar el proyecto desde cero, crea estos archivos manualmente:

**`arduino_secrets.h`**
```cpp
#define SECRET_SSID "tu_red_wifi"
#define SECRET_PASS "tu_contraseña"
```

**`users.json`**
```json
[{ "username": "admin", "password": "admin" }]
```

---

## Solución de problemas

**El Arduino no se detecta automáticamente**
→ Comprueba que el driver USB del Arduino está instalado. En Windows aparecerá en el Administrador de dispositivos como un puerto COM.

**El sensor PIR detecta movimiento continuamente al arrancar**
→ Es normal durante los primeros 15 segundos (calibración). Si continúa, reduce la sensibilidad (`Sx`) girando a la izquierda.

**El buzzer no suena**
→ Verifica que está conectado al pin 8 y a GND. El código usa `tone()`, compatible con buzzers activos y pasivos.

**MongoDB no conecta**
→ Asegúrate de que el servicio MongoDB está corriendo: `mongod` o comprueba los servicios del sistema.
