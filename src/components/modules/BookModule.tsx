import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, Building2, Tag, AlertTriangle } from 'lucide-react';
import { BOOK_SEARCH_PRESET } from '../../data/mockData';
import { ApiService } from '../../services/apiService';
import { BookSearchItem, ApiInspectionData } from '../../types/api';

interface BookModuleProps {
  isLive: boolean;
  nlKey?: string;
  kakaoKey?: string;
  onInspected: (data: ApiInspectionData) => void;
}

export const BookModule: React.FC<BookModuleProps> = ({
  isLive,
  nlKey,
  kakaoKey,
  onInspected
}) => {
  const [query, setQuery] = useState<string>('바우하우스');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'kakao' | 'nl'>('all');
  const [books, setBooks] = useState<BookSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const searchBooks = async (q: string, src: 'all' | 'kakao' | 'nl') => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const result = await ApiService.fetchBooks(q, src, kakaoKey, nlKey, isLive);
      setBooks(result.data);
      if (result.error) {
        setErrorMessage(result.error);
      }
      onInspected(result.inspect);
    } catch (err: any) {
      setErrorMessage(`도서 검색 오류: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchBooks(query, sourceFilter);
  }, [isLive, nlKey, kakaoKey, sourceFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchBooks(query, sourceFilter);
  };

  return (
    <div className="space-y-6">
      {/* 바우하우스 모듈 헤더 */}
      <div className="border-b-2 border-bauhaus-black pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-bauhaus-blue uppercase">
            <span>MODULE 05 // NATIONAL LIBRARY & KAKAO BOOK LAB</span>
            <span className="bg-bauhaus-yellow text-bauhaus-black px-1.5 py-0.5 border border-bauhaus-black text-[10px]">
              DUAL ENGINE
            </span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight font-sans mt-0.5">
            국립중앙도서관 국가서지 & 카카오 책 검색
          </h2>
          <p className="text-xs text-neutral-600 font-mono mt-1">
            종료된 알라딘 API를 대체하여, <b>국립중앙도서관(KDC 십진분류·공공서지)</b>과 <b>카카오 Daum 책 검색(정가·표지·판매)</b> 듀얼 아키텍처로 개편되었습니다.
          </p>
        </div>

        {/* 검색 폼 및 소스 선택 필터 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* 엔진 선택 세그먼트 버튼 */}
          <div className="flex border-2 border-bauhaus-black bg-neutral-100 p-0.5 b-shadow-sm">
            <button
              type="button"
              onClick={() => setSourceFilter('all')}
              className={`px-2.5 py-1 text-xs font-mono font-bold transition-colors ${
                sourceFilter === 'all'
                  ? 'bg-bauhaus-black text-white'
                  : 'text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              전체 (통합)
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter('kakao')}
              className={`px-2.5 py-1 text-xs font-mono font-bold transition-colors flex items-center gap-1 ${
                sourceFilter === 'kakao'
                  ? 'bg-[#FEE500] text-black border border-black'
                  : 'text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <span>카카오</span>
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter('nl')}
              className={`px-2.5 py-1 text-xs font-mono font-bold transition-colors flex items-center gap-1 ${
                sourceFilter === 'nl'
                  ? 'bg-bauhaus-blue text-white'
                  : 'text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              <span>국립도서관</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-1.5">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="도서명 또는 저자 검색..."
              className="px-3 py-1.5 text-xs font-mono border-2 border-bauhaus-black bg-white focus:outline-hidden w-44 sm:w-56"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-3.5 py-1.5 bg-bauhaus-black text-white text-xs font-mono font-bold border-2 border-bauhaus-black hover:bg-neutral-800 flex items-center gap-1 shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? '검색중' : '조회'}</span>
            </button>
          </form>
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
            BOOK SEARCH STATUS
          </span>
        </div>
      )}

      {/* 엔진 상태 및 KDC / 서지 메타 브리핑 바 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="border-2 border-bauhaus-black p-3 bg-white b-shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FEE500] border-2 border-bauhaus-black flex items-center justify-center font-black text-black text-xs shrink-0">
            K
          </div>
          <div>
            <div className="font-bold text-bauhaus-black">카카오 REST API v3</div>
            <div className="text-[11px] text-neutral-500">
              {kakaoKey ? '키 등록됨 (실시간 통신 연동)' : '키 미등록 (카카오 REST 키 필요)'}
            </div>
          </div>
        </div>

        <div className="border-2 border-bauhaus-black p-3 bg-white b-shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-bauhaus-blue border-2 border-bauhaus-black flex items-center justify-center font-black text-white text-xs shrink-0">
            NL
          </div>
          <div>
            <div className="font-bold text-bauhaus-black">국립중앙도서관 국가서지</div>
            <div className="text-[11px] text-neutral-500">
              {nlKey ? '키 등록됨 (KDC 한국십진분류)' : 'KDC 000~900 공공 서지 연동'}
            </div>
          </div>
        </div>

        <div className="border-2 border-bauhaus-black p-3 bg-neutral-100 b-shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-bauhaus-black" />
            <span className="font-bold">현재 검색 결과</span>
          </div>
          <span className="bg-bauhaus-black text-white px-2 py-0.5 font-bold text-xs">
            {books.length}권
          </span>
        </div>
      </div>

      {/* 가상 책장 그리드 (Bookshelf Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {books.map((book, i) => {
          const isNl = book.source === 'nl';
          return (
            <div
              key={`${book.isbn}-${i}`}
              className="border-2 border-bauhaus-black bg-white b-shadow flex flex-col justify-between hover:translate-y-[-2px] transition-transform"
            >
              <div>
                {/* 상단 엔진 뱃지 & 인덱스 */}
                <div className="border-b-2 border-bauhaus-black px-3 py-1.5 flex items-center justify-between text-[11px] font-mono font-bold bg-neutral-50">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full border border-black ${
                        isNl ? 'bg-bauhaus-blue' : 'bg-[#FEE500]'
                      }`}
                    ></span>
                    <span>{isNl ? '국립중앙도서관' : '카카오 DAUM'}</span>
                  </span>
                  <span className="text-neutral-400">NO. {String(i + 1).padStart(2, '0')}</span>
                </div>

                {/* 책 표지 포스터 프레임 */}
                <div className="border-b-2 border-bauhaus-black h-52 bg-neutral-100 relative overflow-hidden flex items-center justify-center p-3">
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="max-h-full max-w-full object-contain border-2 border-bauhaus-black b-shadow-sm bg-white"
                  />
                  {book.priceSales && book.priceSales > 0 ? (
                    <span className="absolute bottom-2 right-2 bg-bauhaus-black text-white text-[10px] font-mono px-1.5 py-0.5 font-bold border border-white">
                      {book.priceSales.toLocaleString()}원
                    </span>
                  ) : null}
                </div>

                {/* 본문 서지 정보 */}
                <div className="p-3.5 space-y-2">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-bauhaus-blue font-semibold uppercase truncate">
                    <Tag className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{book.categoryName}</span>
                  </div>
                  <h3 className="font-bold text-sm font-sans line-clamp-2 leading-snug text-bauhaus-black">
                    {book.title}
                  </h3>
                  <div className="text-xs font-mono text-neutral-600 truncate">
                    {book.author}
                  </div>
                  <div className="text-[11px] font-mono text-neutral-400">
                    {book.publisher} {book.pubDate ? `· ${book.pubDate}` : ''}
                  </div>
                  <p className="text-xs text-neutral-600 font-sans line-clamp-3 leading-relaxed pt-1 border-t border-dashed border-neutral-200">
                    {book.description}
                  </p>
                </div>
              </div>

              {/* 하단 바우하우스 액션 & ISBN 정보 */}
              <div className="border-t-2 border-bauhaus-black p-2.5 bg-neutral-50 flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-500 text-[10px] truncate max-w-[150px]">
                  ISBN: {book.isbn || '미기재'}
                </span>
                {book.url ? (
                  <a
                    href={book.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-bauhaus-black hover:bg-bauhaus-yellow px-1.5 py-0.5 border border-bauhaus-black flex items-center gap-1 bg-white b-shadow-sm"
                  >
                    <span>상세보기</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ) : (
                  <span className="text-[10px] text-neutral-400 font-mono">국가서지DB</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
