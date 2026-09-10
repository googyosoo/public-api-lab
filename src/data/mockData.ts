import { ParsedWeather, ParsedNeisData, AirQualityData, AstroData, BookSearchItem, KakaoPlaceItem } from '../types/api';

// 1. 기상청 지역별 프리셋 및 Mock 데이터 (사용자 지정 3대 지역)
export const WEATHER_PRESETS: Record<string, { nx: number; ny: number; data: ParsedWeather; rawResponse: any }> = {
  '대구 북구 읍내동': {
    nx: 88,
    ny: 92,
    data: {
      region: '대구광역시 북구 읍내동 (칠곡지구)',
      temp: 25.4,
      rainProb: 10,
      sky: '맑음',
      skyCode: 1,
      pty: '없음',
      humidity: 55,
      windSpeed: 1.8,
      forecast3Days: [
        { dayLabel: '오늘 (9/8)', date: '2026-09-08', temp: 25.4, sky: '맑음', rainProb: 10, suitableScore: 95, recommendation: '최적' },
        { dayLabel: '내일 (9/9)', date: '2026-09-09', temp: 26.2, sky: '맑음', rainProb: 10, suitableScore: 96, recommendation: '최적' },
        { dayLabel: '모레 (9/10)', date: '2026-09-10', temp: 23.0, sky: '구름많음', rainProb: 30, suitableScore: 82, recommendation: '양호' },
      ],
      rainAlert: false,
    },
    rawResponse: {
      response: {
        header: { resultCode: "00", resultMsg: "NORMAL_SERVICE" },
        body: {
          dataType: "JSON",
          items: {
            item: [
              { baseDate: "20260908", baseTime: "0830", category: "T1H", fcstDate: "20260908", fcstTime: "0900", fcstValue: "25.4", nx: 88, ny: 92 },
              { baseDate: "20260908", baseTime: "0830", category: "RN1", fcstDate: "20260908", fcstTime: "0900", fcstValue: "0", nx: 88, ny: 92 },
              { baseDate: "20260908", baseTime: "0830", category: "SKY", fcstDate: "20260908", fcstTime: "0900", fcstValue: "1", nx: 88, ny: 92 },
              { baseDate: "20260908", baseTime: "0830", category: "POP", fcstDate: "20260908", fcstTime: "0900", fcstValue: "10", nx: 88, ny: 92 },
              { baseDate: "20260908", baseTime: "0830", category: "REH", fcstDate: "20260908", fcstTime: "0900", fcstValue: "55", nx: 88, ny: 92 },
              { baseDate: "20260908", baseTime: "0830", category: "WSD", fcstDate: "20260908", fcstTime: "0900", fcstValue: "1.8", nx: 88, ny: 92 }
            ]
          },
          numOfRows: 10,
          pageNo: 1,
          totalCount: 60
        }
      }
    }
  },
  '대구 달성군 다사읍': {
    nx: 86,
    ny: 90,
    data: {
      region: '대구광역시 달성군 다사읍 (대실역/금호강)',
      temp: 26.1,
      rainProb: 20,
      sky: '맑음',
      skyCode: 1,
      pty: '없음',
      humidity: 58,
      windSpeed: 2.3,
      forecast3Days: [
        { dayLabel: '오늘 (9/8)', date: '2026-09-08', temp: 26.1, sky: '맑음', rainProb: 20, suitableScore: 92, recommendation: '최적' },
        { dayLabel: '내일 (9/9)', date: '2026-09-09', temp: 26.8, sky: '구름많음', rainProb: 20, suitableScore: 90, recommendation: '최적' },
        { dayLabel: '모레 (9/10)', date: '2026-09-10', temp: 24.1, sky: '흐림', rainProb: 40, suitableScore: 75, recommendation: '양호' },
      ],
      rainAlert: false,
    },
    rawResponse: {
      response: {
        header: { resultCode: "00", resultMsg: "NORMAL_SERVICE" },
        body: {
          items: {
            item: [
              { category: "T1H", fcstValue: "26.1", nx: 86, ny: 90 },
              { category: "POP", fcstValue: "20", nx: 86, ny: 90 },
              { category: "SKY", fcstValue: "1", nx: 86, ny: 90 },
              { category: "PTY", fcstValue: "0", nx: 86, ny: 90 },
              { category: "REH", fcstValue: "58", nx: 86, ny: 90 }
            ]
          }
        }
      }
    }
  },
  '경남 김해시 진영읍': {
    nx: 92,
    ny: 78,
    data: {
      region: '경상남도 김해시 진영읍 (진영단감/영남분지)',
      temp: 27.2,
      rainProb: 65,
      sky: '흐리고 비',
      skyCode: 4,
      pty: '소나기',
      humidity: 78,
      windSpeed: 3.4,
      forecast3Days: [
        { dayLabel: '오늘 (9/8)', date: '2026-09-08', temp: 27.2, sky: '흐리고 비', rainProb: 65, suitableScore: 48, recommendation: '주의' },
        { dayLabel: '내일 (9/9)', date: '2026-09-09', temp: 28.0, sky: '구름많음', rainProb: 30, suitableScore: 85, recommendation: '양호' },
        { dayLabel: '모레 (9/10)', date: '2026-09-10', temp: 26.5, sky: '맑음', rainProb: 10, suitableScore: 95, recommendation: '최적' },
      ],
      rainAlert: true,
      alertMessage: '☔ 현재 강수확률 65% 감지 — 진영읍 야외 행사 시 우천 대비 실내 전환 권장',
    },
    rawResponse: {
      response: {
        header: { resultCode: "00", resultMsg: "NORMAL_SERVICE" },
        body: {
          items: {
            item: [
              { category: "T1H", fcstValue: "27.2", nx: 92, ny: 78 },
              { category: "POP", fcstValue: "65", nx: 92, ny: 78 },
              { category: "SKY", fcstValue: "4", nx: 92, ny: 78 },
              { category: "PTY", fcstValue: "4", nx: 92, ny: 78 },
              { category: "REH", fcstValue: "78", nx: 92, ny: 78 }
            ]
          }
        }
      }
    }
  }
};

