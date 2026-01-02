/*
 * 전자 주사위 & 미니게임 프로젝트
 * 
 * 이 프로그램은 LED를 사용하여 주사위 눈을 표시하고, 부저를 통해 사운드 효과를 냅니다.
 * 버튼을 누르면 주사위가 굴러가며 랜덤한 숫자(1-6)를 표시합니다.
 * 추가적으로 간단한 미니게임 기능도 포함되어 있습니다.
 * 
 * 작성자: 코딩 쏙 학원
 * 날짜: 2023-11-01
 */

// 주사위 LED 핀 정의
const int dicePins[] = {2, 3, 4, 5, 6, 7, 8};  // 주사위 LED 7개 핀
const int gameLedPin = 9;  // 게임용 LED 핀

// 부저 핀 정의
const int buzzerPin = 10;

// 버튼 핀 정의
const int diceButtonPin = 11;  // 주사위 버튼 핀
const int gameButtonPin = 12;  // 게임 버튼 핀

// 주사위 패턴 정의 (LED 위치에 따른 숫자)
// 주사위 LED 배치:
// [1]     [2]
// [3] [4] [5] [6]
// [7]     [8]
// 실제 핀은 1-7번 (중앙 하단 LED는 없음)
const int dicePatterns[7][7] = {
  // 숫자 1
  {0, 0, 0, 1, 0, 0, 0},
  // 숫자 2
  {1, 0, 0, 0, 0, 0, 1},
  // 숫자 3
  {1, 0, 0, 1, 0, 0, 1},
  // 숫자 4
  {1, 0, 1, 0, 1, 0, 1},
  // 숫자 5
  {1, 0, 1, 1, 1, 0, 1},
  // 숫자 6
  {1, 0, 1, 1, 1, 1, 1},
  // 숫자 7 (사용하지 않음, 주사위는 1-6까지)
  {0, 0, 0, 0, 0, 0, 0}
};

// 음계 정의 (부저용)
const int notes[] = {262, 294, 330, 349, 392, 440, 494, 523}; // C, D, E, F, G, A, B, C(옥타브 위)

// 변수 정의
int diceButtonState = 0;      // 주사위 버튼 상태
int lastDiceButtonState = 0;  // 이전 주사위 버튼 상태
int gameButtonState = 0;      // 게임 버튼 상태
int lastGameButtonState = 0;  // 이전 게임 버튼 상태
bool gameMode = false;        // 게임 모드 상태 플래그
int currentDiceValue = 1;     // 현재 주사위 값
unsigned long previousMillis = 0; // 이전 시간 저장 변수
int rollSpeed = 100;          // 주사위 굴리기 속도 (밀리초)
bool isRolling = false;       // 주사위 굴리기 상태 플래그

// 게임 관련 변수
int gameSequence[5] = {0};    // 게임 시퀀스 (랜덤 패턴)
int playerSequence[5] = {0};  // 플레이어 입력 시퀀스
int gameLevel = 1;            // 현재 게임 레벨
int sequenceLength = 1;       // 시퀀스 길이
bool showingSequence = false; // 시퀀스 표시 중 플래그
int currentSequenceIndex = 0; // 현재 시퀀스 인덱스
int playerInputIndex = 0;     // 플레이어 입력 인덱스

void setup() {
  // 시리얼 통신 시작 (디버깅용)
  Serial.begin(9600);

  // 주사위 LED 핀을 출력으로 설정
  for (int i = 0; i < 7; i++) {
    pinMode(dicePins[i], OUTPUT);
    digitalWrite(dicePins[i], LOW);
  }

  // 게임 LED 핀을 출력으로 설정
  pinMode(gameLedPin, OUTPUT);
  digitalWrite(gameLedPin, LOW);

  // 부저 핀을 출력으로 설정
  pinMode(buzzerPin, OUTPUT);

  // 버튼 핀을 입력으로 설정 (내부 풀업 저항 사용)
  pinMode(diceButtonPin, INPUT_PULLUP);
  pinMode(gameButtonPin, INPUT_PULLUP);

  // 초기 주사위 값 표시
  displayDiceValue(1);

  Serial.println("전자 주사위 & 미니게임 시작");
  Serial.println("주사위 버튼: 주사위 굴리기");
  Serial.println("게임 버튼: 미니게임 시작");
}

