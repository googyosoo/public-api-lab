import React, { useState } from 'react';
import { Send, Bell, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { ApiService } from '../../services/apiService';
import { ApiInspectionData } from '../../types/api';

interface WebhookModuleProps {
  isLive: boolean;
  webhookUrl: string;
  onInspected: (data: ApiInspectionData) => void;
}

export const WebhookModule: React.FC<WebhookModuleProps> = ({ isLive, webhookUrl, onInspected }) => {
  const [botName, setBotName] = useState('바우하우스 공공알림봇');
  const [message, setMessage] = useState('🏛 [신청 알림] 2026학년도 2학기 디지털 공공데이터 체험 워크숍 참가 신청이 접수되었습니다.');
  const [senderName, setSenderName] = useState('홍길동 (교사)');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    const payload = {
      username: botName,
      content: `**${message}**\n- 신청자: ${senderName}\n- 발송시각: ${new Date().toLocaleString('ko-KR')}\n- 처리서버: BAUHAUS_API_LAB_DISPATCHER`,
    };

    const result = await ApiService.sendWebhook(webhookUrl, payload);
    onInspected(result.inspect);
    setSending(false);
    setSentSuccess(true);
    setTimeout(() => setSentSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 바우하우스 모듈 헤더 */}
      <div className="border-b-2 border-bauhaus-black pb-4">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-bauhaus-red uppercase">
          <span>MODULE 06 // DISCORD & SLACK WEBHOOK TRANSMITTER</span>
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight font-sans">
          디스코드·슬랙 웹훅 실시간 발송기
        </h2>
        <p className="text-xs text-neutral-600 font-mono mt-1">
          비밀 URL 하나로 웹앱 밖(메신저 채널)으로 즉각적인 알림과 데이터를 전송하는 초경량 API
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 발송 폼 (좌측 6칸) */}
        <div className="lg:col-span-6 border-2 border-bauhaus-black bg-white p-6 b-shadow">
          <div className="border-b-2 border-bauhaus-black pb-2 mb-4 flex items-center justify-between">
            <span className="font-mono text-xs font-bold uppercase flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-bauhaus-red" />
              <span>웹훅 페이로드(Payload) 구성</span>
            </span>
            <span className="text-[10px] font-mono text-neutral-400">HTTP POST</span>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold mb-1">발송 봇 이름 (Username)</label>
              <input
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 border-2 border-bauhaus-black bg-neutral-50 focus:outline-hidden focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold mb-1">신청자 / 작성자 이름</label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 border-2 border-bauhaus-black bg-neutral-50 focus:outline-hidden focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold mb-1">알림 메시지 본문 (Content)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full text-xs font-mono px-3 py-2 border-2 border-bauhaus-black bg-neutral-50 focus:outline-hidden focus:bg-white resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 bg-bauhaus-red text-white font-mono text-xs font-bold uppercase tracking-wider border-2 border-bauhaus-black b-shadow-sm hover:b-shadow transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{sending ? '전송 처리 중...' : '웹훅 전송 트리거 (POST EXECUTE)'}</span>
              </button>
            </div>

            {sentSuccess && (
              <div className="bg-emerald-50 border-2 border-bauhaus-green text-bauhaus-green p-2 text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 className="w-4 h-4" />
                <span>웹훅이 성공적으로 발송되었습니다 (HTTP 204 OK)</span>
              </div>
            )}
          </form>
        </div>

        {/* 디스코드 실시간 미리보기 (우측 6칸) */}
        <div className="lg:col-span-6 border-2 border-bauhaus-black bg-[#313338] text-white p-6 b-shadow flex flex-col justify-between">
          <div>
            <div className="border-b border-neutral-600 pb-2 mb-4 flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>DISCORD CLIENT SIMULATION</span>
              <span># 운영팀-실시간-알림</span>
            </div>

            {/* 디스코드 메시지 버블 */}
            <div className="flex items-start gap-3 bg-[#2B2D31] p-4 rounded-xs border border-neutral-700">
              <div className="w-10 h-10 rounded-full bg-bauhaus-red flex items-center justify-center font-bold text-white shrink-0">
                🤖
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{botName}</span>
                  <span className="bg-[#5865F2] text-white text-[9px] px-1 rounded-xs font-mono">봇</span>
                  <span className="text-[10px] text-neutral-400 font-mono">오늘 오후 3:15</span>
                </div>
                <div className="text-neutral-200 font-sans leading-relaxed pt-1">
                  <b>{message}</b>
                </div>
                <div className="text-neutral-400 font-mono text-[11px] pt-1">
                  • 신청자: {senderName}<br />
                  • 처리엔진: BAUHAUS_API_LAB
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-neutral-700 text-[11px] font-mono text-neutral-400">
            💡 [키 보관소]에서 본인의 실제 Discord 채널 웹훅 URL을 등록하면, 전송 버튼을 누르는 즉시 실제 스마트폰/PC 디스코드 앱에 알림이 울립니다.
          </div>
        </div>
      </div>
    </div>
  );
};
