import React from 'react';
import { Shield, Key, Sparkles, Terminal, Activity } from 'lucide-react';
import { ApiCategory } from '../../types/api';

interface HeaderProps {
  isLive: boolean;
  onToggleLive: (val: boolean) => void;
  onOpenKeyModal: () => void;
  activeCategory: ApiCategory;
  onSelectCategory: (cat: ApiCategory) => void;
}

export const Header: React.FC<HeaderProps> = ({
  isLive,
  onToggleLive,
  onOpenKeyModal,
  activeCategory,
  onSelectCategory,
}) => {
  const tabs: { id: ApiCategory; label: string; symbol: string; badge: string }[] = [
    { id: 'kma', label: '기상청 단기예보', symbol: '●', badge: 'PUBLIC' },
    { id: 'neis', label: '나이스 교육정보', symbol: '■', badge: 'NEIS' },
    { id: 'air', label: '에어코리아 대기', symbol: '▲', badge: 'ENV' },
    { id: 'kasi', label: '천문연 특일/월령', symbol: '◆', badge: 'ASTRO' },
    { id: 'book', label: '국립도서관·카카오 책', symbol: '▰', badge: 'NL·KAKAO' },
    { id: 'webhook', label: '디스코드 웹훅', symbol: '▶', badge: 'HOOK' },
    { id: 'kakao', label: '카카오 장소/지도', symbol: '𝌆', badge: 'MAP' },
    { id: 'gemini', label: '제미나이 AI인사이트', symbol: '★', badge: 'AI' },
  ];

  return (
    <header className="bg-bauhaus-paper border-b-2 border-bauhaus-black sticky top-0 z-40">
      {/* 최상단 마키 스트립 */}
      <div className="bg-bauhaus-black text-white px-4 py-1 text-xs font-mono flex items-center justify-between overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-3">
          <span className="bg-bauhaus-red text-white px-1.5 py-0.2 font-bold uppercase tracking-wider">LAB V1.0</span>
          <span>BAUHAUS FUNCTIONAL OPEN API EXPERIMENTAL STATION</span>
          <span className="text-neutral-400">· FORM FOLLOWS FUNCTION</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-neutral-300">
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full inline-block ${isLive ? 'bg-bauhaus-green animate-pulse' : 'bg-bauhaus-yellow'}`}></span>
            {isLive ? 'LIVE NETWORK ENGINE' : 'SIMULATION MOCK ENGINE'}
          </span>
          <span>DATA.GO.KR COMPATIBLE</span>
        </div>
      </div>

      {/* 메인 헤더 바 */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* 바우하우스 3원색 기하학 심볼 마크 */}
          <div className="flex items-center gap-1 border-2 border-bauhaus-black p-1 bg-white b-shadow-sm">
            <div className="w-5 h-5 rounded-full bg-bauhaus-red flex items-center justify-center text-white text-[10px] font-black">●</div>
            <div className="w-5 h-5 bg-bauhaus-blue flex items-center justify-center text-white text-[10px] font-black">■</div>
            <div className="w-5 h-5 bg-bauhaus-yellow flex items-center justify-center text-bauhaus-black text-[10px] font-black">▲</div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight uppercase font-sans">
                BAUHAUS API LAB
              </h1>
              <span className="text-[10px] font-mono border border-bauhaus-black bg-white px-1.5 py-0.5 uppercase font-bold">
                대백과 에디션
              </span>
            </div>
            <p className="text-xs text-neutral-600 font-mono">
              국가 공공데이터포털 & 무료 API를 시각화하는 기능주의 인터랙티브 실험실
            </p>
          </div>
        </div>

        {/* 우측 컨트롤 도구: 모드 토글 & 키 보관소 */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 모드 스위처 */}
          <div className="flex items-center border-2 border-bauhaus-black bg-white p-0.5 b-shadow-sm">
            <button
              onClick={() => onToggleLive(false)}
              className={`px-3 py-1.5 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors ${
                !isLive ? 'bg-bauhaus-yellow text-bauhaus-black' : 'text-neutral-500 hover:text-bauhaus-black'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>시뮬레이션 (키 불필요)</span>
            </button>
            <button
              onClick={() => onToggleLive(true)}
              className={`px-3 py-1.5 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors ${
                isLive ? 'bg-bauhaus-green text-white' : 'text-neutral-500 hover:text-bauhaus-black'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>라이브 실시간 통신</span>
            </button>
          </div>

          {/* 키 관리 모달 열기 버튼 */}
          <button
            onClick={onOpenKeyModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-bauhaus-black b-shadow-sm hover:b-shadow transition-all text-xs font-mono font-bold hover:bg-neutral-50"
          >
            <Key className="w-3.5 h-3.5 text-bauhaus-blue" />
            <span>키 보관소</span>
          </button>
        </div>
      </div>

      {/* 8대 API 모듈 탭 네비게이션: 가로 스크롤 없이 한 화면에 8개 전체 배치 */}
      <div className="border-t-2 border-bauhaus-black bg-neutral-100">
        <div className="max-w-7xl mx-auto grid grid-cols-4 md:grid-cols-8 border-l-2 border-bauhaus-black">
          {tabs.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectCategory(tab.id)}
                className={`flex flex-col items-center justify-center p-2 text-center border-r-2 border-b-2 md:border-b-0 border-bauhaus-black transition-all ${
                  isActive
                    ? 'bg-bauhaus-black text-white'
                    : 'bg-white text-bauhaus-black hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <span className={`text-xs ${isActive ? 'text-bauhaus-yellow' : 'text-neutral-500'}`}>
                    {tab.symbol}
                  </span>
                  <span
                    className={`text-[8px] font-mono px-1 py-0.2 border leading-none ${
                      isActive
                        ? 'border-white/40 bg-white/10 text-white'
                        : 'border-bauhaus-black/30 bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </div>
                <span className="text-[11px] md:text-xs font-bold leading-tight line-clamp-1">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
