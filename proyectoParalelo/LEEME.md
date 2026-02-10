# 🌐 Proyecto Paralelo: Simulador Web

Este proyecto es una **réplica digital completa** del sistema de seguridad Arduino, construida puramente con tecnologías web (HTML, CSS, JS).

Sirve para demostrar la lógica del sistema, probar cambios en la interfaz o presentar el proyecto sin necesidad de llevar el hardware físico.

## 🚀 Cómo ejecutarlo

Simplemente haz doble clic en el archivo **`index.html`** para abrirlo en tu navegador favorito (Chrome, Edge, Firefox).

No necesitas instalar nada. No necesitas servidor web.

## 🎮 Controles de la Simulación

La pantalla está dividida en dos:

### 1. Izquierda: Hardware (El Mundo Físico)
Aquí controlas los sensores como si estuvieras allí:
*   **Abrir/Cerrar Puerta:** Simula que el imán se separa del sensor Hall.
*   **Pasar Tarjeta:** Simula acercar un llavero RFID autorizado.
*   **Simular Movimiento:** Activa el sensor PIR durante 2 segundos.
*   **Matriz LED y Buzzer:** Reaccionan automáticamente a tus acciones (verás el buzzer vibrar si salta la alarma).

### 2. Derecha: Dashboard (El Software)
Esta es la réplica exacta de lo que vería el usuario en su móvil si se conectara al Arduino real.
*   Se actualiza cada 0.5 segundos consultando a la "API Virtual".
*   Muestra el JSON en tiempo real abajo para depuración.

## 🧠 Cómo funciona el código

*   **`main.js`**: Contiene una clase `VirtualArduino` que tiene las mismas variables que el código C++ (`authorized`, `pinHall`, etc.). Ejecuta un bucle interno y expone una función `getJSON()` que imita la respuesta HTTP del Arduino.
*   **`style.css`**: Usa transformaciones 3D para la puerta y animaciones keyframes para la vibración del buzzer.
