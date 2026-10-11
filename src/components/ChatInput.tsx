import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowUp, 
  Square, 
  Paperclip, 
  X, 
  SlidersHorizontal, 
  Globe 
} from 'lucide-react';
import { ResponseMode, UserPlan } from '../types/chat';
import { SUPPORTED_LANGUAGES, TranslationStrings } from '../i18n/translations';

interface ChatInputProps {
  onSendMessage: (message: string, attachedFileContent?: string) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  responseMode: ResponseMode;
  onChangeResponseMode: (mode: ResponseMode) => void;
  targetLanguage: string;
  onChangeTargetLanguage: (lang: string) => void;
  isDarkMode: boolean;
  t: TranslationStrings;
  userPlan: UserPlan;
  onOpenUpgradeModal: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  responseMode,
  onChangeResponseMode,
  targetLanguage,
  onChangeTargetLanguage,
  isDarkMode,
  t,
  userPlan,
  onOpenUpgradeModal,
}) => {
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea based on input height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [input]);

  const isLimitReached = userPlan.tier === 'free' && userPlan.questionsUsedToday >= userPlan.maxDailyQuestions;

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isStreaming) {
      onStopStreaming();
      return;
    }

    if (isLimitReached) {
      onOpenUpgradeModal();
      return;
    }

    if (!input.trim() && !attachedFile) return;

    onSendMessage(input.trim(), attachedFile?.content);
    setInput('');
    setAttachedFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert(t.fileTooLarge);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setAttachedFile({
        name: file.name,
        content: `[Tệp đính kèm: ${file.name}]\n${content}\n---`,
      });
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  const getModeLabel = (mode: ResponseMode) => {
    switch (mode) {
      case 'precise':
        return t.modePrecise;
      case 'creative':
        return t.modeCreative;
      default:
        return t.modeBalanced;
    }
  };

  const currentLangLabel = targetLanguage === 'auto'
    ? t.autoDetect
    : (SUPPORTED_LANGUAGES.find((l) => l.code === targetLanguage)?.nativeName || targetLanguage);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 pt-1">
      {/* Daily limit reached banner */}
      {isLimitReached && (
        <div className="mb-2 p-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 flex items-center justify-between text-xs text-amber-200 shadow-md">
          <div className="flex items-center gap-2">
            <span>⚡ {t.limitReachedTitle}</span>
          </div>
          <button
            type="button"
            onClick={onOpenUpgradeModal}
            className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs transition-colors cursor-pointer"
          >
            Nâng cấp 20k/tháng
          </button>
        </div>
      )}

      <div
        className={`relative rounded-2xl border transition-all duration-200 shadow-xl ${
          isDarkMode
            ? 'bg-[#0d0d0f] border-neutral-800 focus-within:border-white/40 focus-within:ring-1 focus-within:ring-white/20'
            : 'bg-white border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'
        }`}
      >
        {/* Attached file chip if present */}
        {attachedFile && (
          <div className="px-3.5 pt-2.5 flex items-center gap-2">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono ${
              isDarkMode ? 'bg-slate-700/80 text-blue-300' : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              <Paperclip size={12} />
              <span className="truncate max-w-xs">{attachedFile.name}</span>
              <button
                type="button"
                onClick={() => setAttachedFile(null)}
                className="hover:text-rose-500 transition-colors ml-1"
                title="Gỡ tệp"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Textarea */}
        <div className="px-3.5 pt-2.5 pb-1">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.inputPlaceholder}
            className={`w-full resize-none max-h-44 text-sm leading-relaxed outline-hidden bg-transparent placeholder-slate-400 ${
              isDarkMode ? 'text-slate-100' : 'text-slate-800'
            }`}
          />
        </div>

        {/* Bottom Toolbar & Action buttons */}
        <div className="px-3 py-2 flex items-center justify-between gap-2 border-t border-inherit">
          {/* Left tools: Mode selector & Language target */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* File upload hidden input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.json,.js,.ts,.tsx,.py,.html,.css,.csv,.sql"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-500/10 transition-colors"
              title={t.attachFile}
            >
              <Paperclip size={15} />
            </button>

            {/* Response Mode Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowModeMenu(!showModeMenu);
                  setShowLanguageMenu(false);
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  isDarkMode 
                    ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' 
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
                title="Thay đổi chế độ tư duy"
              >
                <SlidersHorizontal size={12} className="text-blue-500" />
                <span className="hidden sm:inline">{getModeLabel(responseMode)}</span>
              </button>

              {showModeMenu && (
                <div
                  className={`absolute bottom-full left-0 mb-1 w-56 py-1 rounded-xl shadow-xl border z-50 text-xs ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onChangeResponseMode('precise');
                      setShowModeMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-blue-500/10 transition-colors ${
                      responseMode === 'precise' ? 'font-semibold text-blue-500' : ''
                    }`}
                  >
                    <div className="font-medium">{t.modePrecise}</div>
                    <div className="text-[10px] text-slate-400">{t.modePreciseDesc}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onChangeResponseMode('balanced');
                      setShowModeMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-blue-500/10 transition-colors ${
                      responseMode === 'balanced' ? 'font-semibold text-blue-500' : ''
                    }`}
                  >
                    <div className="font-medium">{t.modeBalanced}</div>
                    <div className="text-[10px] text-slate-400">{t.modeBalancedDesc}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onChangeResponseMode('creative');
                      setShowModeMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-blue-500/10 transition-colors ${
                      responseMode === 'creative' ? 'font-semibold text-blue-500' : ''
                    }`}
                  >
                    <div className="font-medium">{t.modeCreative}</div>
                    <div className="text-[10px] text-slate-400">{t.modeCreativeDesc}</div>
                  </button>
                </div>
              )}
            </div>

            {/* Target Output Language */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowLanguageMenu(!showLanguageMenu);
                  setShowModeMenu(false);
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  isDarkMode 
                    ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' 
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
                title="Ngôn ngữ câu trả lời của AI"
              >
                <Globe size={12} className="text-emerald-500" />
                <span className="hidden sm:inline">{currentLangLabel}</span>
              </button>

              {showLanguageMenu && (
                <div
                  className={`absolute bottom-full left-0 mb-1 w-52 py-1 rounded-xl shadow-xl border z-50 text-xs max-h-56 overflow-y-auto ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onChangeTargetLanguage('auto');
                      setShowLanguageMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 hover:bg-blue-500/10 transition-colors ${
                      targetLanguage === 'auto' ? 'font-semibold text-blue-500' : ''
                    }`}
                  >
                    🌐 {t.autoDetect}
                  </button>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        onChangeTargetLanguage(lang.name);
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-blue-500/10 flex items-center justify-between transition-colors ${
                        targetLanguage === lang.name ? 'font-semibold text-blue-500' : ''
                      }`}
                    >
                      <span>{lang.flag} {lang.nativeName}</span>
                      <span className="text-[10px] text-slate-400">{lang.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Action: Send or Stop button */}
          <div className="flex items-center gap-2">
            {/* Limit Counter Badge */}
            <button
              type="button"
              onClick={userPlan.tier === 'free' ? onOpenUpgradeModal : undefined}
              className={`text-[11px] px-2 py-0.5 rounded-md font-medium transition-colors hidden sm:inline-flex items-center gap-1 ${
                userPlan.tier === 'pro_medium'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : isLimitReached
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                  : 'bg-neutral-800 text-neutral-300 border border-neutral-700/80 hover:border-amber-400/50'
              }`}
              title={userPlan.tier === 'free' ? 'Bấm để nâng cấp Pro Medium' : 'Tài khoản Pro Medium'}
            >
              {userPlan.tier === 'pro_medium' ? (
                <span>⭐ Pro Medium</span>
              ) : (
                <span>
                  {Math.max(0, userPlan.maxDailyQuestions - userPlan.questionsUsedToday)}/20 câu
                </span>
              )}
            </button>

            {input.length > 0 && (
              <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                {input.length} {t.charCount}
              </span>
            )}

            {isStreaming ? (
              <button
                type="button"
                onClick={onStopStreaming}
                className="w-8 h-8 rounded-xl bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition-all shadow-xs cursor-pointer animate-pulse"
                title={t.stop}
              >
                <Square size={14} fill="currentColor" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!input.trim() && !attachedFile}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 shadow-xs cursor-pointer ${
                  input.trim() || attachedFile
                    ? 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
                    : 'bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-50'
                }`}
                title={t.send}
              >
                <ArrowUp size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="text-center mt-2">
        <p className="text-[11px] text-slate-400">
          {t.poweredBy} • Chat 4.0 có thể mắc lỗi, hãy kiểm tra lại thông tin quan trọng.
        </p>
      </div>
    </div>
  );
};
