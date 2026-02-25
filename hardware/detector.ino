// Pines configurados para PIR y Buzzer
const int pinPIR = 3;     // Sensor PIR (Activador)
const int pinBuzzer = 8;  // Buzzer activo (Actuador)

void setup() {
  // Inicialización de la comunicación serial para monitoreo
  Serial.begin(9600);
  
  // Configuración de pines
  pinMode(pinPIR, INPUT);
  pinMode(pinBuzzer, OUTPUT);
  
  Serial.println("Sistema PIR-Buzzer Inicializado");
}

void loop() {
  // Lectura del sensor PIR
  int valorPIR = digitalRead(pinPIR);

  // Monitorización
  if (valorPIR == HIGH) {
    Serial.println("¡Movimiento detectado! -> Activando Buzzer");
    digitalWrite(pinBuzzer, HIGH); // Enciende el zumbador
    delay(2000);                   // Mantiene el sonido por 2 segundos
  } else {
    digitalWrite(pinBuzzer, LOW);  // Asegura que esté apagado
  }

  // Pequeña pausa para evitar lecturas erróneas
  delay(100);
}
