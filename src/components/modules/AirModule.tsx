import React, { useState, useEffect } from 'react';
import { Wind, Activity, CheckCircle, AlertCircle, ShieldCheck, Gauge } from 'lucide-react';
import { AIR_PRESETS } from '../../data/mockData';
import { ApiService } from '../../services/apiService';
import { AirQualityData, ApiInspectionData } from '../../types/api';

interface AirModuleProps {
  isLive: boolean;
  liveKey: string;
  onInspected: (data: ApiInspectionData) => void;
}

export const AirModule: React.FC<AirModuleProps> = ({ isLive, liveKey, onInspected }) => {
  const [selectedStation, setSelectedStation] = useState<string>('대구 북구 읍내동');
  const [airData, setAirData] = useState<AirQualityData>(AIR_PRESETS['대구 북구 읍내동'].data);

  const loadAir = async (station: string) => {
    const result = await ApiService.fetchAir(station, liveKey, isLive);
    setAirData(result.data);
    onInspected(result.inspect);
  };

  useEffect(() => {
    loadAir(selectedStation);
  }, [selectedStation, isLive, liveKey]);

  return (
    <div className="space-y-6">
      {/* 바우하우스 모듈 헤더 */}
      <div className="border-b-2 border-bauhaus-black pb-4 flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-bauhaus-green uppercase">
            <span>MODULE 03 // AIR KOREA REALTIME AMBIENT AIR</span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight font-sans">
            에어코리아 대기질 & 3색 미세먼지 신호등
          </h2>
          <p className="text-xs text-neutral-600 font-mono mt-1">
            환경부 측정소별 실시간 PM10·PM2.5 농도와 학교/기관 야외활동 판단 자동화 컴포넌트
          </p>
        </div>

        {/* 측정소 선택기 */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono font-bold whitespace-nowrap">측정소:</label>
          <div className="flex gap-1">
            {Object.keys(AIR_PRESETS).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStation(st)}
                className={`px-3 py-1.5 text-xs font-mono font-bold border-2 border-bauhaus-black transition-all ${
                  selectedStation === st
                    ? 'bg-bauhaus-black text-white b-shadow-sm'
                    : 'bg-white hover:bg-neutral-100 text-bauhaus-black'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2단 그리드: 바우하우스 신호등 (좌) + 야외활동 판정 배지 & 수치 (우) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3색 바우하우스 기하학 신호등 카드 (좌측 6칸) */}
        <div className="lg:col-span-6 border-2 border-bauhaus-black bg-white p-6 b-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b-2 border-bauhaus-black pb-2 mb-4">
              <span className="font-mono text-xs font-bold uppercase flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-bauhaus-blue" />
                <span>기하학 대기질 신호등</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-500">{airData.dateTime}</span>
            </div>

            {/* 신호등 본체 (원형 3개) */}
            <div className="border-2 border-bauhaus-black bg-bauhaus-black p-4 b-shadow-sm flex items-center justify-around my-6">
              {/* 1. 좋음 (Green) */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-black transition-all ${
                    airData.pm10Grade === '좋음'
                      ? 'bg-bauhaus-green ring-4 ring-emerald-400 shadow-[0_0_20px_#2D7F54]'
                      : 'bg-neutral-800 opacity-40'
                  }`}
                />
                <span className="font-mono text-[10px] text-white uppercase font-bold">좋음</span>
              </div>

              {/* 2. 보통 (Yellow) */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-black transition-all ${
                    airData.pm10Grade === '보통'
                      ? 'bg-bauhaus-yellow ring-4 ring-amber-300 shadow-[0_0_20px_#F5A623]'
                      : 'bg-neutral-800 opacity-40'
                  }`}
                />
                <span className="font-mono text-[10px] text-white uppercase font-bold">보통</span>
              </div>

              {/* 3. 나쁨/매우나쁨 (Red) */}
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-black transition-all ${
                    airData.pm10Grade === '나쁨' || airData.pm10Grade === '매우나쁨'
                      ? 'bg-bauhaus-red ring-4 ring-rose-400 shadow-[0_0_20px_#D9381E]'
                      : 'bg-neutral-800 opacity-40'
                  }`}
                />
                <span className="font-mono text-[10px] text-white uppercase font-bold">나쁨</span>
              </div>
            </div>

            <div className="text-center">
              <span className="text-xs font-mono text-neutral-500">측정소: {airData.stationName}</span>
              <div className="text-xl font-black font-sans mt-1">
                현재 대기질 상태:{' '}
                <span
                  style={{ color: airData.colorHex }}
                  className="underline underline-offset-4"
                >
                  {airData.pm10Grade}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-neutral-200 text-[11px] font-mono text-neutral-500">
            복잡한 숫자보다 3색 원형 신호등으로 변환하면 교내 디지털 게시판이나 학부모 알림창에서 인지율이 3배 상승합니다.
          </div>
        </div>

        {/* 수치 게이지 & 야외활동 판단 배지 (우측 6칸) */}
        <div className="lg:col-span-6 space-y-6">
          {/* 야외활동 판정 대형 배지 */}
          <div className="border-2 border-bauhaus-black bg-white p-6 b-shadow flex items-center justify-between">
            <div>
              <div className="text-xs font-mono font-bold text-neutral-500 uppercase">
                SCHOOL / OUTDOOR ACTIVITY STATUS
              </div>
              <h3 className="text-xl font-black font-sans mt-1">오늘 운동장 야외활동</h3>
              <p className="text-xs font-mono text-neutral-600 mt-1">
                {airData.pm10Grade === '좋음' || airData.pm10Grade === '보통'
                  ? '정상 수업 및 야외 체육 활동 가능 기준 충족'
                  : '미세먼지 기준치 초과로 체육관 실내 수업 권장'}
              </p>
            </div>
            <div
              className={`w-20 h-20 border-2 border-bauhaus-black flex flex-col items-center justify-center font-black b-shadow-sm ${
                airData.outdoorStatus === '가능'
                  ? 'bg-bauhaus-green text-white'
                  : 'bg-bauhaus-red text-white'
              }`}
            >
              <div className="text-3xl font-mono">{airData.outdoorStatus === '가능' ? '⭕' : '❌'}</div>
              <div className="text-[11px] font-mono uppercase">{airData.outdoorStatus}</div>
            </div>
          </div>

          {/* PM10 / PM2.5 상세 수치 분할 카드 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border-2 border-bauhaus-black bg-white p-4 b-shadow-sm">
              <div className="text-xs font-mono text-neutral-500 uppercase">미세먼지 (PM10)</div>
              <div className="text-4xl font-black font-mono mt-2 text-bauhaus-black">
                {airData.pm10Value} <span className="text-sm font-normal">㎍/㎥</span>
              </div>
              <div className="mt-3">
                <div className="w-full bg-neutral-200 h-2 border border-bauhaus-black">
                  <div
                    className="h-full bg-bauhaus-blue"
                    style={{ width: `${Math.min(100, (airData.pm10Value / 150) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-neutral-400 mt-1">
                  <span>0 (좋음)</span>
                  <span>80 (보통)</span>
                  <span>150+ (나쁨)</span>
                </div>
              </div>
            </div>

            <div className="border-2 border-bauhaus-black bg-white p-4 b-shadow-sm">
              <div className="text-xs font-mono text-neutral-500 uppercase">초미세먼지 (PM2.5)</div>
              <div className="text-4xl font-black font-mono mt-2 text-bauhaus-black">
                {airData.pm25Value} <span className="text-sm font-normal">㎍/㎥</span>
              </div>
              <div className="mt-3">
                <div className="w-full bg-neutral-200 h-2 border border-bauhaus-black">
                  <div
                    className="h-full bg-bauhaus-red"
                    style={{ width: `${Math.min(100, (airData.pm25Value / 75) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-mono text-neutral-400 mt-1">
                  <span>0 (좋음)</span>
                  <span>35 (보통)</span>
                  <span>75+ (나쁨)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
