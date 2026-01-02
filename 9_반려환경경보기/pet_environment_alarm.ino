/*
 * 반려환경 경보기 프로젝트
 *
 * 이 프로그램은 PIR 센서를 사용하여 움직임을 감지하고,
 * 다양한 모드로 알람을 울리는 반려환경 경보 시스템입니다.
 *
 * 작성자: 코딩 쏙 학원
 * 날짜: 2023-11-01
 */

// 필요한 라이브러리 포함
#include <LiquidCrystal_I2C.h> // I2C LCD 라이브러리

// 센서 및 핀 정의
const int PIR_PIN = 2;         // PIR 센서 핀
const int BUZZER_PIN = 8;      // 부저 핀
const int GREEN_LED_PIN = 9;   // 녹색 LED 핀 (대기 상태)
const int RED_LED_PIN = 10;    // 적색 LED 핀 (경고 상태)
const int MODE_BUTTON_PIN = 11; // 모드 전환 버튼 핀
const int STOP_BUTTON_PIN = 12; // 알람 정지 버튼 핀

// LCD 설정
LiquidCrystal_I2C lcd(0x27, 16, 2); // I2C 주소 0x27, 16x2 LCD

// 상수 정의
const unsigned long ALARM_DURATION = 5000;  // 알람 지속 시간 (밀리초)
const unsigned long DEBOUNCE_DELAY = 50;    // 버튼 디바운스 지연 (밀리초)

// 모드 정의
enum AlarmMode {
  MODE_INACTIVE,  // 비활성 모드
  MODE_MONITOR,   // 감시 모드
  MODE_NIGHT      // 야간 모드
};

// 변수 정의
AlarmMode currentMode = MODE_INACTIVE; // 현재 모드
bool motionDetected = false;           // 움직임 감지 상태
bool alarmActive = false;              // 알람 활성 상태
unsigned long alarmStartTime = 0;      // 알람 시작 시간
unsigned long lastModeChange = 0;      // 마지막 모드 변경 시간
unsigned long lastButtonPress = 0;     // 마지막 버튼 누름 시간

void setup() {
  // 시리얼 통신 시작 (디버깅용)
  Serial.begin(9600);
  Serial.println("반려환경 경보기 시스템 시작");

  // LCD 초기화
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("반려환경 경보기");
  lcd.setCursor(0, 1);
  lcd.print("초기화 중...");
  delay(2000);

  // PIR 센서 핀을 입력으로 설정
  pinMode(PIR_PIN, INPUT);

  // LED 핀을 출력으로 설정
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);

  // 부저 핀을 출력으로 설정
  pinMode(BUZZER_PIN, OUTPUT);

  // 버튼 핀을 입력으로 설정 (내부 풀업 저항 사용)
  pinMode(MODE_BUTTON_PIN, INPUT_PULLUP);
  pinMode(STOP_BUTTON_PIN, INPUT_PULLUP);

  // 초기 LED 상태 설정
  digitalWrite(GREEN_LED_PIN, HIGH);  // 녹색 LED 켜기 (대기 상태)
  digitalWrite(RED_LED_PIN, LOW);     // 적색 LED 끄기

  // 초기 디스플레이 설정
  updateDisplay();

  Serial.println("시스템 준비 완료. 초기 모드: 비활성");
}

void loop() {
  // 모드 전환 버튼 확인
  checkModeButton();

  // 알람 정지 버튼 확인
  checkStopButton();

  // 현재 모드에 따른 동작
  switch (currentMode) {
    case MODE_INACTIVE:
      // 비활성 모드: 아무 동작 안 함
      break;

    case MODE_MONITOR:
      // 감시 모드: 항상 움직임 감지
      checkMotion();
      break;

    case MODE_NIGHT:
      // 야간 모드: 어두울 때만 움직임 감지
      // (이 예제에서는 간단히 항상 감지하도록 설정)
      checkMotion();
      break;
  }

  // 알람 처리
  if (alarmActive) {
    handleAlarm();
  }
}

