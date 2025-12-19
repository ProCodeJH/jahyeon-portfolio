#include <stdio.h>

int main(void) {
    printf("=== C 언어 복합 연산자 예제 100개 (모든 연산자 혼합) ===\n\n");

    // 1-10: 사칙 + 증감 + 관계 + 논리
    printf("1-10: 사칙 + 증감 + 관계 + 논리\n");
    {
        int a = 5, b = 3, c = 0;
        c = (++a + b--) > (a * 2) && (b++ != 0);
        printf("1. c = (++a + b--) > (a * 2) && (b++ != 0); a=%d, b=%d, c=%d\n", a, b, c);

        a = 4, b = 2;
        c = (a++ % ++b) == 0 || (a + b > 5);
        printf("2. c = (a++ %% ++b) == 0 || (a + b > 5); a=%d, b=%d, c=%d\n", a, b, c);

        a = 7, b = 2;
        c = !(a / b == 2) && (++a > b * 2);
        printf("3. c = !(a / b == 2) && (++a > b * 2); a=%d, b=%d, c=%d\n", a, b, c);

        a = 6, b = 4;
        c = (a-- + ++b) >= (a + b) || (b % 2 == 0);
        printf("4. c = (a-- + ++b) >= (a + b) || (b %% 2 == 0); a=%d, b=%d, c=%d\n", a, b, c);

        a = 8, b = 5;
        c = (a + b++) * 2 > a + b && !(a % 3 == 0);
        printf("5. c = (a + b++) * 2 > a + b && !(a %% 3 == 0); a=%d, b=%d, c=%d\n", a, b, c);

        a = 9, b = 2;
        c = ++a % b == 1 && a-- > b * 3;
        printf("6. c = ++a %% b == 1 && a-- > b * 3; a=%d, b=%d, c=%d\n", a, b, c);

        a = 10, b = 3;
        c = (a-- / ++b) == 3 || (a + b) % 2 != 0;
        printf("7. c = (a-- / ++b) == 3 || (a + b) %% 2 != 0; a=%d, b=%d, c=%d\n", a, b, c);

        a = 12, b = 4;
        c = !(a % b != 0) && (++a + b--) > 15;
        printf("8. c = !(a %% b != 0) && (++a + b--) > 15; a=%d, b=%d, c=%d\n", a, b, c);

        a = 15, b = 6;
        c = (a / b == 2) && (a-- % ++b) == 2;
        printf("9. c = (a / b == 2) && (a-- %% ++b) == 2; a=%d, b=%d, c=%d\n", a, b, c);

        a = 18, b = 7;
        c = ++a > b * 2 && !(a % b == 4);
        printf("10. c = ++a > b * 2 && !(a %% b == 4); a=%d, b=%d, c=%d\n", a, b, c);
    }

    // 11-20: 혼합대입 + 증감 + 관계 + 논리
    printf("\n11-20: 혼합대입 + 증감 + 관계 + 논리\n");
    {
        int a = 5, b = 3, c = 0;
        c = (a += ++b) > 8 && (b-- != 4);
        printf("11. c = (a += ++b) > 8 && (b-- != 4); a=%d, b=%d, c=%d\n", a, b, c);

        a = 6, b = 2;
        c = (a *= b++) == 12 || (a + b > 10);
        printf("12. c = (a *= b++) == 12 || (a + b > 10); a=%d, b=%d, c=%d\n", a, b, c);

        a = 8, b = 3;
        c = !(a /= ++b) && (a + b == 6);
        printf("13. c = !(a /= ++b) && (a + b == 6); a=%d, b=%d, c=%d\n", a, b, c);

        a = 10, b = 4;
        c = (a %= b--) == 2 && (a + ++b > 6);
        printf("14. c = (a %%= b--) == 2 && (a + ++b > 6); a=%d, b=%d, c=%d\n", a, b, c);

        a = 12, b = 5;
        c = (a -= b++) > 6 || !(a % 2 == 0);
        printf("15. c = (a -= b++) > 6 || !(a %% 2 == 0); a=%d, b=%d, c=%d\n", a, b, c);

        a = 15, b = 6;
        c = ++a > b && (a += b) < 25;
        printf("16. c = ++a > b && (a += b) < 25; a=%d, b=%d, c=%d\n", a, b, c);

        a = 7, b = 3;
        c = (a *= ++b) == 28 && a-- > 20;
        printf("17. c = (a *= ++b) == 28 && a-- > 20; a=%d, b=%d, c=%d\n", a, b, c);

        a = 9, b = 4;
        c = !(a %= b) && ++a + b > 10;
        printf("18. c = !(a %%= b) && ++a + b > 10; a=%d, b=%d, c=%d\n", a, b, c);

        a = 11, b = 5;
        c = (a /= b--) == 2 && (a + ++b) % 3 == 0;
        printf("19. c = (a /= b--) == 2 && (a + ++b) %% 3 == 0; a=%d, b=%d, c=%d\n", a, b, c);

        a = 13, b = 6;
        c = ++a > b * 2 && (a -= b) < 10;
        printf("20. c = ++a > b * 2 && (a -= b) < 10; a=%d, b=%d, c=%d\n", a, b, c);
    }

    // 21-30: 삼항연산자 + 복합연산자들
    printf("\n21-30: 삼항연산자 + 복합연산자들\n");
    {
        int a = 5, b = 3, c = 0;
        c = (a > b) ? (a += 2) : (b *= 2);
        printf("21. c = (a > b) ? (a += 2) : (b *= 2); a=%d, b=%d, c=%d\n", a, b, c);

        a = 4, b = 6;
        c = (a++ < b--) ? (a + b) : (a * b);
        printf("22. c = (a++ < b--) ? (a + b) : (a * b); a=%d, b=%d, c=%d\n", a, b, c);

        a = 7, b = 2;
        c = (++a > 5) ? (a %= ++b) : (a /= b);
        printf("23. c = (++a > 5) ? (a %%= ++b) : (a /= b); a=%d, b=%d, c=%d\n", a, b, c);

        a = 8, b = 5;
        c = (a-- != b++) ? (a + b) : (a - b);
        printf("24. c = (a-- != b++) ? (a + b) : (a - b); a=%d, b=%d, c=%d\n", a, b, c);

        a = 10, b = 5;
        c = (a > b && ++a < 12) ? (a *= 2) : (b += 3);
        printf("25. c = (a > b && ++a < 12) ? (a *= 2) : (b += 3); a=%d, b=%d, c=%d\n", a, b, c);

        a = 6, b = 4;
        c = (a++ || b--) ? (a + b) : (a * b);
        printf("26. c = (a++ || b--) ? (a + b) : (a * b); a=%d, b=%d, c=%d\n", a, b, c);

        a = 9, b = 7;
        c = !(a < b) ? (a -= b) : (b *= 2);
        printf("27. c = !(a < b) ? (a -= b) : (b *= 2); a=%d, b=%d, c=%d\n", a, b, c);

        a = 11, b = 3;
        c = (a % b == 2) ? (++a + b) : (a-- * b);
        printf("28. c = (a %% b == 2) ? (++a + b) : (a-- * b); a=%d, b=%d, c=%d\n", a, b, c);

        a = 12, b = 8;
        c = (a >= b && a++ < 15) ? (a + b) : (a - b);
        printf("29. c = (a >= b && a++ < 15) ? (a + b) : (a - b); a=%d, b=%d, c=%d\n", a, b, c);

        a = 14, b = 5;
        c = (a / b == 2) ? (a %= ++b) : (a += b--);
        printf("30. c = (a / b == 2) ? (a %%= ++b) : (a += b--); a=%d, b=%d, c=%d\n", a, b, c);
    }

    // 31-40: 비트연산자 + 다른 연산자들
    printf("\n31-40: 비트연산자 + 다른 연산자들\n");
    {
        int a = 12, b = 10, c = 0; // 12=1100, 10=1010
        c = (a & b) == 8 && (++a > b);
        printf("31. c = (a & b) == 8 && (++a > b); a=%d, b=%d, c=%d\n", a, b, c);

        a = 15, b = 7; // 15=1111, 7=0111
        c = (a | b) == 15 || (a++ < 20);
        printf("32. c = (a | b) == 15 || (a++ < 20); a=%d, b=%d, c=%d\n", a, b, c);

        a = 9, b = 3; // 9=1001, 3=0011
        c = (a ^ b) == 10 && !(a % ++b);
        printf("33. c = (a ^ b) == 10 && !(a %% ++b); a=%d, b=%d, c=%d\n", a, b, c);

        a = 16, b = 2;
        c = (a >> b) == 4 && (a-- > 10);
        printf("34. c = (a >> b) == 4 && (a-- > 10); a=%d, b=%d, c=%d\n", a, b, c);

        a = 5, b = 3;
        c = (a << ++b) == 40 || (a + b > 10);
        printf("35. c = (a << ++b) == 40 || (a + b > 10); a=%d, b=%d, c=%d\n", a, b, c);

        a = 25, b = 7;
        c = ~(a & b) == -18 && (a++ > 20);
        printf("36. c = ~(a & b) == -18 && (a++ > 20); a=%d, b=%d, c=%d\n", a, b, c);

        a = 13, b = 11;
        c = (a | b) > 15 && (a++ ^ b--) == 6;
        printf("37. c = (a | b) > 15 && (a++ ^ b--) == 6; a=%d, b=%d, c=%d\n", a, b, c);

        a = 20, b = 4;
        c = (a >> 2) == 5 && !(b++ % 3);
        printf("38. c = (a >> 2) == 5 && !(b++ %% 3); a=%d, b=%d, c=%d\n", a, b, c);

        a = 7, b = 2;
        c = (a << b) == 28 || (a + ++b > 10);
        printf("39. c = (a << b) == 28 || (a + ++b > 10); a=%d, b=%d, c=%d\n", a, b, c);

        a = 30, b = 15;
        c = (a & b) == 14 && (a-- > b++);
        printf("40. c = (a & b) == 14 && (a-- > b++); a=%d, b=%d, c=%d\n", a, b, c);
    }

    // 41-50: 콤마연산자 + 복합표현식
    printf("\n41-50: 콤마연산자 + 복합표현식\n");
    {
        int a = 5, b = 3, c = 0;
        c = (a += 2, b *= 3, a + b);
        printf("41. c = (a += 2, b *= 3, a + b); a=%d, b=%d, c=%d\n", a, b, c);

        a = 4, b = 6;
        c = (++a, b--, a > b ? a : b);
        printf("42. c = (++a, b--, a > b ? a : b); a=%d, b=%d, c=%d\n", a, b, c);

        a = 7, b = 2;
        c = (a *= b++, a % 3 == 0, a + b);
        printf("43. c = (a *= b++, a %% 3 == 0, a + b); a=%d, b=%d, c=%d\n", a, b, c);

        a = 8, b = 5;
        c = (a -= b, ++b, a * b);
        printf("44. c = (a -= b, ++b, a * b); a=%d, b=%d, c=%d\n", a, b, c);

        a = 10, b = 3;
        c = (a /= ++b, a > 2, a + b);
        printf("45. c = (a /= ++b, a > 2, a + b); a=%d, b=%d, c=%d\n", a, b, c);

        a = 12, b = 4;
        c = (a %= b--, a == 0, ++a + b);
        printf("46. c = (a %%= b--, a == 0, ++a + b); a=%d, b=%d, c=%d\n", a, b, c);

        a = 15, b = 6;
        c = (++a, b *= 2, a > b && a + b);
        printf("47. c = (++a, b *= 2, a > b && a + b); a=%d, b=%d, c=%d\n", a, b, c);

        a = 9, b = 7;
        c = (a += b--, a % 2 != 0, a * b);
        printf("48. c = (a += b--, a %% 2 != 0, a * b); a=%d, b=%d, c=%d\n", a, b, c);

        a = 11, b = 5;
        c = (a /= b, ++b, a >= 2 ? a + b : a * b);
        printf("49. c = (a /= b, ++b, a >= 2 ? a + b : a * b); a=%d, b=%d, c=%d\n", a, b, c);

        a = 13, b = 8;
        c = (a -= b++, a > 0, a + b);
        printf("50. c = (a -= b++, a > 0, a + b); a=%d, b=%d, c=%d\n", a, b, c);
    }

    // 51-60: 매우 복합적인 표현식들
    printf("\n51-60: 매우 복합적인 표현식들\n");
    {
        int a = 5, b = 3, c = 2, d = 0;
        d = ++a > b && (c += a) < 10 || !(b-- % 2);
        printf("51. d = ++a > b && (c += a) < 10 || !(b-- %% 2); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 6, b = 4, c = 3;
        d = (a *= ++b) == 30 && c-- > 0 || (a + b) % 5 == 0;
        printf("52. d = (a *= ++b) == 30 && c-- > 0 || (a + b) %% 5 == 0; a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 8, b = 2, c = 5;
        d = !(a /= b++) && ++c > 5 || (a + b + c) > 15;
        printf("53. d = !(a /= b++) && ++c > 5 || (a + b + c) > 15; a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 10, b = 3, c = 7;
        d = (a %= ++b) == 1 && (c += a) < 12 || !(a + b > 10);
        printf("54. d = (a %%= ++b) == 1 && (c += a) < 12 || !(a + b > 10); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 12, b = 5, c = 4;
        d = ++a > b * 2 && (c *= b--) == 20 || (a + c) % 3 != 0;
        printf("55. d = ++a > b * 2 && (c *= b--) == 20 || (a + c) %% 3 != 0; a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 7, b = 2, c = 9;
        d = (a += b++) == 9 && !(c /= 3) || (a + b + c) > 15;
        printf("56. d = (a += b++) == 9 && !(c /= 3) || (a + b + c) > 15; a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 15, b = 4, c = 6;
        d = (a /= ++b) == 3 && (c += a) > 8 || !(b-- % 2 == 0);
        printf("57. d = (a /= ++b) == 3 && (c += a) > 8 || !(b-- %% 2 == 0); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 9, b = 3, c = 8;
        d = ++a > b && (c %= ++b) == 2 || (a + b + c) % 7 == 0;
        printf("58. d = ++a > b && (c %%= ++b) == 2 || (a + b + c) %% 7 == 0; a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 11, b = 6, c = 5;
        d = (a -= b--) == 5 && ++c > 5 || !(a + b > 10);
        printf("59. d = (a -= b--) == 5 && ++c > 5 || !(a + b > 10); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 13, b = 7, c = 10;
        d = ++a > b * 2 && (c /= b) == 1 || (a + b + c) % 4 != 1;
        printf("60. d = ++a > b * 2 && (c /= b) == 1 || (a + b + c) %% 4 != 1; a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);
    }

    // 61-70: 삼항연산자 중첩 + 복합
    printf("\n61-70: 삼항연산자 중첩 + 복합\n");
    {
        int a = 5, b = 3, c = 7, d = 0;
        d = (a > b) ? ((a += 2) > c ? a + c : a - c) : (b *= 2);
        printf("61. d = (a > b) ? ((a += 2) > c ? a + c : a - c) : (b *= 2); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 4, b = 6, c = 8;
        d = (a++ < b--) ? (a + b > c ? ++a : b--) : (a * b);
        printf("62. d = (a++ < b--) ? (a + b > c ? ++a : b--) : (a * b); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 9, b = 2, c = 5;
        d = (++a > b) ? ((a % ++b) == 0 ? a / b : a + b) : (c *= 2);
        printf("63. d = (++a > b) ? ((a %% ++b) == 0 ? a / b : a + b) : (c *= 2); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 10, b = 7, c = 3;
        d = (a-- != b++) ? (a > c && b < 10 ? a + b : a - c) : (b * c);
        printf("64. d = (a-- != b++) ? (a > c && b < 10 ? a + b : a - c) : (b * c); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 12, b = 5, c = 6;
        d = (a > b && ++a < 15) ? (a % c == 0 ? a / c : a + c) : (b += 3);
        printf("65. d = (a > b && ++a < 15) ? (a %% c == 0 ? a / c : a + c) : (b += 3); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 6, b = 4, c = 9;
        d = (a++ || b--) ? (a + b > c ? ++a + b : a-- + c) : (a * b);
        printf("66. d = (a++ || b--) ? (a + b > c ? ++a + b : a-- + c) : (a * b); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 8, b = 11, c = 4;
        d = !(a < b) ? (a % c != 0 ? a - c : b + c) : (a *= 2);
        printf("67. d = !(a < b) ? (a %% c != 0 ? a - c : b + c) : (a *= 2); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 14, b = 3, c = 7;
        d = (a % b == 2) ? (++a + b > c ? a * 2 : b + c) : (a-- * b);
        printf("68. d = (a %% b == 2) ? (++a + b > c ? a * 2 : b + c) : (a-- * b); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 15, b = 10, c = 5;
        d = (a >= b && a++ < 20) ? (a % c == 0 ? a / c : a + c) : (a - b);
        printf("69. d = (a >= b && a++ < 20) ? (a %% c == 0 ? a / c : a + c) : (a - b); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 16, b = 5, c = 8;
        d = (a / b == 3) ? (a % ++b == 1 ? a + b : a - b) : (a += c);
        printf("70. d = (a / b == 3) ? (a %% ++b == 1 ? a + b : a - b) : (a += c); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);
    }

    // 71-80: 비트연산자 + 삼항 + 복합
    printf("\n71-80: 비트연산자 + 삼항 + 복합\n");
    {
        int a = 12, b = 10, c = 5, d = 0; // 12=1100, 10=1010
        d = (a & b) == 8 ? (++a > b ? a | b : a ^ b) : (c <<= 1);
        printf("71. d = (a & b) == 8 ? (++a > b ? a | b : a ^ b) : (c <<= 1); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 15, b = 7, c = 3; // 15=1111, 7=0111
        d = (a | b) == 15 ? (a++ < 20 ? a & b : a ^ b) : (c >>= 1);
        printf("72. d = (a | b) == 15 ? (a++ < 20 ? a & b : a ^ b) : (c >>= 1); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 9, b = 3, c = 6; // 9=1001, 3=0011
        d = (a ^ b) == 10 ? (!(a % ++b) ? a << 1 : b << 2) : (c += 5);
        printf("73. d = (a ^ b) == 10 ? (!(a %% ++b) ? a << 1 : b << 2) : (c += 5); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 16, b = 2, c = 8;
        d = (a >> b) == 4 ? (a-- > 10 ? a & 15 : a | 8) : (c *= 2);
        printf("74. d = (a >> b) == 4 ? (a-- > 10 ? a & 15 : a | 8) : (c *= 2); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 5, b = 3, c = 12;
        d = (a << ++b) == 40 ? (a + b > 10 ? a ^ b : a & b) : (c >>= 2);
        printf("75. d = (a << ++b) == 40 ? (a + b > 10 ? a ^ b : a & b) : (c >>= 2); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 25, b = 7, c = 4;
        d = ~(a & b) == -18 ? (a++ > 20 ? a | b : a ^ b) : (c <<= 1);
        printf("76. d = ~(a & b) == -18 ? (a++ > 20 ? a | b : a ^ b) : (c <<= 1); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 13, b = 11, c = 9;
        d = (a | b) > 15 ? ((a++ ^ b--) == 6 ? a & b : a | b) : (c += 3);
        printf("77. d = (a | b) > 15 ? ((a++ ^ b--) == 6 ? a & b : a | b) : (c += 3); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 20, b = 4, c = 7;
        d = (a >> 2) == 5 ? (!(b++ % 3) ? a << 1 : b << 2) : (c *= 3);
        printf("78. d = (a >> 2) == 5 ? (!(b++ %% 3) ? a << 1 : b << 2) : (c *= 3); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 7, b = 2, c = 14;
        d = (a << b) == 28 ? (a + ++b > 10 ? a ^ b : a & b) : (c >>= 1);
        printf("79. d = (a << b) == 28 ? (a + ++b > 10 ? a ^ b : a & b) : (c >>= 1); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 30, b = 15, c = 11;
        d = (a & b) == 14 ? (a-- > b++ ? a | b : a ^ b) : (c += 2);
        printf("80. d = (a & b) == 14 ? (a-- > b++ ? a | b : a ^ b) : (c += 2); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);
    }

    // 81-90: 콤마연산자 + 삼항 + 비트
    printf("\n81-90: 콤마연산자 + 삼항 + 비트\n");
    {
        int a = 5, b = 3, c = 7, d = 0;
        d = (a += 2, b *= 3, a & b) == 4 ? (c <<= 1) : (c >>= 1);
        printf("81. d = (a += 2, b *= 3, a & b) == 4 ? (c <<= 1) : (c >>= 1); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 4, b = 6, c = 8;
        d = (++a, b--, a > b ? a | b : a ^ b);
        printf("82. d = (++a, b--, a > b ? a | b : a ^ b); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 7, b = 2, c = 5;
        d = (a *= b++, a % 3 == 0, a << 1) > 20 ? (c += 3) : (c -= 1);
        printf("83. d = (a *= b++, a %% 3 == 0, a << 1) > 20 ? (c += 3) : (c -= 1); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 8, b = 5, c = 12;
        d = (a -= b, ++b, a & b) == 0 ? (c >>= 2) : (c <<= 1);
        printf("84. d = (a -= b, ++b, a & b) == 0 ? (c >>= 2) : (c <<= 1); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 10, b = 3, c = 6;
        d = (a /= ++b, a > 2, a | b) < 15 ? (c *= 2) : (c /= 2);
        printf("85. d = (a /= ++b, a > 2, a | b) < 15 ? (c *= 2) : (c /= 2); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 12, b = 4, c = 9;
        d = (a %= b--, a == 0, ++a ^ b) > 5 ? (c += 4) : (c -= 2);
        printf("86. d = (a %%= b--, a == 0, ++a ^ b) > 5 ? (c += 4) : (c -= 2); a=%d,b=%d,c=%d,d=%d\n", a,b,c,d);

        a = 15, b = 6, c = 11;
        d = (++a, b *= 2, a > b && a + b) ? (c <<= 1) : (c >>= 1);
        printf("87. d = (++a, b *= 2, a > b
