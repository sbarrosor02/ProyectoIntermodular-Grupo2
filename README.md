# 📘 Guía Maestra de Desarrollo e Implementación: Residencia IoT (README2)

Este documento es una extensión técnica que detalla **cómo hacer** cada paso y **cómo desarrollar** las funcionalidades del sistema, asegurando que entiendas la lógica detrás de la construcción.

---

## 1. Fase de Hardware: Construcción del Circuito

### **¿Cómo hacerlo? (Pasos de montaje)**
1.  **Preparación de Alimentación:** Conecta los carriles laterales de tu protoboard al pin **5V** y **GND** del Arduino.
2.  **Cableado del Lector RFID (MFRC522):** 
    *   Usa cables DuPont hembra-macho. 
    *   **Crucial:** Lleva el pin VCC del lector al pin **3.3V** del Arduino.
    *   Conecta el resto siguiendo el estándar SPI (10-SDA, 13-SCK, 11-MOSI, 12-MISO, 9-RST).
3.  **Integración de Sensores:** 
    *   Pincha el **PIR** y el **Sensor Hall** en la protoboard. 
    *   Lleva sus cables de señal a los **Pines 2 y 3** respectivamente (en el sistema completo).
    *   **Nota para Arduino Uno (Detector independiente):** Si estás usando el código de la carpeta `dectector/` en un Arduino Uno estándar, los pines configurados son el **Pin 3** para el PIR y el **Pin 8** para el Buzzer.
4.  **Instalación del Buzzer:** 
    *   Para el sistema completo: Conecta el terminal positivo al **Pin 4**.
    *   Para el detector independiente (Arduino Uno): Conecta el terminal positivo al **Pin 8**.
    *   El terminal negativo siempre a la línea de GND común.

### **¿Cómo desarrollarlo? (Lógica de diseño)**
*   Hemos desarrollado el sistema usando **interrupciones lógicas** (lectura constante en el `loop`).
*   El pin del sensor Hall se configura como `INPUT_PULLUP` en el código para evitar ruidos eléctricos, permitiendo que el sensor solo necesite cerrar el circuito a tierra (GND) para detectar la puerta cerrada.

---

## 2. Fase de Software: Configuración del Cerebro

### **¿Cómo hacerlo? (Pasos en el IDE o Terminal)**
1.  **Carga de Bibliotecas:** En el IDE de Arduino, pulsa `Ctrl+Shift+I` y busca "MFRC522" y "NTPClient".
    *   *Nota:* Para el detector simple (`dectector.ino`), no necesitas librerías adicionales.
    *   *Opción Terminal (arduino-cli):* 
        ```bash
        arduino-cli lib install "MFRC522"
        arduino-cli lib install "NTPClient"
        ```
2.  **Configuración Secreta:** Abre la pestaña `arduino_secrets.h` y rellena tus datos WiFi (Solo para R4 WiFi).
3.  **Compilación y Carga:** Pulsa `Subir`.
    *   **Para Arduino Uno:** Asegúrate de seleccionar *Herramientas > Placa > Arduino Uno* y el puerto COM correcto.
    *   *Opción Terminal (Arduino Uno):*
        ```bash
        arduino-cli compile --fqbn arduino:avr:uno dectector/
        arduino-cli upload -p COM3 --fqbn arduino:avr:uno dectector/
        ```
    *   *Opción Terminal (Arduino R4 WiFi):* 
        ```bash
        arduino-cli compile --fqbn arduino:samd:unor4wifi .
        arduino-cli upload -p COM3 --fqbn arduino:samd:unor4wifi .
        ```

### **¿Cómo desarrollarlo? (Lógica de programación)**
*   **Modularidad:** El código se desarrolla separando el HTML (`web_index.h`) de la lógica de control. Esto permite que el Arduino no se sature procesando texto largo.
*   **Seguridad:** El desarrollo incluye un **Timer de Autorización** (`authTimer`). Al pasar la tarjeta, se activa una "ventana de tiempo" de 10 segundos. Si la puerta se abre fuera de esa ventana, la variable `authorized` será `false` y disparará la alarma.

---

## 3. Fase de Conectividad: El Servidor Web

### **¿Cómo hacerlo? (Acceso al sistema)**
1.  **Identificación de IP:** Abre el Monitor Serial a **115200 baudios**. Anota la IP (ej. `192.168.1.15`).
2.  **Verificación de Conexión (Terminal):** Antes de abrir el navegador, comprueba si el Arduino responde en la red:
    ```bash
    ping 192.168.1.15
    ```
3.  **Prueba de API (Terminal):** Puedes ver los datos "crudos" del sistema sin usar el navegador usando `curl`:
    ```bash
    curl http://192.168.1.15/api/status
    ```
    *Resultado esperado:* Verás un texto JSON con los estados de los sensores.

### **¿Cómo desarrollarlo? (Lógica de red)**
*   El sistema desarrolla un **Servidor Asíncrono Simulado**. No recargamos toda la página; el JavaScript en `web_index.h` hace peticiones pequeñas a `/api/status`.
*   El Arduino responde con un formato **JSON**, que es un lenguaje ligero que tanto el chip como el navegador entienden perfectamente.

---

## 4. Fase de Pruebas: Verificación de Comportamiento

### **¿Cómo hacerlo? (Protocolo de test)**
1.  **Test de Alarma:** Abre la puerta sin pasar la tarjeta.
    *   *Resultado:* El buzzer debe pitar. En la web, el historial debe decir "ALERTA: Puerta Forzada".
2.  **Test de Acceso:** Pasa la tarjeta y luego abre la puerta.
    *   *Resultado:* El buzzer debe estar en silencio. El historial dirá "Puerta abierta (Autorizada)".
3.  **Test de Tiempo:** Pasa la tarjeta, espera 15 segundos y luego abre la puerta.
    *   *Resultado:* La alarma debe sonar (porque el tiempo de gracia expiró).

### **¿Cómo desarrollarlo? (Mejora continua)**
*   Si notas que la alarma tarda en sonar, puedes disminuir el `delay()` en el código o aumentar la frecuencia de actualización del Dashboard en el archivo `web_index.h` (cambiando el valor de `setInterval` de 1000 a 500).

---
*Esta guía asegura que no solo montes el proyecto, sino que comprendas por qué cada cable y cada línea de código están donde están.*
