int SENSOR;

void setup () {
  Serial.begin(9600);
  // entradas analógicas no requieren inicialización
}

void loop () {
  SENSOR = analogRead(A0);
  Serial.println (SENSOR);
  delay(500);
}