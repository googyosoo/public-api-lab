import React, { useState, useEffect } from 'react';
import { Utensils, Calendar, Clock, BookOpen, Search, CheckCircle, AlertTriangle } from 'lucide-react';
import { NEIS_PRESETS } from '../../data/mockData';
import { ApiService } from '../../services/apiService';
import { ParsedNeisData, ApiInspectionData } from '../../types/api';

interface NeisModuleProps {
  isLive: boolean;
  liveKey: string;
  onInspected: (data: ApiInspectionData) => void;
}

export const NeisModule: React.FC<NeisModuleProps> = ({ isLive, liveKey, onInspected }) => {
  const [selectedSchool, setSelectedSchool] = useState<string>('심인고등학교');
  const [neisData, setNeisData] = useState<ParsedNeisData>(NEIS_PRESETS['심인고등학교'].data);
  const [activeSubTab, setActiveSubTab] = useState<'meal' | 'schedule' | 'timetable'>('meal');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadNeis = async (school: string) => {
    setErrorMessage(null);
    try {
      const result = await ApiService.fetchNeis(school, liveKey, isLive);
      setNeisData(result.data);
      if (result.error) {
        setErrorMessage(result.error);
      }
      onInspected(result.inspect);
    } catch (err: any) {
      setErrorMessage(`나이스 통신 실패: ${err?.message || err}`);
    }
  };

  useEffect(() => {
    loadNeis(selectedSchool);
  }, [selectedSchool, isLive, liveKey]);

  return (
    <div className="space-y-6">
      {/* 바우하우스 모듈 헤더 */}
      <div className="border-b-2 border-bauhaus-black pb-4 flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-bauhaus-blue uppercase">
            <span>MODULE 02 // NEIS OPEN EDUCATION PORTAL</span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight font-sans">
            나이스 교육정보 개방 포털 (급식·학사·시간표)
          </h2>
          <p className="text-xs text-neutral-600 font-mono mt-1">
            학교코드(SD_SCHUL_CODE)와 교육청코드(ATPT_OFCDC_SC_CODE)를 통한 실시간 학교 데이터 연동
          </p>
        </div>

        {/* 학교 선택기 */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono font-bold whitespace-nowrap">대상 학교:</label>
          <div className="flex gap-1">
            {Object.keys(NEIS_PRESETS).map((school) => (
              <button
                key={school}
                onClick={() => setSelectedSchool(school)}
                className={`px-3 py-1.5 text-xs font-mono font-bold border-2 border-bauhaus-black transition-all ${
                  selectedSchool === school
                    ? 'bg-bauhaus-black text-white b-shadow-sm'
                    : 'bg-white hover:bg-neutral-100 text-bauhaus-black'
                }`}
              >
                {school}
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
            NEIS NETWORK STATUS
          </span>
        </div>
      )}

      {/* 내부 기능 서브 탭 (급식 / 학사일정 / 시간표) */}
      <div className="flex border-2 border-bauhaus-black bg-white b-shadow-sm">
        <button
          onClick={() => setActiveSubTab('meal')}
          className={`flex-1 py-2.5 text-xs font-mono font-bold flex items-center justify-center gap-2 border-r-2 border-bauhaus-black transition-colors ${
            activeSubTab === 'meal' ? 'bg-bauhaus-yellow text-bauhaus-black' : 'hover:bg-neutral-50'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>🍚 오늘의 급식 위젯</span>
        </button>
        <button
          onClick={() => setActiveSubTab('schedule')}
          className={`flex-1 py-2.5 text-xs font-mono font-bold flex items-center justify-center gap-2 border-r-2 border-bauhaus-black transition-colors ${
            activeSubTab === 'schedule' ? 'bg-bauhaus-yellow text-bauhaus-black' : 'hover:bg-neutral-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>📅 학사일정 캘린더</span>
        </button>
        <button
          onClick={() => setActiveSubTab('timetable')}
          className={`flex-1 py-2.5 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors ${
            activeSubTab === 'timetable' ? 'bg-bauhaus-yellow text-bauhaus-black' : 'hover:bg-neutral-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>⏰ 우리 반 시간표</span>
        </button>
      </div>

      {/* 1. 급식 식단 뷰 */}
      {activeSubTab === 'meal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 식단 상세 (좌측 7칸) */}
          <div className="lg:col-span-7 border-2 border-bauhaus-black bg-white p-6 b-shadow">
            <div className="flex items-center justify-between border-b-2 border-bauhaus-black pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono bg-bauhaus-blue text-white px-1.5 py-0.5 font-bold uppercase">
                  MEAL INFO
                </span>
                <h3 className="text-xl font-black font-sans mt-1">{neisData.todayMeal.mealType}</h3>
                <span className="text-xs font-mono text-neutral-500">{neisData.todayMeal.date} 기준</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black font-mono text-bauhaus-red">
                  {neisData.todayMeal.calories}
                </div>
                <div className="text-[10px] font-mono text-neutral-400">기준 열량</div>
              </div>
            </div>

            {/* 식단 요리 리스트 */}
            <div className="space-y-2 mb-6">
              {neisData.todayMeal.dishes.map((dish, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-neutral-200 py-1.5 text-sm font-sans"
                >
                  <div className="flex items-center gap-2 font-bold">
                    <span className="w-5 h-5 bg-neutral-100 border border-bauhaus-black text-[11px] font-mono flex items-center justify-center">
                      0{i + 1}
                    </span>
                    <span>{dish}</span>
                  </div>
                  <span className="text-xs font-mono text-neutral-400">식재료 검수완료</span>
                </div>
              ))}
            </div>

            {/* 영양 정보 분해 바 */}
            <div className="border-t-2 border-bauhaus-black pt-4">
              <span className="text-xs font-mono font-bold uppercase mb-2 block text-neutral-700">
                주요 영양 성분 구성비 (NTR_INFO)
              </span>
              <div className="grid grid-cols-4 gap-2">
                {neisData.todayMeal.nutrients.map((n, i) => (
                  <div key={i} className="border border-bauhaus-black p-2 bg-neutral-50 text-center">
                    <div className="text-[10px] font-mono text-neutral-500">{n.name}</div>
                    <div className="text-xs font-bold font-mono text-bauhaus-black mt-0.5">{n.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 원산지 및 발급 정보 (우측 5칸) */}
          <div className="lg:col-span-5 border-2 border-bauhaus-black bg-white p-5 b-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 border-b-2 border-bauhaus-black pb-2 mb-3">
                <CheckCircle className="w-4 h-4 text-bauhaus-green" />
                <span className="font-mono text-xs font-bold uppercase">주요 식자재 원산지 표기</span>
              </div>
              <div className="space-y-2">
                {neisData.todayMeal.origin.map((org, i) => (
                  <div key={i} className="flex justify-between text-xs font-mono border-b border-neutral-100 py-1">
                    <span className="text-neutral-600">{org.ingredient}</span>
                    <span className="font-bold text-bauhaus-blue">{org.country}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 border-2 border-bauhaus-black p-3 bg-bauhaus-concrete">
              <div className="font-mono text-xs font-bold mb-1">💡 프론트엔드 연동 팁:</div>
              <p className="text-[11px] font-mono text-neutral-600 leading-relaxed">
                나이스 급식 API는 요리명이 `&lt;br/&gt;`로 연결된 문자열 형태로 옵니다. 이를 `.split("&lt;br/&gt;")`로 쪼개기만 하면 위와 같은 멋진 카드 목록이 완성됩니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. 학사일정 캘린더 뷰 */}
      {activeSubTab === 'schedule' && (
        <div className="border-2 border-bauhaus-black bg-white p-6 b-shadow">
          <div className="border-b-2 border-bauhaus-black pb-3 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black font-sans">2026학년도 2학기 주요 학사일정</h3>
              <span className="text-xs font-mono text-neutral-500">SchoolSchedule API 자동 동기화</span>
            </div>
          </div>

          <div className="space-y-3">
            {neisData.weeklySchedules.map((sch, i) => (
              <div
                key={i}
                className={`border-2 border-bauhaus-black p-3 flex items-center justify-between ${
                  sch.isHoliday ? 'bg-amber-50' : 'bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="font-mono text-xs font-bold px-2 py-1 bg-white border border-bauhaus-black">
                    {sch.date}
                  </div>
                  <div>
                    <div className="font-bold text-sm font-sans">{sch.eventName}</div>
                    <div className="text-[11px] font-mono text-neutral-500">대상: {sch.gradeTarget}</div>
                  </div>
                </div>
                <div>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 border ${
                      sch.isHoliday
                        ? 'bg-bauhaus-red text-white border-bauhaus-black'
                        : 'bg-white text-bauhaus-black border-bauhaus-black'
                    }`}
                  >
                    {sch.isHoliday ? '휴업일' : '학사일정'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. 시간표 조회 뷰 */}
      {activeSubTab === 'timetable' && (
        <div className="border-2 border-bauhaus-black bg-white p-6 b-shadow">
          <div className="border-b-2 border-bauhaus-black pb-3 mb-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black font-sans">
                  오늘의 시간표 ({neisData.timetableClass || '학급 시간표'})
                </h3>
                <span className="text-xs font-mono bg-bauhaus-yellow text-bauhaus-black px-2 py-0.5 border border-bauhaus-black font-bold">
                  {neisData.timetableClass} 공식 편성
                </span>
              </div>
              <span className="text-xs font-mono text-neutral-500">
                나이스 {selectedSchool.includes('초등') ? '초등학교 시간표 (elsTimetable)' : '고등학교 시간표 (hisTimetable)'} API 연동
              </span>
            </div>
            <span className="text-xs font-mono bg-neutral-100 px-2 py-0.5 border border-bauhaus-black font-bold">
              총 {neisData.timetable.length}교시 편성
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {neisData.timetable.map((t) => (
              <div key={t.period} className="border-2 border-bauhaus-black p-3 bg-neutral-50 text-center">
                <div className="text-[10px] font-mono text-neutral-500 bg-white border border-bauhaus-black py-0.5 mb-2 font-bold">
                  {t.period}교시
                </div>
                <div className="font-bold text-sm font-sans text-bauhaus-black">{t.subject}</div>
                <div className="text-[10px] font-mono text-neutral-400 mt-1">{t.teacher}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
