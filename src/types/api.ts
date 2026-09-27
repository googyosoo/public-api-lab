// API 모듈 식별자
export type ApiCategory = 
  | 'kma'         // 기상청 단기예보
  | 'neis'        // 나이스 교육정보
  | 'air'         // 에어코리아 대기오염
  | 'kasi'        // 천문연구원 월령/특일
  | 'book'        // 국립중앙도서관 & 카카오 책 검색
  | 'kakao'       // 카카오 주소/좌표
  | 'tour'        // 한국관광공사 TourAPI 4.0
  | 'korean'      // 국립국어원 한국어기초사전
  | 'drug'        // 식품의약품안전처 e약은요 의약품개요
  | 'realestate'; // 국토교통부 아파트 실거래가

// API 키 보관소 상태
export interface ApiKeyStore {
  kmaKey: string;
  neisKey: string;
  airKey: string;
  kasiKey: string;
  nlKey: string;        // 국립중앙도서관 Open API 키
  kakaoKey: string;     // 카카오 REST API 키 (지도+도서 공통)
  tourKey: string;      // 한국관광공사 TourAPI 키 (공공데이터포털 일반 인증키)
  koreanKey: string;    // 국립국어원 Open API 키
  drugKey: string;      // 식약처 의약품개요정보 키 (공공데이터포털 일반 인증키)
  realestateKey: string;// 국토부 아파트실거래가 키 (공공데이터포털 일반 인증키)
}

// 인스펙터에 전달할 메타데이터
export interface ApiInspectionData {
  title: string;
  category: ApiCategory;
  endpoint: string;
  method: 'GET' | 'POST';
  queryParams?: Record<string, string | number>;
  headers?: Record<string, string>;
  body?: Record<string, any>;
  rawResponse: any;
  status: number;
  durationMs: number;
  curlCommand: string;
  fetchSnippet: string;
}

// 기상청 데이터 타입
export interface WeatherItem {
  category: string;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
  nx: number;
  ny: number;
}

export interface ParsedWeather {
  region: string;
  temp: number;          // T1H / TMP 기온 (°C)
  rainProb: number;      // POP 강수확률 (%)
  sky: string;           // SKY 하늘상태 (맑음, 구름많음, 흐림)
  skyCode: number;
  pty: string;           // PTY 강수형태 (없음, 비, 비/눈, 눈, 소나기)
  humidity: number;      // REH 습도 (%)
  windSpeed: number;     // WSD 풍속 (m/s)
  forecast3Days: {
    dayLabel: string;
    date: string;
    temp: number;
    sky: string;
    rainProb: number;
    suitableScore: number; // 0~100 야외활동 적합점수
    recommendation: '최적' | '양호' | '주의' | '비추천';
  }[];
  rainAlert: boolean;
  alertMessage?: string;
}

// 나이스 교육정보 데이터 타입
export interface SchoolMealItem {
  date: string;
  mealType: string;      // 조식, 중식, 석식
  dishes: string[];      // 식단 요리 목록
  calories: string;      // 칼로리 (Kcal)
  origin: { ingredient: string; country: string }[];
  nutrients: { name: string; amount: string }[];
}

export interface SchoolScheduleItem {
  date: string;
  eventName: string;
  gradeTarget: string;
  isHoliday: boolean;
}

export interface ParsedNeisData {
  schoolName: string;
  schoolCode: string;
  officeCode: string;
  timetableClass?: string;
  grade?: number;
  classNum?: number;
  todayMeal: SchoolMealItem;
  weeklySchedules: SchoolScheduleItem[];
  timetable: { period: number; subject: string; teacher?: string }[];
}

// 에어코리아 대기오염 데이터 타입
export interface AirQualityData {
  stationName: string;
  dateTime: string;
  pm10Value: number;
  pm10Grade: '좋음' | '보통' | '나쁨' | '매우나쁨';
  pm25Value: number;
  pm25Grade: '좋음' | '보통' | '나쁨' | '매우나쁨';
  o3Value: number;
  o3Grade: '좋음' | '보통' | '나쁨' | '매우나쁨';
  cai: number; // 통합대기환경지수
  outdoorStatus: '가능' | '주의' | '자제/실내권장';
  colorHex: string;
}

// 천문연구원 데이터 타입
export interface AstroData {
  location: string;
  date: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moonPhase: number;    // 월령 (0 ~ 29.5)
  moonPhaseName: string;// 삭, 초승달, 상현달, 보름달, 하현달, 그믐달
  holidays: { date: string; name: string; isSubstitute?: boolean }[];
  workingDayDDay: {
    targetDays: number;
    expectedDate: string;
    excludedHolidays: string[];
  };
}

// 국립중앙도서관 & 카카오 도서 검색 데이터 타입
export interface BookSearchItem {
  title: string;
  author: string;
  publisher: string;
  pubDate: string;
  isbn: string;
  coverUrl: string;
  priceStandard?: number;  // 정가
  priceSales?: number;     // 판매가
  description: string;
  categoryName: string;    // KDC(한국십진분류) 또는 카테고리
  source: 'kakao' | 'nl';  // 카카오 또는 국립중앙도서관
  url?: string;            // 도서 상세 링크
}

// 카카오 장소(키워드) 검색 데이터 타입
export interface KakaoPlaceItem {
  id: string;
  placeName: string;
  categoryName: string;
  categoryGroupCode?: string;
  categoryGroupName?: string;
  phone: string;
  addressName: string;
  roadAddressName: string;
  x: string; // 경도 lng
  y: string; // 위도 lat
  placeUrl: string;
  distance?: string;
}

// 한국관광공사 TourAPI 데이터 타입
export interface TourItem {
  contentId: string;
  title: string;
  contentTypeId: string;
  contentTypeName: string;
  address: string;
  tel?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  mapX: string;
  mapY: string;
  areaCode: string;
  areaName: string;
  eventStartDate?: string;
  eventEndDate?: string;
  overview?: string;
}

// 국립국어원 한국어기초사전 데이터 타입
export interface DictWordItem {
  targetCode: string;
  word: string;
  part: string;          // 명사, 동사, 형용사 등
  origin?: string;        // 한자/외래어 어원
  definition: string;    // 어휘 정의/뜻풀이
  pos: string;
  link: string;          // 사전 상세 웹 링크
  examples: string[];    // 용례/예문
}

// 식품의약품안전처 e약은요 의약품 개요정보 데이터 타입
export interface DrugInfoItem {
  itemSeq: string;
  itemName: string;
  entpName: string;       // 제약회사
  efcyQesitm: string;     // 효능효과
  useMethodQesitm: string;// 용법용량
  atpnWarnQesitm?: string;// 복용 전 주의사항 경고
  atpnQesitm?: string;    // 주의사항
  intrcQesitm?: string;   // 상호작용 (병용 주의)
  seQesitm?: string;      // 부작용
  depositMethodQesitm?: string; // 보관법
  itemImage?: string;     // 낱알/포장 이미지 URL
}

// 국토교통부 아파트 매매 실거래가 데이터 타입
export interface AptTradeItem {
  aptName: string;        // 아파트 단지명
  dealAmount: number;     // 거래금액 (만원)
  dealYear: number;
  dealMonth: number;
  dealDay: number;
  excluUseAr: number;     // 전용면적 (m2)
  floor: number;          // 층수
  dong: string;           // 법정동
  buildYear: number;      // 건축년도
  jibun?: string;
  cancelDealType?: string;// 해제여부
}