// 2. 나이스 교육정보 프리셋 (대구광역시 3대 학교)
export const NEIS_PRESETS: Record<string, { schoolName: string; code: string; officeCode: string; data: ParsedNeisData; rawResponse: any }> = {
  '심인고등학교': {
    schoolName: '심인고등학교',
    code: '7240094',
    officeCode: 'D10',
    data: {
      schoolName: '심인고등학교 (일반고/대구 달성군)',
      schoolCode: '7240094',
      officeCode: 'D10 (대구광역시교육청)',
      timetableClass: '2학년 3반',
      grade: 2,
      classNum: 3,
      todayMeal: {
        date: '2026-09-08',
        mealType: '중식 (고등 영양 표준식단)',
        dishes: [
          '찰흑미밥',
          '맑은소고기무국 (한우:국내산)',
          '안동식순살찜닭 & 납작당면',
          '해물부추전 & 양념장',
          '아삭깍두기 (배추/무:국내산)',
          '달콤샤인머스캣'
        ],
        calories: '865.4 Kcal',
        origin: [
          { ingredient: '쌀/잡곡', country: '국내산' },
          { ingredient: '쇠고기(한우)', country: '국내산' },
          { ingredient: '닭고기(무항생제)', country: '국내산' },
          { ingredient: '깍두기/김치', country: '국내산' }
        ],
        nutrients: [
          { name: '탄수화물', amount: '115.2g' },
          { name: '단백질', amount: '42.8g' },
          { name: '지방', amount: '21.4g' },
          { name: '칼슘', amount: '345.0mg' }
        ]
      },
      weeklySchedules: [
        { date: '2026-09-09', eventName: '전국연합학력평가 (9월 모의평가)', gradeTarget: '1, 2, 3학년', isHoliday: false },
        { date: '2026-09-17', eventName: '수능 D-60 집중 학습 멘토링 주간', gradeTarget: '3학년', isHoliday: false },
        { date: '2026-09-24', eventName: '심인 가을 축제 및 동아리 한마당', gradeTarget: '전학년', isHoliday: false },
        { date: '2026-10-02', eventName: '개교기념일 재량휴업일', gradeTarget: '전교생', isHoliday: true },
      ],
      timetable: [
        { period: 1, subject: '공통영어 2', teacher: '김진우 T' },
        { period: 2, subject: '수학 II (미적분)', teacher: '박미래 T' },
        { period: 3, subject: '한국사', teacher: '이성호 T' },
        { period: 4, subject: '물리학 I', teacher: '최양자 T' },
        { period: 5, subject: '체육 (배구)', teacher: '정대만 T' },
        { period: 6, subject: '인공지능 프로그래밍', teacher: '도쌤 T' },
        { period: 7, subject: '창의적 체험활동', teacher: '담임교사' },
      ]
    },
    rawResponse: {
      mealServiceDietInfo: [
        { head: [{ list_total_count: 1 }, { RESULT: { CODE: "INFO-000", MESSAGE: "정상 처리되었습니다." } }] },
        {
          row: [
            {
              ATPT_OFCDC_SC_CODE: "D10",
              SD_SCHUL_CODE: "7240094",
              SCHUL_NM: "심인고등학교",
              MMEAL_SC_NM: "중식",
              MLSV_YMD: "20260908",
              DDISH_NM: "찰흑미밥<br/>맑은소고기무국<br/>안동식순살찜닭<br/>해물부추전<br/>아삭깍두기<br/>샤인머스캣",
              CAL_INFO: "865.4 Kcal",
              NTR_INFO: "탄수화물(g) : 115.2<br/>단백질(g) : 42.8<br/>지방(g) : 21.4"
            }
          ]
        }
      ]
    }
  },
  '대구동평초등학교': {
    schoolName: '대구동평초등학교',
    code: '7261087',
    officeCode: 'D10',
    data: {
      schoolName: '대구동평초등학교 (공립/대구 북구 동천동)',
      schoolCode: '7261087',
      officeCode: 'D10 (대구광역시교육청)',
      timetableClass: '6학년 3반',
      grade: 6,
      classNum: 3,
      todayMeal: {
        date: '2026-09-08',
        mealType: '중식 (초등 성장기 맞춤 식단)',
        dishes: [
          '고소한기장밥',
          '쇠고기미역국',
          '수제함박스테이크 & 브라운소스',
          '감자채파프리카볶음',
          '맛있는배추김치',
          '달콤생과일멜론'
        ],
        calories: '642.8 Kcal',
        origin: [
          { ingredient: '쇠고기(한우)', country: '국내산' },
          { ingredient: '돼지고기(수제함박)', country: '국내산(무항생제)' },
          { ingredient: '쌀/잡곡', country: '친환경 우렁이쌀' }
        ],
        nutrients: [
          { name: '탄수화물', amount: '88.5g' },
          { name: '단백질', amount: '28.4g' },
          { name: '지방', amount: '16.2g' },
          { name: '칼슘', amount: '290.5mg' }
        ]
      },
      weeklySchedules: [
        { date: '2026-09-11', eventName: '동평 꿈빛 가을 독서 골든벨', gradeTarget: '3~6학년', isHoliday: false },
        { date: '2026-09-18', eventName: '2학기 학부모 상담 주간', gradeTarget: '전학년', isHoliday: false },
        { date: '2026-09-25', eventName: '가을 현장체험학습', gradeTarget: '1~6학년', isHoliday: false },
      ],
      timetable: [
        { period: 1, subject: '국어 (작품 속 인물)', teacher: '담임선생님' },
        { period: 2, subject: '수학 (분수의 나눗셈)', teacher: '담임선생님' },
        { period: 3, subject: '사회 (세계 여러 나라의 자연)', teacher: '담임선생님' },
        { period: 4, subject: '과학 (전기의 이용 탐구)', teacher: '과학전담교사' },
        { period: 5, subject: '실과 (소프트웨어와 프로그래밍)', teacher: '실과전담교사' },
        { period: 6, subject: '체육 (네트형 경쟁 배구)', teacher: '담임선생님' },
      ]
    },
    rawResponse: {
      mealServiceDietInfo: [
        {
          row: [
            {
              ATPT_OFCDC_SC_CODE: "D10",
              SD_SCHUL_CODE: "7261087",
              SCHUL_NM: "대구동평초등학교",
              MMEAL_SC_NM: "중식",
              MLSV_YMD: "20260908",
              DDISH_NM: "고소한기장밥<br/>쇠고기미역국<br/>수제함박스테이크<br/>감자채파프리카볶음<br/>배추김치<br/>멜론",
              CAL_INFO: "642.8 Kcal"
            }
          ]
        }
      ]
    }
  },
  '대구대천초등학교': {
    schoolName: '대구대천초등학교',
    code: '7261082',
    officeCode: 'D10',
    data: {
      schoolName: '대구대천초등학교 (공립/대구 북구 읍내동)',
      schoolCode: '7261082',
      officeCode: 'D10 (대구광역시교육청)',
      timetableClass: '2학년 2반',
      grade: 2,
      classNum: 2,
      todayMeal: {
        date: '2026-09-08',
        mealType: '중식 (초등 친환경 영양식단)',
        dishes: [
          '찰보리밥',
          '시원한콩나물맑은국',
          '돈육간장불고기 (무항생제)',
          '친환경브로콜리숙회 & 초장',
          '알타리총각김치',
          '유기농그릭요구르트'
        ],
        calories: '628.5 Kcal',
        origin: [
          { ingredient: '돼지고기', country: '국내산(무항생제 1등급)' },
          { ingredient: '콩나물/채소류', country: '대구/경북 친환경 농가' },
          { ingredient: '고춧가루', country: '국내산' }
        ],
        nutrients: [
          { name: '탄수화물', amount: '84.2g' },
          { name: '단백질', amount: '30.1g' },
          { name: '지방', amount: '15.8g' },
          { name: '칼슘', amount: '315.0mg' }
        ]
      },
      weeklySchedules: [
        { date: '2026-09-10', eventName: '2학기 전교 학생자치회 임원선거', gradeTarget: '4~6학년', isHoliday: false },
        { date: '2026-09-16', eventName: '창의융합 SW·AI 체험의 날', gradeTarget: '전학년', isHoliday: false },
        { date: '2026-09-23', eventName: '방과후학교 공개수업 페스티벌', gradeTarget: '전교생', isHoliday: false },
      ],
      timetable: [
        { period: 1, subject: '국어 (간직하고 싶은 노래)', teacher: '담임선생님' },
        { period: 2, subject: '수학 (곱셈구구 6단)', teacher: '담임선생님' },
        { period: 3, subject: '통합교과(가을) (가을의 동네 모습)', teacher: '담임선생님' },
        { period: 4, subject: '즐거운생활 (가을 열매 종이접기)', teacher: '담임선생님' },
        { period: 5, subject: '안전한생활 (교통안전 수칙 지키기)', teacher: '담임선생님' },
      ]
    },
    rawResponse: {
      mealServiceDietInfo: [
        {
          row: [
            {
              ATPT_OFCDC_SC_CODE: "D10",
              SD_SCHUL_CODE: "7261082",
              SCHUL_NM: "대구대천초등학교",
              MMEAL_SC_NM: "중식",
              MLSV_YMD: "20260908",
              DDISH_NM: "찰보리밥<br/>시원한콩나물맑은국<br/>돈육간장불고기<br/>브로콜리숙회<br/>총각김치<br/>그릭요구르트",
              CAL_INFO: "628.5 Kcal"
            }
          ]
        }
      ]
    }
  }
};

