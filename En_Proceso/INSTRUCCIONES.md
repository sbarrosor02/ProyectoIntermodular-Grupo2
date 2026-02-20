# Sistema de Monitoreo Arduino + Web

Este proyecto conecta un Arduino Uno con un sensor PIR a una página web local.

## Requisitos
1.  **Node.js** instalado en tu máquina.
2.  **Arduino Uno** con el código `detector.ino` cargado.

## Instalación y Uso
1.  Abre una terminal en esta carpeta (`En_Proceso`).
2.  Instala las dependencias necesarias:
    ```bash
    npm install
    ```
3.  **Configura el puerto:** Abre `server.js` y cambia `COM3` por el puerto donde esté tu Arduino (lo puedes ver en el Arduino IDE).
4.  Cierra el "Monitor Serie" de Arduino IDE (si lo tienes abierto) para que Node.js pueda acceder al puerto.
5.  Inicia el servidor:
    ```bash
    npm start
    ```
6.  Abre tu navegador en: [http://localhost:3000](http://localhost:3000)

## Características Detalladas

### 1. Gestión de Logs (Guardar Datos)
Existen dos formas principales de capturar y guardar lo que sucede con tu sensor:

#### A. A través del Servidor Node.js (Automático en `.db`)
El archivo `server.js` está configurado para escuchar el puerto serial permanentemente.
- **Cómo funciona:** Cada vez que el Arduino envía un mensaje de "Movimiento detectado", el servidor lo intercepta.
- **Archivo .db:** Los datos se guardan automáticamente en `detecciones.db` usando **SQLite**. Este archivo es una base de datos real que puedes abrir con herramientas como "DB Browser for SQLite".
- **Ventaja:** No pierdes datos aunque cierres el navegador, ya que el servidor sigue guardando todo en el archivo de base de datos.

#### B. Manualmente desde Arduino IDE
Si no quieres usar el servidor web y solo necesitas los datos del Monitor Serie:
1.  Abre el **Monitor Serie** (Herramientas > Monitor Serie).
2.  Asegúrate de que la velocidad esté en **9600 baudios**.
3.  **Para guardar:** El Monitor Serie no tiene un botón de "Guardar como", pero puedes:
    *   Seleccionar el texto con el ratón.
    *   Presionar `Ctrl + A` (seleccionar todo) y luego `Ctrl + C` (copiar).
    *   Pegar en un archivo de texto (`.txt` o `.csv`) o en un Excel.
    *   *Nota:* Para que el servidor de este proyecto funcione, el Monitor Serie del IDE **debe estar cerrado**, ya que solo una aplicación puede usar el puerto COM a la vez.

### 2. Tiempo Real con WebSockets
Para que la página web se actualice instantáneamente sin que tengas que pulsar F5, usamos la tecnología **WebSockets** (vía la librería `socket.io`).
- **Comunicación bidireccional:** A diferencia de una web normal donde el navegador pide datos, aquí el servidor "empuja" la información al navegador en cuanto llega desde el Arduino.
- **Flujo:** Arduino -> Cable USB -> `server.js` (SerialPort) -> `socket.io` -> Tu Navegador.
- **Resultado:** El icono y el texto de la web cambian en milisegundos cuando el sensor detecta a alguien.

### 3. Historial de Detecciones
La interfaz muestra una tabla con las **últimas 20 detecciones**.
- **Consulta a Base de Datos:** Cuando entras a la web, el sistema hace una consulta `SELECT` a `detecciones.db` filtrando por los 20 registros más recientes.
- **Persistencia:** Aunque reinicies el Arduino, el historial se mantiene porque los datos están escritos en el disco duro dentro del archivo de base de datos.
