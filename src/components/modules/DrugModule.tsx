import React, { useState, useEffect } from 'react';
import { Pill, AlertTriangle, ShieldCheck, HeartPulse, Search, Info, HelpCircle } from 'lucide-react';
import { ApiService } from '../../services/apiService';
import { DrugInfoItem, ApiInspectionData } from '../../types/api';

interface DrugModuleProps {
  isLive: boolean;
  drugKey: string;
  onInspected: (data: ApiInspectionData) => void;
}

export const DrugModule: React.FC<DrugModuleProps> = ({ isLive, drugKey, onInspected }) => {
  const [searchDrugName, setSearchDrugName] = useState<string>('타이레놀');
  const [drugList, setDrugList] = useState<DrugInfoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const quickDrugs = ['타이레놀', '이지엔6', '판피린', '아스피린'];

  const loadDrug = async (name: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await ApiService.fetchDrugInfo(name, drugKey);
      setDrugList(result.data);
      if (result.error) {
        setErrorMessage(result.error);
      }
      onInspected(result.inspect);
    } catch (err: any) {
      setErrorMessage(`의약품 정보 수신 실패: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrug(searchDrugName);
  }, [drugKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchDrugName.trim()) {
      loadDrug(searchDrugName.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* 바우하우스 모듈 타이틀 헤더 */}
      <div className="border-b-2 border-bauhaus-black pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-bauhaus-yellow uppercase">
            <span>MODULE 09 // MFDS EASY DRUG SAFE USE INFORMATION</span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight font-sans">
            식품의약품안전처 e약은요 의약품 복약 백과
          </h2>
          <p className="text-xs text-neutral-600 font-mono mt-1">
            식약처 공공데이터 기반 일반·전문의약품의 효능, 용법용량, 부작용 및 복용 전 주의사항 안내
          </p>
        </div>

        {/* 상비약 퀵 셀렉터 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-mono font-bold text-neutral-500">주요 상비약:</span>
          {quickDrugs.map((d) => (
            <button
              key={d}
              onClick={() => {
                setSearchDrugName(d);
                loadDrug(d);
              }}
              className={`px-2.5 py-1 text-xs font-mono border border-bauhaus-black transition-all ${
                searchDrugName === d
                  ? 'bg-bauhaus-yellow text-bauhaus-black font-bold b-shadow-sm'
                  : 'bg-white hover:bg-neutral-100'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* 검색 바 */}
      <div className="border-2 border-bauhaus-black bg-white p-4 b-shadow-sm">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchDrugName}
              onChange={(e) => setSearchDrugName(e.target.value)}
              placeholder="약품명 또는 성분명을 입력하세요 (예: 아세트아미노펜, 이부프로펜, 판피린)..."
              className="w-full pl-9 pr-4 py-2 text-sm font-sans border-2 border-bauhaus-black bg-neutral-50 focus:bg-white focus:outline-hidden"
            />
            <Pill className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-bauhaus-yellow text-bauhaus-black text-xs font-mono font-bold border-2 border-bauhaus-black hover:bg-amber-300 transition-all flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>약품 조회</span>
          </button>
        </form>
      </div>

      {/* 에러/안내 배너 */}
      {errorMessage && (
        <div className="bg-amber-50 border-2 border-bauhaus-black p-3 text-xs font-mono text-amber-900 b-shadow-sm flex items-center justify-between">
          <span>{errorMessage}</span>
          <span className="text-[10px] bg-amber-200 px-1.5 py-0.5 border border-bauhaus-black font-bold">PRESET FALLBACK</span>
        </div>
      )}

      {/* 의약품 상세 카드 */}
      <div className="space-y-6">
        {drugList.map((drug, index) => (
          <div
            key={drug.itemSeq || index}
            className="border-2 border-bauhaus-black bg-white b-shadow overflow-hidden"
          >
            {/* 상단 약품 헤더 */}
            <div className="bg-neutral-100 border-b-2 border-bauhaus-black p-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-bauhaus-black text-white flex items-center justify-center font-bold">
                  <Pill className="w-4 h-4 text-bauhaus-yellow" />
                </div>
                <div>
                  <div className="text-[11px] font-mono text-neutral-500 font-bold">
                    제조/판매사: {drug.entpName}
                  </div>
                  <h3 className="text-xl font-black text-bauhaus-black tracking-tight font-sans">
                    {drug.itemName}
                  </h3>
                </div>
              </div>

              <div className="font-mono text-xs text-neutral-600 bg-white border border-bauhaus-black px-2.5 py-1 shrink-0 self-start md:self-auto">
                품목기준코드: <span className="font-bold text-bauhaus-black">{drug.itemSeq}</span>
              </div>
            </div>

            {/* 카드 본문 그리드 */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* 좌측: 효능효과 & 복용법 (8칸) */}
              <div className="lg:col-span-8 space-y-5">
                {/* 효능효과 */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-bauhaus-blue uppercase">
                    <ShieldCheck className="w-4 h-4" />
                    <span>이 약의 효능·효과 (Efficacy)</span>
                  </div>
                  <div className="bg-blue-50/50 border-l-4 border-bauhaus-blue p-3 text-xs text-neutral-800 font-sans leading-relaxed">
                    {drug.efcyQesitm}
                  </div>
                </div>

                {/* 용법용량 */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-bauhaus-green uppercase">
                    <HeartPulse className="w-4 h-4 text-emerald-600" />
                    <span>올바른 복용법 및 용량 (Usage & Dosage)</span>
                  </div>
                  <div className="bg-emerald-50/50 border-l-4 border-emerald-600 p-3 text-xs text-neutral-800 font-sans leading-relaxed">
                    {drug.useMethodQesitm}
                  </div>
                </div>

                {/* 주의사항 경고 (핵심 안전 정보) */}
                {drug.atpnWarnQesitm && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-bauhaus-red uppercase">
                      <AlertTriangle className="w-4 h-4" />
                      <span>복용 전 필수 주의사항 경고 (Warning)</span>
                    </div>
                    <div className="bg-red-50 border-2 border-bauhaus-red p-3 text-xs text-red-900 font-sans leading-relaxed font-bold">
                      {drug.atpnWarnQesitm}
                    </div>
                  </div>
                )}

                {/* 일반 주의사항 */}
                {drug.atpnQesitm && (
                  <div className="space-y-1 text-xs text-neutral-700 font-sans">
                    <span className="font-mono font-bold text-neutral-500">일반 주의사항: </span>
                    <span>{drug.atpnQesitm}</span>
                  </div>
                )}
              </div>

              {/* 우측: 약품 썸네일 & 보관법 (4칸) */}
              <div className="lg:col-span-4 space-y-4 border-t lg:border-t-0 lg:border-l lg:border-neutral-200 lg:pl-6 pt-4 lg:pt-0">
                {drug.itemImage && (
                  <div className="border-2 border-bauhaus-black p-2 bg-neutral-50">
                    <img
                      src={drug.itemImage}
                      alt={drug.itemName}
                      className="w-full h-40 object-cover border border-neutral-200"
                    />
                    <div className="text-[10px] font-mono text-center text-neutral-400 mt-1">
                      공공 식약처 등록 이미지
                    </div>
                  </div>
                )}

                {drug.depositMethodQesitm && (
                  <div className="border border-neutral-300 p-3 bg-neutral-50 text-xs font-mono space-y-1">
                    <div className="font-bold text-bauhaus-black flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-bauhaus-blue" />
                      <span>보관 방법</span>
                    </div>
                    <div className="text-neutral-600 text-[11px] leading-relaxed">
                      {drug.depositMethodQesitm}
                    </div>
                  </div>
                )}

                <div className="bg-neutral-100 p-3 text-[11px] font-mono text-neutral-600 border border-neutral-300">
                  ※ 본 정보는 식품의약품안전처 e약은요 공공데이터를 기반으로 제공되며, 구체적인 복약 상담은 의사 또는 약사와 상담하십시오.
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
