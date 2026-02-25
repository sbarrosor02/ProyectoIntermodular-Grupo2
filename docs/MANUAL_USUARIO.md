# 📑 Manual de Usuario: Sistema de Control y Seguridad Residencia IoT

Bienvenido al manual oficial de configuración y uso del sistema de seguridad para residencias basado en IoT. Este documento le guiará paso a paso desde el montaje de los componentes hasta la operación diaria del sistema.

---

## 1. Introducción

### 1.1. Propósito del Sistema
El sistema tiene como objetivo monitorizar la seguridad de una residencia mediante sensores de presencia y apertura de puertas, permitiendo la visualización en tiempo real a través de una interfaz web. Además, integra capacidades de control de acceso mediante tecnología RFID.

### 1.2. Especificaciones Técnicas
El núcleo del sistema es un **Arduino UNO R4 WiFi**, aprovechando su conectividad nativa y su matriz de LEDs para notificaciones visuales sin necesidad de componentes externos complejos.

### 1.3. Listado de Componentes
Basado en el presupuesto del proyecto, se requieren los siguientes elementos:

| Componente | Función | Referencia |
| :--- | :--- | :--- |
| **Arduino UNO R4 WiFi** | Cerebro del sistema, servidor Web y Matriz LED | (Sustituye al R3 del presupuesto para funciones IoT) |
| **Módulo RFID RC522** | Control de acceso y validación de usuarios | 3423 |
| **Sensor PIR** | Detección de movimiento en estancias | 8459 |
| **Sensor Hall / Magnético** | Detección de apertura de puerta principal | (Genérico / Kit) |
| **Zumbador (Buzzer)** | Alerta sonora de intrusión | (Genérico / Kit) |
| **Cables Jumper** | Interconexión de módulos | 8415 |

---

## 2. Guía de Montaje de Hardware (Wiring)

Realice las conexiones con el Arduino desconectado de la corriente.

### 2.1. Sensores de Seguridad (Módulo Principal)
Configuración definida en `Residencia_IoT.ino`:

*   **Sensor PIR (Movimiento):**
    *   VCC -> 5V
    *   GND -> GND
    *   **SIGNAL -> Pin Digital 2**

*   **Sensor Hall (Puerta):**
    *   VCC -> 5V
    *   GND -> GND
    *   **SIGNAL -> Pin Digital 3** (Configurado con resistencia Pull-Up interna)

*   **Alerta Sonora (Buzzer):**
    *   Positivo (+) -> **Pin Digital 4**
    *   Negativo (-) -> GND

### 2.2. Módulo de Control de Acceso (RFID)
Conexiones para el lector MFRC522 (Protocolo SPI):

*   **SDA (SS)** -> **Pin Digital 10**
*   **SCK** -> **Pin Digital 13**
*   **MOSI** -> **Pin Digital 11**
*   **MISO** -> **Pin Digital 12**
*   **RST** -> **Pin Digital 9**
*   VCC -> **3.3V** (¡Importante: No conectar a 5V!)
*   GND -> GND

> **Nota:** Si integra el código de flujo (`flow_control.ino`) con el principal, asegúrese de no duplicar el uso de los pines 2 y 3.

---

## 3. Configuración del Software y Conectividad

### 3.1. Requisitos Previos
Necesitará el IDE de Arduino con las siguientes bibliotecas instaladas (Gestor de Librerías):
1.  `WiFiS3` (Nativa para Arduino R4)
2.  `Arduino_LED_Matrix` (Nativa para Arduino R4)
3.  `NTPClient` (Para sincronización horaria)
4.  `MFRC522` (Para el lector RFID)

### 3.2. Configuración de Red (WiFi)
Antes de cargar el código, debe configurar sus credenciales.
1.  Abra el archivo `arduino_secrets.h` en la carpeta del proyecto.
2.  Edite las siguientes líneas con su red:
    ```c
    #define SECRET_SSID "Nombre_de_su_WiFi"
    #define SECRET_PASS "Contraseña_de_su_WiFi"
    ```

### 3.3. Carga del Programa
1.  Abra `Residencia_IoT.ino`.
2.  Seleccione la placa **Arduino UNO R4 WiFi**.
3.  Conecte la placa por USB y haga clic en **Subir**.
4.  Abra el **Monitor Serial** (115200 baudios) para ver la dirección IP asignada.

---

## 4. Operación del Sistema

### 4.1. Interfaz Visual (Matriz LED)
El Arduino R4 mostrará iconos en su matriz integrada:
*   **Icono Check (Verde/Animado):** Sistema seguro, puerta cerrada.
*   **Icono Alerta (X o Parpadeo):** Puerta abierta o intrusión detectada.

### 4.2. Panel de Control Web
Acceda desde cualquier navegador en la misma red WiFi usando la IP mostrada en el Monitor Serial (ej. `http://192.168.1.50`).

**Funcionalidades del Dashboard:**
*   **Estado de Puerta:** Indica "ABIERTA" (Rojo) o "CERRADA" (Verde).
*   **Estado de Movimiento:** Indica si hay actividad reciente.
*   **Historial de Eventos:** Lista los últimos 10 eventos con su hora exacta (Sincronizada vía internet).

### 4.3. Control de Flujo y RFID
*   Al acercar una tarjeta o llavero autorizado al lector RFID, el sistema concederá acceso temporal.
*   Si se detecta paso a través de los sensores sin validación previa, se activará la alarma.

---

## 5. Mantenimiento y Solución de Problemas

### 5.1. Modo de Simulación
Si no dispone de los sensores físicos, puede probar la lógica usando el Monitor Serial:
*   Envíe la letra **`H`**: Simula que la puerta ha sido forzada (Activa Buzzer y Alerta).
*   Envíe la letra **`C`**: Cancela la alerta y apaga el Buzzer.

### 5.2. Problemas Comunes
*   **No conecta al WiFi:** Verifique que la red sea 2.4GHz (el Arduino no soporta 5GHz en algunos casos) y que la contraseña en `arduino_secrets.h` sea correcta.
*   **Hora incorrecta en logs:** Asegúrese de que el Arduino tiene acceso a internet para contactar con `pool.ntp.org`.
*   **El RFID no lee:** Compruebe el cableado, especialmente que VCC esté a 3.3V y no a 5V.

---

## 6. Anexos: Presupuesto del Proyecto

Detalle de costes estimados para la implementación (Precios orientativos):

| Referencia | Concepto | Precio Unitario (€) |
| :--- | :--- | :--- |
| 8431 | Arduino UNO (Base) | 25.41 |
| 3423 | Módulo RFID Mifare | 8.47 |
| 8459 | Sensor PIR Movimiento | 4.84 |
| 8451 | Sensor IR (Pack 2) | 7.26 |
| 8415 | Cables Protoboard | 3.95 |
| **TOTAL** | | **49.93 €** |

---
*Generado por Gemini CLI - 2026*
