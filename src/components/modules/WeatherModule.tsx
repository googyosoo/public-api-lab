import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Wind, Droplets, AlertTriangle, CheckCircle2, Calendar, MapPin, RefreshCw } from 'lucide-react';
import { WEATHER_PRESETS } from '../../data/mockData';
import { ApiService } from '../../services/apiService';
import { ParsedWeather, ApiInspectionData } from '../../types/api';

interface WeatherModuleProps {
  isLive: boolean;
  liveKey: string;
  onInspected: (data: ApiInspectionData) => void;
}

export const WeatherModule: React.FC<WeatherModuleProps> = ({ isLive, liveKey, onInspected }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('대구 북구 읍내동');
  const [weatherData, setWeatherData] = useState<ParsedWeather>(WEATHER_PRESETS['대구 북구 읍내동'].data);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadWeather = async (region: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await ApiService.fetchWeather(region, liveKey, isLive);
      setWeatherData(result.data);
      if (result.error) {
        setErrorMessage(result.error);
      }
      onInspected(result.inspect);
    } catch (err: any) {
      setErrorMessage(`기상청 통신 실패: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedRegion);
  }, [selectedRegion, isLive, liveKey]);

  return (
    <div className="space-y-6">
      {/* 바우하우스 모듈 타이틀 헤더 */}
      <div className="border-b-2 border-bauhaus-black pb-4 flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-bauhaus-blue uppercase">
            <span>MODULE 01 // KMA ULTRA SHORT RANGE FORECAST</span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight font-sans">
            기상청 단기예보 & 동네 날씨 위젯
          </h2>
          <p className="text-xs text-neutral-600 font-mono mt-1">
            공공데이터포털 격자 좌표(Nx, Ny) 기반 실시간 날씨 데이터 및 우천 시 자동 안내 컴포넌트
          </p>
        </div>

        {/* 컨트롤러: 지역 선택 */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono font-bold whitespace-nowrap">관측 지역:</label>
          <div className="flex gap-1">
            {Object.keys(WEATHER_PRESETS).map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`px-3 py-1.5 text-xs font-mono font-bold border-2 border-bauhaus-black transition-all ${
                  selectedRegion === region
                    ? 'bg-bauhaus-blue text-white b-shadow-sm'
                    : 'bg-white hover:bg-neutral-100 text-bauhaus-black'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 실시간 통신 실패 / API 키 미등록 경고 배너 */}
      {errorMessage && (
        <div className="bg-bauhaus-red text-white p-4 border-2 border-bauhaus-black b-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 font-mono text-xs md:text-sm font-bold">
            <AlertTriangle className="w-5 h-5 text-bauhaus-yellow shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <span className="text-[10px] font-mono bg-black/40 px-2 py-1 border border-white/30 uppercase self-start sm:self-auto">
            LIVE NETWORK STATUS
          </span>
        </div>
      )}

      {/* 우천 경보 배너 (API 조건부 렌더링) */}
      {weatherData.rainProb >= 60 && (
        <div className="bg-bauhaus-red text-white p-3 border-2 border-bauhaus-black b-shadow flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-2 font-mono text-xs md:text-sm font-bold">
            <AlertTriangle className="w-5 h-5 text-bauhaus-yellow" />
            <span>[우천 비상 경보] 강수확률 {weatherData.rainProb}% 감지 — 야외 행사(체육대회 등) 강당으로 긴급 전환 권장</span>
          </div>
          <span className="text-[10px] font-mono bg-black/40 px-2 py-0.5 border border-white/30 uppercase">
            TRIGGER: POP &gt;= 60%
          </span>
        </div>
      )}

      {/* 2단 그리드: 메인 날씨 카드 + 측정 파라미터 게이지 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 메인 기온 & 상태 카드 (좌측 7칸) */}
        <div className="lg:col-span-7 border-2 border-bauhaus-black bg-white p-6 b-shadow relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-500 mb-1">
                <MapPin className="w-3.5 h-3.5 text-bauhaus-red" />
                <span>{weatherData.region}</span>
              </div>
              <div className="text-6xl md:text-7xl font-black font-mono tracking-tighter text-bauhaus-black">
                {weatherData.temp}°C
              </div>
              <div className="mt-2 text-sm font-bold font-sans flex items-center gap-2">
                <span className="px-2 py-0.5 bg-neutral-100 border border-bauhaus-black text-xs font-mono">
                  하늘상태: {weatherData.sky}
                </span>
                <span className="px-2 py-0.5 bg-neutral-100 border border-bauhaus-black text-xs font-mono">
                  강수형태: {weatherData.pty}
                </span>
              </div>
            </div>

            {/* 기하학적 날씨 심볼 조형물 */}
            <div className="w-24 h-24 border-2 border-bauhaus-black bg-bauhaus-concrete flex items-center justify-center b-shadow-sm">
              {weatherData.rainProb >= 60 ? (
                <CloudRain className="w-14 h-14 text-bauhaus-blue" />
              ) : (
                <Sun className="w-14 h-14 text-bauhaus-red animate-spin" style={{ animationDuration: '20s' }} />
              )}
            </div>
          </div>

          {/* 하단 지표 3분할 칩 */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t-2 border-bauhaus-black">
            <div className="border border-bauhaus-black p-2 bg-neutral-50">
              <div className="text-[10px] font-mono text-neutral-500 uppercase flex items-center gap-1">
                <CloudRain className="w-3 h-3 text-bauhaus-blue" />
                <span>강수확률 (POP)</span>
              </div>
              <div className="text-lg font-black font-mono mt-1 text-bauhaus-blue">
                {weatherData.rainProb}%
              </div>
            </div>
            <div className="border border-bauhaus-black p-2 bg-neutral-50">
              <div className="text-[10px] font-mono text-neutral-500 uppercase flex items-center gap-1">
                <Droplets className="w-3 h-3 text-bauhaus-green" />
                <span>습도 (REH)</span>
              </div>
              <div className="text-lg font-black font-mono mt-1 text-bauhaus-green">
                {weatherData.humidity}%
              </div>
            </div>
            <div className="border border-bauhaus-black p-2 bg-neutral-50">
              <div className="text-[10px] font-mono text-neutral-500 uppercase flex items-center gap-1">
                <Wind className="w-3 h-3 text-neutral-700" />
                <span>풍속 (WSD)</span>
              </div>
              <div className="text-lg font-black font-mono mt-1 text-neutral-800">
                {weatherData.windSpeed} m/s
              </div>
            </div>
          </div>
        </div>

        {/* 3일간 야외활동 추천 비교 대시보드 (우측 5칸) */}
        <div className="lg:col-span-5 border-2 border-bauhaus-black bg-white p-5 b-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b-2 border-bauhaus-black pb-2 mb-3">
              <span className="font-mono text-xs font-bold uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-bauhaus-blue" />
                <span>야외 행사 일정 비교 대시보드</span>
              </span>
              <span className="text-[10px] font-mono bg-neutral-100 px-1.5 py-0.5 border border-bauhaus-black">
                알고리즘 판정
              </span>
            </div>
            <p className="text-xs text-neutral-600 font-mono mb-4">
              예보 데이터를 바탕으로 체육대회·야외수업 등에 가장 적합한 날짜를 자동 산출합니다.
            </p>

            <div className="space-y-2.5">
              {weatherData.forecast3Days.map((fcst, i) => (
                <div
                  key={i}
                  className="border-2 border-bauhaus-black p-2.5 flex items-center justify-between bg-neutral-50 hover:bg-white transition-colors"
                >
                  <div>
                    <div className="font-mono text-xs font-bold">{fcst.dayLabel}</div>
                    <div className="text-[11px] text-neutral-500 font-mono">
                      {fcst.sky} · {fcst.temp}°C · 강수 {fcst.rainProb}%
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 border ${
                        fcst.recommendation === '최적'
                          ? 'bg-bauhaus-green text-white border-bauhaus-black'
                          : fcst.recommendation === '양호'
                          ? 'bg-bauhaus-yellow text-bauhaus-black border-bauhaus-black'
                          : 'bg-bauhaus-red text-white border-bauhaus-black'
                      }`}
                    >
                      {fcst.recommendation} ({fcst.suitableScore}점)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-200 text-[11px] font-mono text-neutral-500">
            💡 <b>API 활용 팁:</b> `fcstValue`의 T1H(기온)와 POP(강수확률)을 조합하면 날짜 추천기가 단 10줄의 자바스크립트로 완성됩니다.
          </div>
        </div>
      </div>
    </div>
  );
};
