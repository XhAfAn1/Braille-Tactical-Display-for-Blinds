const int dataPin = 25;   // DS
const int clockPin = 26;  // SHCP
const int latchPin = 27;  // STCP

// 16-bit variable to hold the state of all 16 shift register outputs
uint16_t ledState = 0;

// Mapping logical LEDs (0 to 8) to specific shift register bits
// 1st IC outputs Q1-Q7 correspond to bits 1 to 7.
// 2nd IC outputs Q1-Q2 correspond to bits 9 to 10.
const int ledBitMapping[9] = {1, 2, 3, 4, 5, 6, 7, 9, 10};

void setup() {
  pinMode(dataPin, OUTPUT);
  pinMode(clockPin, OUTPUT);
  pinMode(latchPin, OUTPUT);
  
  Serial.begin(115200);
  
  // Initialize all LEDs to OFF
  updateShiftRegister();
}

void loop() {
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim(); // Remove any extra whitespace/newlines
    
    if (command.startsWith("L") && command.length() >= 3) {
      // Command format: L<led_index><state>
      // e.g., "L01" -> LED 0 ON, "L80" -> LED 8 OFF
      int ledIndex = command.substring(1, 2).toInt();
      int state = command.substring(2, 3).toInt();
      
      if (ledIndex >= 0 && ledIndex <= 8) {
        int bitPosition = ledBitMapping[ledIndex];
        
        if (state == 1) {
          bitSet(ledState, bitPosition);
        } else {
          bitClear(ledState, bitPosition);
        }
        
        updateShiftRegister();
      }
    }
  }
}

void updateShiftRegister() {
  digitalWrite(latchPin, LOW);
  
  // Shift out the high byte first (for the 2nd IC)
  shiftOut(dataPin, clockPin, MSBFIRST, highByte(ledState));
  
  // Shift out the low byte (for the 1st IC)
  shiftOut(dataPin, clockPin, MSBFIRST, lowByte(ledState));
  
  digitalWrite(latchPin, HIGH);
}
