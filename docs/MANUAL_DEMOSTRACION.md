# Manual de Demostración Full-Stack (Arduino ↔ Web)

Este manual te guiará a través de la configuración y ejecución de la demostración full-stack que conecta tu Arduino a una página web (`proyecto_info.html`) en tiempo real, registrando los eventos en una base de datos.

## 1. Visión General

El sistema consta de tres componentes principales:

*   **Arduino:** Envía datos (logs) a través del puerto serial.
*   **Backend (Node.js Server):** Se ejecuta en tu computadora. Lee los datos del puerto serial del Arduino, los guarda en una base de datos (MongoDB) y los envía en tiempo real al navegador web a través de WebSockets. También sirve la página web.
*   **Frontend (Navegador Web):** La página `proyecto_info.html` se conecta al servidor, muestra los logs en tiempo real y puede recuperar logs históricos.

## 2. Prerrequisitos

Asegúrate de tener instalado el siguiente software en tu sistema:

*   **Node.js y npm:** Descárgalo desde [nodejs.org](https://nodejs.org/).
*   **MongoDB:** Necesitas tener un servidor MongoDB instalado y ejecutándose localmente. Puedes encontrar las instrucciones de instalación en [mongodb.com](https://www.mongodb.com/docs/manual/installation/).
*   **Arduino IDE:** Para programar tu placa Arduino y monitorear el puerto serial.
*   **Tu placa Arduino:** Con el Sensor PIR y el Buzzer conectados y el código `.ino` cargado.

## 3. Configuración del Backend (Node.js Server)

Hemos creado una carpeta `server/` para el backend. Sigue estos pasos:

### 3.1. Navegar al Directorio del Servidor

Abre tu terminal o PowerShell y navega a la carpeta `server/`:

```bash
cd C:\Users\espmi\Desktop\ProyectoIntermodular-Grupo2\server
```

### 3.2. Inicializar el Proyecto Node.js (Ya Realizado)

Este paso ya fue realizado, pero para referencia:
```bash
npm init -y
```

### 3.3. Instalar Dependencias (Ya Realizado)

Las dependencias principales ya fueron instaladas:
```bash
npm install express ws serialport mongoose cors
npm install --save-dev nodemon
```

### 3.4. Instalar Dependencias Nativas de `serialport`

`serialport` es un módulo que interactúa con componentes de bajo nivel de tu sistema operativo. Es posible que necesite herramientas de compilación.

```bash
npm install --build-from-source
```

*   **Nota para Windows:** Si el comando anterior falla con errores relacionados con Python o Visual Studio, puede que necesites instalar las herramientas de compilación de Windows. Abre una terminal **como administrador** y ejecuta:
    ```bash
    npm install --global --production windows-build-tools
    ```
    Luego, intenta `npm install --build-from-source` de nuevo.

### 3.5. Configurar el Puerto Serial de tu Arduino

**Este es un paso CRÍTICO que debes hacer tú mismo:**

1.  Abre el archivo `server/index.js` en tu editor de código.
2.  Busca la línea:
    ```javascript
    const ARDUINO_PORT = 'COM3'; // <<<--- CHANGE THIS TO YOUR ARDUINO'S PORT
    ```
3.  **Cambia `'COM3'` por el puerto serial real al que está conectado tu Arduino.** Puedes encontrar este puerto en el Arduino IDE bajo `Herramientas > Puerto`. Por ejemplo, podría ser `COM1`, `COM4`, `/dev/ttyUSB0`, `/dev/cu.usbmodemXXXX`, etc.
    *   **Ejemplo (Windows):** `const ARDUINO_PORT = 'COM4';`
    *   **Ejemplo (Linux/macOS):** `const ARDUINO_PORT = '/dev/ttyACM0';`

### 3.6. Ejecutar el Servidor Backend

Una vez que hayas configurado el puerto serial y tengas MongoDB ejecutándose, puedes iniciar el servidor:

```bash
npm start
```

Deberías ver mensajes en la consola indicando que MongoDB se conectó y que el servidor Express/WebSocket está escuchando. Si hay problemas con el puerto serial, verás una advertencia.

## 4. Configuración del Arduino

1.  Abre tu archivo `.ino` (por ejemplo, `dectector.ino`) en el Arduino IDE.
2.  Asegúrate de que tu código Arduino esté enviando datos a través del puerto serial. Por ejemplo, líneas como `Serial.println("¡Movimiento detectado!");` son esenciales.
3.  Sube el código a tu placa Arduino.

## 5. Configuración del Frontend (`proyecto_info.html`)

En breve, modificaremos `proyecto_info.html` para:

*   Añadir un nuevo `<div id="arduino-logs"></div>` donde se mostrarán los mensajes del Arduino.
*   Incluir código JavaScript que se conectará al servidor backend vía WebSocket (`ws://localhost:3000`) y actualizará este `div` con los logs en tiempo real.

## 6. Ejecución de la Demostración

1.  **Asegúrate de que MongoDB esté ejecutándose.**
2.  **Conecta tu Arduino** a tu computadora y asegúrate de que el código `.ino` esté cargado y enviando datos seriales.
3.  **Inicia el servidor backend:** Abre tu terminal en la carpeta `server/` y ejecuta `npm start`.
4.  **Abre `proyecto_info.html`** en tu navegador. Puedes abrirlo directamente o acceder a `http://localhost:3000` si el servidor lo está sirviendo.
5.  Interactúa con tu hardware Arduino (por ejemplo, activa el sensor PIR). Deberías ver los logs aparecer en tiempo real en la página web.

¡Con esto, tu demostración full-stack estará en funcionamiento! Si tienes problemas, revisa la consola de tu servidor Node.js y la consola de desarrollador de tu navegador (F12).
