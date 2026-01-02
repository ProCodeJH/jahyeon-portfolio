/*
 * 스마트 신호등 & 횡단보도 버튼 프로젝트
 * 
 * 이 프로그램은 도로의 신호등 시스템을 시뮬레이션합니다.
 * 차량 신호와 보행자 신호를 제어하고, 보행자 요청 버튼을 통해 횡단보도 신호를 변경합니다.
 * 
 * 작성자: 코딩 쏙 학원
 * 날짜: 2023-11-01
 */

// 차량 신호등 핀 정의
const int carRedPin = 2;    // 차량 신호등 빨간색 LED 핀
const int carYellowPin = 3; // 차량 신호등 노란색 LED 핀
const int carGreenPin = 4;  // 차량 신호등 초록색 LED 핀

// 보행자 신호등 핀 정의
const int pedestrianRedPin = 5;   // 보행자 신호등 빨간색 LED 핀
const int pedestrianGreenPin = 6;  // 보행자 신호등 초록색 LED 핀

// 푸시 버튼 핀 정의
const int buttonPin = 7;  // 보행자 버튼 핀

// 시간 관련 상수 정의
const int greenTime = 5000;      // 차량 녹색 신호 시간 (밀리초)
const int yellowTime = 2000;     // 차량 황색 신호 시간 (밀리초)
const int redTime = 5000;        // 차량 적색 신호 시간 (밀리초)
const int pedestrianGreenTime = 5000;  // 보행자 녹색 신호 시간 (밀리초)
const int blinkTime = 500;       // 보행자 신호 깜빡임 시간 (밀리초)
const int blinkCount = 5;        // 보행자 신호 깜빡임 횟수

// 변수 정의
int buttonState = 0;        // 버튼 상태 저장 변수
int lastButtonState = 0;    // 이전 버튼 상태 저장 변수
bool pedestrianRequested = false; // 보행자 요청 상태 플래그
unsigned long previousMillis = 0; // 이전 시간 저장 변수
int blinkState = LOW;        // 깜빡임 상태 변수
int blinkCounter = 0;       // 깜빡임 카운터 변수

void setup() {
  // 시리얼 통신 시작 (디버깅용)
  Serial.begin(9600);

  // 차량 신호등 핀을 출력으로 설정
  pinMode(carRedPin, OUTPUT);
  pinMode(carYellowPin, OUTPUT);
  pinMode(carGreenPin, OUTPUT);

  // 보행자 신호등 핀을 출력으로 설정
  pinMode(pedestrianRedPin, OUTPUT);
  pinMode(pedestrianGreenPin, OUTPUT);

  // 버튼 핀을 입력으로 설정 (내부 풀업 저항 사용)
  pinMode(buttonPin, INPUT_PULLUP);

  // 초기 상태 설정: 차량은 녹색, 보행자는 적색
  digitalWrite(carRedPin, LOW);
  digitalWrite(carYellowPin, LOW);
  digitalWrite(carGreenPin, HIGH);
  digitalWrite(pedestrianRedPin, HIGH);
  digitalWrite(pedestrianGreenPin, LOW);

  Serial.println("스마트 신호등 시스템 시작");
}

void loop() {
  // 버튼 상태 읽기
  buttonState = digitalRead(buttonPin);

  // 버튼이 눌렸는지 확인 (버튼은 LOW일 때 눌린 상태)
  if (buttonState == LOW && lastButtonState == HIGH && !pedestrianRequested) {
    pedestrianRequested = true;
    Serial.println("보행자가 횡단을 요청했습니다.");

    // 차량 신호 변경: 녹색 → 노란색 → 적색
    digitalWrite(carGreenPin, LOW);
    digitalWrite(carYellowPin, HIGH);
    delay(yellowTime);

    digitalWrite(carYellowPin, LOW);
    digitalWrite(carRedPin, HIGH);

    // 보행자 신호 변경: 적색 → 녹색
    digitalWrite(pedestrianRedPin, LOW);
    digitalWrite(pedestrianGreenPin, HIGH);

    // 보행자 녹색 신호 시간 대기
    delay(pedestrianGreenTime);

    // 보행자 신호 깜빡이기
    previousMillis = millis();
    blinkCounter = 0;
    while (blinkCounter < blinkCount * 2) { // 깜빡임은 ON/OFF 두 번이 한 세트
      if (millis() - previousMillis >= blinkTime) {
        previousMillis = millis();
        blinkState = !blinkState;
        digitalWrite(pedestrianGreenPin, blinkState);
        blinkCounter++;
      }
    }

    // 보행자 신호 적색으로 변경
    digitalWrite(pedestrianGreenPin, LOW);
    digitalWrite(pedestrianRedPin, HIGH);

    // 잠시 대기 후 차량 신호 녹색으로 변경
    delay(1000);
    digitalWrite(carRedPin, LOW);
    digitalWrite(carGreenPin, HIGH);

    // 보행자 요청 플래그 초기화
    pedestrianRequested = false;
    Serial.println("신호등이 초기 상태로 복귀했습니다.");
  }

  // 현재 버튼 상태 저장
  lastButtonState = buttonState;
}
