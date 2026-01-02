/*
 * 초음파 주차 센서 프로젝트
 * 
 * 이 프로그램은 초음파 센서를 사용하여 주차 공간에 차량이 있는지 감지합니다.
 * 차량이 감지되면 LED와 부저를 통해 알림을 제공하며, LCD 화면에 거리 정보를 표시합니다.
 * 
 * 작성자: 코딩 쏙 학원
 * 날짜: 2023-11-01
 */

#include <Wire.h>  // I2C 통신 라이브러리
#include <LiquidCrystal_I2C.h>  // LCD 1602 I2C 라이브러리

// LCD 설정 (주소 0x27, 16자 2줄)
LiquidCrystal_I2C lcd(0x27, 16, 2);

// 초음파 센서 핀 정의
const int trigPin = 9;   // 초음파 센서 Trig 핀
const int echoPin = 10;  // 초음파 센서 Echo 핀

// LED 핀 정의
const int redLedPin = 2;   // 주차 공간 사용 중 LED (빨강)
const int greenLedPin = 3;  // 주차 공간 비어있음 LED (초록)

// 부저 핀 정의
const int buzzerPin = 11;  // 부저 핀

// 상수 정의
const int parkingThreshold = 10;  // 주차 감지 거리 임계값 (cm)
const int maxDistance = 200;      // 최대 측정 거리 (cm)

// 변수 정의
long duration;  // 초음파 왕복 시간
int distance;   // 측정된 거리
bool carParked = false;  // 주차된 차량 유무 플래그
unsigned long previousMillis = 0;  // 이전 시간 저장 변수
unsigned long buzzerInterval = 1000;  // 부저 울림 간격 (밀리초)

void setup() {
  // 시리얼 통신 시작 (디버깅용)
  Serial.begin(9600);

  // LCD 초기화
  lcd.init();
  lcd.backlight();

  // 초음파 센서 핀 설정
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  // LED 핀을 출력으로 설정
  pinMode(redLedPin, OUTPUT);
  pinMode(greenLedPin, OUTPUT);

  // 부저 핀을 출력으로 설정
  pinMode(buzzerPin, OUTPUT);

  // 초기 상태 설정: 주차 공간 비어있음, 초록 LED 켜짐
  digitalWrite(redLedPin, LOW);
  digitalWrite(greenLedPin, HIGH);

  // LCD 초기 메시지
  lcd.setCursor(0, 0);
  lcd.print("초음파 주차 센서");
  lcd.setCursor(0, 1);
  lcd.print("시스템 시작 중...");
  delay(2000);
  lcd.clear();

  Serial.println("초음파 주차 센서 시스템 시작");
}

void loop() {
  // 거리 측정
  measureDistance();

  // LCD 업데이트
  updateLCD();

  // 주차 상태 확인
  checkParkingStatus();

  // 부저 제어
  controlBuzzer();

  // 잠시 대기
  delay(100);
}

// 거리 측정 함수
void measureDistance() {
  // 초음파 센서 Trig 핀으로 10μs 펄스 출력
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Echo 핀으로 돌아오는 펄스 시간 측정
  duration = pulseIn(echoPin, HIGH);

  // 시간을 거리로 변환 (cm)
  // 음속: 340m/s = 0.034cm/μs, 왕복이므로 2로 나눔
  distance = duration * 0.034 / 2;

  // 최대 측정 거리보다 크면 최대값으로 설정
  if (distance > maxDistance) {
    distance = maxDistance;
  }

  // 시리얼 모니터에 거리 출력
  Serial.print("거리: ");
  Serial.print(distance);
  Serial.println(" cm");
}

// LCD 업데이트 함수
void updateLCD() {
  lcd.clear();

  // 첫 번째 줄: 거리 정보
  lcd.setCursor(0, 0);
  lcd.print("거리: ");
  lcd.print(distance);
  lcd.print(" cm");

  // 두 번째 줄: 주차 상태
  lcd.setCursor(0, 1);
  if (carParked) {
    lcd.print("주차 공간 사용중");
  } else {
    lcd.print("주차 공간 비어있음");
  }
}

// 주차 상태 확인 함수
void checkParkingStatus() {
  // 이전 상태 저장
  bool previousCarParked = carParked;

  // 현재 주차 상태 확인
  if (distance <= parkingThreshold) {
    carParked = true;

    // 상태가 변경되었을 때
    if (!previousCarParked) {
      // LED 상태 변경
      digitalWrite(redLedPin, HIGH);
      digitalWrite(greenLedPin, LOW);

      // 알림 사운드
      tone(buzzerPin, 523, 500);  // 523Hz(C음) 500ms

      Serial.println("차량이 주차되었습니다!");
    }
  } else {
    carParked = false;

    // 상태가 변경되었을 때
    if (previousCarParked) {
      // LED 상태 변경
      digitalWrite(redLedPin, LOW);
      digitalWrite(greenLedPin, HIGH);

      // 알림 사운드
      tone(buzzerPin, 262, 500);  // 262Hz(C음) 500ms

      Serial.println("주차 공간이 비어있습니다.");
    }
  }
}

// 부저 제어 함수
void controlBuzzer() {
  if (carParked) {
    // 차량이 주차된 경우: 거리에 따라 부저 간격 조절
    // 거리가 가까울수록 부저가 빠르게 울림
    buzzerInterval = map(distance, 1, parkingThreshold, 50, 500);

    unsigned long currentMillis = millis();

    if (currentMillis - previousMillis >= buzzerInterval) {
      previousMillis = currentMillis;

      // 부저 짧게 울리기
      tone(buzzerPin, 880, 50);  // 880Hz(A음) 50ms
    }
  } else {
    // 차량이 없는 경우: 부저 울리지 않음
    noTone(buzzerPin);
  }
}
