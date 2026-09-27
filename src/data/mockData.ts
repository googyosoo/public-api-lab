import { 
  ParsedWeather, 
  ParsedNeisData, 
  AirQualityData, 
  AstroData, 
  BookSearchItem, 
  KakaoPlaceItem,
  TourItem,
  DictWordItem,
  DrugInfoItem,
  AptTradeItem
} from '../types/api';

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

// 7. 한국관광공사 TourAPI 4.0 프리셋 데이터
export const TOUR_PRESETS: Record<string, { areaName: string; items: TourItem[]; rawResponse: any }> = {
  '4': {
    areaName: '대구광역시',
    items: [
      {
        contentId: '126535',
        title: '김광석다시그리기길',
        contentTypeId: '12',
        contentTypeName: '관광지',
        address: '대구광역시 중구 달구벌대로 2238',
        tel: '053-661-2623',
        imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&auto=format&fit=crop&q=80',
        mapX: '128.6062',
        mapY: '35.8601',
        areaCode: '4',
        areaName: '대구',
        overview: '고(故) 김광석이 살았던 대봉동 방천시장 골목길에 김광석의 삶과 음악을 테마로 조성된 아름다운 벽화 거리입니다.'
      },
      {
        contentId: '126536',
        title: '이월드 & 83타워',
        contentTypeId: '14',
        contentTypeName: '문화/테마시설',
        address: '대구광역시 달서구 두류공원로 200',
        tel: '053-620-0001',
        imageUrl: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=600&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=300&auto=format&fit=crop&q=80',
        mapX: '128.5638',
        mapY: '35.8532',
        areaCode: '4',
        areaName: '대구',
        overview: '대구의 대표적인 도심 테마파크로, 83타워 전망대에서 대구 시가지 전경을 파노라마로 감상할 수 있습니다.'
      },
      {
        contentId: '126537',
        title: '팔공산자연공원 및 갓바위',
        contentTypeId: '12',
        contentTypeName: '관광지',
        address: '대구광역시 동구 팔공산로 199길 6-1',
        tel: '053-982-0005',
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&auto=format&fit=crop&q=80',
        mapX: '128.7058',
        mapY: '35.9863',
        areaCode: '4',
        areaName: '대구',
        overview: '대구의 진산 팔공산의 수려한 암봉과 관봉 석조여래좌상(갓바위)이 자리한 영남의 대표 명산입니다.'
      },
      {
        contentId: '126538',
        title: '대구 치맥페스티벌',
        contentTypeId: '15',
        contentTypeName: '축제/행사',
        address: '대구광역시 달서구 두류공원 일원',
        tel: '053-248-9998',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80',
        mapX: '128.5583',
        mapY: '35.8495',
        areaCode: '4',
        areaName: '대구',
        eventStartDate: '2026-07-08',
        eventEndDate: '2026-07-12',
        overview: '대한민국 치킨의 성지 대구에서 펼쳐지는 국내 최대 규모의 여름 대표 치맥 문화 축제입니다.'
      },
      {
        contentId: '126539',
        title: '안지랑 곱창골목',
        contentTypeId: '39',
        contentTypeName: '음식점/거리',
        address: '대구광역시 남구 대명로36길 63',
        tel: '053-625-7800',
        imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=300&auto=format&fit=crop&q=80',
        mapX: '128.5772',
        mapY: '35.8368',
        areaCode: '4',
        areaName: '대구',
        overview: '전국 5대 음식테마거리로 선정된 곳으로, 젊음의 열기와 고소한 양념 곱창의 풍미가 가득한 명소입니다.'
      }
    ],
    rawResponse: {
      response: {
        header: { resultCode: '0000', resultMsg: 'OK' },
        body: { numOfRows: 5, pageNo: 1, totalCount: 42, items: { item: [] } }
      }
    }
  },
  '1': {
    areaName: '서울특별시',
    items: [
      {
        contentId: '126501',
        title: '경복궁 & 광화문',
        contentTypeId: '12',
        contentTypeName: '관광지',
        address: '서울특별시 종로구 사직로 161',
        tel: '02-3700-3900',
        imageUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=600&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=300&auto=format&fit=crop&q=80',
        mapX: '126.9770',
        mapY: '37.5796',
        areaCode: '1',
        areaName: '서울',
        overview: '조선 왕조 제일의 법궁으로, 근정전과 경회루 등 웅장하고 유려한 전통 한국 건축의 정수를 보여줍니다.'
      },
      {
        contentId: '126502',
        title: 'DDP (동대문디자인플라자)',
        contentTypeId: '14',
        contentTypeName: '문화시설',
        address: '서울특별시 중구 을지로 281',
        tel: '02-2153-0000',
        imageUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=300&auto=format&fit=crop&q=80',
        mapX: '127.0098',
        mapY: '37.5665',
        areaCode: '1',
        areaName: '서울',
        overview: '자하 하디드가 설계한 세계 최대 규모의 비정형 3차원 랜드마크로 디자인 전시와 패션쇼가 열립니다.'
      }
    ],
    rawResponse: { response: { header: { resultCode: '0000', resultMsg: 'OK' } } }
  },
  '39': {
    areaName: '제주특별자치도',
    items: [
      {
        contentId: '126590',
        title: '성산일출봉',
        contentTypeId: '12',
        contentTypeName: '관광지',
        address: '제주특별자치도 서귀포시 성산읍 일출로 284-12',
        tel: '064-783-0959',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
        thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
        mapX: '126.9366',
        mapY: '33.4586',
        areaCode: '39',
        areaName: '제주',
        overview: '바다 위로 솟아오른 거대한 사발 모양의 수성화산체로, 유네스코 세계자연유산으로 등재된 제주의 랜드마크입니다.'
      }
    ],
    rawResponse: { response: { header: { resultCode: '0000', resultMsg: 'OK' } } }
  }
};