// 3. 에어코리아 대기오염 프리셋 (대구 북구, 대구 달성군, 경남 김해시)
export const AIR_PRESETS: Record<string, { stationName: string; data: AirQualityData; rawResponse: any }> = {
  '대구 북구 읍내동': {
    stationName: '태전동',
    data: {
      stationName: '대구 북구 읍내동 (태전동 측정소)',
      dateTime: '2026-09-08 09:00 기준',
      pm10Value: 24,
      pm10Grade: '좋음',
      pm25Value: 11,
      pm25Grade: '좋음',
      o3Value: 0.028,
      o3Grade: '좋음',
      cai: 42,
      outdoorStatus: '가능',
      colorHex: '#2D7F54' // Bauhaus Green
    },
    rawResponse: {
      response: {
        header: { resultCode: "00", resultMsg: "NORMAL_SERVICE" },
        body: {
          items: [
            {
              stationName: "태전동",
              dataTime: "2026-09-08 09:00",
              pm10Value: "24",
              pm10Grade: "1",
              pm25Value: "11",
              pm25Grade: "1",
              o3Value: "0.028",
              o3Grade: "1",
              khaiValue: "42",
              khaiGrade: "1"
            }
          ]
        }
      }
    }
  },
  '대구 달성군 다사읍': {
    stationName: '다사읍',
    data: {
      stationName: '대구 달성군 다사읍 (다사읍 측정소)',
      dateTime: '2026-09-08 09:00 기준',
      pm10Value: 45,
      pm10Grade: '보통',
      pm25Value: 21,
      pm25Grade: '보통',
      o3Value: 0.038,
      o3Grade: '보통',
      cai: 68,
      outdoorStatus: '가능',
      colorHex: '#F5A623' // Bauhaus Yellow
    },
    rawResponse: {
      response: {
        body: {
          items: [
            {
              stationName: "다사읍",
              dataTime: "2026-09-08 09:00",
              pm10Value: "45",
              pm25Value: "21",
              khaiValue: "68",
              pm10Grade: "2",
              pm25Grade: "2"
            }
          ]
        }
      }
    }
  },
  '경남 김해시 진영읍': {
    stationName: '진영읍',
    data: {
      stationName: '경상남도 김해시 진영읍 (진영읍 측정소)',
      dateTime: '2026-09-08 09:00 기준',
      pm10Value: 88,
      pm10Grade: '나쁨',
      pm25Value: 42,
      pm25Grade: '나쁨',
      o3Value: 0.052,
      o3Grade: '보통',
      cai: 124,
      outdoorStatus: '자제/실내권장',
      colorHex: '#D9381E' // Bauhaus Red
    },
    rawResponse: {
      response: {
        body: {
          items: [
            {
              stationName: "진영읍",
              dataTime: "2026-09-08 09:00",
              pm10Value: "88",
              pm25Value: "42",
              khaiValue: "124",
              pm10Grade: "3",
              pm25Grade: "3"
            }
          ]
        }
      }
    }
  }
};

