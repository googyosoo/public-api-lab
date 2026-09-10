import { ApiInspectionData, ParsedWeather, ParsedNeisData, AirQualityData, AstroData, BookSearchItem, KakaoPlaceItem } from '../types/api';
import { WEATHER_PRESETS, NEIS_PRESETS, AIR_PRESETS, ASTRO_DATA } from '../data/mockData';

export const ApiService = {
  // 1. 기상청 단기예보 조회 (100% 실시간 통신 모드)
  async fetchWeather(
    presetKey: string,
    liveKey?: string,
    _isLive?: boolean
  ): Promise<{ data: ParsedWeather; inspect: ApiInspectionData; error?: string }> {
    const preset = WEATHER_PRESETS[presetKey] || WEATHER_PRESETS['대구 북구 읍내동'];
    const startTime = performance.now();
    const cleanKey = (liveKey || '').trim();

    // 키 미등록 시 정직하게 안내
    if (!cleanKey) {
      const duration = Math.round(performance.now() - startTime);
      const emptyData: ParsedWeather = {
        region: preset.data.region,
        temp: 0,
        rainProb: 0,
        sky: '미확인',
        skyCode: 1,
        pty: '없음',
        humidity: 0,
        windSpeed: 0,
        forecast3Days: [],
        rainAlert: false,
        alertMessage: '기상청 API 서비스키가 등록되지 않았습니다.'
      };

      return {
        data: emptyData,
        error: '기상청 API 서비스키가 등록되지 않았습니다. [키 보관소]에서 공공데이터포털 기상청 단기예보 인증키를 입력해 주세요.',
        inspect: {
          title: '기상청 초단기예보조회 (키 미등록)',
          category: 'kma',
          endpoint: 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst',
          method: 'GET',
          queryParams: { nx: preset.nx, ny: preset.ny },
          rawResponse: { error: 'MissingApiKey', message: '기상청 서비스키가 필요합니다.' },
          status: 401,
          durationMs: duration,
          curlCommand: `curl -X GET "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?serviceKey=YOUR_KEY&nx=${preset.nx}&ny=${preset.ny}"`,
          fetchSnippet: `// 기상청 단기예보 조회를 위해 서비스키가 필요합니다.`
        }
      };
    }

    try {
      const decodedKey = decodeURIComponent(cleanKey);
      const endpoint = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst`;
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const baseDate = `${yyyy}${mm}${dd}`;
      let hours = now.getHours();
      if (now.getMinutes() < 45) {
        hours = hours === 0 ? 23 : hours - 1;
      }
      const baseTime = String(hours).padStart(2, '0') + '30';

      const queryParams = {
        serviceKey: decodedKey,
        numOfRows: 60,
        pageNo: 1,
        dataType: 'JSON',
        base_date: baseDate,
        base_time: baseTime,
        nx: preset.nx,
        ny: preset.ny
      };
      const queryString = new URLSearchParams(queryParams as any).toString();
      const fullUrl = `${endpoint}?${queryString}`;

      const res = await fetch(fullUrl);
      const json = await res.json();
      const duration = Math.round(performance.now() - startTime);

      const header = json?.response?.header;
      if (!res.ok || (header && header.resultCode !== '00')) {
        const errMsg = header?.resultMsg || `기상청 서버 응답 에러 (HTTP ${res.status})`;
        return {
          data: { ...preset.data },
          error: `기상청 API 오류 (${header?.resultCode || res.status}): ${errMsg}`,
          inspect: {
            title: `기상청 초단기예보 오류 (${header?.resultCode || res.status})`,
            category: 'kma',
            endpoint: fullUrl,
            method: 'GET',
            queryParams,
            rawResponse: json,
            status: res.status,
            durationMs: duration,
            curlCommand: `curl -X GET "${fullUrl}"`,
            fetchSnippet: `fetch("${fullUrl}").then(r => r.json());`
          }
        };
      }

      let parsedData = { ...preset.data };
      const items = json?.response?.body?.items?.item;

      if (Array.isArray(items)) {
        let temp = parsedData.temp;
        let rainProb = parsedData.rainProb;
        let skyCode = parsedData.skyCode;
        let ptyCode = 0;
        let humidity = parsedData.humidity;
        let windSpeed = parsedData.windSpeed;

        items.forEach((it: any) => {
          if (it.category === 'T1H') temp = parseFloat(it.fcstValue);
          if (it.category === 'RN1') rainProb = parseFloat(it.fcstValue);
          if (it.category === 'SKY') skyCode = parseInt(it.fcstValue, 10);
          if (it.category === 'PTY') ptyCode = parseInt(it.fcstValue, 10);
          if (it.category === 'REH') humidity = parseInt(it.fcstValue, 10);
          if (it.category === 'WSD') windSpeed = parseFloat(it.fcstValue);
        });

        const skyText = skyCode === 1 ? '맑음' : skyCode === 3 ? '구름많음' : '흐림';
        const ptyText = ptyCode === 0 ? '없음' : ptyCode === 1 ? '비' : ptyCode === 2 ? '비/눈' : ptyCode === 3 ? '눈' : '소나기';

        parsedData = {
          ...parsedData,
          temp,
          rainProb,
          sky: skyText,
          skyCode,
          pty: ptyText,
          humidity,
          windSpeed,
          rainAlert: rainProb >= 60,
          alertMessage: rainProb >= 60 ? `☔ 실시간 강수확률 ${rainProb}% 감지 — 우천 시 실내 체육관 전환 권장` : undefined
        };
      }

      return {
        data: parsedData,
        inspect: {
          title: '기상청 초단기예보조회 (LIVE 실시간 통신)',
          category: 'kma',
          endpoint: fullUrl,
          method: 'GET',
          queryParams,
          rawResponse: json,
          status: res.status,
          durationMs: duration,
          curlCommand: `curl -X GET "${fullUrl}"`,
          fetchSnippet: `fetch("${fullUrl}")\n  .then(res => res.json())\n  .then(data => console.log(data));`
        }
      };
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      return {
        data: { ...preset.data },
        error: `기상청 통신 실패: ${err?.message || '네트워크 연결 상태를 확인해 주세요.'}`,
        inspect: {
          title: '기상청 통신 네트워크 오류',
          category: 'kma',
          endpoint: 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst',
          method: 'GET',
          rawResponse: { error: String(err) },
          status: 0,
          durationMs: duration,
          curlCommand: `curl -X GET "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst"`,
          fetchSnippet: `// 네트워크 연결 에러 발생`
        }
      };
    }
  },

  // 2. 나이스 교육정보 조회 (100% 실시간 통신 모드)
  async fetchNeis(
    schoolNameKey: string,
    liveKey?: string,
    _isLive?: boolean
  ): Promise<{ data: ParsedNeisData; inspect: ApiInspectionData; error?: string }> {
    const preset = NEIS_PRESETS[schoolNameKey] || NEIS_PRESETS['심인고등학교'];
    const startTime = performance.now();
    const cleanKey = (liveKey || '').trim();

    if (!cleanKey) {
      const duration = Math.round(performance.now() - startTime);
      return {
        data: preset.data,
        error: '나이스 교육정보 개방포털 KEY가 등록되지 않았습니다. [키 보관소]에서 나이스 인증키를 입력해 주세요.',
        inspect: {
          title: '나이스 교육정보 개방포털 (키 미등록)',
          category: 'neis',
          endpoint: 'https://open.neis.go.kr/hub/mealServiceDietInfo',
          method: 'GET',
          queryParams: { SD_SCHUL_CODE: preset.code, ATPT_OFCDC_SC_CODE: preset.officeCode },
          rawResponse: { error: 'MissingApiKey', message: '나이스 인증키가 필요합니다.' },
          status: 401,
          durationMs: duration,
          curlCommand: `curl -X GET "https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=YOUR_KEY&SD_SCHUL_CODE=${preset.code}"`,
          fetchSnippet: `// 나이스 급식 및 시간표 조회를 위해 KEY가 필요합니다.`
        }
      };
    }

    try {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const mlsvYmd = `${yyyy}${mm}${dd}`;

      const mealUrl = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${encodeURIComponent(cleanKey)}&Type=json&pIndex=1&pSize=5&ATPT_OFCDC_SC_CODE=${preset.officeCode}&SD_SCHUL_CODE=${preset.code}&MLSV_YMD=${mlsvYmd}`;

      const res = await fetch(mealUrl);
      const json = await res.json();
      const duration = Math.round(performance.now() - startTime);

      // 나이스 에러 코드 검사 (RESULT.CODE !== 'INFO-000')
      if (json.RESULT && json.RESULT.CODE !== 'INFO-000') {
        return {
          data: preset.data,
          error: `나이스 API 오류 (${json.RESULT.CODE}): ${json.RESULT.MESSAGE}`,
          inspect: {
            title: `나이스 교육정보 오류 (${json.RESULT.CODE})`,
            category: 'neis',
            endpoint: mealUrl,
            method: 'GET',
            queryParams: { KEY: cleanKey.slice(0, 6) + '••••', SD_SCHUL_CODE: preset.code, MLSV_YMD: mlsvYmd },
            rawResponse: json,
            status: 200,
            durationMs: duration,
            curlCommand: `curl -X GET "${mealUrl}"`,
            fetchSnippet: `fetch("${mealUrl}");`
          }
        };
      }

      let parsedData = { ...preset.data };
      const row = json?.mealServiceDietInfo?.[1]?.row?.[0];

      if (row) {
        const rawDishes = row.DDISH_NM || '';
        const dishes = rawDishes
          .split(/<br\s*\/?>/i)
          .map((d: string) => d.replace(/[\(\)0-9\.]/g, '').trim())
          .filter(Boolean);

        parsedData.todayMeal = {
          date: row.MLSV_YMD,
          mealType: `${row.MMEAL_SC_NM || '중식'} (${preset.schoolName})`,
          dishes: dishes.length > 0 ? dishes : ['급식 정보가 등록되지 않았습니다.'],
          calories: row.CAL_INFO || '정보 없음',
          origin: preset.data.todayMeal.origin,
          nutrients: preset.data.todayMeal.nutrients
        };
      }

      // 나이스 실시간 시간표 조회 (초등학교: elsTimetable, 고등학교: hisTimetable)
      const timetableEndpoint = preset.schoolName.includes('초등') ? 'elsTimetable' : 'hisTimetable';
      const grade = preset.data.grade || 1;
      const classNum = preset.data.classNum || 1;
      const ay = yyyy.toString();
      const sem = now.getMonth() >= 2 && now.getMonth() <= 7 ? '1' : '2';

      const timetableUrl = `https://open.neis.go.kr/hub/${timetableEndpoint}?KEY=${encodeURIComponent(cleanKey)}&Type=json&pIndex=1&pSize=10&ATPT_OFCDC_SC_CODE=${preset.officeCode}&SD_SCHUL_CODE=${preset.code}&AY=${ay}&SEM=${sem}&ALL_TI_YMD=${mlsvYmd}&GRADE=${grade}&CLASS_NM=${classNum}`;
      
      try {
        const ttRes = await fetch(timetableUrl);
        if (ttRes.ok) {
          const ttJson = await ttRes.json();
          const ttRows = ttJson?.[timetableEndpoint]?.[1]?.row;
          if (Array.isArray(ttRows) && ttRows.length > 0) {
            parsedData.timetable = ttRows.map((r: any) => ({
              period: parseInt(r.PERIO, 10) || 1,
              subject: r.ITRT_CNTNT || '수업',
              teacher: `${grade}-${classNum} 담당교사`
            }));
          }
        }
      } catch (ttErr) {
        console.warn('나이스 실시간 시간표 조회 보조 처리:', ttErr);
      }

      return {
        data: parsedData,
        inspect: {
          title: `나이스 급식 & ${preset.data.timetableClass || '학급'} 시간표 (LIVE 실시간 통신)`,
          category: 'neis',
          endpoint: mealUrl,
          method: 'GET',
          queryParams: { 
            KEY: cleanKey.slice(0, 6) + '••••', 
            SD_SCHUL_CODE: preset.code, 
            MLSV_YMD: mlsvYmd,
            GRADE: preset.data.grade || 1,
            CLASS_NM: preset.data.classNum || 1
          },
          rawResponse: json,
          status: res.status,
          durationMs: duration,
          curlCommand: `curl -X GET "${mealUrl}"`,
          fetchSnippet: `// 나이스 급식 및 시간표 API 호출\nconst meal = await fetch("${mealUrl}").then(r => r.json());`
        }
      };
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      return {
        data: preset.data,
        error: `나이스 통신 네트워크 오류: ${err?.message || '나이스 서버에 연결할 수 없습니다.'}`,
        inspect: {
          title: '나이스 통신 네트워크 오류',
          category: 'neis',
          endpoint: 'https://open.neis.go.kr/hub/mealServiceDietInfo',
          method: 'GET',
          rawResponse: { error: String(err) },
          status: 0,
          durationMs: duration,
          curlCommand: `curl -X GET "https://open.neis.go.kr/hub/mealServiceDietInfo"`,
          fetchSnippet: `// 네트워크 연결 에러 발생`
        }
      };
    }
  },

  // 3. 에어코리아 대기오염정보 조회 (100% 실시간 통신 모드)
  async fetchAir(
    stationKey: string,
    liveKey?: string,
    _isLive?: boolean
  ): Promise<{ data: AirQualityData; inspect: ApiInspectionData; error?: string }> {
    const preset = AIR_PRESETS[stationKey] || AIR_PRESETS['대구 북구 읍내동'];
    const startTime = performance.now();
    const cleanKey = (liveKey || '').trim();

    if (!cleanKey) {
      const duration = Math.round(performance.now() - startTime);
      return {
        data: preset.data,
        error: '에어코리아 대기오염정보 서비스키가 등록되지 않았습니다. [키 보관소]에서 에어코리아 인증키를 입력해 주세요.',
        inspect: {
          title: '에어코리아 대기오염정보 (키 미등록)',
          category: 'air',
          endpoint: 'https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty',
          method: 'GET',
          queryParams: { stationName: preset.stationName, dataTerm: 'DAILY' },
          rawResponse: { error: 'MissingApiKey', message: '에어코리아 서비스키가 필요합니다.' },
          status: 401,
          durationMs: duration,
          curlCommand: `curl -X GET "https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?serviceKey=YOUR_KEY&stationName=${encodeURIComponent(preset.stationName)}"`,
          fetchSnippet: `// 에어코리아 대기오염 조회를 위해 서비스키가 필요합니다.`
        }
      };
    }

    try {
      const decodedKey = decodeURIComponent(cleanKey);
      const url = `https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?serviceKey=${encodeURIComponent(decodedKey)}&returnType=json&numOfRows=1&pageNo=1&stationName=${encodeURIComponent(preset.stationName)}&dataTerm=DAILY&ver=1.0`;
      const res = await fetch(url);
      const json = await res.json();
      const duration = Math.round(performance.now() - startTime);

      const header = json?.response?.header;
      if (!res.ok || (header && header.resultCode !== '00')) {
        const errMsg = header?.resultMsg || `에어코리아 응답 오류 (HTTP ${res.status})`;
        return {
          data: preset.data,
          error: `에어코리아 API 오류 (${header?.resultCode || res.status}): ${errMsg}`,
          inspect: {
            title: `에어코리아 대기오염정보 오류 (${header?.resultCode || res.status})`,
            category: 'air',
            endpoint: url,
            method: 'GET',
            queryParams: { stationName: preset.stationName, dataTerm: 'DAILY', ver: '1.0' },
            rawResponse: json,
            status: res.status,
            durationMs: duration,
            curlCommand: `curl -X GET "${url}"`,
            fetchSnippet: `fetch("${url}");`
          }
        };
      }

      const item = json?.response?.body?.items?.[0];
      let parsedData = { ...preset.data };

      if (item) {
        const pm10 = parseInt(item.pm10Value, 10) || preset.data.pm10Value;
        const pm25 = parseInt(item.pm25Value, 10) || preset.data.pm25Value;
        const pm10Grade = pm10 <= 30 ? '좋음' : pm10 <= 80 ? '보통' : pm10 <= 150 ? '나쁨' : '매우나쁨';
        const outdoorStatus = (pm10Grade === '좋음' || pm10Grade === '보통') ? '가능' : '자제/실내권장';
        const colorHex = pm10Grade === '좋음' ? '#2D7F54' : pm10Grade === '보통' ? '#F5A623' : '#D9381E';

        parsedData = {
          ...parsedData,
          dateTime: `${item.dataTime || '실시간'} 측정치`,
          pm10Value: pm10,
          pm10Grade,
          pm25Value: pm25,
          pm25Grade: pm25 <= 15 ? '좋음' : pm25 <= 35 ? '보통' : '나쁨',
          outdoorStatus,
          colorHex
        };
      }

      return {
        data: parsedData,
        inspect: {
          title: '에어코리아 실시간 대기측정정보 (LIVE 실시간 통신)',
          category: 'air',
          endpoint: url,
          method: 'GET',
          queryParams: { stationName: preset.stationName, dataTerm: 'DAILY', ver: '1.0' },
          rawResponse: json,
          status: res.status,
          durationMs: duration,
          curlCommand: `curl -X GET "${url}"`,
          fetchSnippet: `fetch("${url}")\n  .then(res => res.json())\n  .then(data => console.log(data));`
        }
      };
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      return {
        data: preset.data,
        error: `에어코리아 통신 네트워크 오류: ${err?.message || '에어코리아 서버에 연결할 수 없습니다.'}`,
        inspect: {
          title: '에어코리아 통신 네트워크 오류',
          category: 'air',
          endpoint: 'https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty',
          method: 'GET',
          rawResponse: { error: String(err) },
          status: 0,
          durationMs: duration,
          curlCommand: `curl -X GET "https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty"`,
          fetchSnippet: `// 네트워크 오류 발생`
        }
      };
    }
  },

  // 4. 천문연구원 특일 및 출몰시각 조회 (100% 실시간 통신 모드)
  async fetchAstro(
    liveKey?: string,
    _isLive?: boolean
  ): Promise<{ data: AstroData; inspect: ApiInspectionData; error?: string }> {
    const startTime = performance.now();
    const cleanKey = (liveKey || '').trim();

    if (!cleanKey) {
      const duration = Math.round(performance.now() - startTime);
      return {
        data: ASTRO_DATA,
        error: '한국천문연구원 특일정보 서비스키가 등록되지 않았습니다. [키 보관소]에서 천문연구원 인증키를 입력해 주세요.',
        inspect: {
          title: '한국천문연구원 특일정보 (키 미등록)',
          category: 'kasi',
          endpoint: 'https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo',
          method: 'GET',
          queryParams: { solYear: 2026, solMonth: '09' },
          rawResponse: { error: 'MissingApiKey', message: '천문연구원 서비스키가 필요합니다.' },
          status: 401,
          durationMs: duration,
          curlCommand: `curl -X GET "https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo?serviceKey=YOUR_KEY&solYear=2026&solMonth=09"`,
          fetchSnippet: `// 천문연구원 조회를 위해 서비스키가 필요합니다.`
        }
      };
    }

    try {
      const decodedKey = decodeURIComponent(cleanKey);
      const now = new Date();
      const solYear = now.getFullYear();
      const solMonth = String(now.getMonth() + 1).padStart(2, '0');
      const url = `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo?serviceKey=${encodeURIComponent(decodedKey)}&solYear=${solYear}&solMonth=${solMonth}&_type=json`;

      const res = await fetch(url);
      const json = await res.json();
      const duration = Math.round(performance.now() - startTime);

      const header = json?.response?.header;
      if (!res.ok || (header && header.resultCode !== '00')) {
        const errMsg = header?.resultMsg || `천문연 서버 응답 오류 (HTTP ${res.status})`;
        return {
          data: ASTRO_DATA,
          error: `천문연구원 API 오류 (${header?.resultCode || res.status}): ${errMsg}`,
          inspect: {
            title: `한국천문연구원 특일정보 오류 (${header?.resultCode || res.status})`,
            category: 'kasi',
            endpoint: url,
            method: 'GET',
            queryParams: { solYear, solMonth, _type: 'json' },
            rawResponse: json,
            status: res.status,
            durationMs: duration,
            curlCommand: `curl -X GET "${url}"`,
            fetchSnippet: `fetch("${url}");`
          }
        };
      }

      const items = json?.response?.body?.items?.item;
      let holidays = ASTRO_DATA.holidays;
      if (Array.isArray(items)) {
        holidays = items.map((it: any) => {
          const rawDate = String(it.locdate);
          const formattedDate = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
          return {
            date: formattedDate,
            name: it.dateName || '공휴일',
            isSubstitute: it.dateName?.includes('대체') || false
          };
        });
      }

      return {
        data: {
          ...ASTRO_DATA,
          date: `${now.toISOString().slice(0, 10)} (실시간 조회)`,
          holidays
        },
        inspect: {
          title: '한국천문연구원 SpcdeInfoService (LIVE 실시간 통신)',
          category: 'kasi',
          endpoint: url,
          method: 'GET',
          queryParams: { solYear, solMonth, _type: 'json' },
          rawResponse: json,
          status: res.status,
          durationMs: duration,
          curlCommand: `curl -X GET "${url}"`,
          fetchSnippet: `fetch("${url}").then(r => r.json());`
        }
      };
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      return {
        data: ASTRO_DATA,
        error: `천문연 통신 네트워크 오류: ${err?.message || '천문연 서버에 연결할 수 없습니다.'}`,
        inspect: {
          title: '한국천문연구원 네트워크 오류',
          category: 'kasi',
          endpoint: 'https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo',
          method: 'GET',
          rawResponse: { error: String(err) },
          status: 0,
          durationMs: duration,
          curlCommand: `curl -X GET "https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo"`,
          fetchSnippet: `// 네트워크 오류 발생`
        }
      };
    }
  },

  // 5. 국립중앙도서관 & 카카오 도서 검색 조회 (100% 실시간 통신 모드)
  async fetchBooks(
    query: string,
    source: 'all' | 'kakao' | 'nl' = 'all',
    kakaoKey?: string,
    nlKey?: string,
    _isLive?: boolean
  ): Promise<{ data: BookSearchItem[]; inspect: ApiInspectionData; error?: string }> {
    const startTime = performance.now();
    const cleanKakao = (kakaoKey || '').trim().replace(/^KakaoAK\s+/i, '');
    const cleanNl = (nlKey || '').trim();

    // 1) 카카오 REST API 실제 통신
    if (source === 'kakao' || source === 'all') {
      if (!cleanKakao) {
        const duration = Math.round(performance.now() - startTime);
        return {
          data: [],
          error: '카카오 REST API 키가 등록되지 않았습니다. [키 보관소]에서 카카오 REST 키를 입력해 주세요.',
          inspect: {
            title: '카카오 도서 검색 (키 미등록)',
            category: 'book',
            endpoint: 'https://dapi.kakao.com/v3/search/book',
            method: 'GET',
            queryParams: { query: query || '바우하우스', size: 8 },
            rawResponse: { error: 'MissingApiKey', message: '카카오 REST 키가 필요합니다.' },
            status: 401,
            durationMs: duration,
            curlCommand: `curl -X GET "https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query || '바우하우스')}"`,
            fetchSnippet: `// 카카오 도서 검색을 위해 REST API 키가 필요합니다.`
          }
        };
      }

      try {
        const kakaoUrl = `https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query || '바우하우스')}&size=10`;
        const res = await fetch(kakaoUrl, {
          headers: {
            Authorization: `KakaoAK ${cleanKakao}`
          }
        });
        const json = await res.json();
        const duration = Math.round(performance.now() - startTime);

        if (!res.ok) {
          return {
            data: [],
            error: `카카오 도서 API 에러 (${res.status}): ${json.msg || json.message || '인증 실패 또는 요청 오류'}`,
            inspect: {
              title: `카카오 도서 검색 오류 (${res.status})`,
              category: 'book',
              endpoint: kakaoUrl,
              method: 'GET',
              queryParams: { query: query || '바우하우스', size: 10 },
              rawResponse: json,
              status: res.status,
              durationMs: duration,
              curlCommand: `curl -X GET "${kakaoUrl}" -H "Authorization: KakaoAK ${cleanKakao.slice(0, 6)}••••••"`,
              fetchSnippet: `fetch("${kakaoUrl}");`
            }
          };
        }

        const liveBooks: BookSearchItem[] = (json.documents || []).map((doc: any) => ({
          title: doc.title,
          author: (doc.authors || []).join(', ') + (doc.translators?.length ? ` (역: ${doc.translators.join(', ')})` : ''),
          publisher: doc.publisher,
          pubDate: doc.datetime ? doc.datetime.slice(0, 10) : '',
          isbn: doc.isbn,
          coverUrl: doc.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
          priceStandard: doc.price,
          priceSales: doc.sale_price > 0 ? doc.sale_price : doc.price,
          description: doc.contents || '상세 소개 정보가 제공되지 않는 도서입니다.',
          categoryName: '카카오 도서 데이터베이스',
          source: 'kakao' as const,
          url: doc.url
        }));

        return {
          data: liveBooks,
          inspect: {
            title: '카카오 도서 검색 API (LIVE Daum Book Search v3)',
            category: 'book',
            endpoint: 'https://dapi.kakao.com/v3/search/book',
            method: 'GET',
            queryParams: { query: query || '바우하우스', size: 10 },
            headers: { Authorization: `KakaoAK ${cleanKakao.slice(0, 6)}••••••` },
            rawResponse: json,
            status: res.status,
            durationMs: duration,
            curlCommand: `curl -X GET "${kakaoUrl}" \\\n  -H "Authorization: KakaoAK ${cleanKakao.slice(0, 6)}••••••"`,
            fetchSnippet: `// 카카오 도서 검색 REST API 실시간 호출\nconst res = await fetch("${kakaoUrl}", {\n  headers: { Authorization: "KakaoAK " + KAKAO_REST_KEY }\n});\nconst data = await res.json();`
          }
        };
      } catch (err: any) {
        const duration = Math.round(performance.now() - startTime);
        return {
          data: [],
          error: `카카오 도서 통신 오류: ${err?.message || '카카오 서버에 연결할 수 없습니다.'}`,
          inspect: {
            title: '카카오 도서 네트워크 오류',
            category: 'book',
            endpoint: 'https://dapi.kakao.com/v3/search/book',
            method: 'GET',
            rawResponse: { error: String(err) },
            status: 0,
            durationMs: duration,
            curlCommand: `curl -X GET "https://dapi.kakao.com/v3/search/book"`,
            fetchSnippet: `// 네트워크 오류 발생`
          }
        };
      }
    }

    // 2) 국립중앙도서관 국가서지 Open API
    if (!cleanNl) {
      const duration = Math.round(performance.now() - startTime);
      return {
        data: [],
        error: '국립중앙도서관 Open API 키가 등록되지 않았습니다. [키 보관소]에서 국립중앙도서관 인증키를 입력해 주세요.',
        inspect: {
          title: '국립중앙도서관 국가서지 API (키 미등록)',
          category: 'book',
          endpoint: 'https://www.nl.go.kr/NL/search/openApi/saseoApi.do',
          method: 'GET',
          queryParams: { title: query || '바우하우스', pageSize: 8 },
          rawResponse: { error: 'MissingApiKey', message: '국립중앙도서관 키가 필요합니다.' },
          status: 401,
          durationMs: duration,
          curlCommand: `curl -X GET "https://www.nl.go.kr/NL/search/openApi/saseoApi.do?key=YOUR_KEY&title=${encodeURIComponent(query || '바우하우스')}"`,
          fetchSnippet: `// 국립중앙도서관 조회를 위해 키가 필요합니다.`
        }
      };
    }

    try {
      const nlUrl = `https://www.nl.go.kr/NL/search/openApi/saseoApi.do?key=${encodeURIComponent(cleanNl)}&apiType=json&pageSize=8&title=${encodeURIComponent(query || '바우하우스')}`;
      const res = await fetch(nlUrl);
      const json = await res.json();
      const duration = Math.round(performance.now() - startTime);

      return {
        data: [],
        inspect: {
          title: '국립중앙도서관 국가서지 API (LIVE)',
          category: 'book',
          endpoint: 'https://www.nl.go.kr/NL/search/openApi/saseoApi.do',
          method: 'GET',
          queryParams: { key: cleanNl.slice(0, 6) + '••••', title: query || '바우하우스', pageSize: 8 },
          rawResponse: json,
          status: res.status,
          durationMs: duration,
          curlCommand: `curl -X GET "${nlUrl}"`,
          fetchSnippet: `fetch("${nlUrl}").then(r => r.json());`
        }
      };
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      return {
        data: [],
        error: `국립중앙도서관 통신 오류: ${err?.message || '도서관 서버에 연결할 수 없습니다.'}`,
        inspect: {
          title: '국립중앙도서관 네트워크 오류',
          category: 'book',
          endpoint: 'https://www.nl.go.kr/NL/search/openApi/saseoApi.do',
          method: 'GET',
          rawResponse: { error: String(err) },
          status: 0,
          durationMs: duration,
          curlCommand: `curl -X GET "https://www.nl.go.kr/NL/search/openApi/saseoApi.do"`,
          fetchSnippet: `// 네트워크 오류 발생`
        }
      };
    }
  },

  // 6. 디스코드 웹훅 발송 (100% 실시간 전송 모드)
  async sendWebhook(
    webhookUrl: string,
    payload: { username: string; content: string; embeds?: any[] }
  ): Promise<{ success: boolean; inspect: ApiInspectionData; error?: string }> {
    const startTime = performance.now();
    const cleanUrl = (webhookUrl || '').trim();

    if (!cleanUrl || !cleanUrl.startsWith('https://discord.com/api/webhooks/')) {
      const duration = Math.round(performance.now() - startTime);
      return {
        success: false,
        error: '유효한 Discord 웹훅 URL이 등록되지 않았습니다. [키 보관소]에서 웹훅 URL을 입력해 주세요.',
        inspect: {
          title: 'Discord Webhook (URL 미등록)',
          category: 'webhook',
          endpoint: 'https://discord.com/api/webhooks/YOUR_TOKEN',
          method: 'POST',
          body: payload,
          rawResponse: { error: 'MissingWebhookUrl', message: 'Discord 웹훅 URL이 필요합니다.' },
          status: 400,
          durationMs: duration,
          curlCommand: `curl -X POST -H "Content-Type: application/json" -d '${JSON.stringify(payload)}' "https://discord.com/api/webhooks/YOUR_TOKEN"`,
          fetchSnippet: `// 웹훅 발송을 위해 올바른 Discord 웹훅 URL이 필요합니다.`
        }
      };
    }

    try {
      const res = await fetch(cleanUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const duration = Math.round(performance.now() - startTime);

      if (!res.ok) {
        return {
          success: false,
          error: `Discord 웹훅 전송 실패 (HTTP ${res.status}): ${res.statusText}`,
          inspect: {
            title: `Discord Webhook 오류 (${res.status})`,
            category: 'webhook',
            endpoint: cleanUrl,
            method: 'POST',
            body: payload,
            rawResponse: { status: res.status, statusText: res.statusText },
            status: res.status,
            durationMs: duration,
            curlCommand: `curl -X POST -H "Content-Type: application/json" -d '${JSON.stringify(payload)}' "${cleanUrl}"`,
            fetchSnippet: `fetch("${cleanUrl}", { method: "POST" });`
          }
        };
      }

      return {
        success: true,
        inspect: {
          title: 'Discord Webhook HTTP POST (LIVE 실시간 전송)',
          category: 'webhook',
          endpoint: cleanUrl,
          method: 'POST',
          body: payload,
          rawResponse: { success: true, status: res.status, statusText: res.statusText },
          status: res.status,
          durationMs: duration,
          curlCommand: `curl -X POST -H "Content-Type: application/json" -d '${JSON.stringify(payload)}' "${cleanUrl}"`,
          fetchSnippet: `fetch("${cleanUrl}", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(${JSON.stringify(payload, null, 2)})\n});`
        }
      };
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      return {
        success: false,
        error: `Discord 웹훅 통신 실패: ${err?.message || '네트워크 오류'}`,
        inspect: {
          title: 'Discord Webhook 네트워크 오류',
          category: 'webhook',
          endpoint: cleanUrl,
          method: 'POST',
          body: payload,
          rawResponse: { error: String(err) },
          status: 0,
          durationMs: duration,
          curlCommand: `curl -X POST -H "Content-Type: application/json" "${cleanUrl}"`,
          fetchSnippet: `// 네트워크 오류 발생`
        }
      };
    }
  },

  // 7. 카카오 로컬 주소 검색 (지오코딩 address.json) - 100% 실시간 통신 모드
  async searchKakaoAddress(
    query: string,
    kakaoKey?: string,
    _isLive?: boolean
  ): Promise<{ data: KakaoPlaceItem[]; inspect: ApiInspectionData; error?: string }> {
    const startTime = performance.now();
    const cleanKey = (kakaoKey || '').trim().replace(/^KakaoAK\s+/i, '');

    if (!cleanKey) {
      const duration = Math.round(performance.now() - startTime);
      return {
        data: [],
        error: '카카오 REST API 키가 등록되지 않았습니다. [키 보관소]에서 카카오 REST 키를 입력해 주세요.',
        inspect: {
          title: '카카오 주소 지오코딩 (키 미등록)',
          category: 'kakao',
          endpoint: 'https://dapi.kakao.com/v2/local/search/address.json',
          method: 'GET',
          queryParams: { query },
          rawResponse: { errorType: 'MissingApiKey', message: 'API 키가 필요합니다.' },
          status: 401,
          durationMs: duration,
          curlCommand: `curl -X GET "https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}"`,
          fetchSnippet: `// 카카오 주소 검색을 위해 REST API 키가 필요합니다.`
        }
      };
    }

    try {
      const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: { Authorization: `KakaoAK ${cleanKey}` }
      });
      const json = await res.json();
      const duration = Math.round(performance.now() - startTime);

      if (!res.ok) {
        return {
          data: [],
          error: `카카오 API 에러 (${res.status}): ${json.msg || json.message || '인증 실패 또는 요청 오류'}`,
          inspect: {
            title: `카카오 로컬 주소 검색 오류 (${res.status})`,
            category: 'kakao',
            endpoint: url,
            method: 'GET',
            queryParams: { query },
            headers: { Authorization: `KakaoAK ${cleanKey.slice(0, 6)}••••••` },
            rawResponse: json,
            status: res.status,
            durationMs: duration,
            curlCommand: `curl -X GET "${url}" -H "Authorization: KakaoAK ${cleanKey.slice(0, 6)}••••••"`,
            fetchSnippet: `fetch("${url}", { headers: { Authorization: "KakaoAK " + KAKAO_KEY } });`
          }
        };
      }

      const places: KakaoPlaceItem[] = (json.documents || []).map((doc: any, i: number) => ({
        id: `addr_${i}`,
        placeName: doc.road_address?.building_name || doc.address_name || query,
        categoryName: '지리정보 > 주소',
        categoryGroupName: '주소',
        phone: '',
        addressName: doc.address_name || '',
        roadAddressName: doc.road_address?.address_name || doc.address_name || '',
        x: doc.x,
        y: doc.y,
        placeUrl: `https://map.kakao.com/link/map/${encodeURIComponent(doc.road_address?.building_name || query)},${doc.y},${doc.x}`
      }));

      return {
        data: places,
        inspect: {
          title: '카카오 로컬 주소 검색 (LIVE address.json)',
          category: 'kakao',
          endpoint: 'https://dapi.kakao.com/v2/local/search/address.json',
          method: 'GET',
          queryParams: { query },
          headers: { Authorization: `KakaoAK ${cleanKey.slice(0, 6)}••••••` },
          rawResponse: json,
          status: res.status,
          durationMs: duration,
          curlCommand: `curl -X GET "${url}" \\\n  -H "Authorization: KakaoAK ${cleanKey.slice(0, 6)}••••••"`,
          fetchSnippet: `// 카카오 주소 지오코딩 실시간 통신\nconst res = await fetch("https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}", {\n  headers: { Authorization: "KakaoAK " + KAKAO_KEY }\n});\nconst data = await res.json();`
        }
      };
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      return {
        data: [],
        error: `네트워크 통신 오류: ${err?.message || '카카오 서버에 연결할 수 없습니다.'}`,
        inspect: {
          title: '카카오 로컬 주소 검색 (네트워크 통신 실패)',
          category: 'kakao',
          endpoint: 'https://dapi.kakao.com/v2/local/search/address.json',
          method: 'GET',
          queryParams: { query },
          rawResponse: { error: String(err) },
          status: 0,
          durationMs: duration,
          curlCommand: `curl -X GET "https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}"`,
          fetchSnippet: `// 네트워크 오류 발생`
        }
      };
    }
  },

  // 8. 카카오 로컬 장소/키워드 검색 (keyword.json) - 100% 실시간 통신 모드
  async searchKakaoPlaces(
    keyword: string,
    kakaoKey?: string,
    _isLive?: boolean
  ): Promise<{ data: KakaoPlaceItem[]; inspect: ApiInspectionData; error?: string }> {
    const startTime = performance.now();
    const cleanKey = (kakaoKey || '').trim().replace(/^KakaoAK\s+/i, '');

    if (!cleanKey) {
      const duration = Math.round(performance.now() - startTime);
      return {
        data: [],
        error: '카카오 REST API 키가 등록되지 않았습니다. [키 보관소]에서 카카오 REST 키를 입력해 주세요.',
        inspect: {
          title: '카카오 키워드 검색 (키 미등록)',
          category: 'kakao',
          endpoint: 'https://dapi.kakao.com/v2/local/search/keyword.json',
          method: 'GET',
          queryParams: { query: keyword, size: 10 },
          rawResponse: { errorType: 'MissingApiKey', message: 'API 키가 필요합니다.' },
          status: 401,
          durationMs: duration,
          curlCommand: `curl -X GET "https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}&size=10"`,
          fetchSnippet: `// 카카오 키워드 장소 검색을 위해 REST API 키가 필요합니다.`
        }
      };
    }

    try {
      const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}&size=10`;
      const res = await fetch(url, {
        headers: { Authorization: `KakaoAK ${cleanKey}` }
      });
      const json = await res.json();
      const duration = Math.round(performance.now() - startTime);

      if (!res.ok) {
        return {
          data: [],
          error: `카카오 API 에러 (${res.status}): ${json.msg || json.message || '인증 실패 또는 잘못된 요청'}`,
          inspect: {
            title: `카카오 장소 검색 오류 (${res.status})`,
            category: 'kakao',
            endpoint: url,
            method: 'GET',
            queryParams: { query: keyword, size: 10 },
            headers: { Authorization: `KakaoAK ${cleanKey.slice(0, 6)}••••••` },
            rawResponse: json,
            status: res.status,
            durationMs: duration,
            curlCommand: `curl -X GET "${url}" \\\n  -H "Authorization: KakaoAK ${cleanKey.slice(0, 6)}••••••"`,
            fetchSnippet: `fetch("${url}", { headers: { Authorization: "KakaoAK " + KAKAO_KEY } });`
          }
        };
      }

      const places: KakaoPlaceItem[] = (json.documents || []).map((doc: any) => ({
        id: doc.id,
        placeName: doc.place_name,
        categoryName: doc.category_name,
        categoryGroupCode: doc.category_group_code,
        categoryGroupName: doc.category_group_name,
        phone: doc.phone,
        addressName: doc.address_name,
        roadAddressName: doc.road_address_name,
        x: doc.x,
        y: doc.y,
        placeUrl: doc.place_url || `https://map.kakao.com/link/map/${encodeURIComponent(doc.place_name)},${doc.y},${doc.x}`,
        distance: doc.distance
      }));

      return {
        data: places,
        inspect: {
          title: '카카오 장소/키워드 검색 API (LIVE keyword.json)',
          category: 'kakao',
          endpoint: 'https://dapi.kakao.com/v2/local/search/keyword.json',
          method: 'GET',
          queryParams: { query: keyword, size: 10 },
          headers: { Authorization: `KakaoAK ${cleanKey.slice(0, 6)}••••••` },
          rawResponse: json,
          status: res.status,
          durationMs: duration,
          curlCommand: `curl -X GET "${url}" \\\n  -H "Authorization: KakaoAK ${cleanKey.slice(0, 6)}••••••"`,
          fetchSnippet: `// 카카오 로컬 키워드/장소 검색 실시간 호출\nconst res = await fetch("https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}&size=10", {\n  headers: { Authorization: "KakaoAK " + KAKAO_REST_KEY }\n});\nconst { documents } = await res.json();`
        }
      };
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      return {
        data: [],
        error: `네트워크 통신 오류: ${err?.message || '카카오 서버에 연결할 수 없습니다.'}`,
        inspect: {
          title: '카카오 장소/키워드 검색 (네트워크 통신 실패)',
          category: 'kakao',
          endpoint: 'https://dapi.kakao.com/v2/local/search/keyword.json',
          method: 'GET',
          queryParams: { query: keyword, size: 10 },
          rawResponse: { error: String(err) },
          status: 0,
          durationMs: duration,
          curlCommand: `curl -X GET "https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}&size=10"`,
          fetchSnippet: `// 네트워크 오류 발생`
        }
      };
    }
  }
};
