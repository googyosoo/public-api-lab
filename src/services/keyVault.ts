import { ApiKeyStore } from '../types/api';

const STORAGE_KEY = 'BAUHAUS_API_LAB_KEYS_V1';

const ENV = (import.meta as any).env || {};

const DEFAULT_KEYS: ApiKeyStore = {
  kmaKey: ENV.VITE_KMA_KEY || '',
  neisKey: ENV.VITE_NEIS_KEY || '',
  airKey: ENV.VITE_AIR_KEY || '',
  kasiKey: ENV.VITE_KASI_KEY || '',
  nlKey: ENV.VITE_NL_KEY || '',
  webhookUrl: ENV.VITE_DISCORD_WEBHOOK_URL || '',
  kakaoKey: ENV.VITE_KAKAO_KEY || '',
  geminiKey: ENV.VITE_GEMINI_KEY || ''
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
        webhookUrl: saved.webhookUrl || DEFAULT_KEYS.webhookUrl,
        kakaoKey: saved.kakaoKey || DEFAULT_KEYS.kakaoKey,
        geminiKey: saved.geminiKey || DEFAULT_KEYS.geminiKey,
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
    if (!key) return '(키 미등록 - 실제 API 인증키 필요)';
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
      case 'webhookUrl':
        return {
          title: 'Discord / Slack 웹훅 URL',
          url: 'https://support.discord.com/hc/ko/articles/228383668',
          type: '채널 설정 → 연동 → 웹훅',
          cost: '완전 무료',
          authMethod: '비밀 Webhook URL POST',
        };
      case 'kakaoKey':
        return {
          title: '카카오 REST API (도서 검색 & 좌표변환 공통)',
          url: 'https://developers.kakao.com',
          type: '카카오 개발자 콘솔 (Kakao Developers)',
          cost: '무료 (일 30,000회 Daum 책 검색)',
          authMethod: 'KakaoAK 헤더 (Authorization)',
        };
      case 'geminiKey':
        return {
          title: 'Google Gemini AI API',
          url: 'https://aistudio.google.com/apikey',
          type: 'Google AI Studio',
          cost: '무료 티어 (RPM 15회 제공)',
          authMethod: 'x-goog-api-key 헤더 / 쿼리',
        };
    }
  }
};
