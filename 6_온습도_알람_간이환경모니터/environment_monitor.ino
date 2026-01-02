/*
 * 온습도 알람 및 간이 환경 모니터 프로젝트
 *
 * 이 프로그램은 DHT11/DHT22 온습도 센서를 사용하여 온도와 습도를 측정하고,
 * LCD 화면에 표시하며, 설정된 임계값을 초과하면 부저로 알람을 울립니다.
 *
 * 작성자: 코딩 쏙 학원
 * 날짜: 2023-11-01
 */

// 필요한 라이브러리 포함
#include <DHT.h>              // DHT 온습도 센서 라이브러리
#include <LiquidCrystal_I2C.h> // I2C LCD 라이브러리

// 센서 및 핀 정의
#define DHTPIN 2      // DHT 센서 데이터 핀
#define DHTTYPE DHT11 // DHT11 센서 사용 (DHT22로 변경 가능)
#define BUZZER_PIN 8  // 부저 핀

// LCD 설정
LiquidCrystal_I2C lcd(0x27, 16, 2); // I2C 주소 0x27, 16x2 LCD

// DHT 센서 객체 생성
DHT dht(DHTPIN, DHTTYPE);

// 상수 정의
const float TEMP_THRESHOLD = 30.0;    // 온도 임계값 (°C)
const float HUMIDITY_THRESHOLD = 70.0; // 습도 임계값 (%)
const unsigned long MEASUREMENT_INTERVAL = 2000; // 측정 간격 (밀리초)

// 변수 정의
float temperature = 0.0;  // 현재 온도
float humidity = 0.0;     // 현재 습도
bool tempAlarm = false;    // 온도 알람 상태
bool humidityAlarm = false; // 습도 알람 상태
bool alarmActive = false;  // 알람 활성 상태
unsigned long previousMillis = 0; // 이전 측정 시간

void setup() {
  // 시리얼 통신 시작 (디버깅용)
  Serial.begin(9600);
  Serial.println("온습도 알람 및 간이 환경 모니터 시작");

  // DHT 센서 초기화
  dht.begin();

  // LCD 초기화
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("환경 모니터");
  lcd.setCursor(0, 1);
  lcd.print("초기화 중...");
  delay(2000);

  // 부저 핀을 출력으로 설정
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  // 초기 측정
  measureEnvironment();
  updateDisplay();
}

void loop() {
  // 주기적으로 환경 데이터 측정
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= MEASUREMENT_INTERVAL) {
    previousMillis = currentMillis;

    // 환경 데이터 측정
    measureEnvironment();

    // 알람 상태 확인
    checkAlarms();

    // 디스플레이 업데이트
    updateDisplay();

    // 시리얼 모니터에 데이터 출력
    printToSerial();
  }

  // 알람이 활성 상태이면 부저 울리기
  if (alarmActive) {
    soundAlarm();
  }
}

// 환경 데이터 측정 함수
void measureEnvironment() {
  // DHT 센서에서 온도와 습도 읽기
  humidity = dht.readHumidity();
  temperature = dht.readTemperature();

  // 측정 실패 확인
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("DHT 센서에서 데이터를 읽는 데 실패했습니다!");
    return;
  }
}

// 알람 상태 확인 함수
void checkAlarms() {
  // 이전 알람 상태 저장
  bool previousTempAlarm = tempAlarm;
  bool previousHumidityAlarm = humidityAlarm;

  // 온도 임계값 확인
  if (temperature > TEMP_THRESHOLD) {
    tempAlarm = true;
    Serial.print("경고: 온도 임계값 초과 (");
    Serial.print(temperature);
    Serial.println("°C)");
  } else {
    tempAlarm = false;
  }

  // 습도 임계값 확인
  if (humidity > HUMIDITY_THRESHOLD) {
    humidityAlarm = true;
    Serial.print("경고: 습도 임계값 초과 (");
    Serial.print(humidity);
    Serial.println("%)");
  } else {
    humidityAlarm = false;
  }

  // 알람 활성 상태 업데이트
  alarmActive = tempAlarm || humidityAlarm;

  // 알람 상태 변경 시 시리얼 메시지
  if (previousTempAlarm != tempAlarm || previousHumidityAlarm != humidityAlarm) {
    if (alarmActive) {
      Serial.println("알람 활성화!");
    } else {
      Serial.println("알람 비활성화");
      digitalWrite(BUZZER_PIN, LOW); // 부저 끄기
    }
  }
}

// LCD 디스플레이 업데이트 함수
void updateDisplay() {
  lcd.clear();

  // 첫 번째 줄: 온도 표시
  lcd.setCursor(0, 0);
  lcd.print("온도: ");
  lcd.print(temperature, 1);
  lcd.print("C");

  // 온도 알람 상태 표시
  if (tempAlarm) {
    lcd.print("!");
  }

  // 두 번째 줄: 습도 표시
  lcd.setCursor(0, 1);
  lcd.print("습도: ");
  lcd.print(humidity, 1);
  lcd.print("%");

  // 습도 알람 상태 표시
  if (humidityAlarm) {
    lcd.print("!");
  }
}

// 시리얼 모니터에 데이터 출력 함수
void printToSerial() {
  Serial.print("온도: ");
  Serial.print(temperature, 1);
  Serial.print("°C, 습도: ");
  Serial.print(humidity, 1);
  Serial.print("%");

  if (tempAlarm) {
    Serial.print(" (온도 경고!)");
  }

  if (humidityAlarm) {
    Serial.print(" (습도 경고!)");
  }

  Serial.println();
}

// 알람 소리 함수
void soundAlarm() {
  // 간단한 경고음 생성
  digitalWrite(BUZZER_PIN, HIGH);
  delay(200);
  digitalWrite(BUZZER_PIN, LOW);
  delay(200);
}
