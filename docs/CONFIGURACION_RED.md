# 🌐 Guía de Configuración de Red y Panel de Usuario

Esta guía explica cómo conectar su sistema Residencia IoT a Internet y cómo interpretar la información mostrada en el panel de control web.

---

## 1. Configuración de Credenciales WiFi

El sistema necesita conectarse a su red WiFi para servir la página web y sincronizar la hora. Por seguridad, las contraseñas no están en el código principal.

### Pasos para configurar:

1.  Localice el archivo **`arduino_secrets.h`** en la carpeta del proyecto.
2.  Ábralo con el Bloc de notas o su editor de código.
3.  Verá algo similar a esto:
    ```c
    #define SECRET_SSID "NOMBRE_DE_TU_WIFI"
    #define SECRET_PASS "CONTRASEÑA_DE_TU_WIFI"
    ```
4.  Reemplace el texto entre comillas con los datos reales de su red doméstica.
    *   **Nota:** El Arduino UNO R4 WiFi funciona mejor en redes de **2.4GHz**. Si su router tiene 5GHz y 2.4GHz con el mismo nombre y falla la conexión, intente crear una red de invitados solo 2.4GHz.
5.  Guarde el archivo y vuelva a subir el código (`Residencia_IoT.ino`) a la placa.

---

## 2. Acceso al Panel de Control Web

Una vez que el Arduino se conecta, le asignará una dirección IP local.

### Cómo obtener la dirección IP:
1.  Con el Arduino conectado al PC, abra el **Monitor Serial** en el IDE (icono de lupa, arriba a la derecha).
2.  Asegúrese de que la velocidad (abajo a la derecha de la ventana) esté en **115200 baudios**.
3.  Pulse el botón de **Reset** en el Arduino.
4.  Verá mensajes de inicio. Busque la línea que dice:
    ```
    IP Panel Web: http://192.168.1.XX
    ```
5.  Copie esa dirección completa en el navegador de su móvil, tablet u ordenador (deben estar conectados al mismo WiFi).

---

## 3. Interpretación del Panel de Usuario

El panel web se actualiza automáticamente cada segundo. Aquí explicamos qué significa cada tarjeta:

### 🚪 Tarjeta: Puerta Principal
Indica el estado físico del sensor magnético (Hall).
*   **Verde (CERRADA):** El imán está junto al sensor. La casa está segura físicamente.
*   **Rojo (ABIERTA):** El imán se ha separado. Si esto ocurre sin autorización previa, sonará la alarma.

### 🏃 Tarjeta: Sensor Movimiento
Indica la actividad detectada por el sensor PIR.
*   **Verde (INACTIVO):** No hay nadie en el rango de visión.
*   **Rojo (DETECTADO):** Hay movimiento. Esto es informativo y no dispara la alarma sonora por sí solo en esta versión (para evitar falsos positivos con mascotas), pero queda registrado.

### 🛡️ Tarjeta: Sistema de Acceso (NUEVO)
Muestra el estado lógico de seguridad basado en RFID.
*   **Azul (AUTORIZADO):** Alguien ha pasado una tarjeta válida recientemente.
    *   *Efecto:* Tiene 10 segundos para abrir la puerta sin que suene la alarma.
*   **Rojo (BLOQUEADO):** Nadie ha validado acceso.
    *   *Efecto:* Si la puerta se abre en este estado, **sonará la alarma** y se enviará una alerta de "Puerta Forzada" al log.

### 📋 Historial de Eventos
Lista las últimas 10 acciones con hora exacta (sincronizada por internet).
*   Ejemplo: `14:30:05 - Acceso Autorizado (RFID)`
*   Ejemplo: `14:30:12 - Puerta abierta (Autorizada)` -> Todo correcto.
*   Ejemplo: `14:45:00 - ALERTA: Puerta Forzada` -> Alguien entró sin tarjeta.

---

## 4. Solución de Problemas de Red

*   **Si el Monitor Serial dice "Conectando..." infinitamente:**
    *   Revise que la contraseña en `arduino_secrets.h` no tenga espacios extra.
    *   Verifique que la red es 2.4GHz.
*   **Si entra en la IP pero la web no carga:**
    *   Asegúrese de que su dispositivo (móvil/PC) no esté usando datos móviles (4G/5G), sino el mismo WiFi que el Arduino.
