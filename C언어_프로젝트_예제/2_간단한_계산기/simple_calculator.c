/*
 * 간단한 계산기
 *
 * 이 프로그램은 기본적인 사칙연산(덧셈, 뺄셈, 곱셈, 나눗셈)을 수행하는
 * 콘솔 기반 계산기 프로그램입니다.
 *
 * 작성자: 코딩 쏙 학원
 * 날짜: 2023-11-01
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <math.h>

// 상수 정의
#define MAX_HISTORY 20      // 최대 계산 기록 수
#define MAX_INPUT_LENGTH 50 // 최대 입력 길이

// 계산 기록 구조체 정의
typedef struct {
    double num1;     // 첫 번째 숫자
    char operator;    // 연산자
    double num2;     // 두 번째 숫자
    double result;   // 계산 결과
} CalculationRecord;

// 전역 변수
CalculationRecord history[MAX_HISTORY]; // 계산 기록 배열
int historyCount = 0;                 // 현재 기록 수

// 함수 선언
void displayMenu();
double getNumber(const char* prompt);
char getOperator();
double calculate(double num1, char op, double num2);
void addToHistory(double num1, char op, double num2, double result);
void displayHistory();
void clearInputBuffer();

// 메인 함수
int main() {
    int choice;
    double num1, num2, result;
    char op;
    char continueCalc;

    printf("========================================
");
    printf("           간단한 계산기
");
    printf("========================================
");

    do {
        displayMenu();
        choice = (int)getNumber("메뉴를 선택하세요: ");

        switch (choice) {
            case 1:
                // 계산기 기능
                printf("
=== 계산기 ===
");

                // 첫 번째 숫자 입력
                num1 = getNumber("첫 번째 숫자를 입력하세요: ");

                // 연산자 입력
                op = getOperator();

                // 두 번째 숫자 입력
                num2 = getNumber("두 번째 숫자를 입력하세요: ");

                // 계산 수행
                result = calculate(num1, op, num2);

                // 결과 출력
                printf("
결과: %.2f %c %.2f = %.2f
", num1, op, num2, result);

                // 계산 기록에 추가
                addToHistory(num1, op, num2, result);
                break;

            case 2:
                // 계산 기록 조회
                displayHistory();
                break;

            case 3:
                // 프로그램 종료
                printf("프로그램을 종료합니다.
");
                break;

            default:
                printf("잘못된 선택입니다. 다시 시도하세요.
");
        }

        if (choice != 3) {
            printf("
계속하시겠습니까? (y/n): ");
            scanf(" %c", &continueCalc);
            clearInputBuffer();

            if (tolower(continueCalc) != 'y') {
                printf("프로그램을 종료합니다.
");
                break;
            }

            printf("
");
        }
    } while (choice != 3 && tolower(continueCalc) == 'y');

    return 0;
}

// 메뉴 표시 함수
void displayMenu() {
    printf("========================================
");
    printf("                메뉴
");
    printf("========================================
");
    printf("1. 계산하기
");
    printf("2. 계산 기록 조회
");
    printf("3. 종료
");
    printf("========================================
");
}

// 숫자 입력 함수
double getNumber(const char* prompt) {
    double value;
    char input[MAX_INPUT_LENGTH];
    int valid = 0;

    while (!valid) {
        printf("%s", prompt);
        fgets(input, sizeof(input), stdin);

        // 입력된 문자열을 실수로 변환
        if (sscanf(input, "%lf", &value) == 1) {
            valid = 1;
        } else {
            printf("오류: 유효한 숫자를 입력하세요.
");
        }
    }

    return value;
}

// 연산자 입력 함수
char getOperator() {
    char op;
    char input[MAX_INPUT_LENGTH];
    int valid = 0;

    while (!valid) {
        printf("연산자를 입력하세요 (+, -, *, /): ");
        fgets(input, sizeof(input), stdin);

        // 입력된 문자열에서 첫 번째 문자 추출
        if (sscanf(input, " %c", &op) == 1) {
            // 유효한 연산자인지 확인
            if (op == '+' || op == '-' || op == '*' || op == '/') {
                valid = 1;
            } else {
                printf("오류: 유효한 연산자(+, -, *, /)를 입력하세요.
");
            }
        } else {
            printf("오류: 연산자를 입력하세요.
");
        }
    }

    return op;
}

// 계산 수행 함수
double calculate(double num1, char op, double num2) {
    double result;

    switch (op) {
        case '+':
            result = num1 + num2;
            break;
        case '-':
            result = num1 - num2;
            break;
        case '*':
            result = num1 * num2;
            break;
        case '/':
            // 0으로 나누기 오류 처리
            if (num2 == 0) {
                printf("오류: 0으로 나눌 수 없습니다.
");
                return 0;
            }
            result = num1 / num2;
            break;
        default:
            printf("오류: 유효하지 않은 연산자입니다.
");
            return 0;
    }

    return result;
}

// 계산 기록 추가 함수
void addToHistory(double num1, char op, double num2, double result) {
    // 기록 배열이 꽉 찼으면 가장 오래된 기록 삭제
    if (historyCount >= MAX_HISTORY) {
        // 배열의 모든 요소를 한 칸씩 앞으로 이동
        for (int i = 0; i < MAX_HISTORY - 1; i++) {
            history[i] = history[i + 1];
        }
        historyCount--;
    }

    // 새 계산 기록 추가
    history[historyCount].num1 = num1;
    history[historyCount].operator = op;
    history[historyCount].num2 = num2;
    history[historyCount].result = result;
    historyCount++;
}

// 계산 기록 표시 함수
void displayHistory() {
    if (historyCount == 0) {
        printf("계산 기록이 없습니다.
");
        return;
    }

    printf("
=== 계산 기록 ===
");
    printf("========================================
");
    printf(" 번호	계산식			결과
");
    printf("========================================
");

    for (int i = 0; i < historyCount; i++) {
        printf(" %d	%.2f %c %.2f		= %.2f
",
               i + 1, history[i].num1, history[i].operator, history[i].num2, history[i].result);
    }

    printf("========================================
");
}

// 입력 버퍼 비우기 함수
void clearInputBuffer() {
    int c;
    while ((c = getchar()) != '
' && c != EOF);
}
