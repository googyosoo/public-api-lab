import React, { useState, useEffect } from 'react';
import { BookOpen, Search, ExternalLink, RefreshCw, Bookmark, Sparkles } from 'lucide-react';
import { ApiService } from '../../services/apiService';
import { DictWordItem, ApiInspectionData } from '../../types/api';

interface KoreanDictModuleProps {
  isLive: boolean;
  koreanKey: string;
  onInspected: (data: ApiInspectionData) => void;
}

export const KoreanDictModule: React.FC<KoreanDictModuleProps> = ({ isLive, koreanKey, onInspected }) => {
  const [searchTerm, setSearchTerm] = useState<string>('바우하우스');
  const [dictResults, setDictResults] = useState<DictWordItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const presets = ['바우하우스', '인공지능', '학교', '알고리즘', '가을'];

  const searchDict = async (wordToSearch: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await ApiService.searchKoreanDict(wordToSearch, koreanKey);
      setDictResults(result.data);
      if (result.error) {
        setErrorMessage(result.error);
      }
      onInspected(result.inspect);
    } catch (err: any) {
      setErrorMessage(`국어사전 검색 실패: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchDict(searchTerm);
  }, [koreanKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchDict(searchTerm.trim());
    }
  };

  const handleChipClick = (word: string) => {
    setSearchTerm(word);
    searchDict(word);
  };

  return (
    <div className="space-y-6">
      {/* 바우하우스 모듈 타이틀 헤더 */}
      <div className="border-b-2 border-bauhaus-black pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-bauhaus-red uppercase">
            <span>MODULE 08 // NATIONAL INSTITUTE OF KOREAN LANGUAGE API</span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight font-sans">
            국립국어원 한국어기초사전 검색기
          </h2>
          <p className="text-xs text-neutral-600 font-mono mt-1">
            국가 공인 표준국어사전 기반 표제어, 품사, 어원, 정확한 뜻풀이 및 실생활 용례 탐색
          </p>
        </div>

        {/* 추천 어휘 칩 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-mono font-bold text-neutral-500">추천 어휘:</span>
          {presets.map((word) => (
            <button
              key={word}
              onClick={() => handleChipClick(word)}
              className={`px-2.5 py-1 text-xs font-mono border border-bauhaus-black transition-all ${
                searchTerm === word
                  ? 'bg-bauhaus-red text-white font-bold b-shadow-sm'
                  : 'bg-white hover:bg-neutral-100'
              }`}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {/* 검색 입력창 */}
      <div className="border-2 border-bauhaus-black bg-white p-4 b-shadow-sm">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="뜻을 찾고 싶은 우리말 단어를 입력하세요 (예: 지혜, 배움, 디자인)..."
              className="w-full pl-9 pr-4 py-2 text-sm font-sans border-2 border-bauhaus-black bg-neutral-50 focus:bg-white focus:outline-hidden"
            />
            <BookOpen className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-bauhaus-black text-white text-xs font-mono font-bold border-2 border-bauhaus-black hover:bg-neutral-800 transition-all flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>사전 검색</span>
          </button>
        </form>
      </div>

      {/* 에러/알림 배너 */}
      {errorMessage && (
        <div className="bg-amber-50 border-2 border-bauhaus-black p-3 text-xs font-mono text-amber-900 b-shadow-sm flex items-center justify-between">
          <span>{errorMessage}</span>
          <span className="text-[10px] bg-amber-200 px-1.5 py-0.5 border border-bauhaus-black font-bold">PRESET FALLBACK</span>
        </div>
      )}

      {/* 사전 결과 카드 목록 */}
      <div className="space-y-4">
        {dictResults.length === 0 && !loading && (
          <div className="border-2 border-dashed border-bauhaus-black p-12 text-center bg-white font-mono text-xs text-neutral-500">
            검색 결과가 없습니다. 다른 단어로 검색해 보세요.
          </div>
        )}

        {dictResults.map((item, idx) => (
          <div
            key={item.targetCode || idx}
            className="border-2 border-bauhaus-black bg-white p-6 b-shadow space-y-4"
          >
            {/* 표제어 상단 헤더 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-bauhaus-black pb-3">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-6 bg-bauhaus-red inline-block"></span>
                <h3 className="text-2xl font-black text-bauhaus-black tracking-tight font-sans">
                  {item.word}
                </h3>
                {item.origin && (
                  <span className="text-xs font-mono text-neutral-500 border border-neutral-300 px-1.5 py-0.5">
                    {item.origin}
                  </span>
                )}
                <span className="bg-neutral-100 text-bauhaus-black px-2 py-0.5 text-xs font-mono font-bold border border-bauhaus-black">
                  {item.part}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-neutral-400">
                  표제어번호: {item.targetCode}
                </span>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-bauhaus-blue hover:underline flex items-center gap-1 font-bold"
                >
                  <span>국립국어원 원문보기</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* 뜻풀이 정의 */}
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-neutral-500 uppercase flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5 text-bauhaus-blue" />
                <span>어휘 뜻풀이 (Definition)</span>
              </div>
              <p className="text-sm text-neutral-900 font-sans leading-relaxed bg-neutral-50 p-3.5 border-l-4 border-bauhaus-blue">
                {item.definition}
              </p>
            </div>

            {/* 용례 / 예문 영역 */}
            {item.examples && item.examples.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-mono font-bold text-neutral-500 uppercase flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-bauhaus-yellow" />
                  <span>실생활 활용 예문 (Examples)</span>
                </div>
                <div className="space-y-1.5">
                  {item.examples.map((ex, exIdx) => (
                    <div
                      key={exIdx}
                      className="text-xs text-neutral-700 font-sans bg-amber-50/60 px-3 py-2 border border-amber-200 flex items-start gap-2"
                    >
                      <span className="font-mono font-bold text-amber-700 shrink-0">예문 {exIdx + 1}:</span>
                      <span className="italic leading-relaxed">"{ex}"</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
