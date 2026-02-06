#include <SPI.h>
#include <MFRC522.h>

// RFID Configuration
#define SS_PIN 10
#define RST_PIN 9
MFRC522 rfid(SS_PIN, RST_PIN);

// Sensors Configuration
const int sensorA = 2; // Internal sensor
const int sensorB = 3; // External sensor
const int alertPin = 4; // Buzzer or LED

// Variables for logic
bool authorized = false;
unsigned long authTimeout = 5000; // 5 seconds to pass after RFID
unsigned long lastAuthTime = 0;

void setup() {
  Serial.begin(9600);
  SPI.begin();
  rfid.PCD_Init();

  pinMode(sensorA, INPUT);
  pinMode(sensorB, INPUT);
  pinMode(alertPin, OUTPUT);

  Serial.println("System Initialized - Flow Control");
}

void loop() {
  // Check for RFID card
  if (rfid.PICC_IsNewCardPresent() && rfid.PICC_ReadCardSerial()) {
    Serial.println("Authorized Access Detected");
    authorized = true;
    lastAuthTime = millis();
    digitalWrite(alertPin, HIGH);
    delay(200);
    digitalWrite(alertPin, LOW);
    rfid.PICC_HaltA();
  }

  // Reset authorization after timeout
  if (authorized && (millis() - lastAuthTime > authTimeout)) {
    authorized = false;
    Serial.println("Authorization Timed Out");
  }

  // Flow Detection Logic
  if (digitalRead(sensorA) == LOW) { // Someone triggers internal sensor
    delay(50); // Debounce
    if (digitalRead(sensorB) == LOW) {
      // Logic for direction detection can be more complex
      // but here is a simple sequential check
    }
    
    if (!authorized) {
      triggerAlert();
      Serial.println("ALERT: Unauthorized passage attempt (Internal -> External)");
    } else {
      Serial.println("Authorized passage detected");
      authorized = false; 
    }
    while(digitalRead(sensorA) == LOW || digitalRead(sensorB) == LOW); // Wait for clear
  }
}

void triggerAlert() {
  for (int i = 0; i < 3; i++) {
    digitalWrite(alertPin, HIGH);
    delay(100);
    digitalWrite(alertPin, LOW);
    delay(100);
  }
}
