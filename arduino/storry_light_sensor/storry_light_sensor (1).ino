// Storry motion sensor (photoresistor)
// ---------------------------------------------------------------------------
// THE RULE:
//   Compare the newest light reading with each of the two readings before it.
//   If ANY of those differences is more than 15  -> MOTION    (the story continues).
//   If none of them is more than 15              -> NO motion (the story pauses).
//   (Exactly 15 apart still counts as no motion. It has to be over 15.)

const int SENSOR_PIN = A0;         // the pin the photoresistor circuit is wired to
const int MOTION_THRESHOLD = 15;   // a difference bigger than this many counts = motion
const int SAMPLE_MS = 50;          // wait between readings (50 ms = 20 readings a second)

int older = 0;     // the reading from two steps ago
int previous = 0;  // the reading from one step ago

void setup() {
  Serial.begin(9600);              // talk over USB at 9600 "baud". The app expects exactly this.
  pinMode(LED_BUILTIN, OUTPUT);    // the tiny light on the board (pin 13 on an Uno)

  // Start both "previous" readings equal to the first real reading,
  // so the sketch does not think there is motion when it powers on.
  int first = analogRead(SENSOR_PIN);
  older = first;
  previous = first;
}

void loop() {
  int current = analogRead(SENSOR_PIN);   // 0 (pitch dark) to 1023 (very bright)

  // How far is the newest reading from each of the last two readings?
  int changeFromPrevious = abs(current - previous);
  int changeFromOlder    = abs(current - older);

  // Motion means at least one of those changes is bigger than the threshold.
  bool moving = (changeFromPrevious > MOTION_THRESHOLD) || (changeFromOlder > MOTION_THRESHOLD);

  Serial.print(current);           // e.g. 512
  Serial.print(',');               // a comma
  Serial.println(moving ? 1 : 0);  // 1 = motion, 0 = no motion, then a new line

  // The tiny light on the board is ON while motion is detected. Handy for checking without a computer.
  digitalWrite(LED_BUILTIN, moving ? HIGH : LOW);

  // Shift the history along: what was "previous" is now "older".
  older = previous;
  previous = current;

  delay(SAMPLE_MS);
}