// 4. 천문연구원 출몰/월령/특일 프리셋
export const ASTRO_DATA: AstroData = {
  location: '대한민국 서울 (북위 37°34′, 동경 126°58′)',
  date: '2026-09-07 (음력 7월 26일)',
  sunrise: '06:08',
  sunset: '18:52',
  moonrise: '01:42',
  moonset: '16:15',
  moonPhase: 25.4, // 그믐달에 가까움
  moonPhaseName: '그믐달 (Waning Crescent)',
  holidays: [
    { date: '2026-01-01', name: '신정' },
    { date: '2026-02-16', name: '설날 연휴' },
    { date: '2026-02-17', name: '설날 당일' },
    { date: '2026-02-18', name: '설날 연휴' },
    { date: '2026-03-01', name: '삼일절' },
    { date: '2026-03-02', name: '삼일절 대체공휴일', isSubstitute: true },
    { date: '2026-05-05', name: '어린이날' },
    { date: '2026-05-24', name: '부처님오신날' },
    { date: '2026-05-25', name: '부처님오신날 대체공휴일', isSubstitute: true },
    { date: '2026-06-06', name: '현충일' },
    { date: '2026-08-15', name: '광복절' },
    { date: '2026-09-24', name: '추석 연휴' },
    { date: '2026-09-25', name: '추석 당일' },
    { date: '2026-09-26', name: '추석 연휴' },
    { date: '2026-10-03', name: '개천절' },
    { date: '2026-10-09', name: '한글날' },
    { date: '2026-12-25', name: '기독탄신일(크리스마스)' },
  ],
  workingDayDDay: {
    targetDays: 3,
    expectedDate: '2026-09-10 (목)',
    excludedHolidays: ['주말(토/일) 0일 제외']
  }
};

