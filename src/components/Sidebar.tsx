import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Search, 
  Settings, 
  Sun, 
  Moon, 
  Globe, 
  ChevronLeft, 
  ChevronRight,
  Bot
} from 'lucide-react';
import { ChatSession, LanguageCode, UserPlan } from '../types/chat';
import { SUPPORTED_LANGUAGES, TranslationStrings } from '../i18n/translations';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onClearAll: () => void;
  uiLanguage: LanguageCode;
  onChangeUiLanguage: (lang: LanguageCode) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  t: TranslationStrings;
  userPlan: UserPlan;
  onOpenUpgradeModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onClearAll,
  uiLanguage,
  onChangeUiLanguage,
  isDarkMode,
  onToggleTheme,
  onOpenSettings,
  isOpen,
  onToggleOpen,
  t,
  userPlan,
  onOpenUpgradeModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startEditing = (s: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(s.id);
    setEditTitle(s.title);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === uiLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={onToggleOpen}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 flex flex-col transition-all duration-300 ease-in-out border-r
          ${isDarkMode ? 'bg-[#08080a] border-neutral-900 text-neutral-100' : 'bg-slate-50/95 border-slate-200 text-slate-800'}
          ${isOpen ? 'w-72 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-r-0 lg:overflow-hidden'}
        `}
      >
        {/* Top Header / App Brand */}
        <div className="p-4 border-b flex items-center justify-between gap-2 border-inherit">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src="/src/assets/images/chat_star_logo_1791721110607.jpg"
              alt="Chat 4.0 Logo"
              className="w-8 h-8 rounded-lg object-cover bg-black shadow-xs shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="truncate">
              <h1 className="font-semibold text-base leading-tight tracking-tight flex items-center gap-1.5">
                Chat 4.0
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  AI 4.0
                </span>
              </h1>
              <p className="text-xs text-slate-400 truncate">{t.appTagline}</p>
            </div>
          </div>

          <button
            onClick={onToggleOpen}
            className="lg:hidden p-1.5 rounded-md hover:bg-slate-200/50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            title="Close sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 shadow-xs cursor-pointer
              bg-blue-600 hover:bg-blue-500 text-white active:scale-[0.98]"
          >
            <Plus size={18} />
            <span>{t.newChat}</span>
          </button>
        </div>

        {/* Search input if more than 2 sessions */}
        {sessions.length > 2 && (
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
              <input
                type="text"
                placeholder={t.searchHistory}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border transition-colors outline-hidden
                  ${isDarkMode 
                    ? 'bg-slate-800/80 border-slate-700/80 text-slate-200 focus:border-blue-500 placeholder-slate-500' 
                    : 'bg-white border-slate-200 text-slate-700 focus:border-blue-500 placeholder-slate-400'}`}
              />
            </div>
          </div>
        )}

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
          <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            {t.conversations} ({sessions.length})
          </div>

          {filteredSessions.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-slate-400">
              {sessions.length === 0 ? t.noConversations : 'Không tìm thấy kết quả'}
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isActive = session.id === currentSessionId;
              const isRenaming = editingId === session.id;

              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`group relative flex items-center justify-between px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors duration-150
                    ${isActive
                      ? isDarkMode 
                        ? 'bg-neutral-900 text-white font-medium border border-neutral-800' 
                        : 'bg-blue-50 text-blue-700 font-medium'
                      : isDarkMode
                        ? 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden flex-1 mr-1">
                    <MessageSquare size={14} className="shrink-0 opacity-70" />
                    {isRenaming ? (
                      <input
                        type="text"
                        autoFocus
                        value={editTitle}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(session.id, e);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className={`w-full py-0.5 px-1.5 rounded text-xs outline-hidden border
                          ${isDarkMode ? 'bg-slate-900 border-blue-500 text-white' : 'bg-white border-blue-500 text-slate-900'}`}
                      />
                    ) : (
                      <span className="truncate">{session.title}</span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isRenaming ? (
                      <>
                        <button
                          onClick={(e) => handleSaveRename(session.id, e)}
                          className="p-1 hover:text-emerald-500"
                          title={t.save}
                        >
                          <Check size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(null);
                          }}
                          className="p-1 hover:text-slate-400"
                          title={t.cancel}
                        >
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => startEditing(session, e)}
                          className="p-1 text-slate-400 hover:text-slate-200"
                          title={t.rename}
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500"
                          title={t.delete}
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Clear All Chats Footer Button */}
        {sessions.length > 0 && (
          <div className="px-3 py-1">
            <button
              onClick={() => {
                if (window.confirm(t.clearConfirm)) {
                  onClearAll();
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 py-1 text-[11px] text-slate-400 hover:text-rose-500 transition-colors"
            >
              <Trash2 size={11} />
              <span>{t.clearAll}</span>
            </button>
          </div>
        )}

        {/* User Subscription & Daily Limit Card */}
        <div className="p-3 border-t border-inherit">
          {userPlan.tier === 'pro_medium' ? (
            <div className="p-3 rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-neutral-900 to-black text-xs space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 flex items-center gap-1.5 tracking-wide text-[11px]">
                  <span>⭐ PRO MEDIUM</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Đang hoạt động
                </span>
              </div>
              <p className="text-[11px] text-neutral-300">
                ✨ Không giới hạn câu hỏi hàng ngày
              </p>
              {userPlan.proExpiresAt && (
                <p className="text-[10px] text-neutral-500">
                  Hạn dùng: {new Date(userPlan.proExpiresAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-neutral-800 bg-[#0d0d10] text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-neutral-400 font-medium">Giới hạn hôm nay:</span>
                <span className="font-bold text-white font-mono">
                  {userPlan.questionsUsedToday}/{userPlan.maxDailyQuestions} câu
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    userPlan.questionsUsedToday >= userPlan.maxDailyQuestions
                      ? 'bg-rose-500'
                      : userPlan.questionsUsedToday >= 15
                      ? 'bg-amber-400'
                      : 'bg-blue-500'
                  }`}
                  style={{
                    width: `${Math.min(100, (userPlan.questionsUsedToday / userPlan.maxDailyQuestions) * 100)}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-neutral-400">
                <span>Còn lại: {Math.max(0, userPlan.maxDailyQuestions - userPlan.questionsUsedToday)} câu</span>
                <span>Tối đa: 20 câu/ngày</span>
              </div>

              <button
                type="button"
                onClick={onOpenUpgradeModal}
                className="w-full py-2 px-3 rounded-lg font-semibold text-[11px] text-black bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:brightness-110 shadow-md shadow-amber-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
              >
                <span>Nâng cấp Pro Medium</span>
                <span className="text-[10px] px-1 py-0.2 bg-black/20 rounded font-normal">20k/tháng</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Preferences Panel */}
        <div className="p-3 border-t border-inherit space-y-2">
          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs border transition-colors
                ${isDarkMode ? 'border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-slate-300' : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'}`}
            >
              <div className="flex items-center gap-2">
                <Globe size={13} className="text-blue-500" />
                <span>{currentLangObj.flag} {currentLangObj.name}</span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">{uiLanguage}</span>
            </button>

            {showLanguageMenu && (
              <div
                className={`absolute bottom-full left-0 right-0 mb-1 py-1 rounded-xl shadow-xl border z-50 max-h-56 overflow-y-auto
                  ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onChangeUiLanguage(lang.code);
                      setShowLanguageMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-blue-500/10 hover:text-blue-500 transition-colors
                      ${uiLanguage === lang.code ? 'font-semibold text-blue-500' : ''}`}
                  >
                    <span>{lang.flag} {lang.nativeName}</span>
                    <span className="text-[10px] text-slate-400">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme & Settings Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleTheme}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs border transition-colors
                ${isDarkMode ? 'border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-slate-300' : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'}`}
              title={isDarkMode ? t.themeLight : t.themeDark}
            >
              {isDarkMode ? <Sun size={13} className="text-amber-400" /> : <Moon size={13} className="text-indigo-500" />}
              <span>{isDarkMode ? t.themeLight : t.themeDark}</span>
            </button>

            <button
              onClick={onOpenSettings}
              className={`p-2 rounded-lg border transition-colors
                ${isDarkMode ? 'border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-slate-300' : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'}`}
              title={t.settings}
            >
              <Settings size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
