#include "WiFiS3.h"
#include "RTC.h"
#include "NTPClient.h"
#include "WiFiUdp.h"
#include "Arduino_LED_Matrix.h"
#include "arduino_secrets.h"
#include "web_index.h"

// Pines de Hardware
const int PIN_PIR = 2;
const int PIN_HALL = 3;
const int PIN_BUZZER = 4;

// Objetos y Variables
WiFiServer server(80);
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 3600); // GMT+1 (España)
ArduinoLEDMatrix matrix;

String eventLogs[10]; // Array circular para historial
int logIndex = 0;
bool lastHallState = false;

// Iconos para Matriz LED (Efectos Visuales)
const uint32_t icon_ok[] = { 0x0, 0x440000, 0x110000 }; 
const uint32_t icon_alert[] = { 0x1e01e01e, 0x1e01e01e, 0x1e01e01e };

void setup() {
  Serial.begin(115200);
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_HALL, INPUT_PULLUP);
  pinMode(PIN_BUZZER, OUTPUT);
  matrix.begin();

  // Conexión WiFi
  Serial.print("Conectando a "); Serial.println(SECRET_SSID);
  WiFi.begin(SECRET_SSID, SECRET_PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  
  server.begin();
  timeClient.begin();
  Serial.println("\nSistema Online");
  Serial.print("IP del Arduino: "); Serial.println(WiFi.localIP());
}

void loop() {
  timeClient.update();
  checkSensors();
  handleWebServer();
  checkSerialSimulation(); // Para probar sin hardware
}

void addLog(String msg) {
  String timestamp = timeClient.getFormattedTime();
  eventLogs[logIndex] = timestamp + " - " + msg;
  logIndex = (logIndex + 1) % 10;
  Serial.println("Evento: " + msg);
}

void checkSensors() {
  bool hallActive = (digitalRead(PIN_HALL) == HIGH); // Abierto
  bool pirActive = (digitalRead(PIN_PIR) == HIGH);

  if (hallActive && !lastHallState) {
    addLog("PUERTA ABIERTA");
    digitalWrite(PIN_BUZZER, HIGH);
    matrix.loadFrame(icon_alert);
    // sendWebhook("Alerta Puerta"); // Descomentar al configurar IFTTT
  } else if (!hallActive && lastHallState) {
    digitalWrite(PIN_BUZZER, LOW);
    matrix.loadFrame(icon_ok);
  }
  lastHallState = hallActive;
}

void handleWebServer() {
  WiFiClient client = server.available();
  if (client) {
    String request = client.readStringUntil('\r');
    if (request.indexOf("GET /api/status") >= 0) {
      sendJSON(client);
    } else {
      client.println("HTTP/1.1 200 OK");
      client.println("Content-Type: text/html");
      client.println("Connection: close");
      client.println();
      client.print(WEB_DASHBOARD);
    }
    client.stop();
  }
}

void sendJSON(WiFiClient& client) {
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: application/json");
  client.println();
  client.print("{\"hall\":"); client.print(digitalRead(PIN_HALL));
  client.print(",\"pir\":"); client.print(digitalRead(PIN_PIR));
  client.print(",\"logs\":[");
  for(int i=0; i<10; i++) {
    if(eventLogs[i] != "") {
      client.print("\"" + eventLogs[i] + "\"" + (i==9 ? "" : ","));
    }
  }
  client.print("]}");
}

void checkSerialSimulation() {
  if (Serial.available()) {
    char c = Serial.read();
    if (c == 'H') { addLog("SIM: Puerta Forzada"); digitalWrite(PIN_BUZZER, HIGH); }
    if (c == 'C') { digitalWrite(PIN_BUZZER, LOW); Serial.println("Buzzer OFF"); }
  }
}