void loop() {
  // 버튼 상태 읽기
  diceButtonState = digitalRead(diceButtonPin);
  gameButtonState = digitalRead(gameButtonPin);

  // 주사위 버튼이 눌렸는지 확인 (버튼은 LOW일 때 눌린 상태)
  if (diceButtonState == LOW && lastDiceButtonState == HIGH && !gameMode) {
    startDiceRoll();
  }

  // 게임 버튼이 눌렸는지 확인
  if (gameButtonState == LOW && lastGameButtonState == HIGH && !gameMode) {
    startGame();
  }

  // 게임 모드일 때
  if (gameMode) {
    handleGameMode();
  }

  // 주사위 굴리기 중일 때
  if (isRolling) {
    handleDiceRoll();
  }

  // 현재 버튼 상태 저장
  lastDiceButtonState = diceButtonState;
  lastGameButtonState = gameButtonState;
}

// 주사위 굴리기 시작 함수
void startDiceRoll() {
  isRolling = true;
  rollSpeed = 100;  // 초기 굴리기 속도 설정
  Serial.println("주사위 굴리기 시작!");
  playRollSound();  // 굴리기 사운드 재생
}

// 주사위 굴리기 처리 함수
void handleDiceRoll() {
  unsigned long currentMillis = millis();

  if (currentMillis - previousMillis >= rollSpeed) {
    previousMillis = currentMillis;

    // 랜덤한 주사위 값 표시
    currentDiceValue = random(1, 7);  // 1-6 사이의 랜덤 숫자
    displayDiceValue(currentDiceValue);

    // 굴리기 속도 점차 늦추기
    rollSpeed += 20;

    // 굴리기 속도가 너무 느려지면 멈추기
    if (rollSpeed > 500) {
      isRolling = false;
      Serial.print("주사위 결과: ");
      Serial.println(currentDiceValue);
      playSuccessSound();  // 성공 사운드 재생
    }
  }
}

// 주사위 값 표시 함수
void displayDiceValue(int value) {
  // 모든 LED 끄기
  for (int i = 0; i < 7; i++) {
    digitalWrite(dicePins[i], LOW);
  }

  // 해당 숫자 패턴에 맞게 LED 켜기
  if (value >= 1 && value <= 6) {
    for (int i = 0; i < 7; i++) {
      if (dicePatterns[value-1][i] == 1) {
        digitalWrite(dicePins[i], HIGH);
      }
    }
  }
}

// 굴리기 사운드 재생 함수
void playRollSound() {
  // 빠르게 연주되는 음계로 굴리는 효과음 만들기
  for (int i = 0; i < 3; i++) {
    tone(buzzerPin, notes[i], 100);
    delay(100);
  }
}

// 성공 사운드 재생 함수
void playSuccessSound() {
  // 상승하는 음계로 성공 효과음 만들기
  for (int i = 0; i < 5; i++) {
    tone(buzzerPin, notes[i+2], 150);
    delay(150);
  }
  noTone(buzzerPin);  // 부저 소리 끄기
}

// 게임 시작 함수
void startGame() {
  gameMode = true;
  gameLevel = 1;
  sequenceLength = 1;
  showingSequence = false;
  currentSequenceIndex = 0;
  playerInputIndex = 0;

  // 게임 시퀀스 초기화
  for (int i = 0; i < 5; i++) {
    gameSequence[i] = 0;
    playerSequence[i] = 0;
  }

  Serial.println("미니게임 시작!");
  Serial.println("게임 LED가 깜빡이는 패턴을 기억하세요.");

  // 게임 시작 사운드
  tone(buzzerPin, notes[4], 200);
  delay(200);
  tone(buzzerPin, notes[5], 200);
  delay(200);
  tone(buzzerPin, notes[6], 400);
  noTone(buzzerPin);

  // 첫 번째 레벨 시작
  generateSequence();
  showSequence();
}

// 게임 모드 처리 함수
void handleGameMode() {
  if (showingSequence) {
    // 시퀀스 표시 중에는 아무것도 하지 않음
    return;
  }

  // 플레이어 입력 처리
  if (diceButtonState == LOW && lastDiceButtonState == HIGH) {
    // 주사위 버튼 입력 (1로 간주)
    playerSequence[playerInputIndex] = 1;
    playerInputIndex++;
    playInputSound(1);

    // 입력 확인
    checkPlayerInput();
  }

  if (gameButtonState == LOW && lastGameButtonState == HIGH) {
    // 게임 버튼 입력 (2로 간주)
    playerSequence[playerInputIndex] = 2;
    playerInputIndex++;
    playInputSound(2);

    // 입력 확인
    checkPlayerInput();
  }
}