// 8. 국립국어원 한국어기초사전 프리셋 데이터
export const DICT_PRESETS: Record<string, DictWordItem[]> = {
  '인공지능': [
    {
      targetCode: '63201',
      word: '인공지능',
      part: '명사',
      origin: '人工知能',
      definition: '인간의 학습 능력과 추론 능력, 지각 능력, 자연 언어의 이해 능력 등을 컴퓨터 프로그램으로 실현한 기술.',
      pos: '일반명사',
      link: 'https://krdict.korean.go.kr/kor/dicSearch/search?nation=kor&ParaWordNo=63201',
      examples: [
        '최근 인공지능 기술의 발전으로 대규모 공공데이터 분석과 자동화가 급속도로 확산되고 있다.',
        '학교 현장에서도 인공지능 기반 디지털 보조 교구를 활용한 맞춤형 학습이 진행 중이다.'
      ]
    }
  ],
  '데이터': [
    {
      targetCode: '42189',
      word: '데이터',
      part: '명사',
      origin: 'data',
      definition: '이론을 세우는 데 기초가 되는 사실. 또는 바탕이 되는 자료. 컴퓨터 분야에서는 프로그램 운용에 필요한 입력 정보나 처리 결과를 이른다.',
      pos: '외래어',
      link: 'https://krdict.korean.go.kr/kor/dicSearch/search?nation=kor&ParaWordNo=42189',
      examples: [
        '공공데이터 포털을 통해 시민 누구나 실시간 행정 정보를 조회할 수 있다.',
        '축적된 기상 데이터를 바탕으로 다음 주 강수 확률을 예측하였다.'
      ]
    }
  ],
  '학교': [
    {
      targetCode: '31092',
      word: '학교',
      part: '명사',
      origin: '學校',
      definition: '일정한 목적·설비·제도에 의하여 교사가 학생에게 지식과 도덕을 가르치고 지도하는 교육 기관.',
      pos: '일반명사',
      link: 'https://krdict.korean.go.kr/kor/dicSearch/search?nation=kor&ParaWordNo=31092',
      examples: [
        '선생님과 학생들은 학교 도서관에서 공공 오픈 API 활용 프로젝트를 준비했다.',
        '새 학기가 시작되자 학교 운동장은 활기찬 아이들의 웃음소리로 가득 찼다.'
      ]
    }
  ],
  '알고리즘': [
    {
      targetCode: '72810',
      word: '알고리즘',
      part: '명사',
      origin: 'algorithm',
      definition: '어떤 문제의 해결을 위하여 정해진 일련의 절차나 규칙의 모음. 컴퓨터 계산 과정의 논리적 순서를 뜻한다.',
      pos: '일반명사',
      link: 'https://krdict.korean.go.kr/kor/dicSearch/search?nation=kor&ParaWordNo=72810',
      examples: [
        '검색 엔진의 랭킹 알고리즘을 분석하여 사용자에게 가장 유용한 정보를 신속히 제공한다.',
        '복잡한 데이터 정렬 문제를 효율적인 알고리즘 설계를 통해 순식간에 해결하였다.'
      ]
    }
  ],
  '가을': [
    {
      targetCode: '10921',
      word: '가을',
      part: '명사',
      origin: '',
      definition: '네 계절 가운데 셋째 계절. 여름과 겨울 사이로 날씨가 맑고 서늘하며 온갖 곡식과 과일이 익는 결실의 때이다.',
      pos: '일반명사',
      link: 'https://krdict.korean.go.kr/kor/dicSearch/search?nation=kor&ParaWordNo=10921',
      examples: [
        '청명한 가을 하늘 아래 선선한 바람이 불어와 야외 활동을 하기에 안성맞춤이다.',
        '가을 들녘에는 누렇게 익은 벼가 고개를 숙이고 있었다.'
      ]
    }
  ]
};

