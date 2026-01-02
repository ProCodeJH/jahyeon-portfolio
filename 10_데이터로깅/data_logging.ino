/*
 * 데이터 로깅 프로젝트
 *
 * 이 프로그램은 다양한 센서(온도, 습도, 조도)에서 데이터를 수집하고,
 * SD 카드에 저장하는 데이터 로깅 시스템입니다.
 *
 * 작성자: 코딩 쏙 학원
 * 날짜: 2023-11-01
 */

// 필요한 라이브러리 포함
#include <DHT.h>              // DHT 온습도 센서 라이브러리
#include <LiquidCrystal_I2C.h> // I2C LCD 라이브러리
#include <SD.h>               // SD 카드 라이브러리
#include <SPI.h>              // SPI 통신 라이브러리 (SD 카드용)
#include <RTClib.h>           // RTC 라이브러리

// 센서 및 핀 정의
#define DHTPIN 2      // DHT 센서 데이터 핀
#define DHTTYPE DHT11 // DHT11 센서 사용 (DHT22로 변경 가능)
const int LIGHT_SENSOR_PIN = A0; // 조도 센서 아날로그 핀
const int SD_CS_PIN = 10;         // SD 카드 모듈 CS 핀

// LCD 설정
LiquidCrystal_I2C lcd(0x27, 16, 2); // I2C 주소 0x27, 16x2 LCD

// DHT 센서 객체 생성
DHT dht(DHTPIN, DHTTYPE);

// RTC 객체 생성
RTC_DS1307 rtc;

// 상수 정의
const unsigned long LOG_INTERVAL = 10000; // 로깅 간격 (밀리초)
const char LOG_FILE[] = "DATALOG.CSV";    // 로그 파일 이름

// 변수 정의
float temperature = 0.0;  // 현재 온도
float humidity = 0.0;     // 현재 습도
int lightValue = 0;       // 현재 조도 값
unsigned long previousMillis = 0; // 이전 로깅 시간
File logFile;             // SD 카드 로그 파일 객체
bool sdInitialized = false; // SD 카드 초기화 상태

void setup() {
  // 시리얼 통신 시작 (디버깅용)
  Serial.begin(9600);
  Serial.println("데이터 로깅 시스템 시작");

  // DHT 센서 초기화
  dht.begin();

  // LCD 초기화
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("데이터 로깅");
  lcd.setCursor(0, 1);
  lcd.print("초기화 중...");
  delay(2000);

  // RTC 초기화
  if (!rtc.begin()) {
    Serial.println("RTC를 찾을 수 없습니다!");
    while (1);
  }

  // RTC 시간이 설정되어 있는지 확인
  if (!rtc.isrunning()) {
    Serial.println("RTC가 실행되고 있지 않습니다!");
    // 컴파일 시간으로 RTC 설정 (한 번만 실행)
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
    Serial.println("RTC가 컴파일 시간으로 설정되었습니다.");
  }

  // SD 카드 초기화
  if (!SD.begin(SD_CS_PIN)) {
    Serial.println("SD 카드 초기화 실패!");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("SD 카드 오류");
    delay(3000);
  } else {
    sdInitialized = true;
    Serial.println("SD 카드 초기화 성공!");

    // 로그 파일 확인 및 헤더 작성
    if (!SD.exists(LOG_FILE)) {
      // 파일이 없으면 새로 생성하고 헤더 작성
      logFile = SD.open(LOG_FILE, FILE_WRITE);
      if (logFile) {
        logFile.println("날짜,시간,온도(°C),습도(%),조도");
        logFile.close();
        Serial.println("새 로그 파일 생성 및 헤더 작성 완료");
      }
    } else {
      Serial.println("기존 로그 파일 사용");
    }
  }

  // 초기 측정
  measureSensors();
  updateDisplay();

  Serial.println("시스템 준비 완료");
}

void loop() {
  // 주기적으로 센서 데이터 측정 및 로깅
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= LOG_INTERVAL) {
    previousMillis = currentMillis;

    // 센서 데이터 측정
    measureSensors();

    // 디스플레이 업데이트
    updateDisplay();

    // 시리얼 모니터에 데이터 출력
    printToSerial();

    // SD 카드에 데이터 로깅
    if (sdInitialized) {
      logData();
    }
  }
}

// 센서 데이터 측정 함수
void measureSensors() {
  // DHT 센서에서 온도와 습도 읽기
  humidity = dht.readHumidity();
  temperature = dht.readTemperature();

  // 측정 실패 확인
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("DHT 센서에서 데이터를 읽는 데 실패했습니다!");
    return;
  }

  // 조도 센서 값 읽기
  lightValue = analogRead(LIGHT_SENSOR_PIN);
}

// LCD 디스플레이 업데이트 함수
void updateDisplay() {
  lcd.clear();

  // 첫 번째 줄: 온도와 습도 표시
  lcd.setCursor(0, 0);
  lcd.print("T:");
  lcd.print(temperature, 1);
  lcd.print("C H:");
  lcd.print(humidity, 1);
  lcd.print("%");

  // 두 번째 줄: 조도 값 표시
  lcd.setCursor(0, 1);
  lcd.print("조도: ");
  lcd.print(lightValue);
}

// 시리얼 모니터에 데이터 출력 함수
void printToSerial() {
  // 현재 시간 가져오기
  DateTime now = rtc.now();

  // 날짜와 시간 출력
  Serial.print(now.year(), DEC);
  Serial.print('/');
  Serial.print(now.month(), DEC);
  Serial.print('/');
  Serial.print(now.day(), DEC);
  Serial.print(" ");
  Serial.print(now.hour(), DEC);
  Serial.print(':');
  Serial.print(now.minute(), DEC);
  Serial.print(':');
  Serial.print(now.second(), DEC);

  // 센서 데이터 출력
  Serial.print(", 온도: ");
  Serial.print(temperature, 1);
  Serial.print("°C, 습도: ");
  Serial.print(humidity, 1);
  Serial.print("%, 조도: ");
  Serial.println(lightValue);
}

// SD 카드에 데이터 로깅 함수
void logData() {
  // 로그 파일 열기
  logFile = SD.open(LOG_FILE, FILE_WRITE);

  if (logFile) {
    // 현재 시간 가져오기
    DateTime now = rtc.now();

    // 날짜와 시간 기록
    logFile.print(now.year(), DEC);
    logFile.print("/");
    logFile.print(now.month(), DEC);
    logFile.print("/");
    logFile.print(now.day(), DEC);
    logFile.print(",");
    logFile.print(now.hour(), DEC);
    logFile.print(":");
    logFile.print(now.minute(), DEC);
    logFile.print(":");
    logFile.print(now.second(), DEC);
    logFile.print(",");

    // 센서 데이터 기록
    logFile.print(temperature, 1);
    logFile.print(",");
    logFile.print(humidity, 1);
    logFile.print(",");
    logFile.println(lightValue);

    // 파일 닫기
    logFile.close();

    Serial.println("데이터가 SD 카드에 기록되었습니다.");
  } else {
    Serial.println("로그 파일을 열 수 없습니다!");
  }
}
