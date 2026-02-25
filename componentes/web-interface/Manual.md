# Manual de Inicio de la Aplicación

Para iniciar la aplicación web de monitoreo, sigue los siguientes pasos:

1.  **Abre tu terminal o línea de comandos.**

2.  **Navega al directorio del proyecto `web-interface`:**
    ```bash
    cd Componentes/web-interface
    ```

3.  **Instala las dependencias (si no lo has hecho ya):**
    Si es la primera vez que inicias el proyecto o si hay nuevas dependencias, ejecuta:
    ```bash
    npm install
    ```

4.  **Inicia el servidor Node.js:**
    ```bash
    node server.js
    ```

5.  **Accede a la aplicación en tu navegador:**
    Una vez que el servidor esté funcionando (verás un mensaje como "Server running on port 3000"), abre tu navegador web y ve a la siguiente dirección:
    [http://localhost:3000](http://localhost:3000)

**Funcionamiento Básico:**

*   **Autenticación:** Al abrir la página, verás una sección para **Login / Register**. Puedes crear un nuevo usuario y luego iniciar sesión.
*   **Dashboard:** Tras iniciar sesión, accederás al Dashboard. Aquí verás el estado simulado del sensor PIR y del zumbador.
*   **Simulación de Detección:** El servidor simulará automáticamente detecciones de personas y la activación del zumbador cada 10-20 segundos. Verás notificaciones en la interfaz y la animación de la persona se activará.
*   **Botón "Reiniciar Sistema":** Puedes hacer clic en este botón para resetear la simulación en cualquier momento.
