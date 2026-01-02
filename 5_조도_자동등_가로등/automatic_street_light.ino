/*
 * 조도 자동등(가로등) 프로젝트
 * 
 * 이 프로그램은 조도 센서를 사용하여 주변 밝기를 감지하고, 자동으로 LED를 켜고 끕니다.
 * 어두워지면 자동으로 불이 켜지고 밝아지면 자동으로 꺼지며, 밝기에 따라 LED 밝기도 조절됩니다.
 * 
 * 작성자: 코딩 쏙 학원
 * 날짜: 2023-11-01
 */

// 조도 센서 핀 정의
const int lightSensorPin = A0;  // 조도 센서 아날로그 핀

// LED 핀 정의
const int streetLight1Pin = 9;  // 가로등 1 PWM 핀
const int streetLight2Pin = 10; // 가로등 2 PWM 핀
const int streetLight3Pin = 11; // 가로등 3 PWM 핀

// 상수 정의
const int darkThreshold = 300;    // 어두움 판단 임계값
const int twilightThreshold = 500; // 황혼 판단 임계값
const int brightnessStep = 5;     // 밝기 변화 단계
const int checkInterval = 100;    // 조도 확인 간격 (밀리초)

// 변수 정의
int lightValue = 0;      // 조도 센서 값
int ledBrightness = 0;   // LED 밝기 값 (0-255)
bool lightsOn = false;   // 가로등 상태 플래그
unsigned long previousMillis = 0;  // 이전 시간 저장 변수

void setup() {
  // 시리얼 통신 시작 (디버깅용)
  Serial.begin(9600);

  // LED 핀을 출력으로 설정
  pinMode(streetLight1Pin, OUTPUT);
  pinMode(streetLight2Pin, OUTPUT);
  pinMode(streetLight3Pin, OUTPUT);

  // 초기 상태 설정: 모든 LED 끄기
  digitalWrite(streetLight1Pin, LOW);
  digitalWrite(streetLight2Pin, LOW);
  digitalWrite(streetLight3Pin, LOW);

  Serial.println("조도 자동등(가로등) 시스템 시작");
  Serial.println("조도 센서 값에 따라 자동으로 LED 밝기 조절");
}

void loop() {
  // 주기적으로 조도 확인
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= checkInterval) {
    previousMillis = currentMillis;

    // 조도 센서 값 읽기
    lightValue = analogRead(lightSensorPin);

    // 시리얼 모니터에 조도 값 출력
    Serial.print("조도 센서 값: ");
    Serial.print(lightValue);

    // 조도 값에 따라 LED 밝기 조절
    adjustLights();

    // 시리얼 모니터에 LED 상태 출력
    Serial.print(", LED 밝기: ");
    Serial.print(ledBrightness);
    Serial.print(", 가로등 상태: ");
    Serial.println(lightsOn ? "켜짐" : "꺼짐");
  }
}

// LED 밝기 조절 함수
void adjustLights() {
  // 이전 상태 저장
  bool previousLightsOn = lightsOn;

  // 조도 값에 따라 LED 밝기 결정
  if (lightValue < darkThreshold) {
    // 매우 어두움: 최대 밝기
    ledBrightness = 255;
    lightsOn = true;
  } 
  else if (lightValue < twilightThreshold) {
    // 중간 어두움: 중간 밝기
    // 조도 값에 따라 선형적으로 밝기 조절
    ledBrightness = map(lightValue, darkThreshold, twilightThreshold, 255, 50);
    lightsOn = true;
  } 
  else {
    // 밝음: LED 끄기
    ledBrightness = 0;
    lightsOn = false;
  }

  // LED 밝기 설정
  analogWrite(streetLight1Pin, ledBrightness);
  analogWrite(streetLight2Pin, ledBrightness);
  analogWrite(streetLight3Pin, ledBrightness);

  // 상태가 변경되었을 때 알림
  if (previousLightsOn != lightsOn) {
    if (lightsOn) {
      Serial.println("가로등이 켜졌습니다.");
    } else {
      Serial.println("가로등이 꺼졌습니다.");
    }
  }
}
