# 📖 Manual de Uso: Simulador de Residencia IoT

Este manual explica cómo interactuar con el **Simulador Web** del proyecto. Este simulador permite validar la lógica de seguridad y la interfaz de usuario sin necesidad de conectar componentes físicos.

---

## 1. Inicio Rápido

1.  Navegue a la carpeta `proyectoParalelo`.
2.  Localice el archivo `index.html`.
3.  Haga doble clic sobre el archivo para abrirlo en su navegador web (se recomienda Google Chrome, Microsoft Edge o Firefox).

---

## 2. Descripción de la Interfaz

La pantalla se divide en dos secciones principales que se comunican entre sí:

### A. Zona de Hardware (Panel Izquierdo)
Representa los componentes físicos colocados en la residencia:
*   **Puerta 3D:** Un modelo visual que se abre o cierra.
*   **Lector RFID:** Dispositivo con un LED de estado.
*   **Sensor PIR:** Un domo blanco que detecta movimiento.
*   **Arduino UNO R4:** Muestra la matriz de LEDs (iconos) y el buzzer (alarma).

### B. Zona de Dashboard (Panel Derecho)
Representa la página web que el usuario final vería en su dispositivo móvil.
*   **Tarjetas de Estado:** Muestran información en tiempo real ("ABIERTA", "BLOQUEADO", etc.).
*   **Historial de Eventos:** Registro detallado de lo que ha sucedido con marcas de tiempo.
*   **Depurador JSON:** Muestra la trama de datos técnica que viaja del "Arduino" a la "Web".

---

## 3. Guía de Operación (Qué hacer y qué esperar)

Para probar que el sistema funciona correctamente, realice los siguientes experimentos:

### Escenario 1: Acceso Correcto (Residente)
1.  Haga clic en el botón **"💳 Pasar Tarjeta"**.
    *   *Resultado:* El LED del lector se pone verde, el Arduino muestra un candado abierto (`🔓`) y el Dashboard cambia a "AUTORIZADO" (color azul).
2.  Antes de 10 segundos, haga clic en **"Abrir Puerta"**.
    *   *Resultado:* La puerta se abre. El Dashboard indica "ABIERTA" pero **no suena la alarma**. En el historial aparecerá: `Puerta abierta (Autorizada)`.

### Escenario 2: Intento de Intrusión (Alarma)
1.  Asegúrese de que el sistema dice "BLOQUEADO" en el Dashboard (espere 10 segundos si acaba de pasar la tarjeta).
2.  Haga clic en **"Abrir Puerta"**.
    *   *Resultado:* El buzzer empezará a vibrar y se pondrá rojo. El Arduino mostrará una `❌`.
    *   *Dashboard:* El estado de la puerta se pondrá en rojo y el historial registrará: `ALERTA: Puerta Forzada`.

### Escenario 3: Detección de Presencia
1.  Haga clic en **"🏃 Simular Movimiento"**.
    *   *Resultado:* El sensor físico (blanco) se iluminará en rojo durante 2 segundos.
    *   *Dashboard:* El estado de movimiento cambiará a "DETECTADO" momentáneamente.

---

## 4. Comprensión de los Datos (JSON)

En la parte inferior derecha, verá un cuadro oscuro con código. Esto es lo que el sistema "desarrolla" internamente. 
*   Si `hall` es `true`, la puerta está abierta.
*   Si `authorized` es `true`, alguien pasó la tarjeta recientemente.

Este es exactamente el mismo formato de datos que utiliza el código real del Arduino para comunicarse con la web real.

---

## 5. Resolución de Problemas

*   **¿La puerta no se mueve?** Asegúrese de que el archivo `style.css` está en la misma carpeta que `index.html`.
*   **¿Los botones no hacen nada?** Verifique que el archivo `main.js` no ha sido movido o renombrado.
*   **¿La web se ve desordenada?** El simulador está optimizado para pantallas de ordenador. Si usa un móvil, pruebe a ponerlo en modo horizontal.

---
*Manual generado para el Proyecto Intermodular - Grupo 2 (2026)*
