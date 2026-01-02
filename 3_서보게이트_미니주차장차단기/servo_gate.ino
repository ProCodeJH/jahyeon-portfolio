/*
 * 서보게이트(미니주차장차단기) 프로젝트
 * 
 * 이 프로그램은 서보 모터를 사용하여 미니 주차장 차단기를 제어합니다.
 * 버튼이나 RFID 카드를 통해 차단기를 개방하고, 일정 시간 후 자동으로 닫힙니다.
 * LED 표시등으로 현재 상태를 시각적으로 확인할 수 있습니다.
 * 
 * 작성자: 코딩 쏙 학원
 * 날짜: 2023-11-01
 */

#include <Servo.h>  // 서보 모터 라이브러리 포함

// RFID 라이브러리 (선택 사항)
// #include <SPI.h>
// #include <MFRC522.h>

// 서보 모터 핀 정의
const int servoPin = 9;  // 서보 모터 신호 핀

// LED 핀 정의
const int redLedPin = 2;   // 차단기 닫힘 상태 LED (빨강)
const int greenLedPin = 3;  // 차단기 열림 상태 LED (초록)

// 버튼 핀 정의
const int openButtonPin = 4;  // 차단기 개방 버튼 핀
const int closeButtonPin = 5; // 차단기 닫기 버튼 핀

// RFID 핀 정의 (선택 사항)
// const int RST_PIN = 8;      // 리셋 핀 (서보와 충돌 방지를 위해 9에서 8로 변경)
// const int SS_PIN = 10;      // 슬레이브 선택 핀

// 서보 모터 각도 정의
const int closedAngle = 0;    // 차단기 닫힘 각도
const int openAngle = 90;     // 차단기 열림 각도

// 시간 관련 상수 정의
const int openDuration = 5000;  // 차단기 열려있는 시간 (밀리초)

// 변수 정의
Servo gateServo;  // 서보 모터 객체
bool gateOpen = false;  // 차단기 열림 상태 플래그
unsigned long openTime = 0;  // 차단기가 열린 시간 저장 변수

// RFID 관련 변수 (선택 사항)
// MFRC522 mfrc522(SS_PIN, RST_PIN);  // RFID 리더기 객체
// String authorizedCardID = "A1:B2:C3:D4";  // 인증된 카드 ID (실제 카드 ID로 변경 필요)

void setup() {
  // 시리얼 통신 시작 (디버깅용)
  Serial.begin(9600);

  // 서보 모터 핀 연결
  gateServo.attach(servoPin);

  // LED 핀을 출력으로 설정
  pinMode(redLedPin, OUTPUT);
  pinMode(greenLedPin, OUTPUT);

  // 버튼 핀을 입력으로 설정 (내부 풀업 저항 사용)
  pinMode(openButtonPin, INPUT_PULLUP);
  pinMode(closeButtonPin, INPUT_PULLUP);

  // 초기 상태 설정: 차단기 닫힘, 빨간 LED 켜짐
  closeGate();

  // RFID 초기화 (선택 사항)
  // SPI.begin();
  // mfrc522.PCD_Init();
  // Serial.println("RFID 리더기 초기화 완료");

  Serial.println("서보게이트(미니주차장차단기) 시스템 시작");
  Serial.println("개방 버튼: 차단기 열기");
  Serial.println("닫기 버튼: 차단기 닫기");
  // Serial.println("RFID 카드: 인증된 카드로 차단기 열기");
}

void loop() {
  // 버튼 상태 읽기
  int openButtonState = digitalRead(openButtonPin);
  int closeButtonState = digitalRead(closeButtonPin);

  // 개방 버튼이 눌렸는지 확인 (버튼은 LOW일 때 눌린 상태)
  if (openButtonState == LOW && !gateOpen) {
    openGate();
  }

  // 닫기 버튼이 눌렸는지 확인
  if (closeButtonState == LOW && gateOpen) {
    closeGate();
  }

  // RFID 카드 확인 (선택 사항)
  // checkRFID();

  // 자동 닫기 확인
  if (gateOpen && (millis() - openTime >= openDuration)) {
    closeGate();
  }
}

// 차단기 열기 함수
void openGate() {
  gateOpen = true;
  openTime = millis();

  // 서보 모터 각도 변경
  gateServo.write(openAngle);

  // LED 상태 변경
  digitalWrite(redLedPin, LOW);
  digitalWrite(greenLedPin, HIGH);

  // 사운드 효과
  tone(8, 523, 200);  // 부저 핀 8번에 연결, 523Hz(C음) 200ms
  delay(200);
  tone(8, 659, 200);  // 659Hz(E음) 200ms
  delay(200);
  tone(8, 784, 400);  // 784Hz(G음) 400ms

  Serial.println("차단기가 열렸습니다.");
}

// 차단기 닫기 함수
void closeGate() {
  gateOpen = false;

  // 서보 모터 각도 변경
  gateServo.write(closedAngle);

  // LED 상태 변경
  digitalWrite(redLedPin, HIGH);
  digitalWrite(greenLedPin, LOW);

  // 사운드 효과
  tone(8, 784, 200);  // 부저 핀 8번에 연결, 784Hz(G음) 200ms
  delay(200);
  tone(8, 659, 200);  // 659Hz(E음) 200ms
  delay(200);
  tone(8, 523, 400);  // 523Hz(C음) 400ms

  Serial.println("차단기가 닫혔습니다.");
}

// RFID 카드 확인 함수 (선택 사항)
/*
void checkRFID() {
  // 새 카드가 있는지 확인
  if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  // 카드 ID 읽기
  String cardID = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    cardID += (mfrc522.uid.uidByte[i] < 0x10 ? " 0" : " ");
    cardID += String(mfrc522.uid.uidByte[i], HEX);
  }
  cardID.toUpperCase();
  cardID.trim();

  Serial.print("감지된 카드 ID: ");
  Serial.println(cardID);

  // 인증된 카드인지 확인
  if (cardID == authorizedCardID && !gateOpen) {
    Serial.println("인증된 카드입니다. 차단기를 엽니다.");
    openGate();
  } else if (cardID != authorizedCardID) {
    Serial.println("인증되지 않은 카드입니다.");
    // 인증 실패 사운드
    for (int i = 0; i < 3; i++) {
      tone(8, 262, 200);  // 262Hz(C음) 200ms
      delay(200);
    }
  }

  // 카드 처리 종료
  mfrc522.PICC_HaltA();
  mfrc522.PCD_StopCrypto1();
}
*/
