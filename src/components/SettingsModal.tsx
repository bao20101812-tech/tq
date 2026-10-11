import React, { useState } from 'react';
import { X, RotateCcw, Download, Sliders, Globe } from 'lucide-react';
import { AppSettings, LanguageCode, ResponseMode } from '../types/chat';
import { SUPPORTED_LANGUAGES, TranslationStrings } from '../i18n/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  onExportCurrentChat: () => void;
  isDarkMode: boolean;
  t: TranslationStrings;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onExportCurrentChat,
  isDarkMode,
  t,
}) => {
  const [formData, setFormData] = useState<AppSettings>(settings);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(formData);
    onClose();
  };

  const handleReset = () => {
    setFormData({
      ...formData,
      customSystemInstruction: '',
      responseMode: 'balanced',
      responseLanguage: 'auto',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all duration-200 ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between border-inherit">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-blue-500" />
            <h3 className="font-semibold text-base">{t.settings}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* UI Language */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              {t.language}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setFormData({ ...formData, uiLanguage: lang.code })}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs border transition-all ${
                    formData.uiLanguage === lang.code
                      ? 'border-blue-500 bg-blue-500/10 text-blue-500 font-semibold'
                      : isDarkMode
                      ? 'border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-slate-300'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>{lang.flag} {lang.nativeName}</span>
                  <span className="text-[10px] text-slate-400 uppercase">{lang.code}</span>
                </button>
              ))}
            </div>
          </div>

          {/* AI Response Output Language */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              {t.outputLanguage}
            </label>
            <div className="relative">
              <select
                value={formData.responseLanguage}
                onChange={(e) => setFormData({ ...formData, responseLanguage: e.target.value })}
                className={`w-full text-xs p-2.5 rounded-xl border outline-hidden transition-colors ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <option value="auto">🌐 {t.autoDetect}</option>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.name}>
                    {lang.flag} {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Response Mode / Temperature */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              {t.mode}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['precise', 'balanced', 'creative'] as ResponseMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFormData({ ...formData, responseMode: mode })}
                  className={`p-2.5 rounded-xl text-center border text-xs transition-all ${
                    formData.responseMode === mode
                      ? 'border-blue-500 bg-blue-500/10 text-blue-500 font-semibold'
                      : isDarkMode
                      ? 'border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-slate-300'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="font-medium capitalize">{mode === 'precise' ? t.modePrecise : mode === 'creative' ? t.modeCreative : t.modeBalanced}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom System Instruction */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              {t.systemInstructionTitle}
            </label>
            <p className="text-[11px] text-slate-400 mb-2">{t.systemInstructionDesc}</p>
            <textarea
              rows={3}
              value={formData.customSystemInstruction}
              onChange={(e) => setFormData({ ...formData, customSystemInstruction: e.target.value })}
              placeholder="Nhập hướng dẫn riêng cho trợ lý (ví dụ: 'Hãy luôn đưa ra giải thích kèm code mẫu và phân tích hiệu năng'). Để trống để dùng thiết lập 4.0 chuẩn."
              className={`w-full text-xs p-3 rounded-xl border outline-hidden transition-colors resize-none ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200 placeholder-slate-500'
                  : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Quick Actions (Export, Reset) */}
          <div className="pt-2 flex items-center justify-between border-t border-inherit">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RotateCcw size={13} />
              <span>{t.resetDefault}</span>
            </button>

            <button
              type="button"
              onClick={onExportCurrentChat}
              className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-400 transition-colors"
            >
              <Download size={13} />
              <span>{t.exportChat}</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-end gap-2 border-inherit bg-slate-500/5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
};
