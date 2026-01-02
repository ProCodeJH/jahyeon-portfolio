/*
 * 미니 스마트팜 프로젝트
 *
 * 이 프로그램은 토양 수분 센서를 사용하여 토양의 수분 상태를 감지하고,
 * 자동으로 물을 공급하는 미니 스마트팜 시스템입니다.
 *
 * 작성자: 코딩 쏙 학원
 * 날짜: 2023-11-01
 */

// 필요한 라이브러리 포함
#include <LiquidCrystal_I2C.h> // I2C LCD 라이브러리

// 센서 및 핀 정의
const int SOIL_MOISTURE_PIN = A0;  // 토양 수분 센서 아날로그 핀
const int RELAY_PIN = 7;           // 릴레이 제어 핀

// LCD 설정
LiquidCrystal_I2C lcd(0x27, 16, 2); // I2C 주소 0x27, 16x2 LCD

// 상수 정의
const int MOISTURE_THRESHOLD = 400;    // 토양 수분 임계값 (낮을수록 건조)
const int WATERING_DURATION = 5000;    // 급수 지속 시간 (밀리초)
const unsigned long MEASUREMENT_INTERVAL = 10000; // 측정 간격 (밀리초)
const unsigned long MIN_WATERING_INTERVAL = 30000; // 최소 급수 간격 (밀리초)

// 변수 정의
int soilMoistureValue = 0;  // 현재 토양 수분 값
int moisturePercent = 0;    // 토양 수분 백분율
bool isPumping = false;     // 펌프 작동 상태
unsigned long previousMillis = 0;  // 이전 측정 시간
unsigned long pumpStartTime = 0;   // 펌프 시작 시간
unsigned long lastWateringTime = 0; // 마지막 급수 시간

void setup() {
  // 시리얼 통신 시작 (디버깅용)
  Serial.begin(9600);
  Serial.println("미니 스마트팜 시스템 시작");

  // LCD 초기화
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("미니 스마트팜");
  lcd.setCursor(0, 1);
  lcd.print("초기화 중...");
  delay(2000);

  // 릴레이 핀을 출력으로 설정
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH); // 릴레이는 LOW에서 활성화되므로 초기에 HIGH 설정

  // 초기 측정
  measureMoisture();
  updateDisplay();

  Serial.println("시스템 준비 완료");
}

void loop() {
  // 주기적으로 토양 수분 측정
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= MEASUREMENT_INTERVAL) {
    previousMillis = currentMillis;

    // 토양 수분 측정
    measureMoisture();

    // 토양 수분 상태 확인 및 필요시 급수
    checkAndWater();

    // 디스플레이 업데이트
    updateDisplay();

    // 시리얼 모니터에 데이터 출력
    printToSerial();
  }

  // 펌프 작동 시간 확인
  if (isPumping && (currentMillis - pumpStartTime >= WATERING_DURATION)) {
    stopPumping();
  }
}

// 토양 수분 측정 함수
void measureMoisture() {
  // 토양 수분 센서 값 읽기
  soilMoistureValue = analogRead(SOIL_MOISTURE_PIN);

  // 센서 값을 백분율로 변환 (0-1023 -> 0-100%)
  // 센서 값이 높을수록 건조하므로 반전시킴
  moisturePercent = map(soilMoistureValue, 1023, 200, 0, 100);

  // 백분율 범위 제한 (0-100)
  if (moisturePercent > 100) moisturePercent = 100;
  if (moisturePercent < 0) moisturePercent = 0;
}

// 토양 수분 상태 확인 및 급수 함수
void checkAndWater() {
  // 이미 펌프가 작동 중이거나 최소 급수 간경이 지나지 않았으면 급수하지 않음
  if (isPumping || (millis() - lastWateringTime < MIN_WATERING_INTERVAL)) {
    return;
  }

  // 토양 수분이 임계값보다 낮으면 (건조하면) 급수 시작
  if (soilMoistureValue > MOISTURE_THRESHOLD) {
    startPumping();
  }
}

// 펌프 작동 시작 함수
void startPumping() {
  isPumping = true;
  pumpStartTime = millis();
  lastWateringTime = millis();

  // 릴레이 활성화 (펌프 작동)
  digitalWrite(RELAY_PIN, LOW);

  Serial.println("급수 시작");

  // LCD에 급수 상태 표시
  lcd.setCursor(0, 1);
  lcd.print("급수 중...    ");
}

// 펌프 작동 중지 함수
void stopPumping() {
  isPumping = false;

  // 릴레이 비활성화 (펌프 중지)
  digitalWrite(RELAY_PIN, HIGH);

  Serial.println("급수 완료");

  // 급수 완료 후 다시 토양 수분 측정
  delay(1000); // 물이 토양에 스며들 시간
  measureMoisture();
  updateDisplay();
}

// LCD 디스플레이 업데이트 함수
void updateDisplay() {
  lcd.clear();

  // 첫 번째 줄: 토양 수분 표시
  lcd.setCursor(0, 0);
  lcd.print("수분: ");
  lcd.print(moisturePercent);
  lcd.print("% (");
  lcd.print(soilMoistureValue);
  lcd.print(")");

  // 두 번째 줄: 펌프 상태 표시
  lcd.setCursor(0, 1);
  if (isPumping) {
    lcd.print("급수 중...    ");
  } else {
    lcd.print("대기 중...    ");
  }
}

// 시리얼 모니터에 데이터 출력 함수
void printToSerial() {
  Serial.print("토양 수분 센서 값: ");
  Serial.print(soilMoistureValue);
  Serial.print(" (");
  Serial.print(moisturePercent);
  Serial.print("%)");

  if (isPumping) {
    Serial.print(" - 급수 중");
  } else {
    Serial.print(" - 대기 중");
  }

  Serial.println();
}
