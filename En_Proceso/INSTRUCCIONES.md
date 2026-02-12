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

## Características
- **Base de Datos:** Guarda cada detección en un archivo `detecciones.db` (SQLite).
- **Tiempo Real:** Usa WebSockets para mostrar el estado sin refrescar la página.
- **Historial:** Muestra las últimas 20 detecciones guardadas.
