# Guía de Uso: Sistema de Alarma PIR

Esta guía explica cómo conectar el sensor PIR y el zumbador a tu Arduino Uno utilizando una protoboard.

## 1. Conexiones (Hardware)

Este esquema funciona con cualquier protoboard (incluida la de 100 pines) y un Arduino Uno. La protoboard sirve para compartir las líneas de energía (5V y GND).

| Componente | Pin del Componente | Pin Arduino Uno | Color sugerido |
| :--- | :--- | :--- | :--- |
| **Buzzer Activo** | S (Señal) | **Pin 8** | Azul |
| **Buzzer Activo** | - (Tierra) | **GND** | Negro |
| **Sensor PIR** | Out (Señal) | **Pin 3** | Verde |
| **Sensor PIR** | VCC (+) | **5V** | Rojo |
| **Sensor PIR** | GND (-) | **GND** | Negro |

---

## 2. Configuración en Arduino IDE

1.  **Abrir el archivo**: Abre `dectector.ino` en la carpeta `dectector`.
2.  **Placa**: Selecciona **Arduino Uno** en *Herramientas > Placa*.
3.  **Puerto**: Selecciona el puerto COM correspondiente en *Herramientas > Puerto*.
4.  **Subir**: Haz clic en el botón de la flecha (**Subir**).

---

## 3. Funcionamiento

*   El sistema está diseñado para que el **PIR actúe como el único activador**.
*   Cuando el sensor detecta movimiento, envía una señal al **Pin 3**.
*   El Arduino procesa esa señal y activa el **Buzzer en el Pin 8** durante 2 segundos.
*   Puedes abrir el **Monitor Serie** (9600 baudios) para ver cuándo se detecta movimiento.

---

## Notas sobre la Protoboard
*   Usa los carriles laterales de la protoboard (marcados con + y -) para conectar los 5V y GND del Arduino. Desde ahí, puedes sacar cables para alimentar tanto el PIR como el Buzzer fácilmente.
