import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass, Search, ExternalLink, Phone, Building, Tag, Layers, Share2, CornerDownRight } from 'lucide-react';
import { ApiInspectionData, KakaoPlaceItem } from '../../types/api';
import { KAKAO_PLACES_PRESET } from '../../data/mockData';
import { ApiService } from '../../services/apiService';

interface KakaoModuleProps {
  isLive: boolean;
  kakaoKey: string;
  onInspected: (data: ApiInspectionData) => void;
}

export const KakaoModule: React.FC<KakaoModuleProps> = ({ isLive, kakaoKey, onInspected }) => {
  const [searchMode, setSearchMode] = useState<'keyword' | 'address'>('keyword');
  const [query, setQuery] = useState('심인고등학교');
  const [places, setPlaces] = useState<KakaoPlaceItem[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<KakaoPlaceItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 빠른 프리셋 목적지 (사용자 주요 관심 지역 및 학교)
  const quickPresets = [
    { label: '심인고등학교', query: '심인고등학교', mode: 'keyword' as const },
    { label: '대구동평초등학교', query: '대구동평초등학교', mode: 'keyword' as const },
    { label: '대구대천초등학교', query: '대구대천초등학교', mode: 'keyword' as const },
    { label: '대구 북구 읍내동', query: '대구광역시 북구 읍내동', mode: 'address' as const },
    { label: '대구 달성군 다사읍', query: '대구광역시 달성군 다사읍', mode: 'address' as const },
    { label: '경남 김해시 진영읍', query: '경상남도 김해시 진영읍', mode: 'address' as const },
  ];

  const executeSearch = async (searchTerm: string, mode: 'keyword' | 'address') => {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (mode === 'keyword') {
        const res = await ApiService.searchKakaoPlaces(searchTerm, kakaoKey, isLive);
        if (res.error) {
          setErrorMessage(res.error);
          setPlaces([]);
          setSelectedPlace(null);
        } else {
          setPlaces(res.data);
          setSelectedPlace(res.data.length > 0 ? res.data[0] : null);
          if (res.data.length === 0) {
            setErrorMessage(`"${searchTerm}"에 대한 카카오 검색 결과가 0건입니다.`);
          }
        }
        onInspected(res.inspect);
      } else {
        const res = await ApiService.searchKakaoAddress(searchTerm, kakaoKey, isLive);
        if (res.error) {
          setErrorMessage(res.error);
          setPlaces([]);
          setSelectedPlace(null);
        } else {
          setPlaces(res.data);
          setSelectedPlace(res.data.length > 0 ? res.data[0] : null);
          if (res.data.length === 0) {
            setErrorMessage(`"${searchTerm}"에 대한 카카오 주소 변환 결과가 없습니다.`);
          }
        }
        onInspected(res.inspect);
      }
    } catch (err: any) {
      setErrorMessage(`검색 처리 중 예기치 않은 오류: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch(query, searchMode);
  }, [isLive, kakaoKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query, searchMode);
  };

  const handleSelectPreset = (p: typeof quickPresets[0]) => {
    setSearchMode(p.mode);
    setQuery(p.query);
    executeSearch(p.query, p.mode);
  };

  const currentLat = selectedPlace ? parseFloat(selectedPlace.y) : 35.8239;
  const currentLng = selectedPlace ? parseFloat(selectedPlace.x) : 128.6083;

  // 카카오맵 길찾기 및 로드뷰 공식 링크 생성
  const kakaoMapDirectUrl = selectedPlace?.placeUrl || (selectedPlace ? `https://map.kakao.com/link/map/${encodeURIComponent(selectedPlace.placeName)},${currentLat},${currentLng}` : 'https://map.kakao.com');
  const kakaoRouteUrl = selectedPlace ? `https://map.kakao.com/link/to/${encodeURIComponent(selectedPlace.placeName)},${currentLat},${currentLng}` : 'https://map.kakao.com';
  const kakaoRoadviewUrl = `https://map.kakao.com/link/roadview/${currentLat},${currentLng}`;

  return (
    <div className="space-y-6">
      {/* 에러 경고 바우하우스 배너 (시뮬레이션 없이 실제 에러 표시) */}
      {errorMessage && (
        <div className="border-2 border-bauhaus-black bg-bauhaus-red text-white p-4 b-shadow flex items-start justify-between">
          <div>
            <div className="font-mono text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>⚠️ API CONNECTION ERROR // 실시간 통신 실패 안내</span>
            </div>
            <p className="font-sans text-sm font-bold">{errorMessage}</p>
            <p className="font-mono text-xs text-red-100 mt-1">
              • [키 보관소]에서 올바른 카카오 REST API 키(KakaoAK)를 등록했는지 확인해 주세요.<br/>
              • 키가 없거나 잘못되었을 경우 가짜 데이터를 조작해 보여주지 않고 있는 그대로 중단됩니다.
            </p>
          </div>
        </div>
      )}

      {/* 바우하우스 모듈 헤더 */}
      <div className="border-b-2 border-bauhaus-black pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-bauhaus-blue uppercase">
            <span>MODULE 07 // KAKAO LOCAL & MAP INTELLIGENCE</span>
            <span className="bg-[#FEE500] text-black px-1.5 py-0.5 border border-bauhaus-black text-[10px] font-bold">
              REST KEY REUSED
            </span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight font-sans mt-0.5">
            카카오 장소 검색 & 주소 좌표 변환 지도
          </h2>
          <p className="text-xs text-neutral-600 font-mono mt-1">
            기존에 등록한 <b>카카오 REST API 키 그대로</b> 주소 지오코딩뿐만 아니라 <b>장소명·상호·학교 검색 및 지도 정보</b>를 모두 조회할 수 있습니다.
          </p>
        </div>

        {/* 퀵 프리셋 버튼 */}
        <div className="flex gap-1.5 flex-wrap items-center">
          <span className="text-[10px] font-mono font-bold text-neutral-400">QUICK:</span>
          {quickPresets.map((p) => (
            <button
              key={p.label}
              onClick={() => handleSelectPreset(p)}
              className={`px-2 py-1 text-[11px] font-mono font-bold border-2 border-bauhaus-black transition-colors ${
                query === p.query ? 'bg-bauhaus-black text-white' : 'bg-white hover:bg-neutral-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 검색 바 & 모드 스위처 */}
      <div className="border-2 border-bauhaus-black p-4 bg-white b-shadow">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex border-2 border-bauhaus-black bg-neutral-100 p-0.5 b-shadow-sm">
            <button
              type="button"
              onClick={() => {
                setSearchMode('keyword');
                setQuery('심인고등학교');
                executeSearch('심인고등학교', 'keyword');
              }}
              className={`px-3 py-1.5 text-xs font-mono font-bold transition-colors flex items-center gap-1.5 ${
                searchMode === 'keyword'
                  ? 'bg-bauhaus-black text-white'
                  : 'text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>장소/키워드 검색 (keyword.json)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchMode('address');
                setQuery('대구광역시 북구 읍내동');
                executeSearch('대구광역시 북구 읍내동', 'address');
              }}
              className={`px-3 py-1.5 text-xs font-mono font-bold transition-colors flex items-center gap-1.5 ${
                searchMode === 'address'
                  ? 'bg-bauhaus-blue text-white'
                  : 'text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>도로명/지번 주소 지오코딩 (address.json)</span>
            </button>
          </div>

          {/* 검색 입력창 */}
          <form onSubmit={handleSubmit} className="flex gap-1.5 flex-1 max-w-lg">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchMode === 'keyword' ? '장소명, 상호, 학교명 검색...' : '도로명 또는 지번 주소 입력...'}
              className="flex-1 text-xs font-mono px-3 py-2 border-2 border-bauhaus-black bg-neutral-50 focus:outline-hidden focus:bg-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-bauhaus-black text-white text-xs font-mono font-bold border-2 border-bauhaus-black hover:bg-neutral-800 flex items-center gap-1.5 shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? '검색중' : '검색'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* 메인 2열 그리드: 좌측 장소 목록 & 우측 인터랙티브 지도 뷰포트 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측: 장소 목록 (5칸) */}
        <div className="lg:col-span-5 border-2 border-bauhaus-black bg-white b-shadow flex flex-col justify-between max-h-[560px]">
          <div>
            <div className="border-b-2 border-bauhaus-black p-3 bg-neutral-100 flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-bauhaus-blue" />
                <span>검색 결과 목록</span>
              </span>
              <span className="bg-bauhaus-black text-white px-2 py-0.5 text-[10px] font-mono font-bold">
                {places.length}건
              </span>
            </div>

            {/* 장소 리스트 스크롤 영역 */}
            <div className="divide-y-2 divide-neutral-200 overflow-y-auto max-h-[460px]">
              {places.length === 0 ? (
                <div className="p-8 text-center font-mono text-xs text-neutral-500">
                  <p className="font-bold text-neutral-700 mb-1">검색된 장소가 없습니다.</p>
                  <p className="text-[11px]">카카오 API 키를 확인하거나 검색어를 입력 후 검색 버튼을 눌러주세요.</p>
                </div>
              ) : (
                places.map((place, idx) => {
                  const isSelected = selectedPlace?.id === place.id;
                  return (
                    <div
                      key={`${place.id}-${idx}`}
                      onClick={() => setSelectedPlace(place)}
                      className={`p-3.5 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-amber-50 border-l-4 border-l-bauhaus-black'
                          : 'hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="w-4 h-4 rounded-full bg-bauhaus-black text-white text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <h4 className="font-bold text-sm font-sans text-bauhaus-black">
                              {place.placeName}
                            </h4>
                          </div>
                          <div className="text-[11px] font-mono text-bauhaus-blue flex items-center gap-1 mb-1">
                            <Tag className="w-2.5 h-2.5" />
                            <span>{place.categoryName || '지리/장소 정보'}</span>
                          </div>
                          <div className="text-xs font-mono text-neutral-600">
                            {place.roadAddressName || place.addressName}
                          </div>
                          {place.phone && (
                            <div className="text-[11px] font-mono text-neutral-500 flex items-center gap-1 mt-1">
                              <Phone className="w-2.5 h-2.5" />
                              <span>{place.phone}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                          {isSelected ? '선택됨 ●' : '선택'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="border-t-2 border-bauhaus-black p-2.5 bg-neutral-50 text-[11px] font-mono text-neutral-600 flex items-center justify-between">
            <span>목록을 클릭하면 오른쪽 지도 위치가 전환됩니다.</span>
            <span className="text-bauhaus-green font-bold">READY</span>
          </div>
        </div>

        {/* 우측: 바우하우스 인터랙티브 지도 뷰포트 & 장소 상세 카드 (7칸) */}
        <div className="lg:col-span-7 space-y-4">
          {/* 인터랙티브 지도 프레임 */}
          <div className="border-2 border-bauhaus-black bg-neutral-100 p-4 b-shadow flex flex-col justify-between relative overflow-hidden bauhaus-grid-bg">
            <div className="border-b-2 border-bauhaus-black pb-2 mb-3 flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-bauhaus-red" />
                <span>카카오 실시간 정밀 지도 뷰포트</span>
              </span>
              <span className="text-[10px] font-mono bg-[#FEE500] text-black px-1.5 py-0.5 border border-bauhaus-black font-bold">
                WGS84 EPSG:4326
              </span>
            </div>

            {/* 실제 카카오 지도 화면 및 기하학적 맵 디스플레이 */}
            <div className="border-2 border-bauhaus-black bg-white h-72 relative flex items-center justify-center overflow-hidden b-shadow-sm">
              {selectedPlace ? (
                <>
                  {/* 실제 카카오맵 임베드 웹 지도 */}
                  <iframe
                    title="Kakao Map View"
                    src={`https://m.map.kakao.com/actions/searchView?q=${encodeURIComponent(selectedPlace.roadAddressName || selectedPlace.placeName)}`}
                    className="w-full h-full border-0 absolute inset-0 z-0 opacity-90 hover:opacity-100 transition-opacity"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                  />

                  {/* 좌측 상단 방위계 및 축척 오버레이 */}
                  <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-xs border border-bauhaus-black px-2 py-1 text-[10px] font-mono z-10 b-shadow-sm">
                    <div className="font-bold flex items-center gap-1 text-bauhaus-red">
                      <Compass className="w-3 h-3" />
                      <span>NORTH 000°</span>
                    </div>
                    <div className="text-neutral-500">SCALE 1:5,000</div>
                  </div>

                  {/* 우측 상단 좌표 뱃지 */}
                  <div className="absolute top-2 right-2 bg-bauhaus-black text-white border border-white px-2 py-1 text-[10px] font-mono z-10 b-shadow-sm">
                    <span>LAT: {currentLat.toFixed(5)}</span>
                    <span className="mx-1">/</span>
                    <span>LNG: {currentLng.toFixed(5)}</span>
                  </div>

                  {/* 좌하단 카카오 지도 직접 열기 플로팅 버튼 */}
                  <div className="absolute bottom-2 right-2 z-10 flex gap-1">
                    <a
                      href={kakaoMapDirectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-[#FEE500] hover:bg-[#FADA0A] text-black text-xs font-mono font-bold px-2.5 py-1.5 border-2 border-bauhaus-black flex items-center gap-1 b-shadow"
                    >
                      <span>카카오맵 크게보기</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </>
              ) : (
                <div className="text-center font-mono text-xs text-neutral-400 p-6">
                  <Navigation className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <span>선택된 장소가 없습니다. 검색 후 목록에서 선택해 주세요.</span>
                </div>
              )}
            </div>

            {/* 하단 카카오 바로가기 링크 바 */}
            {selectedPlace && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="text-neutral-500 text-[11px]">
                  실제 카카오 길찾기 및 360° 로드뷰:
                </span>
                <div className="flex gap-2">
                  <a
                    href={kakaoRouteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white hover:bg-neutral-100 text-bauhaus-black font-bold px-2 py-1 border border-bauhaus-black flex items-center gap-1"
                  >
                    <CornerDownRight className="w-3 h-3 text-bauhaus-blue" />
                    <span>길찾기</span>
                  </a>
                  <a
                    href={kakaoRoadviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white hover:bg-neutral-100 text-bauhaus-black font-bold px-2 py-1 border border-bauhaus-black flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3 text-bauhaus-red" />
                    <span>거리뷰/로드뷰</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* 선택된 장소 세부 정보 바우하우스 카드 */}
          {selectedPlace && (
            <div className="border-2 border-bauhaus-black bg-white p-4 b-shadow space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <h3 className="font-bold text-base font-sans text-bauhaus-black flex items-center gap-2">
                  <Building className="w-4 h-4 text-bauhaus-blue" />
                  <span>{selectedPlace.placeName}</span>
                </h3>
                <span className="text-[11px] font-mono bg-neutral-100 px-2 py-0.5 border border-bauhaus-black">
                  {selectedPlace.categoryGroupName || '기본 정보'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="border border-neutral-200 p-2.5 bg-neutral-50">
                  <div className="text-[10px] text-neutral-400 uppercase">도로명 주소</div>
                  <div className="font-bold text-neutral-800 mt-0.5">
                    {selectedPlace.roadAddressName || selectedPlace.addressName || '정보 없음'}
                  </div>
                </div>
                <div className="border border-neutral-200 p-2.5 bg-neutral-50">
                  <div className="text-[10px] text-neutral-400 uppercase">지번 주소</div>
                  <div className="font-bold text-neutral-800 mt-0.5">
                    {selectedPlace.addressName || '정보 없음'}
                  </div>
                </div>
                <div className="border border-neutral-200 p-2.5 bg-neutral-50">
                  <div className="text-[10px] text-neutral-400 uppercase">위도 (Latitude / Y)</div>
                  <div className="font-black text-bauhaus-black text-sm mt-0.5">
                    {selectedPlace.y}
                  </div>
                </div>
                <div className="border border-neutral-200 p-2.5 bg-neutral-50">
                  <div className="text-[10px] text-neutral-400 uppercase">경도 (Longitude / X)</div>
                  <div className="font-black text-bauhaus-black text-sm mt-0.5">
                    {selectedPlace.x}
                  </div>
                </div>
              </div>

              {selectedPlace.phone && (
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-500">전화번호:</span>
                  <span className="font-bold text-bauhaus-black">{selectedPlace.phone}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
