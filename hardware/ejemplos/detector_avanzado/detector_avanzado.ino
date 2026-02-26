// Pines configurados para PIR y Buzzer
const int pinPIR    = 3;  // Sensor PIR (Activador)
const int pinBuzzer = 8;  // Buzzer (activo o pasivo)

const unsigned long WARMUP_MS         = 15000; // Calibración del PIR al arrancar (15s)
const unsigned long DURACION_BUZZER_MS = 2000;  // Tiempo que suena el buzzer

int ultimoEstado = -1; // -1 = sin estado previo, HIGH = detectando, LOW = libre

String getTimestamp() {
  return "[" + String(millis() / 1000) + "s]";
}

void setup() {
  Serial.begin(115200);
  pinMode(pinPIR, INPUT);
  pinMode(pinBuzzer, OUTPUT);

  // El sensor PIR necesita tiempo para calibrarse al encenderse.
  // Sin este periodo, detecta movimiento continuamente.
  Serial.println("Calibrando sensor PIR, espere...");
  for (int i = WARMUP_MS / 1000; i > 0; i--) {
    Serial.print("  Listo en "); Serial.print(i); Serial.println("s");
    delay(1000);
  }
  Serial.println("Sistema PIR-Buzzer v2 Inicializado (Sin WiFi)");
}

void loop() {
  int valorPIR = digitalRead(pinPIR);

  if (valorPIR == HIGH) {
    if (ultimoEstado != HIGH) {
      Serial.print(getTimestamp());
      Serial.println(" -> ¡Movimiento detectado! -> Activando Buzzer");
      ultimoEstado = HIGH;
      // tone() funciona con buzzer activo Y pasivo (2kHz durante DURACION_BUZZER_MS)
      tone(pinBuzzer, 2000, DURACION_BUZZER_MS);
    }
  } else {
    if (ultimoEstado != LOW) {
      Serial.print(getTimestamp());
      Serial.println(" -> No esta pasando nadie (Standby)");
      ultimoEstado = LOW;
      noTone(pinBuzzer); // Asegura que el buzzer se apaga al perder la señal
    }
  }

  delay(10); // Muestreo cada 10ms (antes 100ms) para reducir latencia
}
