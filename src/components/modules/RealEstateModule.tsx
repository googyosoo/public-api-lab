import React, { useState, useEffect } from 'react';
import { Building2, TrendingUp, DollarSign, Calendar, MapPin, RefreshCw, BarChart3, Layers } from 'lucide-react';
import { ApiService } from '../../services/apiService';
import { AptTradeItem, ApiInspectionData } from '../../types/api';

interface RealEstateModuleProps {
  isLive: boolean;
  realestateKey: string;
  onInspected: (data: ApiInspectionData) => void;
}

export const RealEstateModule: React.FC<RealEstateModuleProps> = ({ isLive, realestateKey, onInspected }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('27230'); // 대구 북구
  const [selectedYmd, setSelectedYmd] = useState<string>('202608');
  const [trades, setTrades] = useState<AptTradeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const regions = [
    { code: '27230', name: '대구 북구 (칠곡지구)' },
    { code: '27260', name: '대구 수성구 (범어/만촌)' },
    { code: '11440', name: '서울 마포구 (공덕/아현)' },
    { code: '11680', name: '서울 강남구 (대치/개포)' }
  ];

  const months = ['202608', '202607', '202606'];

  const loadTrades = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await ApiService.fetchAptTrades(selectedRegion, selectedYmd, realestateKey);
      setTrades(result.data);
      if (result.error) {
        setErrorMessage(result.error);
      }
      onInspected(result.inspect);
    } catch (err: any) {
      setErrorMessage(`실거래가 수신 실패: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrades();
  }, [selectedRegion, selectedYmd, realestateKey]);

  // 통계 연산
  const amounts = trades.map((t) => t.dealAmount).filter((a) => a > 0);
  const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0;
  const minAmount = amounts.length > 0 ? Math.min(...amounts) : 0;
  const avgAmount = amounts.length > 0 ? Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length) : 0;

  const formatPrice = (manwon: number) => {
    if (manwon >= 10000) {
      const eok = Math.floor(manwon / 10000);
      const rest = manwon % 10000;
      return rest > 0 ? `${eok}억 ${rest.toLocaleString()}만` : `${eok}억`;
    }
    return `${manwon.toLocaleString()}만원`;
  };

  return (
    <div className="space-y-6">
      {/* 바우하우스 모듈 타이틀 헤더 */}
      <div className="border-b-2 border-bauhaus-black pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-bauhaus-green uppercase">
            <span>MODULE 10 // MOLIT APARTMENT REAL TRANSACTION PRICE API</span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight font-sans">
            국토교통부 아파트 매매 실거래가 대시보드
          </h2>
          <p className="text-xs text-neutral-600 font-mono mt-1">
            국가 부동산 거래 신고 전산망 공공데이터 기반 법정동·단지별 실거래 신고가 및 시세 분석
          </p>
        </div>

        {/* 컨트롤 패널: 지역 및 년월 선택 */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono font-bold border-2 border-bauhaus-black bg-white focus:outline-hidden"
          >
            {regions.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </select>

          <select
            value={selectedYmd}
            onChange={(e) => setSelectedYmd(e.target.value)}
            className="px-3 py-1.5 text-xs font-mono font-bold border-2 border-bauhaus-black bg-white focus:outline-hidden"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {m.slice(0, 4)}년 {m.slice(4, 6)}월
              </option>
            ))}
          </select>

          <button
            onClick={loadTrades}
            disabled={loading}
            className="p-1.5 bg-white border-2 border-bauhaus-black hover:bg-neutral-100"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 에러/안내 배너 */}
      {errorMessage && (
        <div className="bg-amber-50 border-2 border-bauhaus-black p-3 text-xs font-mono text-amber-900 b-shadow-sm flex items-center justify-between">
          <span>{errorMessage}</span>
          <span className="text-[10px] bg-amber-200 px-1.5 py-0.5 border border-bauhaus-black font-bold">PRESET FALLBACK</span>
        </div>
      )}

      {/* 상단 핵심 지표 통계 카드 (4분할) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="border-2 border-bauhaus-black bg-white p-4 b-shadow-sm">
          <div className="text-[11px] text-neutral-500 font-bold uppercase flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-bauhaus-blue" />
            <span>신고 건수</span>
          </div>
          <div className="text-2xl font-black text-bauhaus-black mt-2">
            {trades.length} <span className="text-xs font-normal">건</span>
          </div>
        </div>

        <div className="border-2 border-bauhaus-black bg-white p-4 b-shadow-sm">
          <div className="text-[11px] text-neutral-500 font-bold uppercase flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-bauhaus-red" />
            <span>월간 최고 거래가</span>
          </div>
          <div className="text-2xl font-black text-bauhaus-red mt-2">
            {maxAmount > 0 ? formatPrice(maxAmount) : '-'}
          </div>
        </div>

        <div className="border-2 border-bauhaus-black bg-white p-4 b-shadow-sm">
          <div className="text-[11px] text-neutral-500 font-bold uppercase flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>월간 최저 거래가</span>
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            {minAmount > 0 ? formatPrice(minAmount) : '-'}
          </div>
        </div>

        <div className="border-2 border-bauhaus-black bg-white p-4 b-shadow-sm">
          <div className="text-[11px] text-neutral-500 font-bold uppercase flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5 text-bauhaus-black" />
            <span>평균 실거래가</span>
          </div>
          <div className="text-2xl font-black text-bauhaus-blue mt-2">
            {avgAmount > 0 ? formatPrice(avgAmount) : '-'}
          </div>
        </div>
      </div>

      {/* 아파트 실거래가 명세 데이터 테이블 */}
      <div className="border-2 border-bauhaus-black bg-white b-shadow overflow-x-auto">
        <div className="bg-neutral-100 border-b-2 border-bauhaus-black px-4 py-2.5 flex items-center justify-between">
          <div className="font-mono text-xs font-bold uppercase flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-bauhaus-black" />
            <span>실거래 신고 내역 상세 목록 (MOLIT REAL TIME LOG)</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-500">단위: 만원 / 전용면적 ㎡</span>
        </div>

        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b-2 border-bauhaus-black bg-neutral-50 text-neutral-700 font-bold">
              <th className="p-3 border-r border-neutral-300">계약일</th>
              <th className="p-3 border-r border-neutral-300">단지명</th>
              <th className="p-3 border-r border-neutral-300">전용면적</th>
              <th className="p-3 border-r border-neutral-300">층수</th>
              <th className="p-3 border-r border-neutral-300">법정동</th>
              <th className="p-3 border-r border-neutral-300">건축년도</th>
              <th className="p-3 text-right">실거래가</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {trades.map((item, idx) => (
              <tr key={idx} className="hover:bg-amber-50/50 transition-colors">
                <td className="p-3 border-r border-neutral-200 text-neutral-600">
                  {item.dealYear}.{String(item.dealMonth).padStart(2, '0')}.{String(item.dealDay).padStart(2, '0')}
                </td>
                <td className="p-3 border-r border-neutral-200 font-bold font-sans text-bauhaus-black text-sm">
                  {item.aptName}
                </td>
                <td className="p-3 border-r border-neutral-200">
                  {item.excluUseAr.toFixed(2)}㎡ <span className="text-neutral-400">({Math.round(item.excluUseAr / 3.3)}평)</span>
                </td>
                <td className="p-3 border-r border-neutral-200">
                  {item.floor}층
                </td>
                <td className="p-3 border-r border-neutral-200 text-neutral-600">
                  {item.dong || '-'}
                </td>
                <td className="p-3 border-r border-neutral-200 text-neutral-500">
                  {item.buildYear}년
                </td>
                <td className="p-3 text-right font-black text-bauhaus-red text-sm">
                  {formatPrice(item.dealAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
