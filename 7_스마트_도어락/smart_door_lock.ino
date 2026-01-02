/*
 * 스마트 도어락 프로젝트
 *
 * 이 프로그램은 4x4 키패드를 사용하여 비밀번호를 입력하고,
 * 서보 모터로 도어락을 제어하며, LED와 부저로 상태를 표시합니다.
 *
 * 작성자: 코딩 쏙 학원
 * 날짜: 2023-11-01
 */

// 필요한 라이브러리 포함
#include <Keypad.h>  // 키패드 라이브러리
#include <Servo.h>   // 서보 모터 라이브러리

// 키패드 설정
const byte ROWS = 4; // 키패드 행 수
const byte COLS = 4; // 키패드 열 수

// 키패드 키 배열
char keys[ROWS][COLS] = {
  {'1','2','3','A'},
  {'4','5','6','B'},
  {'7','8','9','C'},
  {'*','0','#','D'}
};

// 키패드 핀 연결
byte rowPins[ROWS] = {9, 8, 7, 6}; // 행 핀 (R1, R2, R3, R4)
byte colPins[COLS] = {5, 4, 3, 2}; // 열 핀 (C1, C2, C3, C4)

// 키패드 객체 생성
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);

// 서보 모터 객체 생성
Servo doorServo;

// 핀 정의
const int SERVO_PIN = 10;     // 서보 모터 핀
const int BUZZER_PIN = 11;    // 부저 핀
const int GREEN_LED_PIN = 12; // 녹색 LED 핀 (잠금 해제 상태)
const int RED_LED_PIN = 13;   // 적색 LED 핀 (잠금 상태)

// 상수 정의
const String CORRECT_PASSWORD = "1234"; // 올바른 비밀번호
const int LOCKED_POSITION = 0;          // 잠금 위치 (서보 각도)
const int UNLOCKED_POSITION = 90;       // 잠금 해제 위치 (서보 각도)
const unsigned long AUTO_LOCK_DELAY = 5000; // 자동 잠금 대기 시간 (밀리초)

// 변수 정의
String inputPassword = "";      // 입력된 비밀번호
bool isLocked = true;           // 도어락 상태 (true: 잠금, false: 잠금 해제)
unsigned long unlockTime = 0;   // 잠금 해제 시간

void setup() {
  // 시리얼 통신 시작 (디버깅용)
  Serial.begin(9600);
  Serial.println("스마트 도어락 시스템 시작");

  // 서보 모터 초기화
  doorServo.attach(SERVO_PIN);
  doorServo.write(LOCKED_POSITION); // 초기 상태: 잠금

  // LED 핀을 출력으로 설정
  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);

  // 부저 핀을 출력으로 설정
  pinMode(BUZZER_PIN, OUTPUT);

  // 초기 LED 상태 설정
  digitalWrite(GREEN_LED_PIN, LOW);  // 녹색 LED 끄기
  digitalWrite(RED_LED_PIN, HIGH);   // 적색 LED 켜기 (잠금 상태)

  Serial.println("도어락이 잠겼습니다. 비밀번호를 입력하세요.");
}

void loop() {
  // 자동 잠금 확인
  if (!isLocked && (millis() - unlockTime >= AUTO_LOCK_DELAY)) {
    lockDoor();
  }

  // 키패드 입력 확인
  char key = keypad.getKey();

  if (key) {
    // 키패드 입력이 있을 경우
    handleKeyPress(key);
  }
}

// 키패드 입력 처리 함수
void handleKeyPress(char key) {
  // 시리얼 모니터에 입력된 키 표시
  Serial.print("입력된 키: ");
  Serial.println(key);

  // 키 입력에 따른 소리 피드백
  tone(BUZZER_PIN, 1000, 50); // 짧은 삐 소리

  if (key == '#') {
    // '#' 키: 비밀번호 확인
    checkPassword();
  }
  else if (key == '*') {
    // '*' 키: 입력 초기화
    resetInput();
  }
  else {
    // 숫자 키: 비밀번호에 추가
    inputPassword += key;

    // 입력된 비밀번호 길이 표시 (보안을 위해 '*'로 표시)
    Serial.print("입력된 비밀번호: ");
    for (int i = 0; i < inputPassword.length(); i++) {
      Serial.print("*");
    }
    Serial.println();
  }
}

// 비밀번호 확인 함수
void checkPassword() {
  if (inputPassword == CORRECT_PASSWORD) {
    // 비밀번호가 올바를 경우
    Serial.println("비밀번호가 일치합니다. 도어락을 엽니다.");
    unlockDoor();
  }
  else {
    // 비밀번호가 틀릴 경우
    Serial.println("비밀번호가 일치하지 않습니다.");
    indicateWrongPassword();
  }

  // 입력 초기화
  resetInput();
}

// 도어락 잠금 함수
void lockDoor() {
  if (!isLocked) {
    isLocked = true;
    doorServo.write(LOCKED_POSITION); // 서보 모터를 잠금 위치로 이동

    // LED 상태 변경
    digitalWrite(GREEN_LED_PIN, LOW);  // 녹색 LED 끄기
    digitalWrite(RED_LED_PIN, HIGH);   // 적색 LED 켜기

    // 소리 피드백
    tone(BUZZER_PIN, 500, 200); // 낮은 삐 소리

    Serial.println("도어락이 잠겼습니다.");
  }
}

// 도어락 잠금 해제 함수
void unlockDoor() {
  if (isLocked) {
    isLocked = false;
    doorServo.write(UNLOCKED_POSITION); // 서보 모터를 잠금 해제 위치로 이동
    unlockTime = millis(); // 잠금 해제 시간 기록

    // LED 상태 변경
    digitalWrite(GREEN_LED_PIN, HIGH);  // 녹색 LED 켜기
    digitalWrite(RED_LED_PIN, LOW);     // 적색 LED 끄기

    // 소리 피드백
    tone(BUZZER_PIN, 1000, 200); // 높은 삐 소리

    Serial.println("도어락이 열렸습니다. 5초 후 자동으로 잠깁니다.");
  }
}

// 잘못된 비밀번호 알림 함수
void indicateWrongPassword() {
  // LED 깜빡임
  for (int i = 0; i < 3; i++) {
    digitalWrite(RED_LED_PIN, HIGH);
    tone(BUZZER_PIN, 300, 200); // 경고음
    delay(200);
    digitalWrite(RED_LED_PIN, LOW);
    delay(200);
  }

  // LED 상태 복원
  digitalWrite(RED_LED_PIN, HIGH);
}

// 입력 초기화 함수
void resetInput() {
  inputPassword = "";
  Serial.println("입력이 초기화되었습니다.");
}
