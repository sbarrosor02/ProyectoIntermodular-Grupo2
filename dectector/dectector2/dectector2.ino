// Pines configurados para PIR y Buzzer (según dectector.ino)
const int pinPIR = 3;     // Sensor PIR (Activador)
const int pinBuzzer = 8;  // Buzzer activo (Actuador)

bool ultimoEstado = -1; // Variable para controlar cambios de estado y no saturar el monitor serial

void setup() {
  // Inicialización de la comunicación serial
  Serial.begin(9600);
  
  // Configuración de pines
  pinMode(pinPIR, INPUT);
  pinMode(pinBuzzer, OUTPUT);
  
  Serial.println("Sistema PIR-Buzzer v2 Inicializado (Sin WiFi)");
}

// Función para obtener el timestamp (simulado o basado en tiempo de ejecución)
// Como no hay WiFi, no podemos obtener la hora de NTP.
// Podríamos usar millis() para un timestamp de tiempo de ejecución, o un RTC externo si se añade hardware.
// Por ahora, solo indicaremos que es un evento sin timestamp de hora real.
String getTimestamp() {
  // Retorna un timestamp basado en el tiempo de ejecución en milisegundos
  return "[Tiempo de ejecucion: " + String(millis() / 1000) + "s]";
}

void loop() {
  // Lectura del sensor PIR
  int valorPIR = digitalRead(pinPIR);

  if (valorPIR == HIGH) {
    // Si detecta movimiento
    if (ultimoEstado != HIGH) {
      Serial.print(getTimestamp());
      Serial.println(" -> ¡Movimiento detectado! -> Activando Buzzer");
      ultimoEstado = HIGH;
    }
    digitalWrite(pinBuzzer, HIGH); // Enciende el zumbador
    delay(2000);                   // Mantiene el sonido por 2 segundos
  } else {
    // Si no hay nadie
    if (ultimoEstado != LOW) {
      Serial.print(getTimestamp());
      Serial.println(" -> No esta pasando nadie (Standby)");
      ultimoEstado = LOW;
    }
    digitalWrite(pinBuzzer, LOW);  // No pite si no hay nadie
  }

  // Pequeña pausa para evitar lecturas erróneas
  delay(100);
}
