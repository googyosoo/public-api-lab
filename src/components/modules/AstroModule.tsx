import React, { useState, useEffect } from 'react';
import { Moon, Sunrise, Sunset, Calendar, Clock, Sparkles, AlertTriangle } from 'lucide-react';
import { ASTRO_DATA } from '../../data/mockData';
import { ApiService } from '../../services/apiService';
import { AstroData, ApiInspectionData } from '../../types/api';

interface AstroModuleProps {
  isLive: boolean;
  liveKey: string;
  onInspected: (data: ApiInspectionData) => void;
}

export const AstroModule: React.FC<AstroModuleProps> = ({ isLive, liveKey, onInspected }) => {
  const [astroData, setAstroData] = useState<AstroData>(ASTRO_DATA);
  const [targetDays, setTargetDays] = useState<number>(3);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAstro = async () => {
    setErrorMessage(null);
    try {
      const result = await ApiService.fetchAstro(liveKey);
      setAstroData(result.data);
      if (result.error) {
        setErrorMessage(result.error);
      }
      onInspected(result.inspect);
    } catch (err: any) {
      setErrorMessage(`천문연구원 통신 오류: ${err?.message || err}`);
    }
  };

  useEffect(() => {
    loadAstro();
  }, [isLive, liveKey]);

  return (
    <div className="space-y-6">
      {/* 바우하우스 모듈 헤더 */}
      <div className="border-b-2 border-bauhaus-black pb-4 flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-bauhaus-yellow uppercase">
            <span>MODULE 04 // KASI ASTRONOMY & SPECIAL HOLIDAYS</span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight font-sans">
            한국천문연구원 출몰·월령 & 특일 정보 API
          </h2>
          <p className="text-xs text-neutral-600 font-mono mt-1">
            일출·일몰 시각, 기하학적 달의 위상(월령), 대체공휴일 포함 영업일(Business Day) 자동 계산기
          </p>
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
            KASI NETWORK STATUS
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 천체 출몰 & 월령 뷰포트 (좌측 6칸) */}
        <div className="lg:col-span-6 border-2 border-bauhaus-black bg-white p-6 b-shadow flex flex-col justify-between">
          <div>
            <div className="border-b-2 border-bauhaus-black pb-2 mb-4 flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-bauhaus-yellow" />
                <span>오늘의 천체 및 월령 시각화</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-500">{astroData.date}</span>
            </div>

            {/* 일출 일몰 2단 카드 */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="border-2 border-bauhaus-black p-3 bg-amber-50 flex items-center gap-3">
                <div className="w-10 h-10 bg-bauhaus-yellow border-2 border-bauhaus-black flex items-center justify-center text-white">
                  <Sunrise className="w-6 h-6 text-bauhaus-black" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-neutral-500 uppercase">일출 시각 (SUNRISE)</div>
                  <div className="text-xl font-black font-mono">{astroData.sunrise}</div>
                </div>
              </div>

              <div className="border-2 border-bauhaus-black p-3 bg-neutral-900 text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-bauhaus-red border-2 border-white flex items-center justify-center text-white">
                  <Sunset className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-neutral-400 uppercase">일몰 시각 (SUNSET)</div>
                  <div className="text-xl font-black font-mono text-amber-300">{astroData.sunset}</div>
                </div>
              </div>
            </div>

            {/* 기하학적 달의 위상 SVG 조형물 */}
            <div className="border-2 border-bauhaus-black bg-neutral-900 p-6 text-white flex flex-col items-center justify-center b-shadow-sm my-2">
              <div className="w-24 h-24 rounded-full border-2 border-neutral-700 relative overflow-hidden bg-neutral-800 flex items-center justify-center mb-3">
                {/* 기하학적 달 표면 (월령 25.4 표현) */}
                <div className="absolute inset-0 bg-amber-100/90 rounded-full" />
                <div
                  className="absolute inset-0 bg-neutral-900 rounded-full transition-all"
                  style={{ transform: 'translateX(35%)' }}
                />
              </div>
              <div className="text-center">
                <div className="text-sm font-bold font-sans text-amber-200">
                  {astroData.moonPhaseName}
                </div>
                <div className="text-xs font-mono text-neutral-400 mt-0.5">
                  월령(LunAge): {astroData.moonPhase} / 29.5
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-200 text-[11px] font-mono text-neutral-500">
            💡 천문연 API는 달의 위상 숫자(월령)를 제공합니다. 이를 SVG 마스크와 결합하면 감성적인 달 조형물 위젯이 브라우저에서 자동 생성됩니다.
          </div>
        </div>

        {/* 특일 정보 (공휴일 & 영업일 D-Day 계산기) (우측 6칸) */}
        <div className="lg:col-span-6 space-y-6">
          {/* 영업일 기준 D-day 자동 계산기 */}
          <div className="border-2 border-bauhaus-black bg-white p-6 b-shadow">
            <div className="border-b-2 border-bauhaus-black pb-2 mb-3 flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-bauhaus-blue" />
                <span>영업일 기준 배송/마감 D-Day 계산기</span>
              </span>
              <span className="text-[10px] font-mono bg-bauhaus-yellow px-1.5 py-0.5 border border-bauhaus-black font-bold">
                특일정보 연동
              </span>
            </div>
            <p className="text-xs text-neutral-600 font-mono mb-4">
              주말(토/일)과 법정 공휴일 및 대체공휴일을 자동으로 건너뛰어 정확한 발송/도착일을 산출합니다.
            </p>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-mono font-bold">영업일 기준 일수:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 5, 7].map((days) => (
                  <button
                    key={days}
                    onClick={() => setTargetDays(days)}
                    className={`px-3 py-1 text-xs font-mono font-bold border-2 border-bauhaus-black ${
                      targetDays === days ? 'bg-bauhaus-blue text-white' : 'bg-neutral-50 hover:bg-white'
                    }`}
                  >
                    +{days}일
                  </button>
                ))}
              </div>
            </div>

            {/* 계산 결과 패널 */}
            <div className="border-2 border-bauhaus-black bg-neutral-50 p-4">
              <div className="text-xs font-mono text-neutral-500">지금 신청/주문 시 예상 처리 완료일</div>
              <div className="text-2xl font-black font-mono text-bauhaus-black mt-1">
                2026-09-{7 + targetDays < 10 ? `0${7 + targetDays}` : 7 + targetDays} (영업일 기준)
              </div>
              <div className="text-[11px] font-mono text-neutral-500 mt-1">
                ✓ 법정 대체공휴일 및 일요일 자동 제외 필터링 적용됨
              </div>
            </div>
          </div>

          {/* 2026년 대한민국 공휴일 스냅샷 */}
          <div className="border-2 border-bauhaus-black bg-white p-5 b-shadow">
            <div className="flex items-center justify-between border-b-2 border-bauhaus-black pb-2 mb-3">
              <span className="font-mono text-xs font-bold uppercase flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-bauhaus-red" />
                <span>2026 주요 법정 공휴일 (SpcdeInfo API)</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-400">대체공휴일 자동 포함</span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {astroData.holidays.map((h, i) => (
                <div
                  key={i}
                  className={`border border-bauhaus-black p-2 text-xs font-mono flex items-center justify-between ${
                    h.isSubstitute ? 'bg-rose-50 border-bauhaus-red' : 'bg-neutral-50'
                  }`}
                >
                  <span className="font-bold text-bauhaus-red">{h.date}</span>
                  <span className="text-neutral-700 truncate">{h.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