// 5. 국립중앙도서관 & 카카오 도서 검색 프리셋
export const BOOK_SEARCH_PRESET: BookSearchItem[] = [
  {
    title: '바우하우스 (Bauhaus 1919-1933)',
    author: '막달레나 드로스테 (지은이)',
    publisher: '마로니에북스 / TASCHEN',
    pubDate: '2021-08-20',
    isbn: '9788960536258',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
    priceStandard: 25000,
    priceSales: 22500,
    description: '바이마르에서 데사우, 베를린으로 이어진 20세기 가장 위대한 디자인·건축 혁명 바우하우스의 연대기와 공식 도판 아카이브.',
    categoryName: '예술 > 건축/인테리어 (KDC 610.9)',
    source: 'kakao',
    url: 'https://search.daum.net/search?w=bookpage&bookId=5810232'
  },
  {
    title: '코딩하는 디자이너를 위한 실전 API 핸드북',
    author: '도쌤 (지은이)',
    publisher: '도키피디아 출판부',
    pubDate: '2026-05-15',
    isbn: '9791199821034',
    coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e37262?w=400&auto=format&fit=crop&q=80',
    priceStandard: 28000,
    priceSales: 25200,
    description: '국립중앙도서관 및 카카오 REST API를 연결하는 실전 아키텍처. 키 발급부터 실시간 데이터 바인딩까지.',
    categoryName: '컴퓨터/IT > 웹 프로그래밍 (KDC 005.133)',
    source: 'nl',
    url: 'https://www.nl.go.kr'
  },
  {
    title: '형태는 기능을 따른다: 기능주의 조형 원리',
    author: '루이스 설리번, 발터 그로피우스 외',
    publisher: '조형미학사',
    pubDate: '2023-11-01',
    isbn: '9788970599102',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80',
    priceStandard: 22000,
    priceSales: 19800,
    description: '장식을 걷어내고 순수한 본질과 기능에 집중한 현대 디자인의 영원한 나침반.',
    categoryName: '인문학 > 조형미학 (KDC 600)',
    source: 'kakao',
    url: 'https://search.daum.net'
  },
  {
    title: '국가 공공데이터로 구축하는 지능형 웹 애플리케이션',
    author: '한국정보문화진흥원 연구팀',
    publisher: '공공정보미디어',
    pubDate: '2025-10-10',
    isbn: '9791192837105',
    coverUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80',
    priceStandard: 30000,
    priceSales: 27000,
    description: '기상청, 나이스, 에어코리아, 국립중앙도서관 등 대한민국 표준 공공데이터포털 API 실전 구축 가이드.',
    categoryName: '기술과학 > 데이터베이스 (KDC 004.678)',
    source: 'nl',
    url: 'https://data4library.kr'
  }
];

