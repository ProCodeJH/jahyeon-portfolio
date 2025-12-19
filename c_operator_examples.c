#include <stdio.h>

int main(void) {
    // C 언어 연산자 예제 100개
    // 각 예제는 변수 선언, 연산, 결과 출력 포함

    printf("=== C 언어 연산자 예제 100개 ===\n\n");

    // 1-10: 기본 사칙연산
    printf("1-10: 기본 사칙연산\n");
    {
        int a = 10, b = 3;
        printf("a=%d, b=%d\n", a, b);
        printf("a + b = %d\n", a + b);  // 13
        printf("a - b = %d\n", a - b);  // 7
        printf("a * b = %d\n", a * b);  // 30
        printf("a / b = %d\n", a / b);  // 3 (정수 나눗셈)
        printf("a %% b = %d\n", a % b); // 1 (나머지)
    }

    // 11-20: 우선순위와 괄호
    printf("\n11-20: 우선순위와 괄호\n");
    {
        int a = 2, b = 3, c = 4;
        printf("a=%d, b=%d, c=%d\n", a, b, c);
        printf("a + b * c = %d\n", a + b * c);     // 14 (곱셈 우선)
        printf("(a + b) * c = %d\n", (a + b) * c); // 20 (괄호 우선)
        printf("a * b + c = %d\n", a * b + c);     // 10
        printf("a + b + c = %d\n", a + b + c);     // 9
        printf("a * (b + c) = %d\n", a * (b + c)); // 14
    }

    // 21-30: 대입연산자
    printf("\n21-30: 대입연산자\n");
    {
        int x, y, z;
        x = 5;
        printf("x = 5; x = %d\n", x);
        y = x + 3;
        printf("y = x + 3; y = %d\n", y);
        z = y * 2;
        printf("z = y * 2; z = %d\n", z);
        x = z - y;
        printf("x = z - y; x = %d\n", x);
        y = x = 10;
        printf("y = x = 10; x=%d, y=%d\n", x, y);
    }

    // 31-40: 증가/감소 연산자 (전위)
    printf("\n31-40: 증가/감소 연산자 (전위)\n");
    {
        int a = 5, b, c;
        printf("초기 a = %d\n", a);
        b = ++a;
        printf("b = ++a; a=%d, b=%d\n", a, b); // a=6, b=6
        c = ++a + 2;
        printf("c = ++a + 2; a=%d, c=%d\n", a, c); // a=7, c=9
        ++a;
        printf("++a; a=%d\n", a); // a=8
        b = ++a * 2;
        printf("b = ++a * 2; a=%d, b=%d\n", a, b); // a=9, b=18
    }

    // 41-50: 증가/감소 연산자 (후위)
    printf("\n41-50: 증가/감소 연산자 (후위)\n");
    {
        int a = 5, b, c;
        printf("초기 a = %d\n", a);
        b = a++;
        printf("b = a++; a=%d, b=%d\n", a, b); // a=6, b=5
        c = a++ + 2;
        printf("c = a++ + 2; a=%d, c=%d\n", a, c); // a=7, c=8
        a++;
        printf("a++; a=%d\n", a); // a=8
        b = a++ * 2;
        printf("b = a++ * 2; a=%d, b=%d\n", a, b); // a=9, b=16
    }

    // 51-60: 혼합대입 연산자
    printf("\n51-60: 혼합대입 연산자\n");
    {
        int a = 10, b = 3;
        printf("초기 a=%d, b=%d\n", a, b);
        a += b;
        printf("a += b; a=%d\n", a); // 13
        a -= 2;
        printf("a -= 2; a=%d\n", a); // 11
        a *= 3;
        printf("a *= 3; a=%d\n", a); // 33
        a /= 3;
        printf("a /= 3; a=%d\n", a); // 11
        a %= 4;
        printf("a %%= 4; a=%d\n", a); // 3
    }

    // 61-70: 관계 연산자
    printf("\n61-70: 관계 연산자\n");
    {
        int a = 5, b = 8, c = 5;
        printf("a=%d, b=%d, c=%d\n", a, b, c);
        printf("a > b = %d\n", a > b);   // 0
        printf("a < b = %d\n", a < b);   // 1
        printf("a >= c = %d\n", a >= c); // 1
        printf("b <= a = %d\n", b <= a); // 0
        printf("a == c = %d\n", a == c); // 1
        printf("a != b = %d\n", a != b); // 1
        printf("a > 3 = %d\n", a > 3);   // 1
        printf("b < 10 = %d\n", b < 10); // 1
    }

    // 71-80: 논리 연산자
    printf("\n71-80: 논리 연산자\n");
    {
        int a = 5, b = 0, c = 3;
        printf("a=%d, b=%d, c=%d\n", a, b, c);
        printf("a && c = %d\n", a && c);     // 1 (둘 다 참)
        printf("a && b = %d\n", a && b);     // 0 (b가 거짓)
        printf("a || b = %d\n", a || b);     // 1 (a가 참)
        printf("b || 0 = %d\n", b || 0);     // 0 (둘 다 거짓)
        printf("!a = %d\n", !a);             // 0 (NOT 참 = 거짓)
        printf("!b = %d\n", !b);             // 1 (NOT 거짓 = 참)
        printf("(a > 3) && (c < 10) = %d\n", (a > 3) && (c < 10)); // 1
        printf("(a < 3) || (b == 0) = %d\n", (a < 3) || (b == 0)); // 1
    }

    // 81-90: 복합 연산자 조합
    printf("\n81-90: 복합 연산자 조합\n");
    {
        int a = 3, b = 2, c = 0, d = 0;
        printf("초기 a=%d, b=%d\n", a, b);

        c = a == ++b;
        printf("c = a == ++b; a=%d, b=%d, c=%d\n", a, b, c); // a=3, b=3, c=1

        d = (a++ > b) && (c-- > 0);
        printf("d = (a++ > b) && (c-- > 0); a=%d, b=%d, c=%d, d=%d\n", a, b, c, d);

        a += b * 2;
        printf("a += b * 2; a=%d, b=%d\n", a, b);

        c = !(a > b) || (b++ == 3);
        printf("c = !(a > b) || (b++ == 3); a=%d, b=%d, c=%d\n", a, b, c);

        d = (a %= 5) + (b *= 2);
        printf("d = (a %%= 5) + (b *= 2); a=%d, b=%d, d=%d\n", a, b, d);
    }

    // 91-100: 삼항 연산자와 비트 연산자
    printf("\n91-100: 삼항 연산자와 비트 연산자\n");
    {
        int a = 5, b = 3, c = 0, x = 12, y = 10;
        printf("초기 a=%d, b=%d, x=%d, y=%d\n", a, b, x, y);

        c = (a > b) ? a : b;
        printf("c = (a > b) ? a : b; c=%d\n", c); // 5

        c = (a < b) ? a + 10 : b - 1;
        printf("c = (a < b) ? a + 10 : b - 1; c=%d\n", c); // 2

        c = x & y;
        printf("c = x & y; (12 & 10) = %d\n", c); // 8 (1010 & 1100 = 1000)

        c = x | y;
        printf("c = x | y; (12 | 10) = %d\n", c); // 14 (1010 | 1100 = 1110)

        c = x ^ y;
        printf("c = x ^ y; (12 ^ 10) = %d\n", c); // 6 (1010 ^ 1100 = 0110)

        c = ~x;
        printf("c = ~x; (~12) = %d\n", c); // -13 (비트 반전)

        c = x << 2;
        printf("c = x << 2; (12 << 2) = %d\n", c); // 48 (1100 << 2 = 110000)

        c = y >> 1;
        printf("c = y >> 1; (10 >> 1) = %d\n", c); // 5 (1010 >> 1 = 0101)

        c = (a > 4) ? (x & 15) : (y | 8);
        printf("c = (a > 4) ? (x & 15) : (y | 8); c=%d\n", c); // 12

        c = ((a += 2) > 6) && ((x >>= 1) < 10);
        printf("c = ((a += 2) > 6) && ((x >>= 1) < 10); a=%d, x=%d, c=%d\n", a, x, c);
    }

    printf("\n=== 예제 종료 ===\n");
    return 0;
}
