int dataPin = 25;  
int clockPin = 26; 
int latchPin = 27; 

// The 5 Positives (Rows) - '1' turns a row ON
byte rows[5] = {B00000010, B00000100, B00001000, B00010000, B00100000};

// The Live Frame Buffer (Starts completely blank/OFF)
// Remember: For columns, '1' is OFF, '0' is ON (Ground)
byte currentFrame[5] = {B11111111, B11111111, B11111111, B11111111, B11111111};

void setup() {
  pinMode(dataPin, OUTPUT);
  pinMode(clockPin, OUTPUT);
  pinMode(latchPin, OUTPUT);
  
  // Open the USB connection to listen to Python
  Serial.begin(115200); 
}

void loop() {
  // 1. LISTEN FOR PYTHON DATA
  // We expect 6 bytes total: [Start Marker (255), Row1, Row2, Row3, Row4, Row5]
  if (Serial.available() >= 6) {
    if (Serial.read() == 255) { // If the first byte is our start marker
      for (int i = 0; i < 5; i++) {
        currentFrame[i] = Serial.read(); // Overwrite the frame with new data
      }
    }
  }

  // 2. MULTIPLEX THE DISPLAY (Runs continuously)
  for (int r = 0; r < 5; r++) {
    digitalWrite(latchPin, LOW);
    
    // Push Column Data (The pattern for this specific row)
    shiftOut(dataPin, clockPin, MSBFIRST, currentFrame[r]);
    // Push Row Data (Turn this specific row ON)
    shiftOut(dataPin, clockPin, MSBFIRST, rows[r]);
    
    digitalWrite(latchPin, HIGH);
    
    // Hold the light on for 2 milliseconds
    delayMicroseconds(2000); 
  }
}
