import { ApiKeyStore } from '../types/api';

const STORAGE_KEY = 'BAUHAUS_API_LAB_KEYS_V1';

const ENV = (import.meta as any).env || {};

const COMMON_PUBLIC_KEY = 
  ENV.VITE_PUBLIC_DATA_KEY || 
  ENV.VITE_KMA_KEY || 
  'b%2BCyVpC58a2hFGho34vflH5YO0%2F0fWeNb0xO2r%2FMTx1erJXlBXFxkpDg8y7GfL0YtZQmu43w9RFwtuscLv7fcQ%3D%3D';

const DEFAULT_KEYS: ApiKeyStore = {
  kmaKey: ENV.VITE_KMA_KEY || COMMON_PUBLIC_KEY,
  neisKey: ENV.VITE_NEIS_KEY || 'df916e24d7174474998b7e50707c841e',
  airKey: ENV.VITE_AIR_KEY || COMMON_PUBLIC_KEY,
  kasiKey: ENV.VITE_KASI_KEY || COMMON_PUBLIC_KEY,
  nlKey: ENV.VITE_NL_KEY || '9cbae0b900d62767e4be4ab30a850abd33c7f640a22d7d3e4095eb2b68d0cb73',
  kakaoKey: ENV.VITE_KAKAO_KEY || '6958dfb0128de91294f6f8116cda8db1',
  tourKey: ENV.VITE_TOUR_KEY || COMMON_PUBLIC_KEY,
  koreanKey: ENV.VITE_KOREAN_DICT_KEY || '',
  drugKey: ENV.VITE_DRUG_KEY || COMMON_PUBLIC_KEY,
  realestateKey: ENV.VITE_REALESTATE_KEY || COMMON_PUBLIC_KEY,
};

export const KeyVault = {
  // 모든 키 불러오기 (환경변수 기본값 + 로컬스토리지 융합)
  getKeys(): ApiKeyStore {
    try {
      const item = localStorage.getItem(STORAGE_KEY);
      const saved = item ? JSON.parse(item) : {};
      return {
        kmaKey: saved.kmaKey || DEFAULT_KEYS.kmaKey,
        neisKey: saved.neisKey || DEFAULT_KEYS.neisKey,
        airKey: saved.airKey || DEFAULT_KEYS.airKey,
        kasiKey: saved.kasiKey || DEFAULT_KEYS.kasiKey,
        nlKey: saved.nlKey || DEFAULT_KEYS.nlKey,
        kakaoKey: saved.kakaoKey || DEFAULT_KEYS.kakaoKey,
        tourKey: saved.tourKey || DEFAULT_KEYS.tourKey,
        koreanKey: saved.koreanKey || DEFAULT_KEYS.koreanKey,
        drugKey: saved.drugKey || DEFAULT_KEYS.drugKey,
        realestateKey: saved.realestateKey || DEFAULT_KEYS.realestateKey,
      };
    } catch {
      return DEFAULT_KEYS;
    }
  },

  // 특정 키 저장
  saveKey(keyName: keyof ApiKeyStore, value: string): void {
    const current = this.getKeys();
    current[keyName] = value.trim();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  },

  // 모든 키 한 번에 저장
  saveAllKeys(keys: ApiKeyStore): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
  },

  // 모든 키 삭제
  clearAllKeys(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  // 마스킹 처리 (앞 4글자, 뒤 3글자 노출)
  maskKey(key: string): string {
    if (!key) return '(키 미등록 - 프리셋 모드로 안전 동작)';
    if (key.length <= 8) return '••••••••';
    return `${key.slice(0, 4)}••••${key.slice(-3)}`;
  },

  // 각 API별 발급 링크 및 공식 문서
  getIssueGuide(service: keyof ApiKeyStore) {
    switch (service) {
      case 'kmaKey':
        return {
          title: '기상청 단기예보 API',
          url: 'https://www.data.go.kr/data/15084084/openapi.do',
          type: '공공데이터포털 (data.go.kr)',
          cost: '완전 무료 (일 10,000회)',
          authMethod: '인코딩/디코딩 서비스키(쿼리 파라미터)',
        };
      case 'neisKey':
        return {
          title: '나이스 교육정보 개방포털',
          url: 'https://open.neis.go.kr',
          type: '나이스 개방포털 (open.neis.go.kr)',
          cost: '완전 무료 (즉시 발급)',
          authMethod: 'KEY 쿼리 파라미터',
        };
      case 'airKey':
        return {
          title: '에어코리아 대기오염정보',
          url: 'https://www.data.go.kr/data/15073861/openapi.do',
          type: '공공데이터포털 (data.go.kr)',
          cost: '완전 무료',
          authMethod: '서비스키(쿼리)',
        };
      case 'kasiKey':
        return {
          title: '천문연구원 출몰/특일 정보',
          url: 'https://www.data.go.kr/data/15012690/openapi.do',
          type: '공공데이터포털 (data.go.kr)',
          cost: '완전 무료',
          authMethod: '서비스키(쿼리)',
        };
      case 'nlKey':
        return {
          title: '국립중앙도서관 국가서지 Open API',
          url: 'https://www.nl.go.kr/NL/contents/N31101010000.do',
          type: '국립중앙도서관 정보포털 / 도서관 정보나루',
          cost: '완전 무료 (일 5,000회~)',
          authMethod: '인증키 쿼리 파라미터 (key)',
        };
      case 'kakaoKey':
        return {
          title: '카카오 REST API (도서 검색 & 좌표변환 공통)',
          url: 'https://developers.kakao.com',
          type: '카카오 개발자 콘솔 (Kakao Developers)',
          cost: '무료 (일 30,000회 Daum 책 검색)',
          authMethod: 'KakaoAK 헤더 (Authorization)',
        };
      case 'tourKey':
        return {
          title: '한국관광공사 국문관광정보 TourAPI 4.0',
          url: 'https://www.data.go.kr/data/15101578/openapi.do',
          type: '공공데이터포털 (data.go.kr)',
          cost: '완전 무료',
          authMethod: '공공데이터포털 일반 인증키(serviceKey)',
        };
      case 'koreanKey':
        return {
          title: '국립국어원 한국어기초사전 Open API',
          url: 'https://krdict.korean.go.kr/openApi/openApiInfo',
          type: '국립국어원 개방형 사전 오픈API',
          cost: '완전 무료',
          authMethod: '인증키 파라미터 (key / certkey_no)',
        };
      case 'drugKey':
        return {
          title: '식품의약품안전처 의약품개요정보(e약은요)',
          url: 'https://www.data.go.kr/data/1471000/openapi.do',
          type: '공공데이터포털 (data.go.kr)',
          cost: '완전 무료',
          authMethod: '공공데이터포털 일반 인증키(serviceKey)',
        };
      case 'realestateKey':
        return {
          title: '국토교통부 아파트매매 실거래자료 API',
          url: 'https://www.data.go.kr/data/15057511/openapi.do',
          type: '공공데이터포털 (data.go.kr)',
          cost: '완전 무료',
          authMethod: '공공데이터포털 일반 인증키(serviceKey)',
        };
    }
  }
};