// 모드 전환 버튼 확인 함수
void checkModeButton() {
  // 버튼이 눌렸는지 확인 (LOW 신호)
  if (digitalRead(MODE_BUTTON_PIN) == LOW) {
    // 디바운싱 처리
    if (millis() - lastButtonPress > DEBOUNCE_DELAY) {
      lastButtonPress = millis();

      // 모드 전환
      switch (currentMode) {
        case MODE_INACTIVE:
          currentMode = MODE_MONITOR;
          Serial.println("모드 변경: 비활성 -> 감시");
          break;
        case MODE_MONITOR:
          currentMode = MODE_NIGHT;
          Serial.println("모드 변경: 감시 -> 야간");
          break;
        case MODE_NIGHT:
          currentMode = MODE_INACTIVE;
          Serial.println("모드 변경: 야간 -> 비활성");
          break;
      }

      // 알람 중지
      if (alarmActive) {
        stopAlarm();
      }

      // 디스플레이 업데이트
      updateDisplay();
    }
  }
}

// 알람 정지 버튼 확인 함수
void checkStopButton() {
  // 버튼이 눌렸는지 확인 (LOW 신호)
  if (digitalRead(STOP_BUTTON_PIN) == LOW) {
    // 디바운싱 처리
    if (millis() - lastButtonPress > DEBOUNCE_DELAY) {
      lastButtonPress = millis();

      // 알람 중지
      if (alarmActive) {
        stopAlarm();
        Serial.println("알람 수동 정지");
      }
    }
  }
}

// 움직임 감지 확인 함수
void checkMotion() {
  // PIR 센서에서 움직임 감지 (HIGH 신호)
  if (digitalRead(PIR_PIN) == HIGH) {
    if (!motionDetected) {
      motionDetected = true;
      Serial.println("움직임 감지!");

      // 알람 시작
      if (!alarmActive) {
        startAlarm();
      }
    }
  } else {
    motionDetected = false;
  }
}

// 알람 시작 함수
void startAlarm() {
  alarmActive = true;
  alarmStartTime = millis();

  // LED 상태 변경
  digitalWrite(GREEN_LED_PIN, LOW);  // 녹색 LED 끄기
  digitalWrite(RED_LED_PIN, HIGH);   // 적색 LED 켜기

  Serial.println("알람 활성화");

  // LCD에 알람 상태 표시
  lcd.setCursor(0, 1);
  lcd.print("움직임 감지!   ");
}

// 알람 중지 함수
void stopAlarm() {
  alarmActive = false;

  // LED 상태 복원
  digitalWrite(GREEN_LED_PIN, HIGH);  // 녹색 LED 켜기
  digitalWrite(RED_LED_PIN, LOW);      // 적색 LED 끄기

  // 부저 끄기
  digitalWrite(BUZZER_PIN, LOW);

  Serial.println("알람 중지");

  // 디스플레이 업데이트
  updateDisplay();
}

// 알람 처리 함수
void handleAlarm() {
  // 알람 지속 시간 확인
  if (millis() - alarmStartTime >= ALARM_DURATION) {
    stopAlarm();
    return;
  }

  // 경고음 생성 (삐-삐-삐)
  digitalWrite(BUZZER_PIN, HIGH);
  delay(100);
  digitalWrite(BUZZER_PIN, LOW);
  delay(100);
}

// LCD 디스플레이 업데이트 함수
void updateDisplay() {
  lcd.clear();

  // 첫 번째 줄: 현재 모드 표시
  lcd.setCursor(0, 0);
  lcd.print("모드: ");

  switch (currentMode) {
    case MODE_INACTIVE:
      lcd.print("비활성");
      break;
    case MODE_MONITOR:
      lcd.print("감시");
      break;
    case MODE_NIGHT:
      lcd.print("야간");
      break;
  }

  // 두 번째 줄: 상태 표시
  lcd.setCursor(0, 1);
  if (alarmActive) {
    lcd.print("움직임 감지!   ");
  } else {
    lcd.print("대기 중...     ");
  }
}
