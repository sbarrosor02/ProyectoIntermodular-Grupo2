# 🌟 Simulador Avanzado v2.0: Avatar y Base de Datos

Hemos actualizado el simulador con dos características potentes: **Persistencia de Datos** y **Animaciones de Personaje**.

## 1. El Avatar (Personaje Animado)
Ahora verás un pequeño personaje en el centro de la pantalla. Este avatar reacciona a tus acciones:

*   **Estado Quieto (Idle):** Está en el centro esperando.
*   **Acción de Tarjeta:** Se desplaza hacia la izquierda, extiende su brazo y presenta la tarjeta al lector RFID.
*   **Intrusión (Forzar Puerta):** Si abres la puerta sin permiso, el personaje se mueve hacia ella y empieza a "agitarse" (simulando forzarla o pánico por la alarma). Su cara se pone roja.
*   **Cruce PIR:** Si pulsas "Cruzar (PIR)", el personaje camina hacia la derecha. Verás que su pierna izquierda se ilumina en rojo, indicando que el sensor ha detectado movimiento en esa extremidad.

## 2. Base de Datos Persistente
Hemos implementado una clase `LocalDB` que usa la memoria de tu navegador (`localStorage`).

*   **¿Qué significa esto?** Si recargas la página con `F5`, **el historial no se borra**. Los eventos de "Puerta Abierta" o "Alarma" seguirán ahí, tal como ocurriría en un sistema real conectado a una base de datos en la nube.
*   **Limpieza:** Hemos añadido un botón rojo **"🗑️ Borrar DB"** en la esquina derecha para reiniciar el sistema por completo.

## 3. Guía Técnica (Para desarrolladores)

### Estructura de Clases (`main.js`)
*   `LocalDB`: Maneja `insertLog()` y `getAllLogs()`.
*   `VirtualArduino`: Ahora instancia `LocalDB` en su constructor. Cada vez que hace un `logEvent()`, lo guarda en disco.
*   `updateAvatarState(state)`: Función que cambia las clases CSS del `div#avatar` (`state-rfid`, `state-forcing`, etc.).

### Animaciones (`style.css`)
Usamos CSS puro para evitar imágenes pesadas.
*   `.state-forcing`: Usa `@keyframes shakePerson` para vibrar.
*   `.state-pir .leg`: Usa `@keyframes walk` para mover las piernas y añade `box-shadow` rojo para simular el láser del sensor.
