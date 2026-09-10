import React, { useState } from 'react';
import { Sparkles, BrainCircuit, Lightbulb, Shirt, Send, Check } from 'lucide-react';
import { ApiInspectionData } from '../../types/api';

interface GeminiModuleProps {
  isLive: boolean;
  geminiKey: string;
  onInspected: (data: ApiInspectionData) => void;
}

export const GeminiModule: React.FC<GeminiModuleProps> = ({ isLive, geminiKey, onInspected }) => {
  const [promptTopic, setPromptTopic] = useState<'outfit' | 'notice' | 'school'>('outfit');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiOutput, setAiOutput] = useState<{
    summary: string;
    actionItems: string[];
    clothingRecommendation: string;
    warningNote: string;
  }>({
    summary: '서울 지역 오늘 기온 24.8°C에 강수확률 20%, 미세먼지는 28㎍/㎥(좋음)으로 매우 쾌적한 초가을 날씨입니다.',
    actionItems: [
      '오전과 오후 일교차가 약 6~8°C 발생하므로 가벼운 겉옷을 준비하세요.',
      '야외 활동(운동장 체육수업, 야외 행사)을 진행하기에 최적의 대기 조건입니다.',
      '자외선 지수가 다소 높으므로 모자나 자외선 차단제를 권장합니다.'
    ],
    clothingRecommendation: '반팔 또는 얇은 긴팔 셔츠 + 얇은 가디건/바람막이 조합',
    warningNote: '모레(9/9)에는 강수확률 80%의 비 소식이 예보되어 있으니 수요일 우산 휴대를 잊지 마세요.'
  });

  const handleGenerate = async (topic: 'outfit' | 'notice' | 'school') => {
    setPromptTopic(topic);
    setIsGenerating(true);

    const systemPrompt = `당신은 공공데이터 기반 생활 비서입니다. 기상청 날씨(기온 24.8°C, 강수 20%)와 에어코리아(미세먼지 좋음) 데이터를 결합해 사용자 맞춤형 가이드를 작성하세요.`;
    const userPrompt = topic === 'outfit'
      ? '오늘 날씨와 미세먼지에 맞춘 추천 옷차림과 행동 수칙을 알려줘.'
      : topic === 'notice'
      ? '학부모 안내용 오늘 야외활동 가부 공지문을 3줄로 작성해줘.'
      : '오늘 급식(제육볶음, 미역국)과 기온을 고려한 건강 관리 팁을 알려줘.';

    if (isLive && geminiKey) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }]
          })
        });
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (text) {
          setAiOutput({
            summary: text.slice(0, 120) + '...',
            clothingRecommendation: topic === 'outfit' ? text.slice(0, 80) : '쾌적한 표준 활동복',
            actionItems: text.split('\n').filter((l: string) => l.trim().length > 0).slice(0, 3),
            warningNote: '구글 Gemini AI 실시간 API 응답이 성공적으로 반영되었습니다.'
          });
        }

        onInspected({
          title: 'Google Gemini 1.5 Flash (LIVE 실제 응답)',
          category: 'gemini',
          endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
          method: 'POST',
          body: { prompt: userPrompt },
          rawResponse: json,
          status: res.status,
          durationMs: 450,
          curlCommand: `curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}" -H "Content-Type: application/json" -d '{"contents":[{"parts":[{"text":"${userPrompt}"}]}]}'`,
          fetchSnippet: `// Gemini Flash API 호출\nconst res = await fetch(\n  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + KEY,\n  {\n    method: "POST",\n    headers: { "Content-Type": "application/json" },\n    body: JSON.stringify({ contents: [{ parts: [{ text: "${userPrompt}" }] }] })\n  }\n);\nconst data = await res.json();`
        });
      } catch (err) {
        console.warn('Gemini Live 통신 에러:', err);
      }
    } else {
      await new Promise((r) => setTimeout(r, 350));
      onInspected({
        title: 'Google Gemini AI (공공데이터 연계 추론 시뮬레이션)',
        category: 'gemini',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        method: 'POST',
        body: { model: 'gemini-1.5-flash', topic, systemPrompt, userPrompt },
        rawResponse: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify(aiOutput, null, 2)
                  }
                ]
              },
              finishReason: "STOP"
            }
          ],
          usageMetadata: { promptTokenCount: 84, candidatesTokenCount: 142, totalTokenCount: 226 }
        },
        status: 200,
        durationMs: 320,
        curlCommand: `curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSy...KEY" -H "Content-Type: application/json" -d '{"contents":[{"parts":[{"text":"${userPrompt}"}]}]}'`,
        fetchSnippet: `// Gemini API 연동 코드\nconst response = await ai.generateContent({\n  prompt: "${userPrompt}",\n  context: "기상청 기온: 24.8°C, 에어코리아 PM10: 28"\n});`
      });
    }

    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* 바우하우스 모듈 헤더 */}
      <div className="border-b-2 border-bauhaus-black pb-4 flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-bauhaus-red uppercase">
            <span>MODULE 08 // GEMINI AI DATA SYNTHESIS</span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight font-sans">
            제미나이 AI 데이터 연계 스마트 인사이트
          </h2>
          <p className="text-xs text-neutral-600 font-mono mt-1">
            기상청 + 에어코리아 + 나이스 공공데이터를 융합하여 실시간 맞춤 가이드를 생성하는 지능형 파이프라인
          </p>
        </div>

        {/* 템플릿 선택 버튼 */}
        <div className="flex gap-1 flex-wrap">
          <button
            onClick={() => handleGenerate('outfit')}
            className={`px-3 py-1.5 text-xs font-mono font-bold border-2 border-bauhaus-black transition-all ${
              promptTopic === 'outfit' ? 'bg-bauhaus-black text-white b-shadow-sm' : 'bg-white hover:bg-neutral-100'
            }`}
          >
            👕 오늘 옷차림 추천
          </button>
          <button
            onClick={() => handleGenerate('notice')}
            className={`px-3 py-1.5 text-xs font-mono font-bold border-2 border-bauhaus-black transition-all ${
              promptTopic === 'notice' ? 'bg-bauhaus-black text-white b-shadow-sm' : 'bg-white hover:bg-neutral-100'
            }`}
          >
            📢 야외수업 공지문
          </button>
          <button
            onClick={() => handleGenerate('school')}
            className={`px-3 py-1.5 text-xs font-mono font-bold border-2 border-bauhaus-black transition-all ${
              promptTopic === 'school' ? 'bg-bauhaus-black text-white b-shadow-sm' : 'bg-white hover:bg-neutral-100'
            }`}
          >
            🍱 급식 건강 가이드
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 생성 결과 카드 (좌측 7칸) */}
        <div className="lg:col-span-7 border-2 border-bauhaus-black bg-white p-6 b-shadow space-y-4">
          <div className="border-b-2 border-bauhaus-black pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-bauhaus-red" />
              <h3 className="font-bold text-sm font-sans">AI 공공데이터 종합 브리핑</h3>
            </div>
            <span className="text-[10px] font-mono bg-bauhaus-yellow px-2 py-0.5 border border-bauhaus-black font-bold">
              GEMINI 1.5 FLASH
            </span>
          </div>

          <div className="border-l-4 border-bauhaus-blue pl-3 py-1 text-sm font-bold font-sans text-neutral-800 leading-relaxed">
            {aiOutput.summary}
          </div>

          {/* 추천 착장 */}
          <div className="border-2 border-bauhaus-black p-3 bg-amber-50">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-900 mb-1">
              <Shirt className="w-4 h-4 text-bauhaus-red" />
              <span>추천 복장 가이드</span>
            </div>
            <div className="font-bold text-sm font-sans text-bauhaus-black">
              {aiOutput.clothingRecommendation}
            </div>
          </div>

          {/* 실천 수칙 */}
          <div>
            <div className="text-xs font-mono font-bold uppercase text-neutral-500 mb-2">
              오늘의 권장 행동 수칙
            </div>
            <div className="space-y-1.5">
              {aiOutput.actionItems.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs font-sans">
                  <span className="w-4 h-4 rounded-full bg-bauhaus-black text-white text-[10px] font-mono flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 알림 노트 */}
          <div className="border-t border-neutral-200 pt-3 text-[11px] font-mono text-neutral-500">
            📌 {aiOutput.warningNote}
          </div>
        </div>

        {/* 연계 파이프라인 아키텍처 다이어그램 (우측 5칸) */}
        <div className="lg:col-span-5 border-2 border-bauhaus-black bg-neutral-900 text-white p-6 b-shadow flex flex-col justify-between">
          <div>
            <div className="border-b border-neutral-700 pb-2 mb-4 flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>DATA FUSION PIPELINE</span>
              <span>ARCHITECTURE</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="border border-neutral-700 p-2.5 bg-neutral-800 flex items-center justify-between">
                <span>[INPUT 1] 기상청 단기예보</span>
                <span className="text-bauhaus-blue font-bold">24.8°C / 20%</span>
              </div>
              <div className="text-center text-neutral-500">↓</div>
              <div className="border border-neutral-700 p-2.5 bg-neutral-800 flex items-center justify-between">
                <span>[INPUT 2] 에어코리아 대기질</span>
                <span className="text-bauhaus-green font-bold">좋음 (28㎍)</span>
              </div>
              <div className="text-center text-neutral-500">↓</div>
              <div className="border border-neutral-700 p-2.5 bg-neutral-800 flex items-center justify-between">
                <span>[INPUT 3] 나이스 급식 식단</span>
                <span className="text-amber-300 font-bold">제육볶음</span>
              </div>
              <div className="text-center text-neutral-500">↓</div>
              <div className="border-2 border-bauhaus-yellow p-3 bg-neutral-800 text-center font-bold text-bauhaus-yellow">
                🤖 LLM 컨텍스트 주입 및 맞춤 생성
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-neutral-800 text-[11px] font-mono text-neutral-400">
            💡 "단순히 날씨를 보여주는 사이트"에서 "날씨에 맞춰 무엇을 입을지 결정해주는 인텔리전트 앱"으로의 진화 방식입니다.
          </div>
        </div>
      </div>
    </div>
  );
};
