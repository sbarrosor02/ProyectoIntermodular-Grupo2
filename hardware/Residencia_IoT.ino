#include "WiFiS3.h"
#include "RTC.h"
#include "NTPClient.h"
#include "WiFiUdp.h"
#include "Arduino_LED_Matrix.h"
#include <SPI.h>
#include <MFRC522.h>
#include "arduino_secrets.h"
#include "web_index.h"

// --- CONFIGURACIÓN DE PINES ---
// Sensores de entorno
const int PIN_PIR = 2;
const int PIN_HALL = 3;
const int PIN_BUZZER = 4;

// RFID (SPI Protocol)
#define SS_PIN 10
#define RST_PIN 9

// --- OBJETOS GLOBALES ---
WiFiServer server(80);
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 3600); // GMT+1
ArduinoLEDMatrix matrix;
MFRC522 rfid(SS_PIN, RST_PIN);

// --- VARIABLES DE ESTADO ---
String eventLogs[10]; // Buffer circular para logs
int logIndex = 0;

bool lastHallState = false;  // Estado previo puerta
bool authorized = false;     // ¿Alguien pasó la tarjeta?
unsigned long authTimer = 0; 
const unsigned long AUTH_TIMEOUT = 10000; // 10 segundos de acceso tras tarjeta

// --- ICONOS MATRIZ LED ---
const uint32_t icon_secure[] = { 0x182442, 0x818181, 0x422418 }; // Candado
const uint32_t icon_alert[]  = { 0x814224, 0x181818, 0x244281 }; // X grande
const uint32_t icon_unlock[] = { 0x0, 0x6699, 0x0 };             // Check pequeño

// --- SETUP ---
void setup() {
  Serial.begin(115200);
  
  // 1. Iniciar Hardware
  pinMode(PIN_PIR, INPUT);
  pinMode(PIN_HALL, INPUT_PULLUP); // LOW = Cerrado (Imán cerca), HIGH = Abierto
  pinMode(PIN_BUZZER, OUTPUT);
  matrix.begin();
  
  SPI.begin();
  rfid.PCD_Init();

  // 2. Conexión WiFi
  Serial.print("Conectando WiFi: "); Serial.println(SECRET_SSID);
  matrix.loadFrame(icon_alert); // Visualmente cargando...
  
  WiFi.begin(SECRET_SSID, SECRET_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  // 3. Servicios Red
  server.begin();
  timeClient.begin();
  
  Serial.println("\n--- SISTEMA ONLINE ---");
  Serial.print("IP Panel Web: http://"); Serial.println(WiFi.localIP());
  
  matrix.loadFrame(icon_secure); // Sistema listo y asegurado
  addLog("Sistema Iniciado");
}

// --- LOOP PRINCIPAL ---
void loop() {
  timeClient.update();
  
  checkRFID();       // 1. ¿Hay tarjeta válida?
  checkSensors();    // 2. ¿Hay intrusión o puerta abierta?
  handleWebServer(); // 3. ¿Alguien mira la web?
  
  // Lógica de timeout para autorización
  if (authorized && (millis() - authTimer > AUTH_TIMEOUT)) {
    authorized = false;
    Serial.println("Tiempo de acceso expirado. Sistema Bloqueado.");
    addLog("Acceso Expirado");
    matrix.loadFrame(icon_secure);
  }
}

// --- FUNCIONES LÓGICAS ---

void checkRFID() {
  // Mirar si hay tarjeta nueva presente
  if (!rfid.PICC_IsNewCardPresent() || !rfid.PICC_ReadCardSerial()) {
    return; 
  }

  // Si lee tarjeta (aquí podríamos validar UID específicos)
  authorized = true;
  authTimer = millis();
  
  // Feedback
  Serial.println("TARJETA DETECTADA -> ACCESO CONCEDIDO");
  addLog("Acceso Autorizado (RFID)");
  
  // Pitido corto
  digitalWrite(PIN_BUZZER, HIGH); delay(100); digitalWrite(PIN_BUZZER, LOW);
  
  // Visual
  matrix.loadFrame(icon_unlock);
  
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
}

void checkSensors() {
  bool doorOpen = (digitalRead(PIN_HALL) == HIGH); // Sin imán
  bool motion = (digitalRead(PIN_PIR) == HIGH);

  // LOGICA DE ALARMA
  // Si la puerta se abre Y NO estamos autorizados -> ALARMA
  if (doorOpen && !authorized) {
    if (!lastHallState) { // Solo loguear al cambiar de estado
      addLog("ALERTA: Puerta Forzada");
      Serial.println("ALERTA: Puerta abierta sin autorización");
      matrix.loadFrame(icon_alert);
    }
    // Sonido intermitente (alarma)
    // Usamos millis para no bloquear el loop con delay()
    if (millis() % 500 < 250) digitalWrite(PIN_BUZZER, HIGH);
    else digitalWrite(PIN_BUZZER, LOW);
    
  } else if (doorOpen && authorized) {
    // Puerta abierta pero autorizado (Entrando/Saliendo)
    if (!lastHallState) addLog("Puerta abierta (Autorizada)");
    digitalWrite(PIN_BUZZER, LOW); // Silencio
    
  } else {
    // Puerta cerrada
    if (lastHallState) { // Si estaba abierta antes
       addLog("Puerta cerrada");
       if (!authorized) matrix.loadFrame(icon_secure); // Volver a candado si no hay auth
    }
    digitalWrite(PIN_BUZZER, LOW);
  }

  lastHallState = doorOpen;
}

// --- GESTIÓN WEB Y LOGS ---

void addLog(String msg) {
  String timestamp = timeClient.getFormattedTime();
  // Mover logs viejos
  for (int i = 9; i > 0; i--) {
    eventLogs[i] = eventLogs[i-1];
  }
  eventLogs[0] = timestamp + " - " + msg;
}

void handleWebServer() {
  WiFiClient client = server.available();
  if (client) {
    String currentLine = "";
    String request = "";
    while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        request += c;
        if (c == '\n') {
          if (currentLine.length() == 0) {
            // Fin de cabeceras HTTP
            
            // RUTAS
            if (request.indexOf("GET /api/status") >= 0) {
              sendJSON(client);
            } else {
              // Servir Dashboard HTML
              client.println("HTTP/1.1 200 OK");
              client.println("Content-Type: text/html");
              client.println("Connection: close");
              client.println();
              
              // Enviar HTML desde PROGMEM
              int len = strlen_P(WEB_DASHBOARD);
              for (int k = 0; k < len; k++) {
                char myChar = pgm_read_byte_near(WEB_DASHBOARD + k);
                client.print(myChar);
              }
            }
            break;
          } else {
            currentLine = "";
          }
        } else if (c != '\r') {
          currentLine += c;
        }
      }
    }
    client.stop();
  }
}

void sendJSON(WiFiClient& client) {
  client.println("HTTP/1.1 200 OK");
  client.println("Content-Type: application/json");
  client.println("Connection: close");
  client.println();
  
  client.print("{");
  client.print("\"hall\":"); client.print(digitalRead(PIN_HALL));
  client.print(",\"pir\":"); client.print(digitalRead(PIN_PIR));
  client.print(",\"authorized\":"); client.print(authorized ? "true" : "false");
  client.print(",\"logs\":[");
  
  for(int i=0; i<10; i++) {
    if(eventLogs[i].length() > 0) {
      client.print("\"" + eventLogs[i] + "\"");
      if (i < 9 && eventLogs[i+1].length() > 0) client.print(",");
    }
  }
  client.print("]}");
}