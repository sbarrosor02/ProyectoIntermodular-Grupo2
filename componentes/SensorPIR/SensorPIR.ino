int SensorPIR = 3;

void setup() {
  Serial.begin(9600);
  pinMode(SensorPIR, INPUT);
}

void loop() {
  int Valor = digitalRead(SensorPIR);

  Serial.println(Valor);
  delay(250);
}
