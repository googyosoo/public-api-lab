import React, { useState, useEffect, useMemo } from 'react';
import { Building2, TrendingUp, DollarSign, Calendar, MapPin, RefreshCw, BarChart3, Layers, Search, Filter, ArrowUpDown, X, Sparkles } from 'lucide-react';
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

  // 검색 및 필터링 상태
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [areaFilter, setAreaFilter] = useState<'all' | 'small' | 'medium' | 'large'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under3' | '3to6' | '6to10' | 'over10'>('all');
  const [floorFilter, setFloorFilter] = useState<'all' | 'low' | 'mid' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'price_desc' | 'price_asc' | 'area_desc' | 'year_desc'>('date_desc');

  // 전국 주요 광역/기초 자치단체 법정동 코드 목록
  const regions = [
    { group: '대구광역시', code: '27230', name: '대구 북구 (칠곡/침산/복현)' },
    { group: '대구광역시', code: '27260', name: '대구 수성구 (범어/만촌/황금)' },
    { group: '대구광역시', code: '27290', name: '대구 달서구 (월배/상인/성서)' },
    { group: '대구광역시', code: '27110', name: '대구 중구 (동성로/남산)' },
    { group: '대구광역시', code: '27140', name: '대구 동구 (신서혁신/율하/신암)' },
    { group: '서울특별시', code: '11680', name: '서울 강남구 (대치/개포/압구정)' },
    { group: '서울특별시', code: '11650', name: '서울 서초구 (반포/잠원/서초)' },
    { group: '서울특별시', code: '11710', name: '서울 송파구 (잠실/가락/문정)' },
    { group: '서울특별시', code: '11440', name: '서울 마포구 (공덕/아현/상암)' },
    { group: '서울특별시', code: '11200', name: '서울 성동구 (성수/옥수/왕십리)' },
    { group: '서울특별시', code: '11560', name: '서울 영등포구 (여의도/당산)' },
    { group: '서울특별시', code: '11350', name: '서울 노원구 (상계/중계/하계)' },
    { group: '경기/인천/부산', code: '41135', name: '경기 성남 분당구 (판교/정자)' },
    { group: '경기/인천/부산', code: '41117', name: '경기 수원 영통구 (광교)' },
    { group: '경기/인천/부산', code: '28185', name: '인천 연수구 (송도국제도시)' },
    { group: '경기/인천/부산', code: '26350', name: '부산 해운대구 (우동/좌동/센텀)' },
  ];

  // 최근 계약 년월
  const months = ['202609', '202608', '202607', '202606', '202605', '202604'];

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

  // 검색 및 필터링, 정렬 연산 (useMemo)
  const filteredTrades = useMemo(() => {
    return trades
      .filter((item) => {
        // 1. 단지명 또는 법정동 검색어 매칭
        if (searchTerm.trim()) {
          const term = searchTerm.trim().toLowerCase();
          const matchApt = item.aptName.toLowerCase().includes(term);
          const matchDong = (item.dong || '').toLowerCase().includes(term);
          if (!matchApt && !matchDong) return false;
        }

        // 2. 전용면적(평수) 필터
        if (areaFilter === 'small' && item.excluUseAr > 59.9) return false;
        if (areaFilter === 'medium' && (item.excluUseAr <= 59.9 || item.excluUseAr > 85.0)) return false;
        if (areaFilter === 'large' && item.excluUseAr <= 85.0) return false;

        // 3. 실거래가(금액) 필터 (단위: 만원)
        if (priceFilter === 'under3' && item.dealAmount > 30000) return false;
        if (priceFilter === '3to6' && (item.dealAmount <= 30000 || item.dealAmount > 60000)) return false;
        if (priceFilter === '6to10' && (item.dealAmount <= 60000 || item.dealAmount > 100000)) return false;
        if (priceFilter === 'over10' && item.dealAmount <= 100000) return false;

        // 4. 층수 필터
        if (floorFilter === 'low' && item.floor > 5) return false;
        if (floorFilter === 'mid' && (item.floor < 6 || item.floor > 15)) return false;
        if (floorFilter === 'high' && item.floor < 16) return false;

        return true;
      })
      .sort((a, b) => {
        // 5. 정렬 기준
        if (sortBy === 'date_desc') {
          return (b.dealYear * 10000 + b.dealMonth * 100 + b.dealDay) - (a.dealYear * 10000 + a.dealMonth * 100 + a.dealDay);
        }
        if (sortBy === 'price_desc') {
          return b.dealAmount - a.dealAmount;
        }
        if (sortBy === 'price_asc') {
          return a.dealAmount - b.dealAmount;
        }
        if (sortBy === 'area_desc') {
          return b.excluUseAr - a.excluUseAr;
        }
        if (sortBy === 'year_desc') {
          return b.buildYear - a.buildYear;
        }
        return 0;
      });
  }, [trades, searchTerm, areaFilter, priceFilter, floorFilter, sortBy]);

  // 필터링된 데이터 기반 통계 연산
  const amounts = filteredTrades.map((t) => t.dealAmount).filter((a) => a > 0);
  const maxAmount = amounts.length > 0 ? Math.max(...amounts) : 0;
  const minAmount = amounts.length > 0 ? Math.min(...amounts) : 0;
  const avgAmount = amounts.length > 0 ? Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length) : 0;

  const handleResetFilters = () => {
    setSearchTerm('');
    setAreaFilter('all');
    setPriceFilter('all');
    setFloorFilter('all');
    setSortBy('date_desc');
  };

  const isFilterActive = searchTerm !== '' || areaFilter !== 'all' || priceFilter !== 'all' || floorFilter !== 'all' || sortBy !== 'date_desc';

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
      {/* 모듈 타이틀 헤더 */}
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

      {/* 검색 바 & 다차원 필터링 툴바 */}
      <div className="border-2 border-bauhaus-black bg-white p-4 b-shadow space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* 아파트 단지명 및 법정동 실시간 검색창 */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="단지명 또는 법정동 검색 (예: 칠곡, 범어, 래미안, 자이, 동천동, 만촌동...)"
              className="w-full pl-9 pr-8 py-2 text-xs font-mono border-2 border-bauhaus-black bg-neutral-50 focus:bg-white focus:outline-hidden"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 정렬 순서 선택기 */}
          <div className="flex items-center gap-1.5 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-2.5 py-2 text-xs font-mono font-bold border-2 border-bauhaus-black bg-white focus:outline-hidden"
            >
              <option value="date_desc">📅 계약일 최신순</option>
              <option value="price_desc">💰 실거래가 높은순</option>
              <option value="price_asc">🏷️ 실거래가 낮은순</option>
              <option value="area_desc">📐 전용면적 넓은순</option>
              <option value="year_desc">🏗️ 건축연도 최신순</option>
            </select>
          </div>
        </div>

        {/* 2단: 전용면적, 금액대, 층수 상세 필터 칩 */}
        <div className="pt-2 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-3">
            {/* 전용면적(평형) 필터 */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-neutral-500">면적:</span>
              <div className="flex border border-bauhaus-black bg-neutral-100 p-0.5 font-bold">
                {[
                  { id: 'all', label: '전체' },
                  { id: 'small', label: '~59㎡ (~24평)' },
                  { id: 'medium', label: '59~84㎡ (25~34평)' },
                  { id: 'large', label: '84㎡+ (35평~)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setAreaFilter(f.id as any)}
                    className={`px-2 py-0.5 transition-colors ${
                      areaFilter === f.id ? 'bg-bauhaus-black text-white' : 'text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 거래 금액대 필터 */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-neutral-500">금액대:</span>
              <div className="flex border border-bauhaus-black bg-neutral-100 p-0.5 font-bold">
                {[
                  { id: 'all', label: '전체' },
                  { id: 'under3', label: '3억 이하' },
                  { id: '3to6', label: '3억~6억' },
                  { id: '6to10', label: '6억~10억' },
                  { id: 'over10', label: '10억 초과' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setPriceFilter(f.id as any)}
                    className={`px-2 py-0.5 transition-colors ${
                      priceFilter === f.id ? 'bg-bauhaus-blue text-white' : 'text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 층수 필터 */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-neutral-500">층수:</span>
              <div className="flex border border-bauhaus-black bg-neutral-100 p-0.5 font-bold">
                {[
                  { id: 'all', label: '전체' },
                  { id: 'low', label: '저층 (1~5층)' },
                  { id: 'mid', label: '중층 (6~15층)' },
                  { id: 'high', label: '고층 (16층~)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFloorFilter(f.id as any)}
                    className={`px-2 py-0.5 transition-colors ${
                      floorFilter === f.id ? 'bg-emerald-700 text-white' : 'text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 필터 초기화 버튼 */}
          {isFilterActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 border border-bauhaus-black font-bold flex items-center gap-1 text-[11px] text-bauhaus-red"
            >
              <X className="w-3 h-3" />
              <span>필터 초기화</span>
            </button>
          )}
        </div>
      </div>

      {/* 상단 핵심 지표 통계 카드 (필터링된 결과 반영) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="border-2 border-bauhaus-black bg-white p-4 b-shadow-sm">
          <div className="text-[11px] text-neutral-500 font-bold uppercase flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-bauhaus-blue" />
            <span>조회 건수</span>
          </div>
          <div className="text-2xl font-black text-bauhaus-black mt-2">
            {filteredTrades.length} <span className="text-xs font-normal text-neutral-400">/ 총 {trades.length}건</span>
          </div>
        </div>

        <div className="border-2 border-bauhaus-black bg-white p-4 b-shadow-sm">
          <div className="text-[11px] text-neutral-500 font-bold uppercase flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-bauhaus-red" />
            <span>최고 실거래가</span>
          </div>
          <div className="text-2xl font-black text-bauhaus-red mt-2">
            {maxAmount > 0 ? formatPrice(maxAmount) : '-'}
          </div>
        </div>

        <div className="border-2 border-bauhaus-black bg-white p-4 b-shadow-sm">
          <div className="text-[11px] text-neutral-500 font-bold uppercase flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            <span>최저 실거래가</span>
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
            <span>실거래 신고 내역 상세 목록 ({filteredTrades.length}건)</span>
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
            {filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center text-neutral-400 font-mono">
                  <Building2 className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="font-bold text-neutral-600 text-sm">일치하는 실거래 데이터가 없습니다.</p>
                  <p className="text-xs mt-1">검색어를 변경하거나 필터 조건을 조정해 보세요.</p>
                  {isFilterActive && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-3 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 border border-bauhaus-black text-xs font-bold"
                    >
                      필터 초기화
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filteredTrades.map((item, idx) => (
                <tr key={idx} className="hover:bg-amber-50/50 transition-colors">
                  <td className="p-3 border-r border-neutral-200 text-neutral-600 whitespace-nowrap">
                    {item.dealYear}.{String(item.dealMonth).padStart(2, '0')}.{String(item.dealDay).padStart(2, '0')}
                  </td>
                  <td className="p-3 border-r border-neutral-200 font-bold font-sans text-bauhaus-black text-sm">
                    {item.aptName}
                  </td>
                  <td className="p-3 border-r border-neutral-200 whitespace-nowrap">
                    {item.excluUseAr.toFixed(2)}㎡ <span className="text-neutral-400">({Math.round(item.excluUseAr / 3.3)}평)</span>
                  </td>
                  <td className="p-3 border-r border-neutral-200 whitespace-nowrap">
                    {item.floor}층
                  </td>
                  <td className="p-3 border-r border-neutral-200 text-neutral-600 whitespace-nowrap">
                    {item.dong || '-'}
                  </td>
                  <td className="p-3 border-r border-neutral-200 text-neutral-500 whitespace-nowrap">
                    {item.buildYear}년
                  </td>
                  <td className="p-3 text-right font-black text-bauhaus-red text-sm whitespace-nowrap">
                    {formatPrice(item.dealAmount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