// 9. 식품의약품안전처 e약은요 의약품개요정보 프리셋 데이터
export const DRUG_PRESETS: Record<string, DrugInfoItem> = {
  '타이레놀': {
    itemSeq: '199303108',
    itemName: '어린이타이레놀현탁액 / 타이레놀정500밀리그람 (아세트아미노펜)',
    entpName: '(주)한국존슨앤드존슨판매',
    efcyQesitm: '감기로 인한 발열 및 통증, 두통, 신경통, 근육통, 월경통, 염좌통, 치통, 관절통 완화에 사용합니다.',
    useMethodQesitm: '성인 기준 1회 1~2정씩 1일 3~4회(4~6시간 간격) 필요시 복용합니다. 하루 최대 4,000mg(8정)을 초과하지 마십시오.',
    atpnWarnQesitm: '매일 3잔 이상의 술을 정기적으로 마시는 사람이 이 약이나 다른 해열진통제를 복용할 경우 간 손상이 유발될 수 있으므로 반드시 의사 또는 약사와 상의해야 합니다.',
    atpnQesitm: '아세트아미노펜을 포함하는 다른 제품과 함께 복용하지 마십시오. 심각한 간 손상이 유발될 수 있습니다.',
    intrcQesitm: '바르비탈계 약물, 삼환계 항우울제 및 알코올을 투여한 환자는 간 손상 위험이 증가할 수 있습니다.',
    seQesitm: '드물게 쇼크, 아나필락시스 반응, 스티븐스-존슨 증후군, 혈소판 감소증 등이 나타날 수 있습니다.',
    depositMethodQesitm: '밀폐용기, 실온(1~30℃)에 보관하십시오. 어린이의 손이 닿지 않는 곳에 보관하십시오.',
    itemImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80'
  },
  '이지엔6': {
    itemSeq: '200502120',
    itemName: '이지엔6애니연질캡슐 (이부프로펜)',
    entpName: '대웅제약',
    efcyQesitm: '감기로 인한 발열 및 통증, 요통, 생리통, 류마티스성 관절염, 골관절염, 두통, 치통에 효능이 있습니다.',
    useMethodQesitm: '성인은 1회 200~400mg을 1일 3~4회 경구 투여합니다. 공복(빈속) 복용을 피하고 식후에 복용하는 것이 권장됩니다.',
    atpnWarnQesitm: '위장관 궤양이나 위장관 출혈 환자, 심한 혈액 이상 환자, 심한 간장애 및 신장애 환자는 복용하지 마십시오.',
    atpnQesitm: '위장장애를 유발할 수 있으므로 물과 함께 식후 즉시 복용하십시오.',
    intrcQesitm: '아스피린 또는 다른 비스테로이드성 소염진통제(NSAIDs)와 병용 투여하지 마십시오.',
    seQesitm: '소화불량, 속쓰림, 구역, 설사, 부종 등이 나타날 수 있습니다.',
    depositMethodQesitm: '기밀용기, 실온(1~30℃) 건소 보관하십시오.',
    itemImage: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&auto=format&fit=crop&q=80'
  },
  '판피린': {
    itemSeq: '196100010',
    itemName: '판피린큐액 (종합감기약)',
    entpName: '동아제약',
    efcyQesitm: '감기의 제증상(콧물, 코막힘, 재채기, 인후통, 기침, 가래, 오한, 발열, 두통, 관절통, 근육통)의 완화에 복용합니다.',
    useMethodQesitm: '성인 1회 20mL(1병)를 1일 3회 식후 30분에 복용합니다.',
    atpnWarnQesitm: '아세트아미노펜이 함유되어 있으므로 다른 해열진통제와 중복 투여하지 마십시오.',
    atpnQesitm: '복용 중 졸음이 올 수 있으므로 운전이나 기계 조작을 피하십시오.',
    intrcQesitm: '다른 감기약, 진통제, 진정제, 항히스타민제를 함유하는 약과 병용하지 마십시오.',
    depositMethodQesitm: '차광기밀용기, 실온보관(1~30℃)',
    itemImage: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&auto=format&fit=crop&q=80'
  },
  '아스피린': {
    itemSeq: '198700012',
    itemName: '바이엘아스피린정100mg / 500mg (아세틸살리실산)',
    entpName: '바이엘코리아',
    efcyQesitm: '혈전 생성 억제(심근경색, 뇌경색 예방 100mg) 또는 해열, 진통, 소염(500mg) 목적으로 사용합니다.',
    useMethodQesitm: '혈전 예방 목적: 1일 1회 100mg 복용. 정해진 시간에 충분한 물과 함께 씹지 않고 삼켜 복용합니다.',
    atpnWarnQesitm: '출혈 경향이 있는 환자나 수술을 앞둔 환자는 복용 전 반드시 의사와 상담해야 합니다.',
    atpnQesitm: '위점막을 자극할 수 있으므로 위궤양 환자는 투여 금기입니다.',
    depositMethodQesitm: '기밀용기, 25℃ 이하 실온보관',
    itemImage: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=400&auto=format&fit=crop&q=80'
  }
};

