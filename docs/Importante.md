# 🚨 NOTAS IMPORTANTES DE INTEGRACIÓN

Para asegurar que tu sistema funcione correctamente tras la última actualización, por favor lee estos puntos clave:

### 1. Consolidación de Código
Tras la integración realizada, el archivo **`Residencia_IoT.ino`** ahora contiene TODA la lógica del proyecto (WiFi, Servidor Web, Sensores y Control de Acceso RFID). 
*   **Acción:** A partir de ahora, este es el único archivo que necesitas abrir y subir a tu placa Arduino.
*   **Limpieza:** El archivo `flow_control.ino` ha quedado obsoleto ya que su código ha sido fusionado en el principal. Puedes borrarlo o guardarlo en una carpeta de respaldo para evitar confusiones.

### 2. Configuración Crítica
No olvides que antes de cada subida de código debes verificar el archivo `arduino_secrets.h`. Sin este archivo configurado con tu SSID y Password correctos, el sistema se quedará bloqueado en el arranque intentando conectar.

### 3. Requisitos de Hardware
Asegúrate de que el módulo RFID esté conectado al pin **3.3V**. Conectarlo a 5V podría dañar el lector permanentemente.

---
*Este proyecto ahora es una solución "Todo en Uno".*