// 시퀀스 생성 함수
void generateSequence() {
  randomSeed(millis());  // 랜덤 시드 설정

  for (int i = 0; i < sequenceLength; i++) {
    gameSequence[i] = random(1, 3);  // 1 또는 2의 랜덤 값
  }
}

// 시퀀스 표시 함수
void showSequence() {
  showingSequence = true;
  currentSequenceIndex = 0;

  // 시퀀스 표시 시작 알림
  Serial.print("레벨 ");
  Serial.print(gameLevel);
  Serial.println(" 시퀀스 표시 중...");

  // 시퀀스 표시
  for (int i = 0; i < sequenceLength; i++) {
    if (gameSequence[i] == 1) {
      // 주사위 LED 패턴 표시
      displayDiceValue(random(1, 7));
      tone(buzzerPin, notes[3], 300);
    } else {
      // 게임 LED 깜빡임
      digitalWrite(gameLedPin, HIGH);
      tone(buzzerPin, notes[6], 300);
    }

    delay(500);

    // 모든 LED 끄기
    for (int j = 0; j < 7; j++) {
      digitalWrite(dicePins[j], LOW);
    }
    digitalWrite(gameLedPin, LOW);

    delay(200);
  }

  // 플레이어 입력 초기화
  playerInputIndex = 0;
  for (int i = 0; i < 5; i++) {
    playerSequence[i] = 0;
  }

  showingSequence = false;
  Serial.println("이제 패턴을 따라 입력하세요!");
}

// 플레이어 입력 확인 함수
void checkPlayerInput() {
  // 마지막 입력이었는지 확인
  if (playerInputIndex >= sequenceLength) {
    // 모든 입력이 올바른지 확인
    bool correct = true;
    for (int i = 0; i < sequenceLength; i++) {
      if (gameSequence[i] != playerSequence[i]) {
        correct = false;
        break;
      }
    }

    if (correct) {
      // 레벨 성공
      levelSuccess();
    } else {
      // 레벨 실패
      levelFailed();
    }
  }
}

// 레벨 성공 처리 함수
void levelSuccess() {
  Serial.print("레벨 ");
  Serial.print(gameLevel);
  Serial.println(" 성공!");

  // 성공 사운드 및 LED 효과
  playSuccessSound();

  // 모든 LED 깜빡이기
  for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 7; j++) {
      digitalWrite(dicePins[j], HIGH);
    }
    digitalWrite(gameLedPin, HIGH);
    delay(200);

    for (int j = 0; j < 7; j++) {
      digitalWrite(dicePins[j], LOW);
    }
    digitalWrite(gameLedPin, LOW);
    delay(200);
  }

  // 다음 레벨로
  gameLevel++;
  sequenceLength = min(sequenceLength + 1, 5);  // 최대 5까지

  // 새로운 시퀀스 생성 및 표시
  generateSequence();
  delay(1000);
  showSequence();
}

// 레벨 실패 처리 함수
void levelFailed() {
  Serial.print("레벨 ");
  Serial.print(gameLevel);
  Serial.println(" 실패!");
  Serial.print("최종 레벨: ");
  Serial.println(gameLevel);

  // 실패 사운드
  for (int i = 0; i < 3; i++) {
    tone(buzzerPin, notes[1], 300);
    delay(300);
  }
  noTone(buzzerPin);

  // 게임 모드 종료
  gameMode = false;

  // 초기 상태로 복귀
  displayDiceValue(1);

  Serial.println("게임이 종료되었습니다. 게임 버튼을 다시 누르면 새 게임을 시작할 수 있습니다.");
}

// 입력 사운드 재생 함수
void playInputSound(int inputType) {
  if (inputType == 1) {
    tone(buzzerPin, notes[3], 150);  // 주사위 버튼 입력음
  } else {
    tone(buzzerPin, notes[6], 150);  // 게임 버튼 입력음
  }
  delay(150);
  noTone(buzzerPin);
}
