import React, { useState } from 'react';
import { Header } from './components/common/Header';
import { CodeInspector } from './components/common/CodeInspector';
import { KeyModal } from './components/common/KeyModal';
import { WeatherModule } from './components/modules/WeatherModule';
import { NeisModule } from './components/modules/NeisModule';
import { AirModule } from './components/modules/AirModule';
import { AstroModule } from './components/modules/AstroModule';
import { BookModule } from './components/modules/BookModule';
import { KakaoModule } from './components/modules/KakaoModule';
import { TourModule } from './components/modules/TourModule';
import { KoreanDictModule } from './components/modules/KoreanDictModule';
import { DrugModule } from './components/modules/DrugModule';
import { RealEstateModule } from './components/modules/RealEstateModule';
import { KeyVault } from './services/keyVault';
import { ApiCategory, ApiInspectionData, ApiKeyStore } from './types/api';

export const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<ApiCategory>('kma');
  const [isLive, setIsLive] = useState<boolean>(true);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [keys, setKeys] = useState<ApiKeyStore>(KeyVault.getKeys());
  const [currentInspection, setCurrentInspection] = useState<ApiInspectionData | null>(null);

  const handleKeysUpdated = () => {
    setKeys(KeyVault.getKeys());
  };

  return (
    <div className="min-h-screen flex flex-col bg-bauhaus-paper bauhaus-grid-bg">
      {/* 헤더 & 네비게이션 */}
      <Header
        isLive={isLive}
        onToggleLive={setIsLive}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      {/* 메인 작업 영역 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* 모듈 스위처 */}
        {activeCategory === 'kma' && (
          <WeatherModule
            isLive={isLive}
            liveKey={keys.kmaKey}
            onInspected={setCurrentInspection}
          />
        )}
        {activeCategory === 'neis' && (
          <NeisModule
            isLive={isLive}
            liveKey={keys.neisKey}
            onInspected={setCurrentInspection}
          />
        )}
        {activeCategory === 'air' && (
          <AirModule
            isLive={isLive}
            liveKey={keys.airKey}
            onInspected={setCurrentInspection}
          />
        )}
        {activeCategory === 'kasi' && (
          <AstroModule
            isLive={isLive}
            liveKey={keys.kasiKey}
            onInspected={setCurrentInspection}
          />
        )}
        {activeCategory === 'book' && (
          <BookModule
            isLive={isLive}
            nlKey={keys.nlKey}
            kakaoKey={keys.kakaoKey}
            onInspected={setCurrentInspection}
          />
        )}
        {activeCategory === 'kakao' && (
          <KakaoModule
            isLive={isLive}
            kakaoKey={keys.kakaoKey}
            onInspected={setCurrentInspection}
          />
        )}
        {activeCategory === 'tour' && (
          <TourModule
            isLive={isLive}
            tourKey={keys.tourKey}
            onInspected={setCurrentInspection}
          />
        )}
        {activeCategory === 'korean' && (
          <KoreanDictModule
            isLive={isLive}
            koreanKey={keys.koreanKey}
            onInspected={setCurrentInspection}
          />
        )}
        {activeCategory === 'drug' && (
          <DrugModule
            isLive={isLive}
            drugKey={keys.drugKey}
            onInspected={setCurrentInspection}
          />
        )}
        {activeCategory === 'realestate' && (
          <RealEstateModule
            isLive={isLive}
            realestateKey={keys.realestateKey}
            onInspected={setCurrentInspection}
          />
        )}

        {/* 하단 공통: Form Follows Function 코드 & 데이터 인스펙터 */}
        <CodeInspector inspectData={currentInspection} />
      </main>

      {/* 푸터 */}
      <footer className="border-t-2 border-bauhaus-black bg-white mt-12 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-neutral-600">
          <div>
            <div className="font-bold text-bauhaus-black flex items-center gap-2">
              <span className="w-3 h-3 bg-bauhaus-red inline-block"></span>
              <span>PUBLIC API LABORATORY // 2026 EDITION</span>
            </div>
            <p className="mt-1 text-[11px] text-neutral-500">
              기획·설계 기반: 도키피디아 「API키 대백과 — 종류·발급·요금」 (도쌤)
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] flex-wrap justify-end">
            <span>공공데이터포털(기상청·에어코리아·천문연·관광공사·식약처·국토부)</span>
            <span>·</span>
            <span>나이스(NEIS)</span>
            <span>·</span>
            <span>국립국어원</span>
            <span>·</span>
            <span className="font-bold text-bauhaus-blue">100% REAL-TIME LIVE NETWORK</span>
          </div>
        </div>
      </footer>

      {/* 키 관리 모달 */}
      <KeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onKeysUpdated={handleKeysUpdated}
      />
    </div>
  );
};
