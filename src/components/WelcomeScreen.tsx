import React from 'react';
import { 
  Bot, 
  Brain, 
  Code, 
  Cpu, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Languages 
} from 'lucide-react';
import { TranslationStrings } from '../i18n/translations';

interface WelcomeScreenProps {
  onSelectPrompt: (prompt: string) => void;
  isDarkMode: boolean;
  t: TranslationStrings;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectPrompt,
  isDarkMode,
  t,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Brain':
        return <Brain size={18} className="text-purple-500" />;
      case 'Code':
        return <Code size={18} className="text-blue-500" />;
      case 'Cpu':
        return <Cpu size={18} className="text-emerald-500" />;
      case 'TrendingUp':
        return <TrendingUp size={18} className="text-amber-500" />;
      default:
        return <Sparkles size={18} className="text-blue-500" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-3xl mx-auto w-full text-center my-auto">
      {/* Hero Badge & Avatar */}
      <div className="relative mb-5">
        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-2 ring-white/10 bg-black flex items-center justify-center">
          <img
            src="/src/assets/images/chat_star_logo_1791721110607.jpg"
            alt="Chat 4.0 Logo"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-slate-900 shadow-xs" title="Online & Ready">
          <Zap size={10} />
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2.5">
        {t.welcomeTitle}
      </h2>
      <p className={`text-sm md:text-base max-w-xl mx-auto mb-6 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
        {t.welcomeSubtitle}
      </p>

      {/* 4.0 Feature Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8 text-xs">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors ${
          isDarkMode ? 'bg-[#0e0e11] border-neutral-800 text-neutral-300' : 'bg-slate-100 border-slate-200 text-slate-700'
        }`}>
          <Languages size={13} className="text-white" />
          Đa ngôn ngữ toàn cầu
        </span>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors ${
          isDarkMode ? 'bg-[#0e0e11] border-neutral-800 text-neutral-300' : 'bg-slate-100 border-slate-200 text-slate-700'
        }`}>
          <Cpu size={13} className="text-white" />
          Cách mạng 4.0 & IoT
        </span>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors ${
          isDarkMode ? 'bg-[#0e0e11] border-neutral-800 text-neutral-300' : 'bg-slate-100 border-slate-200 text-slate-700'
        }`}>
          <ShieldCheck size={13} className="text-white" />
          Phân tích & Lập trình chuẩn xác
        </span>
      </div>

      {/* Suggestion Prompts Section */}
      <div className="w-full text-left">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3 px-1">
          {t.suggestions.title}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {t.suggestions.items.map((item, index) => (
            <button
              key={index}
              onClick={() => onSelectPrompt(item.prompt)}
              className={`group flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                isDarkMode
                  ? 'bg-[#0c0c0e] border-neutral-800/80 hover:bg-[#141418] hover:border-neutral-700 hover:shadow-lg hover:shadow-black'
                  : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className={`shrink-0 p-2 rounded-lg ${isDarkMode ? 'bg-[#18181d] group-hover:bg-[#202026]' : 'bg-slate-100 group-hover:bg-blue-50'}`}>
                {getIcon(item.icon)}
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-white mb-0.5">
                  {item.category}
                </span>
                <span className={`block text-xs font-medium leading-snug line-clamp-2 ${isDarkMode ? 'text-neutral-300' : 'text-slate-700'}`}>
                  {item.prompt}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
