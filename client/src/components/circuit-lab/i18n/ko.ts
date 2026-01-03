/**
 * Korean Language Pack for Circuit Lab
 * 아두이노 시뮬레이터 한국어 번역
 */

export const ko = {
  // App Header
  app: {
    title: '회로 실험실',
    subtitle: '3D 아두이노 시뮬레이터',
    home: '홈',
    run: '실행',
    stop: '정지',
    reset: '초기화',
    running: '실행 중',
    ready: '대기',
  },

  // Component Library
  components: {
    title: '부품',
    search: '부품 검색...',
    dragToAdd: '드래그하여 추가',
    categories: {
      microcontrollers: '마이크로컨트롤러',
      basics: '기본 부품',
      output: '출력',
      input: '입력',
      power: '전원',
      sensors: '센서',
    },
    items: {
      arduino_uno: {
        name: '아두이노 UNO',
        description: 'ATmega328P 마이크로컨트롤러 보드',
      },
      breadboard: {
        name: '브레드보드',
        description: '풀사이즈 솔더리스 브레드보드',
      },
      led: {
        name: 'LED',
        description: '5mm 발광 다이오드',
      },
      led_rgb: {
        name: 'RGB LED',
        description: '공통 캐소드 RGB LED',
      },
      resistor: {
        name: '저항',
        description: '1/4W 스루홀 저항',
      },
      button: {
        name: '푸시 버튼',
        description: '순간 택트 스위치',
      },
      potentiometer: {
        name: '가변저항',
        description: '10kΩ 회전식 가변저항',
      },
      buzzer: {
        name: '피에조 버저',
        description: '능동형 피에조 버저',
      },
      lcd: {
        name: 'LCD 디스플레이',
        description: '16x2 문자 LCD',
      },
      capacitor: {
        name: '커패시터',
        description: '세라믹 커패시터',
      },
      photoresistor: {
        name: '광센서',
        description: '조도 감지 저항 (LDR)',
      },
      temperature: {
        name: '온도 센서',
        description: 'TMP36 온도 센서',
      },
      ultrasonic: {
        name: '초음파 센서',
        description: 'HC-SR04 거리 센서',
      },
    },
  },

  // Code Editor
  editor: {
    title: '코드 편집기',
    run: '실행',
    stop: '정지',
    save: '저장',
    language: '언어',
    arduino: '아두이노',
    javascript: '자바스크립트',
    python: '파이썬',
    cpp: 'C++',
    idle: '대기',
    running: '실행 중',
    error: '오류',
    success: '성공',
    line: '줄',
    column: '열',
  },

  // Serial Monitor
  serial: {
    title: '시리얼 모니터',
    connected: '연결됨',
    disconnected: '연결 안됨',
    baudRate: '통신 속도',
    send: '전송',
    clear: '지우기',
    export: '내보내기',
    autoScroll: '자동 스크롤',
    timestamp: '타임스탬프',
    placeholder: '메시지를 입력하세요...',
    noOutput: '출력이 없습니다. 코드를 실행하면 시리얼 출력이 여기에 표시됩니다.',
  },

  // Logic Analyzer
  logicAnalyzer: {
    title: '로직 분석기',
    start: '시작',
    stop: '정지',
    reset: '초기화',
    export: '내보내기',
    channels: '채널',
    noChannels: '활성 채널이 없습니다',
    time: '시간',
    value: '값',
    zoomIn: '확대',
    zoomOut: '축소',
    timeScale: '시간 스케일',
    recording: '녹화중',
    waiting: '대기',
    digital: '디지털',
    analog: '아날로그',
    pwm: 'PWM',
    high: 'HIGH',
    low: 'LOW',
    cursor: '커서',
    current: '현재',
  },

  // Timeline
  timeline: {
    title: '시뮬레이션 타임라인',
    play: '재생',
    pause: '일시정지',
    stop: '정지',
    speed: '속도',
    realtime: '실시간',
    slow: '느림',
    fast: '빠름',
    elapsed: '경과 시간',
    events: '이벤트',
    noEvents: '이벤트 없음',
    running: '실행 중',
    paused: '일시정지',
    stopped: '정지됨',
    eventTypes: {
      pin_change: '핀 변경',
      serial: '시리얼 출력',
      interrupt: '인터럽트',
      function_call: '함수 호출',
    },
    speedOptions: {
      0.1: '0.1x (매우 느림)',
      0.5: '0.5x (느림)',
      1: '1x (실시간)',
      2: '2x (빠름)',
      5: '5x (매우 빠름)',
      10: '10x (최대)',
    },
  },

  // Properties Panel
  properties: {
    title: '속성',
    position: '위치',
    rotation: '회전',
    color: '색상',
    value: '값',
    pin: '핀',
    connected: '연결됨',
    notConnected: '연결 안됨',
  },

  // Arduino API Help
  arduino: {
    functions: {
      pinMode: '핀 모드 설정',
      digitalWrite: '디지털 출력',
      digitalRead: '디지털 입력',
      analogWrite: 'PWM 출력 (0-255)',
      analogRead: '아날로그 입력 (0-1023)',
      delay: '지연 (밀리초)',
      delayMicroseconds: '지연 (마이크로초)',
      millis: '밀리초 단위 시간',
      micros: '마이크로초 단위 시간',
    },
    constants: {
      HIGH: '높음 (5V)',
      LOW: '낮음 (0V)',
      INPUT: '입력 모드',
      OUTPUT: '출력 모드',
      INPUT_PULLUP: '내부 풀업 입력',
      LED_BUILTIN: '내장 LED (핀 13)',
    },
    serial: {
      begin: '시리얼 통신 시작',
      print: '출력 (줄바꿈 없음)',
      println: '출력 (줄바꿈)',
      available: '수신 데이터 확인',
      read: '데이터 읽기',
    },
  },

  // Status Bar
  status: {
    simulation: '시뮬레이션',
    active: '활성',
    stopped: '정지됨',
    components: '부품',
    mcu: 'Arduino UNO • ATmega328P',
    clock: '16 MHz',
    version: '버전',
  },

  // Tooltips
  tooltips: {
    runCode: '코드 실행 (Ctrl+Enter)',
    stopCode: '실행 중지 (Ctrl+Shift+Enter)',
    saveCode: '코드 저장 (Ctrl+S)',
    toggleGrid: '그리드 표시/숨기기',
    fullscreen: '전체 화면',
    settings: '설정',
    zoomIn: '확대',
    zoomOut: '축소',
    resetView: '보기 초기화',
  },

  // Error Messages
  errors: {
    compileFailed: '컴파일 실패',
    runtimeError: '런타임 오류',
    syntaxError: '구문 오류',
    connectionFailed: '연결 실패',
    unknownComponent: '알 수 없는 부품',
    pinNotFound: '핀을 찾을 수 없음',
    invalidValue: '잘못된 값',
    line: '줄',
  },

  // Time units
  time: {
    us: 'µs',
    ms: 'ms',
    s: '초',
    min: '분',
    h: '시간',
  },

  // Units
  units: {
    ohm: 'Ω',
    kohm: 'kΩ',
    mohm: 'MΩ',
    uf: 'µF',
    nf: 'nF',
    pf: 'pF',
    v: 'V',
    mv: 'mV',
    ma: 'mA',
    hz: 'Hz',
    khz: 'kHz',
    mhz: 'MHz',
    celsius: '°C',
    cm: 'cm',
  },
};

export default ko;