// 10. 국토교통부 아파트 실거래가 프리셋 데이터
export const REAL_ESTATE_PRESETS: Record<string, { regionName: string; dealYmd: string; items: AptTradeItem[]; rawResponse: any }> = {
  '27230': {
    regionName: '대구광역시 북구 (칠곡지구)',
    dealYmd: '202608',
    items: [
      {
        aptName: '칠곡화성타운',
        dealAmount: 28500,
        dealYear: 2026,
        dealMonth: 8,
        dealDay: 18,
        excluUseAr: 84.92,
        floor: 11,
        dong: '읍내동',
        buildYear: 1999
      },
      {
        aptName: '칠곡그린빌3차',
        dealAmount: 23200,
        dealYear: 2026,
        dealMonth: 8,
        dealDay: 14,
        excluUseAr: 59.84,
        floor: 8,
        dong: '동천동',
        buildYear: 2002
      },
      {
        aptName: '한양수자인칠곡더퍼스트',
        dealAmount: 39800,
        dealYear: 2026,
        dealMonth: 8,
        dealDay: 9,
        excluUseAr: 84.97,
        floor: 15,
        dong: '태전동',
        buildYear: 2017
      },
      {
        aptName: '강북화성파크드림',
        dealAmount: 33000,
        dealYear: 2026,
        dealMonth: 8,
        dealDay: 5,
        excluUseAr: 84.88,
        floor: 7,
        dong: '구암동',
        buildYear: 2010
      },
      {
        aptName: '동화골든빌',
        dealAmount: 19500,
        dealYear: 2026,
        dealMonth: 8,
        dealDay: 2,
        excluUseAr: 59.91,
        floor: 4,
        dong: '관음동',
        buildYear: 1998
      }
    ],
    rawResponse: {
      response: {
        header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
        body: { numOfRows: 10, pageNo: 1, totalCount: 28 }
      }
    }
  },
  '27260': {
    regionName: '대구광역시 수성구 (범어/만촌)',
    dealYmd: '202608',
    items: [
      {
        aptName: '수성범어W',
        dealAmount: 112000,
        dealYear: 2026,
        dealMonth: 8,
        dealDay: 21,
        excluUseAr: 84.99,
        floor: 32,
        dong: '범어동',
        buildYear: 2023
      },
      {
        aptName: '범어SK뷰',
        dealAmount: 98500,
        dealYear: 2026,
        dealMonth: 8,
        dealDay: 16,
        excluUseAr: 84.91,
        floor: 18,
        dong: '범어동',
        buildYear: 2009
      },
      {
        aptName: '힐스테이트범어',
        dealAmount: 125000,
        dealYear: 2026,
        dealMonth: 8,
        dealDay: 11,
        excluUseAr: 84.98,
        floor: 20,
        dong: '범어동',
        buildYear: 2020
      },
      {
        aptName: '만촌자이르네',
        dealAmount: 89000,
        dealYear: 2026,
        dealMonth: 8,
        dealDay: 4,
        excluUseAr: 84.85,
        floor: 12,
        dong: '만촌동',
        buildYear: 2022
      }
    ],
    rawResponse: {
      response: {
        header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
        body: { numOfRows: 10, pageNo: 1, totalCount: 35 }
      }
    }
  },
  '11680': {
    regionName: '서울특별시 강남구 (대치/개포/압구정)',
    dealYmd: '202608',
    items: [
      {
        aptName: '래미안대치팰리스',
        dealAmount: 345000,
        dealYear: 2026,
        dealMonth: 8,
        dealDay: 23,
        excluUseAr: 84.97,
        floor: 19,
        dong: '대치동',
        buildYear: 2015
      },
      {
        aptName: '디에이치퍼스티어아이파크',
        dealAmount: 310000,
        dealYear: 2026,
        dealMonth: 8,
        dealDay: 15,
        excluUseAr: 84.94,
        floor: 24,
        dong: '개포동',
        buildYear: 2024
      },
      {
        aptName: '은마아파트',
        dealAmount: 265000,
        dealYear: 2026,
        dealMonth: 8,
        dealDay: 8,
        excluUseAr: 76.79,
        floor: 9,
        dong: '대치동',
        buildYear: 1979
      }
    ],
    rawResponse: {
      response: {
        header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
        body: { numOfRows: 10, pageNo: 1, totalCount: 42 }
      }
    }
  },
  '11440': {
    regionName: '서울특별시 마포구 (아현/공덕)',
    dealYmd: '202608',
    items: [
      {
        aptName: '마포래미안푸르지오',
        dealAmount: 185000,
        dealYear: 2026,
        dealMonth: 8,
        dealDay: 19,
        excluUseAr: 84.89,
        floor: 14,
        dong: '아현동',
        buildYear: 2014
      },
      {
        aptName: '마포프레스티지자이',
        dealAmount: 205000,
        dealYear: 2026,
        dealMonth: 8,
        dealDay: 12,
        excluUseAr: 84.93,
        floor: 18,
        dong: '염리동',
        buildYear: 2021
      },
      {
        aptName: '공덕자이',
        dealAmount: 168000,
        dealYear: 2026,
        dealMonth: 8,
        dealDay: 6,
        excluUseAr: 84.95,
        floor: 10,
        dong: '공덕동',
        buildYear: 2015
      }
    ],
    rawResponse: {
      response: {
        header: { resultCode: '00', resultMsg: 'NORMAL_SERVICE' },
        body: { numOfRows: 10, pageNo: 1, totalCount: 22 }
      }
    }
  }
};

