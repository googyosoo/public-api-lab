import React, { useState } from 'react';
import { Terminal, Copy, Check, ChevronDown, ChevronUp, Code2, Globe, Database } from 'lucide-react';
import { ApiInspectionData } from '../../types/api';

interface CodeInspectorProps {
  inspectData: ApiInspectionData | null;
}

export const CodeInspector: React.FC<CodeInspectorProps> = ({ inspectData }) => {
  const [copiedType, setCopiedType] = useState<'curl' | 'fetch' | 'json' | null>(null);
  const [activeTab, setActiveTab] = useState<'response' | 'curl' | 'fetch' | 'params'>('response');
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!inspectData) return null;

  const handleCopy = (text: string, type: 'curl' | 'fetch' | 'json') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 1500);
  };

  const jsonString = JSON.stringify(inspectData.rawResponse, null, 2);

  return (
    <div className="mt-8 border-2 border-bauhaus-black bg-white b-shadow">
      {/* 인스펙터 헤더 바 */}
      <div className="bg-bauhaus-black text-white px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 font-mono text-xs">
          <Terminal className="w-4 h-4 text-bauhaus-yellow" />
          <span className="font-bold tracking-wider uppercase">INSPECTOR // FORM FOLLOWS FUNCTION</span>
          <span className="text-neutral-400">·</span>
          <span className="text-neutral-300 truncate max-w-xs">{inspectData.title}</span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="flex items-center gap-1 bg-neutral-800 px-2 py-0.5 border border-neutral-700">
            <span className="text-neutral-400">STATUS:</span>
            <span className={inspectData.status === 200 || inspectData.status === 204 ? 'text-bauhaus-green font-bold' : 'text-bauhaus-red font-bold'}>
              {inspectData.status} OK
            </span>
          </span>
          <span className="bg-neutral-800 px-2 py-0.5 border border-neutral-700 text-neutral-300">
            {inspectData.durationMs}ms
          </span>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-neutral-400 hover:text-white flex items-center"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* 엔드포인트 URL 표기 바 */}
          <div className="bg-neutral-100 border-b-2 border-bauhaus-black px-4 py-2 text-xs font-mono flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-2">
              <span className="bg-bauhaus-blue text-white px-1.5 py-0.5 font-bold uppercase text-[10px]">
                {inspectData.method}
              </span>
              <span className="text-neutral-700 font-semibold break-all">
                {inspectData.endpoint}
              </span>
            </div>
          </div>

          {/* 탭 바 */}
          <div className="flex border-b-2 border-bauhaus-black bg-neutral-50 text-xs font-mono font-bold">
            <button
              onClick={() => setActiveTab('response')}
              className={`px-4 py-2 border-r-2 border-bauhaus-black flex items-center gap-1.5 ${
                activeTab === 'response' ? 'bg-white text-bauhaus-black' : 'text-neutral-500 hover:text-bauhaus-black'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-bauhaus-blue" />
              <span>RAW JSON 응답</span>
            </button>
            <button
              onClick={() => setActiveTab('curl')}
              className={`px-4 py-2 border-r-2 border-bauhaus-black flex items-center gap-1.5 ${
                activeTab === 'curl' ? 'bg-white text-bauhaus-black' : 'text-neutral-500 hover:text-bauhaus-black'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-bauhaus-red" />
              <span>cURL 명령어</span>
            </button>
            <button
              onClick={() => setActiveTab('fetch')}
              className={`px-4 py-2 border-r-2 border-bauhaus-black flex items-center gap-1.5 ${
                activeTab === 'fetch' ? 'bg-white text-bauhaus-black' : 'text-neutral-500 hover:text-bauhaus-black'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-bauhaus-green" />
              <span>JavaScript fetch() 코드</span>
            </button>
          </div>

          {/* 탭 내용 영역 */}
          <div className="p-4 bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto max-h-72 relative">
            {activeTab === 'response' && (
              <div>
                <button
                  onClick={() => handleCopy(jsonString, 'json')}
                  className="absolute top-3 right-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-neutral-200 px-2.5 py-1 text-[11px] flex items-center gap-1 transition-colors"
                >
                  {copiedType === 'json' ? <Check className="w-3.5 h-3.5 text-bauhaus-green" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'json' ? '복사 완료' : 'JSON 복사'}</span>
                </button>
                <pre className="whitespace-pre-wrap leading-relaxed text-emerald-300">
                  {jsonString}
                </pre>
              </div>
            )}

            {activeTab === 'curl' && (
              <div>
                <button
                  onClick={() => handleCopy(inspectData.curlCommand, 'curl')}
                  className="absolute top-3 right-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-neutral-200 px-2.5 py-1 text-[11px] flex items-center gap-1 transition-colors"
                >
                  {copiedType === 'curl' ? <Check className="w-3.5 h-3.5 text-bauhaus-green" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'curl' ? '복사 완료' : 'cURL 복사'}</span>
                </button>
                <pre className="whitespace-pre-wrap leading-relaxed text-amber-200 break-all">
                  {inspectData.curlCommand}
                </pre>
              </div>
            )}

            {activeTab === 'fetch' && (
              <div>
                <button
                  onClick={() => handleCopy(inspectData.fetchSnippet, 'fetch')}
                  className="absolute top-3 right-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 text-neutral-200 px-2.5 py-1 text-[11px] flex items-center gap-1 transition-colors"
                >
                  {copiedType === 'fetch' ? <Check className="w-3.5 h-3.5 text-bauhaus-green" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'fetch' ? '복사 완료' : '코드 복사'}</span>
                </button>
                <pre className="whitespace-pre-wrap leading-relaxed text-sky-200">
                  {inspectData.fetchSnippet}
                </pre>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
