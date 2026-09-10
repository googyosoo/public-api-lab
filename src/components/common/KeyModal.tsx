import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Key, ExternalLink, Check, Trash2, Lock } from 'lucide-react';
import { KeyVault } from '../../services/keyVault';
import { ApiKeyStore } from '../../types/api';

interface KeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeysUpdated: () => void;
}

export const KeyModal: React.FC<KeyModalProps> = ({ isOpen, onClose, onKeysUpdated }) => {
  const [keys, setKeys] = useState<ApiKeyStore>(KeyVault.getKeys());
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setKeys(KeyVault.getKeys());
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof ApiKeyStore, value: string) => {
    setKeys((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    KeyVault.saveAllKeys(keys);
    setSaveSuccess(true);
    onKeysUpdated();
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleClear = () => {
    if (confirm('저장된 모든 API 키를 브라우저에서 삭제하시겠습니까?')) {
      KeyVault.clearAllKeys();
      setKeys(KeyVault.getKeys());
      onKeysUpdated();
    }
  };

  const keyConfigs: { id: keyof ApiKeyStore; label: string; placeholder: string; guideKey: keyof ApiKeyStore }[] = [
    { id: 'kmaKey', label: '기상청 서비스키 (공공데이터포털)', placeholder: 'kMa9... 일반 인증키(Encoding/Decoding)', guideKey: 'kmaKey' },
    { id: 'neisKey', label: '나이스(NEIS) 오픈API 인증키', placeholder: 'ne1s... 32자리 인증키', guideKey: 'neisKey' },
    { id: 'airKey', label: '에어코리아 서비스키 (공공데이터포털)', placeholder: 'a1rK... 대기오염정보 서비스키', guideKey: 'airKey' },
    { id: 'kasiKey', label: '천문연구원 특일/출몰 서비스키', placeholder: 'kAsI... 천문정보 서비스키', guideKey: 'kasiKey' },
    { id: 'nlKey', label: '국립중앙도서관 오픈API 인증키', placeholder: '국립도서관/정보나루 인증키', guideKey: 'nlKey' },
    { id: 'webhookUrl', label: 'Discord / Slack Webhook URL', placeholder: 'https://discord.com/api/webhooks/...', guideKey: 'webhookUrl' },
    { id: 'kakaoKey', label: '카카오 REST 키 (도서검색/지도 공통)', placeholder: '카카오 REST API 키 (KakaoAK)', guideKey: 'kakaoKey' },
    { id: 'geminiKey', label: 'Google Gemini API Key', placeholder: 'AIzaSy... Google AI Studio 키', guideKey: 'geminiKey' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border-2 border-bauhaus-black b-shadow w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* 모달 상단 */}
        <div className="bg-bauhaus-black text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-bauhaus-black">
          <div className="flex items-center gap-2 font-mono text-sm font-bold">
            <Key className="w-4 h-4 text-bauhaus-yellow" />
            <span>API KEY VAULT // 보안 키 보관소</span>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 보안 안내 스트립 */}
        <div className="bg-amber-50 border-b-2 border-bauhaus-black px-5 py-2.5 text-xs font-mono text-amber-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-bauhaus-red shrink-0" />
          <span>
            <b>안심하세요:</b> 입력하신 모든 키는 외부 서버로 전송되지 않으며, 사용자 본인의 브라우저 <b>LocalStorage</b>에만 보관됩니다.
          </span>
        </div>

        {/* 키 입력 폼 영역 */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <p className="text-xs text-neutral-600 font-sans">
            실제 API 키가 없어도 <b>시뮬레이션 모드</b>를 통해 100% 동일한 실물 데이터를 체험할 수 있습니다.
            키를 발급받으신 경우 아래에 입력하면 실시간 Live 통신으로 전환됩니다.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keyConfigs.map((cfg) => {
              const guide = KeyVault.getIssueGuide(cfg.guideKey);
              return (
                <div key={cfg.id} className="border-2 border-bauhaus-black p-3 bg-neutral-50 b-shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <label className="font-mono text-xs font-bold text-bauhaus-black truncate">
                        {cfg.label}
                      </label>
                      <a
                        href={guide.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-mono text-bauhaus-blue hover:underline flex items-center gap-0.5 shrink-0"
                      >
                        <span>발급</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono mb-2">
                      {guide.cost} · {guide.authMethod}
                    </div>
                    <input
                      type="password"
                      value={keys[cfg.id]}
                      onChange={(e) => handleChange(cfg.id, e.target.value)}
                      placeholder={cfg.placeholder}
                      className="w-full text-xs font-mono px-2 py-1.5 border-2 border-bauhaus-black bg-white focus:outline-hidden focus:bg-amber-50"
                    />
                  </div>
                  {keys[cfg.id] && (
                    <div className="mt-2 text-[10px] font-mono text-bauhaus-green flex items-center gap-1 font-bold">
                      <Check className="w-3 h-3" />
                      <span>키 등록됨: {KeyVault.maskKey(keys[cfg.id])}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 모달 하단 액션 */}
        <div className="bg-neutral-100 border-t-2 border-bauhaus-black px-5 py-3 flex items-center justify-between">
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-xs font-mono text-neutral-500 hover:text-bauhaus-red"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>모든 키 초기화</span>
          </button>

          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs font-mono text-bauhaus-green font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> 저장되었습니다!
              </span>
            )}
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-bauhaus-black text-white text-xs font-mono font-bold hover:bg-neutral-800 transition-colors border-2 border-bauhaus-black"
            >
              저장하고 닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
