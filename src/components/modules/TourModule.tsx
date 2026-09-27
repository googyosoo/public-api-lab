import React, { useState, useEffect } from 'react';
import { Compass, MapPin, Phone, Calendar, Search, RefreshCw, Image as ImageIcon, Sparkles } from 'lucide-react';
import { ApiService } from '../../services/apiService';
import { TourItem, ApiInspectionData } from '../../types/api';

interface TourModuleProps {
  isLive: boolean;
  tourKey: string;
  onInspected: (data: ApiInspectionData) => void;
}

export const TourModule: React.FC<TourModuleProps> = ({ isLive, tourKey, onInspected }) => {
  const [selectedArea, setSelectedArea] = useState<string>('4'); // 4: 대구
  const [selectedType, setSelectedType] = useState<string>('');   // 전체
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [tourList, setTourList] = useState<TourItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const areas = [
    { code: '4', name: '대구광역시' },
    { code: '1', name: '서울특별시' },
    { code: '6', name: '부산광역시' },
    { code: '39', name: '제주도' }
  ];

  const types = [
    { id: '', label: '전체 보기' },
    { id: '12', label: '관광지' },
    { id: '14', label: '문화시설' },
    { id: '15', label: '축제/행사' },
    { id: '39', label: '음식점' }
  ];

  const loadTours = async (keywordOverride?: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const kw = keywordOverride !== undefined ? keywordOverride : searchKeyword;
      const result = await ApiService.fetchTourList(selectedArea, selectedType, kw, tourKey);
      setTourList(result.data);
      if (result.error) {
        setErrorMessage(result.error);
      }
      onInspected(result.inspect);
    } catch (err: any) {
      setErrorMessage(`관광정보 수신 실패: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTours();
  }, [selectedArea, selectedType, tourKey]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadTours();
  };

  return (
    <div className="space-y-6">
      {/* 바우하우스 모듈 타이틀 헤더 */}
      <div className="border-b-2 border-bauhaus-black pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-bauhaus-blue uppercase">
            <span>MODULE 07 // KTO KOREA TOUR INFORMATION API 4.0</span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight font-sans">
            한국관광공사 전국 명소·축제 탐색기
          </h2>
          <p className="text-xs text-neutral-600 font-mono mt-1">
            전국 관광지·축제·문화시설·맛집의 위치와 고화질 이미지를 탐색하는 공공 여행 데이터 스테이션
          </p>
        </div>

        {/* 지역 셀렉터 버튼 그룹 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {areas.map((area) => (
            <button
              key={area.code}
              onClick={() => {
                setSelectedArea(area.code);
                setSearchKeyword('');
              }}
              className={`px-3 py-1.5 text-xs font-mono font-bold border-2 border-bauhaus-black transition-all ${
                selectedArea === area.code
                  ? 'bg-bauhaus-blue text-white b-shadow-sm'
                  : 'bg-white hover:bg-neutral-100'
              }`}
            >
              {area.name}
            </button>
          ))}
        </div>
      </div>

      {/* 검색 & 필터 바 */}
      <div className="border-2 border-bauhaus-black bg-white p-4 b-shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* 콘텐츠 타입 필터 탭 */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-2.5 py-1 text-xs font-mono font-bold border border-bauhaus-black whitespace-nowrap transition-all ${
                selectedType === t.id
                  ? 'bg-bauhaus-black text-white'
                  : 'bg-neutral-50 hover:bg-neutral-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 키워드 검색창 */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="관광지 또는 축제명 검색..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs font-mono border-2 border-bauhaus-black bg-neutral-50 focus:bg-white focus:outline-hidden"
            />
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-bauhaus-red text-white text-xs font-mono font-bold border-2 border-bauhaus-black hover:bg-red-700 transition-all"
          >
            검색
          </button>
          <button
            type="button"
            onClick={() => loadTours()}
            disabled={loading}
            className="p-1.5 bg-white border-2 border-bauhaus-black hover:bg-neutral-100"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </form>
      </div>

      {/* 안내 / 에러 메시지 */}
      {errorMessage && (
        <div className="bg-amber-50 border-2 border-bauhaus-black p-3 text-xs font-mono text-amber-900 b-shadow-sm flex items-center justify-between">
          <span>{errorMessage}</span>
          <span className="text-[10px] bg-amber-200 px-1.5 py-0.5 border border-bauhaus-black font-bold">PRESET FALLBACK</span>
        </div>
      )}

      {/* 관광 아이템 카드 그리드 (바우하우스 스타일) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tourList.map((item) => (
          <div
            key={item.contentId}
            className="border-2 border-bauhaus-black bg-white flex flex-col b-shadow hover:-translate-y-1 transition-transform overflow-hidden"
          >
            {/* 이미지 영역 */}
            <div className="h-48 border-b-2 border-bauhaus-black relative bg-neutral-100 overflow-hidden">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80';
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 font-mono text-xs">
                  <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                  <span>대표 사진 준비 중</span>
                </div>
              )}
              {/* 분류 배지 */}
              <div className="absolute top-2 left-2 bg-bauhaus-black text-white px-2 py-0.5 text-[11px] font-mono font-bold border border-white">
                {item.contentTypeName}
              </div>
              <div className="absolute top-2 right-2 bg-white text-bauhaus-black px-1.5 py-0.5 text-[10px] font-mono font-bold border border-bauhaus-black">
                ID: {item.contentId}
              </div>
            </div>

            {/* 본문 정보 */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-base font-black text-bauhaus-black tracking-tight line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-600 font-sans mt-1.5 line-clamp-2 leading-relaxed">
                  {item.overview || '문화체육관광부 한국관광공사가 보증하는 공공 추천 여행지입니다.'}
                </p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-neutral-200 font-mono text-xs text-neutral-700">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-bauhaus-red shrink-0 mt-0.5" />
                  <span className="line-clamp-1 text-[11px]">{item.address}</span>
                </div>
                {item.tel && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-bauhaus-blue shrink-0" />
                    <span className="text-[11px]">{item.tel}</span>
                  </div>
                )}
                {item.eventStartDate && (
                  <div className="flex items-center gap-1.5 text-bauhaus-red font-bold">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[11px]">축제: {item.eventStartDate} ~ {item.eventEndDate}</span>
                  </div>
                )}
              </div>

              {/* 하단 카카오맵 길찾기 링크 연동 */}
              <div className="pt-2">
                <a
                  href={`https://map.kakao.com/link/map/${encodeURIComponent(item.title)},${item.mapY},${item.mapX}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full block text-center py-1.5 bg-neutral-100 hover:bg-bauhaus-black hover:text-white border border-bauhaus-black text-xs font-mono font-bold transition-colors"
                >
                  카카오맵 위치 확인 ↗
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
