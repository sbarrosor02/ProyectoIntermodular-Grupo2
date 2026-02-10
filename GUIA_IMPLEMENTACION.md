# 🛠️ Guía de Implementación Técnica: Proyecto Residencia IoT

Esta guía técnica detalla el proceso paso a paso para construir, programar y desplegar el sistema de seguridad. Está diseñada para mantener una coherencia total entre el hardware seleccionado y el software desarrollado.

---

## 1. Preparación del Entorno de Desarrollo (IDE)

Antes de manipular el hardware, debemos asegurar que el entorno de software está listo para comunicar con el Arduino UNO R4 WiFi.

### Cómo hacerlo:
1.  **Instalar Arduino IDE:** Descargue la versión 2.0+ desde la web oficial.
2.  **Instalar el Soporte para la Placa (Core):**
    *   Abra el IDE y vaya a *Herramientas > Placa > Gestor de Tarjetas*.
    *   Busque "Arduino UNO R4 Boards" y haga clic en **Instalar**.
3.  **Instalar Librerías Dependientes:**
    *   Vaya a *Herramientas > Administrar Bibliotecas*.
    *   Busque e instale las siguientes:
        *   `WiFiS3` (Para conexión inalámbrica en R4).
        *   `Arduino_LED_Matrix` (Para controlar la pantalla LED integrada).
        *   `NTPClient` (Autor: Fabrice Weinberg) - Para la hora real.
        *   `MFRC522` (Autor: GithubCommunity) - Para el lector RFID.

---

## 2. Montaje del Hardware (Paso a Paso)

Esta sección asegura que las conexiones físicas coincidan exactamente con las definiciones del código (`Residencia_IoT.ino` y `flow_control.ino`).

### Cómo hacerlo:

#### Paso 2.1: El Bus de Alimentación
1.  Conecte el pin **5V** del Arduino a la línea roja (+) de la protoboard.
2.  Conecte el pin **GND** del Arduino a la línea azul (-) de la protoboard.
3.  **Excepción:** El módulo RFID requiere 3.3V. Identifique el pin **3.3V** en el Arduino para uso exclusivo de este módulo.

#### Paso 2.2: Sensores de Seguridad
*   **Sensor PIR (Movimiento):**
    *   Conecte VCC a 5V y GND a GND.
    *   Conecte el pin de Señal (OUT) al **Pin Digital 2**.
*   **Sensor de Puerta (Hall/Magnético):**
    *   Una pata a GND.
    *   La otra pata al **Pin Digital 3**.
    *   *Nota:* No hace falta resistencia externa; el código activa la resistencia interna (`INPUT_PULLUP`).

#### Paso 2.3: Actuadores (Alarma)
*   **Buzzer Activo:**
    *   Pata larga (+) al **Pin Digital 4**.
    *   Pata corta (-) a GND.

#### Paso 2.4: Módulo RFID (SPI)
*   **Precaución:** Conecte VCC del módulo al pin **3.3V** del Arduino.
*   RST -> **Pin 9**
*   SDA (SS) -> **Pin 10**
*   MOSI -> **Pin 11**
*   MISO -> **Pin 12**
*   SCK -> **Pin 13**

---

## 3. Integración y Configuración del Firmware

El código está dividido en módulos para facilitar el mantenimiento. Aquí explicamos cómo unificarlos y configurarlos.

### Cómo hacerlo:

#### Paso 3.1: Configuración de Credenciales
1.  Abra el archivo `arduino_secrets.h`.
2.  Este archivo aísla las contraseñas del código principal para seguridad.
3.  Rellene los campos:
    ```c
    #define SECRET_SSID "Su_Red_WiFi"
    #define SECRET_PASS "Su_Contraseña"
    ```

#### Paso 3.2: Unificación de Lógica (RFID + WiFi)
Actualmente, `Residencia_IoT.ino` maneja el WiFi y `flow_control.ino` el RFID. Para un sistema coherente, debe fusionar la lógica RFID en el archivo principal:

1.  **Copie los encabezados** de `flow_control.ino` (`#include <MFRC522.h>`, definiciones de pines) al inicio de `Residencia_IoT.ino`.
2.  **Copie la inicialización** (`SPI.begin(); rfid.PCD_Init();`) dentro del `setup()` de `Residencia_IoT.ino`.
3.  **Integre la lectura**: Copie el bloque `if (rfid.PICC_IsNewCardPresent()...)` dentro de una nueva función `void checkRFID()` en el archivo principal y llámela desde el `loop()`.

#### Paso 3.3: Interfaz Web
1.  Verifique el archivo `web_index.h`. Este contiene el código HTML/JS de la página web almacenado en la memoria de programa (`PROGMEM`) para ahorrar RAM.
2.  Si desea cambiar el título o colores, edite el HTML dentro de la variable `WEB_DASHBOARD`.

---

## 4. Despliegue y Verificación

Una vez montado el hardware y preparado el código, procedemos a la puesta en marcha.

### Cómo hacerlo:

1.  **Conexión al PC:** Conecte el Arduino R4 mediante cable USB-C.
2.  **Compilación:** Pulse el botón "Verificar" (Check) en el IDE. Si hay errores, revise que las librerías del Paso 1 estén instaladas.
3.  **Subida:** Pulse "Subir" (Flecha). Espere a que el IDE diga "Subido".
4.  **Monitorización:**
    *   Abra el **Monitor Serial** (Lupa arriba a la derecha).
    *   Ajuste la velocidad a **115200 baudios**.
    *   Espere el mensaje: `Conectando a [Su_Red]... Sistema Online. IP: 192.168.X.X`.

---

## 5. Pruebas Funcionales

Para asegurar la coherencia del sistema, realice estas pruebas en orden.

### Cómo hacerlo:

1.  **Prueba de Conectividad:** Introduzca la IP mostrada en el monitor serial en el navegador de su móvil u ordenador. Debería ver el panel de control.
2.  **Prueba de Puerta:** Separe el imán del sensor Hall.
    *   *Resultado esperado:* El Dashboard Web cambia a "ABIERTA" (Rojo), el Buzzer suena y la Matriz LED muestra una "X" o alerta.
3.  **Prueba de RFID (si integrado):** Pase una tarjeta por el lector.
    *   *Resultado esperado:* El monitor serial muestra "Authorized Access" y el buzzer emite un pitido corto de confirmación.
4.  **Prueba de Movimiento:** Pase la mano frente al PIR.
    *   *Resultado esperado:* El Dashboard indica "MOVIMIENTO".

---
*Este documento garantiza que la implementación sigue una estructura lógica: Preparación -> Montaje -> Programación -> Verificación.*