// 6. 카카오 장소(키워드) 검색 및 주소 지오코딩 프리셋
export const KAKAO_PLACES_PRESET: KakaoPlaceItem[] = [
  {
    id: 'place_1',
    placeName: '심인고등학교',
    categoryName: '교육,학문 > 학교 > 고등학교',
    categoryGroupName: '학교',
    phone: '053-231-9000',
    addressName: '대구 수성구 파동 11-1',
    roadAddressName: '대구광역시 수성구 파동로 11-1',
    x: '128.6083',
    y: '35.8239',
    placeUrl: 'https://place.map.kakao.com/8141235'
  },
  {
    id: 'place_2',
    placeName: '대구동평초등학교',
    categoryName: '교육,학문 > 학교 > 초등학교',
    categoryGroupName: '학교',
    phone: '053-231-1000',
    addressName: '대구 북구 동천동 923',
    roadAddressName: '대구광역시 북구 동암로 100',
    x: '128.5582',
    y: '35.9405',
    placeUrl: 'https://place.map.kakao.com/11261087'
  },
  {
    id: 'place_3',
    placeName: '대구대천초등학교',
    categoryName: '교육,학문 > 학교 > 초등학교',
    categoryGroupName: '학교',
    phone: '053-231-2000',
    addressName: '대구 달서구 대천동 518',
    roadAddressName: '대구광역시 달서구 대천로 15',
    x: '128.5098',
    y: '35.8163',
    placeUrl: 'https://place.map.kakao.com/11261082'
  },
  {
    id: 'place_4',
    placeName: '읍내동 행정복지센터',
    categoryName: '공공기관 > 행정복지센터',
    categoryGroupName: '공공기관',
    phone: '053-665-3641',
    addressName: '대구 북구 읍내동 865',
    roadAddressName: '대구광역시 북구 칠곡중앙대로 574',
    x: '128.5448',
    y: '35.9492',
    placeUrl: 'https://place.map.kakao.com/10892011'
  },
  {
    id: 'place_5',
    placeName: '다사읍 행정복지센터',
    categoryName: '공공기관 > 행정복지센터',
    categoryGroupName: '공공기관',
    phone: '053-668-5400',
    addressName: '대구 달성군 다사읍 매곡리 1546',
    roadAddressName: '대구광역시 달성군 다사읍 다사로 33',
    x: '128.4621',
    y: '35.8569',
    placeUrl: 'https://place.map.kakao.com/17582012'
  },
  {
    id: 'place_6',
    placeName: '진영읍 행정복지센터',
    categoryName: '공공기관 > 행정복지센터',
    categoryGroupName: '공공기관',
    phone: '055-330-8561',
    addressName: '경남 김해시 진영읍 진영리 1618',
    roadAddressName: '경상남도 김해시 진영읍 김해대로 365번길 8',
    x: '128.7352',
    y: '35.3128',
    placeUrl: 'https://place.map.kakao.com/10892831'
  }
];
