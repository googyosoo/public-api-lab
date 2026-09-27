import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Compass, Search, ExternalLink, Phone, Building, Layers, CornerDownRight, ZoomIn, ZoomOut, Crosshair } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
  const [mapLayerType, setMapLayerType] = useState<'street' | 'satellite'>('street');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // 빠른 프리셋 목적지 (사용자 주요 관심 지역 및 학교)
  const quickPresets = [
    { label: '심인고등학교', query: '심인고등학교', mode: 'keyword' as const },
    { label: '대구동평초등학교', query: '대구동평초등학교', mode: 'keyword' as const },
    { label: '대구대천초등학교', query: '대구대천초등학교', mode: 'keyword' as const },
    { label: '대구 북구 읍내동', query: '대구광역시 북구 읍내동', mode: 'address' as const },
    { label: '대구 달성군 다사읍', query: '대구광역시 달성군 다사읍', mode: 'address' as const },
    { label: '경남 김해시 진영읍', query: '경상남도 김해시 진영읍', mode: 'address' as const },
    { label: '광화문광장', query: '광화문광장', mode: 'keyword' as const },
    { label: '해운대해수욕장', query: '해운대해수욕장', mode: 'keyword' as const },
  ];

  // 1. 카카오 API 기반 실시간 장소 검색
  const executeSearch = async (searchTerm: string, mode: 'keyword' | 'address') => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      if (mode === 'keyword') {
        const res = await ApiService.searchKakaoPlaces(searchTerm, kakaoKey, isLive);
        if (res.error) {
          setErrorMessage(res.error);
          const matched = KAKAO_PLACES_PRESET.filter((p) => p.placeName.includes(searchTerm) || searchTerm.includes(p.placeName));
          const fallbackPlaces = matched.length > 0 ? matched : KAKAO_PLACES_PRESET;
          setPlaces(fallbackPlaces);
          setSelectedPlace(fallbackPlaces[0]);
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
          const matched = KAKAO_PLACES_PRESET.filter((p) => p.addressName.includes(searchTerm) || searchTerm.includes(p.addressName));
          const fallbackPlaces = matched.length > 0 ? matched : KAKAO_PLACES_PRESET;
          setPlaces(fallbackPlaces);
          setSelectedPlace(fallbackPlaces[0]);
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
      setErrorMessage(`검색 처리 중 오류: ${err?.message || err}`);
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

  // 2. 실제 인터랙티브 지도 엔진 초기화 및 갱신
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 지도 인스턴스가 없을 때 생성
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: 16,
        zoomControl: false,
      });

      // 기본 스트리트 타일 레이어
      const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      tileLayerRef.current = tileLayer;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // 지도 중심 부드럽게 이동
    map.setView([currentLat, currentLng], 16, { animate: true });

    // 기존 마커 제거 후 신규 마커 생성
    if (markerRef.current) {
      markerRef.current.remove();
    }

    if (selectedPlace) {
      // 바우하우스 감성의 커스텀 HTML 핀 마커
      const customPinHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
          <div style="padding: 4px 8px; background-color: #D9381E; color: white; font-family: monospace; font-size: 11px; font-weight: 900; border: 2px solid black; white-space: nowrap; box-shadow: 3px 3px 0px #121212; margin-bottom: 2px; display: flex; align-items: center; gap: 4px;">
            <span style="width: 8px; height: 8px; border-radius: 9999px; background-color: #F5A623; display: inline-block;"></span>
            <span>${selectedPlace.placeName}</span>
          </div>
          <div style="width: 14px; height: 14px; background-color: #D9381E; border: 2px solid black; transform: rotate(45deg); margin-top: -6px; display: flex; align-items: center; justify-content: center;">
            <div style="width: 4px; height: 4px; background-color: #F5A623; border-radius: 9999px;"></div>
          </div>
          <div style="width: 8px; height: 4px; background-color: rgba(0,0,0,0.4); border-radius: 9999px; margin-top: 2px;"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: customPinHtml,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -45],
      });

      const popupContent = `
        <div style="font-family: Pretendard, -apple-system, BlinkMacSystemFont, sans-serif; min-width: 220px; padding: 4px;">
          <div style="font-weight: 800; font-size: 14px; color: #121212; margin-bottom: 4px; border-bottom: 2px solid #121212; padding-bottom: 3px;">
            ${selectedPlace.placeName}
          </div>
          <div style="font-size: 11px; color: #444; margin-bottom: 4px; line-height: 1.4;">
            ${selectedPlace.roadAddressName || selectedPlace.addressName || '주소 정보'}
          </div>
          <div style="font-size: 10px; font-family: monospace; color: #0F4C81; margin-bottom: 8px; font-weight: bold;">
            📍 ${currentLat.toFixed(5)}°N, ${currentLng.toFixed(5)}°E
          </div>
          <a href="${selectedPlace.placeUrl || `https://map.kakao.com/link/map/${encodeURIComponent(selectedPlace.placeName)},${currentLat},${currentLng}`}" 
             target="_blank" 
             rel="noreferrer"
             style="display: block; width: 100%; text-align: center; background-color: #FEE500; color: #000; font-weight: 800; font-size: 11px; padding: 5px 0; border: 1.5px solid #000; text-decoration: none; box-shadow: 2px 2px 0px #000;">
            카카오맵에서 크게 보기 ↗
          </a>
        </div>
      `;

      const newMarker = L.marker([currentLat, currentLng], { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent, { closeButton: true })
        .openPopup();

      markerRef.current = newMarker;
    }

    // 지도 렌더링 리프레시
    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  }, [selectedPlace, currentLat, currentLng]);

  // 타일 레이어 전환 (일반 / 위성)
  const handleLayerSwitch = (type: 'street' | 'satellite') => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    setMapLayerType(type);
    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    let newTileLayer: L.TileLayer;
    if (type === 'street') {
      newTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
        subdomains: 'abcd',
      });
    } else {
      newTileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri &copy; Earthstar Geographics',
        maxZoom: 19,
      });
    }

    newTileLayer.addTo(mapInstanceRef.current);
    tileLayerRef.current = newTileLayer;
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleRecenter = () => {
    mapInstanceRef.current?.setView([currentLat, currentLng], 16, { animate: true });
    markerRef.current?.openPopup();
  };

  // 카카오맵 길찾기 및 로드뷰 공식 링크 생성
  const kakaoMapDirectUrl = selectedPlace?.placeUrl || (selectedPlace ? `https://map.kakao.com/link/map/${encodeURIComponent(selectedPlace.placeName)},${currentLat},${currentLng}` : 'https://map.kakao.com');
  const kakaoRouteUrl = selectedPlace ? `https://map.kakao.com/link/to/${encodeURIComponent(selectedPlace.placeName)},${currentLat},${currentLng}` : 'https://map.kakao.com';
  const kakaoRoadviewUrl = `https://map.kakao.com/link/roadview/${currentLat},${currentLng}`;

  return (
    <div className="space-y-6">
      {/* 에러 경고 배너 (실시간 통신 상태 안내) */}
      {errorMessage && (
        <div className="border-2 border-bauhaus-black bg-bauhaus-red text-white p-4 b-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="font-mono text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>⚠️ KAKAO LOCAL API NOTICE // 카카오 로컬 서비스 상태 안내</span>
            </div>
            <p className="font-sans text-sm font-bold">{errorMessage}</p>
            {errorMessage.includes('OPEN_MAP_AND_LOCAL') ? (
              <p className="font-mono text-xs text-amber-200 mt-1">
                👉 <b>해결 방법</b>: 카카오 디벨로퍼스 콘솔의 [내 애플리케이션] &gt; <b>[생활도구]</b> 앱 &gt; [제품 설정] &gt; <b>[지도/로컬]</b> 스위치를 <b>ON(활성화)</b>으로 변경하시면 실시간 검색이 즉시 동작합니다!
              </p>
            ) : (
              <p className="font-mono text-xs text-red-100 mt-1">
                • [키 보관소]에서 올바른 카카오 REST API 키를 등록했는지 확인해 주세요.
              </p>
            )}
          </div>
          {errorMessage.includes('OPEN_MAP_AND_LOCAL') && (
            <a
              href="https://developers.kakao.com/console"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-[#FEE500] hover:bg-yellow-400 text-black text-xs font-mono font-bold border-2 border-bauhaus-black flex items-center gap-1.5 shrink-0 b-shadow-sm"
            >
              <span>카카오 콘솔 설정 바로가기</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* 모듈 헤더 */}
      <div className="border-b-2 border-bauhaus-black pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-bauhaus-blue uppercase">
            <span>MODULE 07 // KAKAO LOCAL & REAL INTERACTIVE MAP</span>
            <span className="bg-[#FEE500] text-black px-1.5 py-0.5 border border-bauhaus-black text-[10px] font-bold">
              LIVE MAP & SEARCH
            </span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight font-sans mt-0.5">
            카카오 실시간 장소 검색 & 대화형 지도 뷰어
          </h2>
          <p className="text-xs text-neutral-600 font-mono mt-1">
            원하는 <b>장소명·학교·상호·주소</b>를 검색하면 웹페이지 내에서 <b>실제 지도로 즉시 위치를 확인하고 줌/패닝</b>할 수 있습니다.
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
              <span>도로명/지번 주소 변환 (address.json)</span>
            </button>
          </div>

          {/* 검색 입력창 */}
          <form onSubmit={handleSubmit} className="flex gap-1.5 flex-1 max-w-lg">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchMode === 'keyword' ? '장소명, 상호, 학교명, 지하철역 검색...' : '도로명 또는 지번 주소 입력...'}
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

      {/* 메인 2열 그리드: 좌측 장소 목록 & 우측 실제 인터랙티브 지도 뷰포트 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측: 장소 목록 (5칸) */}
        <div className="lg:col-span-5 border-2 border-bauhaus-black bg-white b-shadow flex flex-col justify-between max-h-[640px]">
          <div>
            <div className="border-b-2 border-bauhaus-black p-3 bg-neutral-100 flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-bauhaus-blue" />
                <span>검색 결과 목록 ({places.length}건)</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                장소를 클릭하면 지도가 이동합니다
              </span>
            </div>

            {/* 장소 리스트 스크롤 영역 */}
            <div className="divide-y-2 divide-neutral-200 overflow-y-auto max-h-[540px]">
              {places.length === 0 ? (
                <div className="p-8 text-center font-mono text-xs text-neutral-500">
                  <p className="font-bold text-neutral-700 mb-1">검색된 장소가 없습니다.</p>
                  <p className="text-[11px]">검색어를 입력하고 검색 버튼을 눌러주세요.</p>
                </div>
              ) : (
                places.map((place, idx) => {
                  const isSelected = selectedPlace?.id === place.id;
                  return (
                    <button
                      key={place.id || idx}
                      type="button"
                      onClick={() => setSelectedPlace(place)}
                      className={`w-full text-left p-3.5 transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-neutral-100 border-l-4 border-bauhaus-red'
                          : 'hover:bg-neutral-50 bg-white'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono font-bold shrink-0 ${
                              isSelected ? 'bg-bauhaus-red text-white' : 'bg-neutral-200 text-neutral-800'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="font-bold text-xs md:text-sm text-neutral-900 truncate">
                            {place.placeName}
                          </span>
                          {place.categoryGroupName && (
                            <span className="text-[9px] font-mono bg-neutral-200 text-neutral-700 px-1 py-0.2 border border-neutral-300 shrink-0">
                              {place.categoryGroupName}
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-neutral-600 font-mono space-y-0.5 pl-5.5">
                          {place.roadAddressName && (
                            <p className="truncate text-neutral-700 font-semibold">
                              {place.roadAddressName}
                            </p>
                          )}
                          {place.addressName && place.addressName !== place.roadAddressName && (
                            <p className="truncate text-neutral-500 text-[10px]">
                              (지번) {place.addressName}
                            </p>
                          )}
                          {place.phone && (
                            <p className="text-[10px] text-bauhaus-blue flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5" />
                              <span>{place.phone}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {place.distance && (
                          <span className="text-[10px] font-mono font-bold text-bauhaus-red block">
                            {parseInt(place.distance, 10) > 1000
                              ? `${(parseInt(place.distance, 10) / 1000).toFixed(1)}km`
                              : `${place.distance}m`}
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-neutral-400">
                          {parseFloat(place.y).toFixed(3)}, {parseFloat(place.x).toFixed(3)}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* 우측: 실제 인터랙티브 지도 뷰포트 & 장소 상세 카드 (7칸) */}
        <div className="lg:col-span-7 space-y-4">
          {/* 인터랙티브 지도 프레임 */}
          <div className="border-2 border-bauhaus-black bg-white p-4 b-shadow flex flex-col justify-between relative overflow-hidden">
            {/* 지도 상단 컨트롤 바 */}
            <div className="border-b-2 border-bauhaus-black pb-2.5 mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-bauhaus-red" />
                  <span>실시간 인터랙티브 지도 뷰포트</span>
                </span>
                <span className="text-[10px] font-mono bg-[#FEE500] text-black px-1.5 py-0.5 border border-bauhaus-black font-bold">
                  {mapLayerType === 'street' ? '일반 지도' : '위성 지도'}
                </span>
              </div>

              {/* 레이어 토글 & 줌/리셋 컨트롤 */}
              <div className="flex items-center gap-1.5">
                <div className="flex border border-bauhaus-black bg-neutral-100 p-0.5 text-[11px] font-mono font-bold">
                  <button
                    type="button"
                    onClick={() => handleLayerSwitch('street')}
                    className={`px-2 py-0.5 transition-colors ${
                      mapLayerType === 'street' ? 'bg-bauhaus-black text-white' : 'text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    일반
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLayerSwitch('satellite')}
                    className={`px-2 py-0.5 transition-colors ${
                      mapLayerType === 'satellite' ? 'bg-bauhaus-black text-white' : 'text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    위성
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleRecenter}
                  title="현재 마커 위치로 중심 이동"
                  className="p-1 bg-white border border-bauhaus-black hover:bg-neutral-100 text-bauhaus-black text-xs"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  title="확대"
                  className="p-1 bg-white border border-bauhaus-black hover:bg-neutral-100 text-bauhaus-black text-xs font-bold"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  title="축소"
                  className="p-1 bg-white border border-bauhaus-black hover:bg-neutral-100 text-bauhaus-black text-xs font-bold"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 실제 지도 컨테이너 (Leaflet / OSM / CartoDB Voyager 엔진) */}
            <div className="border-2 border-bauhaus-black h-[380px] w-full relative z-0 overflow-hidden b-shadow-sm">
              <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '380px' }} />

              {/* 우하단 카카오맵 공식 실시간 크게보기 플로팅 버튼 */}
              <div className="absolute bottom-3 right-3 z-[1000] flex gap-1">
                <a
                  href={kakaoMapDirectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#FEE500] hover:bg-[#FADA0A] text-black text-xs font-mono font-black px-3 py-1.5 border-2 border-bauhaus-black flex items-center gap-1.5 shadow-[3px_3px_0px_#121212] transition-transform hover:-translate-y-0.5"
                >
                  <span>카카오맵에서 크게보기</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* 하단 카카오 바로가기 링크 바 */}
            {selectedPlace && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="text-neutral-500 text-[11px]">
                  카카오맵 길찾기 & 360° 로드뷰 직접 연결:
                </span>
                <div className="flex gap-2">
                  <a
                    href={kakaoRouteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white hover:bg-neutral-100 text-bauhaus-black font-bold px-2.5 py-1 border border-bauhaus-black flex items-center gap-1 text-xs"
                  >
                    <CornerDownRight className="w-3 h-3 text-bauhaus-blue" />
                    <span>길찾기</span>
                  </a>
                  <a
                    href={kakaoRoadviewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white hover:bg-neutral-100 text-bauhaus-black font-bold px-2.5 py-1 border border-bauhaus-black flex items-center gap-1 text-xs"
                  >
                    <MapPin className="w-3 h-3 text-bauhaus-red" />
                    <span>거리뷰/로드뷰</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* 선택된 장소 세부 정보 카드 */}
          {selectedPlace && (
            <div className="border-2 border-bauhaus-black bg-white p-4 b-shadow space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                <h3 className="font-bold text-base font-sans text-bauhaus-black flex items-center gap-2">
                  <Building className="w-4 h-4 text-bauhaus-blue" />
                  <span>{selectedPlace.placeName}</span>
                </h3>
                <span className="text-[11px] font-mono bg-neutral-100 px-2 py-0.5 border border-bauhaus-black font-bold">
                  {selectedPlace.categoryGroupName || '장소 정보'}
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
