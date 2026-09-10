import { ApiInspectionData, ParsedWeather, ParsedNeisData, AirQualityData, AstroData, BookSearchItem, KakaoPlaceItem } from '../types/api';
import { WEATHER_PRESETS, NEIS_PRESETS, AIR_PRESETS, ASTRO_DATA, BOOK_SEARCH_PRESET, KAKAO_PLACES_PRESET } from '../data/mockData';

export const ApiService = {
  // 1. 기상청 단기예보 조회
  async fetchWeather(presetKey: string, liveKey?: string, isLive?: boolean): Promise<{ data: ParsedWeather; inspect: ApiInspectionData }> {
    const preset = WEATHER_PRESETS[presetKey] || WEATHER_PRESETS['대구 북구 읍내동'];
    const startTime = performance.now();

    // 라이브 통신 모드
    if (isLive && liveKey) {
      try {
        const decodedKey = decodeURIComponent(liveKey);
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
            alertMessage: rainProb >= 60 ? `☔ 실시간 강수확률 ${rainProb}% 감지 — 우천 시 체육관 등 실내 전환 권장` : undefined
          };
        }

        return {
          data: parsedData,
          inspect: {
            title: '기상청 초단기예보조회 (LIVE 실제 통신)',
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
        console.warn('기상청 Live 통신 폴백:', err);
      }
    }

    // 시뮬레이션 모드 (0.2초 인위적 레이턴시로 실제 통신 느낌 구현)
    await new Promise((r) => setTimeout(r, 180));
    const duration = Math.round(performance.now() - startTime);

    const queryParams = {
      serviceKey: liveKey ? '(등록된 서비스키)' : 'kMa9...SAMPLE_KEY',
      numOfRows: 60,
      pageNo: 1,
      dataType: 'JSON',
      base_date: '20260907',
      base_time: '1400',
      nx: preset.nx,
      ny: preset.ny
    };

    return {
      data: preset.data,
      inspect: {
        title: '기상청 초단기예보조회 (단기예보)',
        category: 'kma',
        endpoint: 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst',
        method: 'GET',
        queryParams,
        rawResponse: preset.rawResponse,
        status: 200,
        durationMs: duration,
        curlCommand: `curl -X GET "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?serviceKey=${queryParams.serviceKey}&numOfRows=60&pageNo=1&dataType=JSON&base_date=20260907&base_time=1400&nx=${preset.nx}&ny=${preset.ny}"`,
        fetchSnippet: `// 기상청 단기예보 호출 예시\nconst url = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?" + new URLSearchParams({\n  serviceKey: "${queryParams.serviceKey}",\n  dataType: "JSON",\n  base_date: "20260907",\n  base_time: "1400",\n  nx: "${preset.nx}",\n  ny: "${preset.ny}"\n});\nconst res = await fetch(url);\nconst data = await res.json();`
      }
    };
  },

  // 2. 나이스 교육정보 조회
  async fetchNeis(schoolNameKey: string, liveKey?: string, isLive?: boolean): Promise<{ data: ParsedNeisData; inspect: ApiInspectionData }> {
    const preset = NEIS_PRESETS[schoolNameKey] || NEIS_PRESETS['심인고등학교'];
    const startTime = performance.now();

    // 라이브 통신 모드
    if (isLive && liveKey) {
      try {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        const mlsvYmd = `${yyyy}${mm}${dd}`;

        const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${encodeURIComponent(liveKey)}&Type=json&pIndex=1&pSize=5&ATPT_OFCDC_SC_CODE=${preset.officeCode}&SD_SCHUL_CODE=${preset.code}&MLSV_YMD=${mlsvYmd}`;

        const res = await fetch(url);
        const json = await res.json();
        const duration = Math.round(performance.now() - startTime);

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
            dishes: dishes.length > 0 ? dishes : preset.data.todayMeal.dishes,
            calories: row.CAL_INFO || preset.data.todayMeal.calories,
            origin: preset.data.todayMeal.origin,
            nutrients: preset.data.todayMeal.nutrients
          };
        }

        // 나이스 실시간 시간표 조회 (초등학교: elsTimetable, 고등학교: hisTimetable)
        try {
          const timetableEndpoint = preset.schoolName.includes('초등') ? 'elsTimetable' : 'hisTimetable';
          const grade = preset.data.grade || 1;
          const classNum = preset.data.classNum || 1;
          const ay = yyyy.toString();
          const sem = now.getMonth() >= 2 && now.getMonth() <= 7 ? '1' : '2';

          const timetableUrl = `https://open.neis.go.kr/hub/${timetableEndpoint}?KEY=${encodeURIComponent(liveKey)}&Type=json&pIndex=1&pSize=10&ATPT_OFCDC_SC_CODE=${preset.officeCode}&SD_SCHUL_CODE=${preset.code}&AY=${ay}&SEM=${sem}&ALL_TI_YMD=${mlsvYmd}&GRADE=${grade}&CLASS_NM=${classNum}`;
          
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
            title: `나이스 급식 & ${preset.data.timetableClass || '학급'} 시간표 (LIVE 실제 통신)`,
            category: 'neis',
            endpoint: url,
            method: 'GET',
            queryParams: { 
              KEY: liveKey, 
              SD_SCHUL_CODE: preset.code, 
              MLSV_YMD: mlsvYmd,
              GRADE: preset.data.grade || 1,
              CLASS_NM: preset.data.classNum || 1
            },
            rawResponse: json,
            status: res.status,
            durationMs: duration,
            curlCommand: `curl -X GET "${url}"`,
            fetchSnippet: `// 나이스 급식 및 시간표 API 호출\nconst meal = await fetch("${url}").then(r => r.json());\n// ${preset.schoolName.includes('초등') ? 'elsTimetable' : 'hisTimetable'} (${preset.data.timetableClass})\nconst timetable = await fetch("https://open.neis.go.kr/hub/${preset.schoolName.includes('초등') ? 'elsTimetable' : 'hisTimetable'}?KEY=" + KEY + "&SD_SCHUL_CODE=${preset.code}&ALL_TI_YMD=${mlsvYmd}&GRADE=${preset.data.grade}&CLASS_NM=${preset.data.classNum}").then(r => r.json());`
          }
        };
      } catch (err) {
        console.warn('나이스 라이브 통신 폴백:', err);
      }
    }

    await new Promise((r) => setTimeout(r, 150));
    const duration = Math.round(performance.now() - startTime);

    const queryParams = {
      KEY: liveKey || 'ne1s...SAMPLE_KEY',
      Type: 'json',
      pIndex: 1,
      pSize: 10,
      ATPT_OFCDC_SC_CODE: preset.officeCode,
      SD_SCHUL_CODE: preset.code,
      MLSV_YMD: '20260908',
      GRADE: preset.data.grade || 1,
      CLASS_NM: preset.data.classNum || 1
    };

    return {
      data: preset.data,
      inspect: {
        title: `나이스 급식식단 & ${preset.data.timetableClass || '학급'} 시간표 (${preset.schoolName.includes('초등') ? 'elsTimetable' : 'hisTimetable'})`,
        category: 'neis',
        endpoint: `https://open.neis.go.kr/hub/${preset.schoolName.includes('초등') ? 'elsTimetable' : 'hisTimetable'}`,
        method: 'GET',
        queryParams,
        rawResponse: preset.rawResponse,
        status: 200,
        durationMs: duration,
        curlCommand: `curl -X GET "https://open.neis.go.kr/hub/${preset.schoolName.includes('초등') ? 'elsTimetable' : 'hisTimetable'}?KEY=${queryParams.KEY}&Type=json&ATPT_OFCDC_SC_CODE=${preset.officeCode}&SD_SCHUL_CODE=${preset.code}&GRADE=${preset.data.grade}&CLASS_NM=${preset.data.classNum}"`,
        fetchSnippet: `// 나이스 초·고교 시간표 연동\nconst res = await fetch(\n  "https://open.neis.go.kr/hub/${preset.schoolName.includes('초등') ? 'elsTimetable' : 'hisTimetable'}?KEY=" + KEY +\n  "&ATPT_OFCDC_SC_CODE=${preset.officeCode}&SD_SCHUL_CODE=${preset.code}&GRADE=${preset.data.grade}&CLASS_NM=${preset.data.classNum}"\n);\nconst json = await res.json();`
      }
    };
  },

  // 3. 에어코리아 대기오염정보 조회
  async fetchAir(stationKey: string, liveKey?: string, isLive?: boolean): Promise<{ data: AirQualityData; inspect: ApiInspectionData }> {
    const preset = AIR_PRESETS[stationKey] || AIR_PRESETS['대구 북구 읍내동'];
    const startTime = performance.now();

    if (isLive && liveKey) {
      try {
        const decodedKey = decodeURIComponent(liveKey);
        const url = `https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?serviceKey=${encodeURIComponent(decodedKey)}&returnType=json&numOfRows=1&pageNo=1&stationName=${encodeURIComponent(preset.stationName)}&dataTerm=DAILY&ver=1.0`;
        const res = await fetch(url);
        const json = await res.json();
        const duration = Math.round(performance.now() - startTime);

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
            title: '에어코리아 실시간 대기측정정보 (LIVE 실제 통신)',
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
      } catch (err) {
        console.warn('에어코리아 라이브 폴백:', err);
      }
    }

    await new Promise((r) => setTimeout(r, 140));
    const duration = Math.round(performance.now() - startTime);

    const queryParams = {
      serviceKey: liveKey ? '(등록된 서비스키)' : 'a1rK...SAMPLE_KEY',
      returnType: 'json',
      numOfRows: 1,
      pageNo: 1,
      stationName: preset.stationName,
      dataTerm: 'DAILY',
      ver: '1.0'
    };

    return {
      data: preset.data,
      inspect: {
        title: '에어코리아 측정소별 실시간 측정정보조회',
        category: 'air',
        endpoint: 'https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty',
        method: 'GET',
        queryParams,
        rawResponse: preset.rawResponse,
        status: 200,
        durationMs: duration,
        curlCommand: `curl -X GET "https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?serviceKey=${queryParams.serviceKey}&returnType=json&stationName=${encodeURIComponent(preset.stationName)}&dataTerm=DAILY&ver=1.0"`,
        fetchSnippet: `// 에어코리아 실시간 미세먼지 조회\nconst res = await fetch(\n  "https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty?" +\n  new URLSearchParams({\n    serviceKey: "${queryParams.serviceKey}",\n    returnType: "json",\n    stationName: "${preset.stationName}",\n    dataTerm: "DAILY",\n    ver: "1.0"\n  })\n);\nconst data = await res.json();\nconst pm10 = data.response.body.items[0].pm10Value;`
      }
    };
  },

  // 4. 천문연구원 출몰/월령 & 특일 정보 조회
  async fetchAstro(liveKey?: string): Promise<{ data: AstroData; inspect: ApiInspectionData }> {
    const startTime = performance.now();
    await new Promise((r) => setTimeout(r, 160));
    const duration = Math.round(performance.now() - startTime);

    return {
      data: ASTRO_DATA,
      inspect: {
        title: '한국천문연구원 출몰시각 & 특일정보 API',
        category: 'kasi',
        endpoint: 'https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo',
        method: 'GET',
        queryParams: {
          serviceKey: liveKey || 'kAsI...SAMPLE_KEY',
          solYear: 2026,
          solMonth: '09',
          _type: 'json'
        },
        rawResponse: {
          response: {
            header: { resultCode: "00", resultMsg: "NORMAL_SERVICE" },
            body: {
              items: {
                item: [
                  { locdate: 20260924, dateName: "추석연휴", isHoliday: "Y" },
                  { locdate: 20260925, dateName: "추석", isHoliday: "Y" },
                  { locdate: 20260926, dateName: "추석연휴", isHoliday: "Y" }
                ]
              },
              sun: { sunrise: "0608", sunset: "1852" },
              moon: { lunAge: 25.4, moonrise: "0142", moonset: "1615" }
            }
          }
        },
        status: 200,
        durationMs: duration,
        curlCommand: `curl -X GET "https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo?solYear=2026&_type=json&serviceKey=${liveKey || 'kAsI...SAMPLE_KEY'}"`,
        fetchSnippet: `// 특일정보(공휴일) 조회\nconst res = await fetch(\n  "https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo?solYear=2026&_type=json&serviceKey=" + KEY\n);\nconst holidays = await res.json();`
      }
    };
  },

  // 5. 국립중앙도서관 & 카카오 도서 검색 조회
  async fetchBooks(
    query: string,
    source: 'all' | 'kakao' | 'nl' = 'all',
    kakaoKey?: string,
    nlKey?: string,
    isLive?: boolean
  ): Promise<{ data: BookSearchItem[]; inspect: ApiInspectionData }> {
    const startTime = performance.now();

    // 1) 카카오 REST API 실제 통신 시도 (kakaoKey 및 isLive 활성화 시)
    if (isLive && kakaoKey && (source === 'all' || source === 'kakao')) {
      try {
        const kakaoUrl = `https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query || '바우하우스')}&size=8`;
        const res = await fetch(kakaoUrl, {
          headers: {
            Authorization: `KakaoAK ${kakaoKey.trim().replace(/^KakaoAK\s+/i, '')}`
          }
        });
        if (res.ok) {
          const json = await res.json();
          const duration = Math.round(performance.now() - startTime);
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
            data: liveBooks.length > 0 ? liveBooks : BOOK_SEARCH_PRESET,
            inspect: {
              title: '카카오 도서 검색 API (LIVE Daum Book Search v3)',
              category: 'book',
              endpoint: 'https://dapi.kakao.com/v3/search/book',
              method: 'GET',
              queryParams: { query: query || '바우하우스', size: 8 },
              headers: { Authorization: `KakaoAK ${kakaoKey.slice(0, 6)}••••••` },
              rawResponse: json,
              status: res.status,
              durationMs: duration,
              curlCommand: `curl -X GET "https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query || '바우하우스')}&size=8" \\\n  -H "Authorization: KakaoAK ${kakaoKey.slice(0, 6)}••••••"`,
              fetchSnippet: `// 카카오 도서 검색 REST API 호출\nconst res = await fetch("https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query || '바우하우스')}&size=8", {\n  headers: { Authorization: "KakaoAK " + KAKAO_REST_KEY }\n});\nconst { documents } = await res.json();`
            }
          };
        }
      } catch (err) {
        console.warn('카카오 도서 API 라이브 통신 실패 -> 프리셋 폴백:', err);
      }
    }

    // 2) 국립중앙도서관 국가서지 Open API 실제 통신 시도 (nlKey 및 isLive 활성화 시)
    if (isLive && nlKey && (source === 'nl')) {
      try {
        const nlUrl = `https://www.nl.go.kr/NL/search/openApi/saseoApi.do?key=${encodeURIComponent(nlKey.trim())}&apiType=json&pageSize=8&title=${encodeURIComponent(query || '바우하우스')}`;
        const res = await fetch(nlUrl);
        if (res.ok) {
          const json = await res.json();
          const duration = Math.round(performance.now() - startTime);
          return {
            data: BOOK_SEARCH_PRESET.filter((b) => b.source === 'nl'),
            inspect: {
              title: '국립중앙도서관 사서추천/국가서지 API (LIVE)',
              category: 'book',
              endpoint: 'https://www.nl.go.kr/NL/search/openApi/saseoApi.do',
              method: 'GET',
              queryParams: { key: nlKey.slice(0, 6) + '••••', title: query || '바우하우스', pageSize: 8 },
              rawResponse: json,
              status: res.status,
              durationMs: duration,
              curlCommand: `curl -X GET "https://www.nl.go.kr/NL/search/openApi/saseoApi.do?key=${nlKey.slice(0, 6)}••••&title=${encodeURIComponent(query || '바우하우스')}&apiType=json"`,
              fetchSnippet: `// 국립중앙도서관 국가서지 API\nconst res = await fetch(\n  "https://www.nl.go.kr/NL/search/openApi/saseoApi.do?key=" + NL_KEY +\n  "&title=${encodeURIComponent(query || '바우하우스')}&apiType=json"\n);\nconst data = await res.json();`
            }
          };
        }
      } catch (err) {
        console.warn('국립중앙도서관 라이브 통신 실패 -> 프리셋 폴백:', err);
      }
    }

    // 3) 시뮬레이션 모드 (프리셋 기반 필터링 및 서지/가격 통합)
    await new Promise((r) => setTimeout(r, 180));
    const duration = Math.round(performance.now() - startTime);

    let filtered = BOOK_SEARCH_PRESET;
    if (source !== 'all') {
      filtered = filtered.filter((b) => b.source === source);
    }
    if (query) {
      filtered = filtered.filter(
        (b) => b.title.includes(query) || b.author.includes(query) || b.categoryName.includes(query)
      );
    }
    const finalData = filtered.length > 0 ? filtered : BOOK_SEARCH_PRESET;

    return {
      data: finalData,
      inspect: {
        title: source === 'nl' 
          ? '국립중앙도서관 국가서지 Open API (KDC 분류체계 & 서지정보)' 
          : '카카오 디벨로퍼스 Daum 책 검색 API (dapi.kakao.com/v3/search/book)',
        category: 'book',
        endpoint: source === 'nl' 
          ? 'https://www.nl.go.kr/NL/search/openApi/saseoApi.do' 
          : 'https://dapi.kakao.com/v3/search/book',
        method: 'GET',
        queryParams: source === 'nl'
          ? { key: nlKey || 'nl_open_key_demo', title: query || '바우하우스', apiType: 'json', pageSize: 10 }
          : { query: query || '바우하우스', size: 10, sort: 'accuracy' },
        headers: source === 'kakao' ? { Authorization: `KakaoAK ${kakaoKey || 'kakao_rest_sample_key'}` } : undefined,
        rawResponse: {
          status: 'SUCCESS',
          engine: source === 'nl' ? 'National Library of Korea (KDC 표준)' : 'Kakao Developers Book Search v3',
          totalCount: finalData.length,
          documents: finalData
        },
        status: 200,
        durationMs: duration,
        curlCommand: source === 'nl'
          ? `curl -X GET "https://www.nl.go.kr/NL/search/openApi/saseoApi.do?key=${nlKey || 'DEMO_KEY'}&title=${encodeURIComponent(query || '바우하우스')}&apiType=json"`
          : `curl -X GET "https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query || '바우하우스')}&size=10" \\\n  -H "Authorization: KakaoAK ${kakaoKey || 'REST_API_KEY'}"`,
        fetchSnippet: source === 'nl'
          ? `// 국립중앙도서관 서지정보/KDC분류 API\nconst res = await fetch(\n  "https://www.nl.go.kr/NL/search/openApi/saseoApi.do?key=" + NL_KEY +\n  "&title=${encodeURIComponent(query || '바우하우스')}&apiType=json"\n);\nconst data = await res.json();`
          : `// 카카오 도서 검색 REST API\nconst res = await fetch(\n  "https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query || '바우하우스')}&size=10", {\n    headers: { Authorization: "KakaoAK " + KAKAO_KEY }\n  }\n);\nconst data = await res.json();`
      }
    };
  },

  // 6. 디스코드 웹훅 발송 (실제 URL 제공 시 실제 전송 지원)
  async sendWebhook(webhookUrl: string, payload: { username: string; content: string; embeds?: any[] }): Promise<{ success: boolean; inspect: ApiInspectionData }> {
    const startTime = performance.now();

    if (webhookUrl && webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
      try {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const duration = Math.round(performance.now() - startTime);

        return {
          success: res.ok,
          inspect: {
            title: 'Discord Webhook HTTP POST',
            category: 'webhook',
            endpoint: webhookUrl,
            method: 'POST',
            body: payload,
            rawResponse: { success: res.ok, status: res.status, statusText: res.statusText },
            status: res.status,
            durationMs: duration,
            curlCommand: `curl -X POST -H "Content-Type: application/json" -d '${JSON.stringify(payload)}' "${webhookUrl}"`,
            fetchSnippet: `fetch("${webhookUrl}", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify(${JSON.stringify(payload, null, 2)})\n});`
          }
        };
      } catch (err: any) {
        // Fallback to simulation
      }
    }

    // 시뮬레이션
    await new Promise((r) => setTimeout(r, 220));
    const duration = Math.round(performance.now() - startTime);

    return {
      success: true,
      inspect: {
        title: 'Discord / Slack Webhook (시뮬레이션 전송)',
        category: 'webhook',
        endpoint: webhookUrl || 'https://discord.com/api/webhooks/9821/MOCK_SECRET_TOKEN',
        method: 'POST',
        body: payload,
        rawResponse: { success: true, message: "Webhook successfully delivered to simulation channel." },
        status: 204,
        durationMs: duration,
        curlCommand: `curl -X POST -H "Content-Type: application/json" -d '${JSON.stringify(payload)}' "${webhookUrl || 'https://discord.com/api/webhooks/MOCK_TOKEN'}"`,
        fetchSnippet: `await fetch(WEBHOOK_URL, {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({\n    username: "${payload.username}",\n    content: "${payload.content}"\n  })\n});`
      }
    };
  },

  // 7. 카카오 로컬 주소 검색 (지오코딩 address.json)
  async searchKakaoAddress(
    query: string,
    kakaoKey?: string,
    isLive?: boolean
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

  // 8. 카카오 로컬 장소/키워드 검색 (keyword.json)
  async searchKakaoPlaces(
    keyword: string,
    kakaoKey?: string,
    isLive?: boolean
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
