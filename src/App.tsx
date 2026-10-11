import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  Plus, 
  Download, 
  Trash2, 
  Bot, 
  SlidersHorizontal,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SettingsModal } from './components/SettingsModal';
import { ProUpgradeModal } from './components/ProUpgradeModal';
import { ChatSession, Message, AppSettings, ResponseMode, LanguageCode, UserPlan } from './types/chat';
import { translations, TranslationStrings } from './i18n/translations';

const STORAGE_SESSIONS_KEY = 'chat_4_0_sessions_v1';
const STORAGE_SETTINGS_KEY = 'chat_4_0_settings_v1';
const STORAGE_USER_PLAN_KEY = 'chat_4_0_user_plan_v1';

export default function App() {
  // Load settings or defaults
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      uiLanguage: 'vi',
      responseLanguage: 'auto',
      responseMode: 'balanced',
      customSystemInstruction: '',
      darkMode: true,
    };
  });

  // Auto reset chat sessions on each entry as requested
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      localStorage.removeItem(STORAGE_SESSIONS_KEY);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const [userPlan, setUserPlan] = useState<UserPlan>(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      const saved = localStorage.getItem(STORAGE_USER_PLAN_KEY);
      if (saved) {
        const parsed: UserPlan = JSON.parse(saved);
        const isPro = parsed.tier === 'pro_medium' && (!parsed.proExpiresAt || parsed.proExpiresAt > Date.now());
        return {
          tier: isPro ? 'pro_medium' : 'free',
          questionsUsedToday: 0, // Reset question count on entry
          lastActiveDate: todayStr,
          maxDailyQuestions: 20,
          proExpiresAt: isPro ? parsed.proExpiresAt : undefined,
          transactionId: parsed.transactionId,
          paymentMethod: parsed.paymentMethod,
        };
      }
    } catch (e) {
      console.error(e);
    }
    return {
      tier: 'free',
      questionsUsedToday: 0,
      lastActiveDate: todayStr,
      maxDailyQuestions: 20,
    };
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find((s) => s.id === currentSessionId) || null;
  const currentMessages = currentSession?.messages || [];
  const t: TranslationStrings = translations[settings.uiLanguage] || translations.vi;

  // Sync dark mode class to document element
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  // Persist sessions
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SESSIONS_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error(e);
    }
  }, [sessions]);

  // Persist user plan
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_USER_PLAN_KEY, JSON.stringify(userPlan));
    } catch (e) {
      console.error(e);
    }
  }, [userPlan]);

  const handleUpgradeSuccess = (
    days: number = 30,
    transactionInfo?: { transactionId: string; paymentMethod: string }
  ) => {
    const expiresAt = Date.now() + days * 24 * 60 * 60 * 1000;
    setUserPlan((prev) => ({
      ...prev,
      tier: 'pro_medium',
      proExpiresAt: expiresAt,
      transactionId: transactionInfo?.transactionId,
      paymentMethod: transactionInfo?.paymentMethod,
      transactionDate: Date.now(),
    }));
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (isStreaming || currentMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentMessages, isStreaming]);

  // Reset all state (both manual and on visit)
  const handleResetAll = () => {
    if (isStreaming) handleStopStreaming();
    setSessions([]);
    setCurrentSessionId(null);
    setUserPlan((prev) => ({
      ...prev,
      questionsUsedToday: 0,
    }));
    try {
      localStorage.removeItem(STORAGE_SESSIONS_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  // Create a new chat session
  const handleCreateNewChat = () => {
    const newSession: ChatSession = {
      id: 'session_' + Date.now(),
      title: `${t.newChat} ${sessions.length + 1}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      responseMode: settings.responseMode,
      targetLanguage: settings.responseLanguage,
    };

    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  // Select existing session
  const handleSelectSession = (id: string) => {
    if (isStreaming) {
      handleStopStreaming();
    }
    setCurrentSessionId(id);
  };

  // Delete session
  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (currentSessionId === id) {
        setCurrentSessionId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  // Rename session
  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s))
    );
  };

  // Clear all sessions
  const handleClearAllSessions = () => {
    if (isStreaming) handleStopStreaming();
    setSessions([]);
    setCurrentSessionId(null);
  };

  // Change response mode for current session and settings
  const handleChangeResponseMode = (mode: ResponseMode) => {
    setSettings((prev) => ({ ...prev, responseMode: mode }));
    if (currentSessionId) {
      setSessions((prev) =>
        prev.map((s) => (s.id === currentSessionId ? { ...s, responseMode: mode } : s))
      );
    }
  };

  // Change target output language
  const handleChangeTargetLanguage = (lang: string) => {
    setSettings((prev) => ({ ...prev, responseLanguage: lang }));
    if (currentSessionId) {
      setSessions((prev) =>
        prev.map((s) => (s.id === currentSessionId ? { ...s, targetLanguage: lang } : s))
      );
    }
  };

  // Stop streaming response
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);

    // Turn off streaming flag for any streaming message
    if (currentSessionId) {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== currentSessionId) return s;
          return {
            ...s,
            messages: s.messages.map((m) => (m.isStreaming ? { ...m, isStreaming: false } : m)),
          };
        })
      );
    }
  };

  // Temperature based on response mode
  const getTemperature = (mode: ResponseMode) => {
    switch (mode) {
      case 'precise':
        return 0.2;
      case 'creative':
        return 1.0;
      default:
        return 0.7;
    }
  };

  // Send message and stream response from AI
  const handleSendMessage = async (userPrompt: string, attachedContent?: string) => {
    let fullPrompt = userPrompt;
    if (attachedContent) {
      fullPrompt = `${attachedContent}\n\n${userPrompt}`;
    }

    if (!fullPrompt.trim()) return;

    // Check daily limit for free tier
    if (userPlan.tier === 'free' && userPlan.questionsUsedToday >= userPlan.maxDailyQuestions) {
      setIsProModalOpen(true);
      return;
    }

    // Increment question count for free tier
    if (userPlan.tier === 'free') {
      setUserPlan((prev) => ({
        ...prev,
        questionsUsedToday: prev.questionsUsedToday + 1,
      }));
    }

    let activeSessionId = currentSessionId;
    let targetSession = sessions.find((s) => s.id === activeSessionId);

    // If no active session, create one
    if (!targetSession || !activeSessionId) {
      const newSession: ChatSession = {
        id: 'session_' + Date.now(),
        title: userPrompt.slice(0, 32) || t.newChat,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        responseMode: settings.responseMode,
        targetLanguage: settings.responseLanguage,
      };
      setSessions((prev) => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      activeSessionId = newSession.id;
      targetSession = newSession;
    }

    const userMessage: Message = {
      id: 'msg_' + Date.now() + '_user',
      role: 'user',
      content: fullPrompt,
      timestamp: Date.now(),
    };

    const assistantMessageId = 'msg_' + (Date.now() + 1) + '_assistant';
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    const updatedMessages = [...(targetSession?.messages || []), userMessage, assistantMessage];

    // Auto title for the session if this was the first message
    const isFirstMessage = (targetSession?.messages || []).length === 0;
    const sessionTitle = isFirstMessage ? (userPrompt.slice(0, 32) || t.newChat) : targetSession?.title;

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        return {
          ...s,
          title: sessionTitle || s.title,
          updatedAt: Date.now(),
          messages: updatedMessages,
        };
      })
    );

    setIsStreaming(true);
    abortControllerRef.current = new AbortController();

    try {
      // Build messages payload for backend
      const apiMessages = [...(targetSession?.messages || []), userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          systemInstruction: settings.customSystemInstruction || undefined,
          temperature: getTemperature(targetSession?.responseMode || settings.responseMode),
          targetLanguage: targetSession?.targetLanguage || settings.responseLanguage,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || t.errorGenerating);
      }

      if (!res.body) {
        throw new Error('Readable stream not supported.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;

          const dataStr = trimmed.slice(5).trim();
          if (dataStr === '[DONE]') {
            break;
          }

          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.text) {
              accumulatedText += parsed.text;

              setSessions((prev) =>
                prev.map((s) => {
                  if (s.id !== activeSessionId) return s;
                  return {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, content: accumulatedText, isStreaming: true }
                        : m
                    ),
                  };
                })
              );
            }
          } catch (e) {
            // non-json or chunk delimiter
          }
        }
      }

      // Finalize completed streaming message
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSessionId) return s;
          return {
            ...s,
            messages: s.messages.map((m) =>
              m.id === assistantMessageId
                ? { ...m, content: accumulatedText || '...', isStreaming: false }
                : m
            ),
          };
        })
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream generation aborted by user.');
      } else {
        console.error('Error generating response:', err);
        const errMsg = `⚠️ ${err.message || t.errorGenerating}`;

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== activeSessionId) return s;
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, content: errMsg, isStreaming: false }
                  : m
              ),
            };
          })
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate last response
  const handleRegenerate = () => {
    if (!currentSession || currentMessages.length === 0 || isStreaming) return;

    // Find the last assistant message
    const lastMsg = currentMessages[currentMessages.length - 1];
    if (lastMsg.role !== 'assistant') return;

    // Remove last message and get the previous user message
    const prevUserMsg = currentMessages[currentMessages.length - 2];
    if (!prevUserMsg || prevUserMsg.role !== 'user') return;

    // Strip the last assistant message
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== currentSession.id) return s;
        return {
          ...s,
          messages: s.messages.slice(0, -1),
        };
      })
    );

    // Resend
    handleSendMessage(prevUserMsg.content);
  };

  // Rate message (like / dislike)
  const handleRateMessage = (messageId: string, rating: 'like' | 'dislike') => {
    if (!currentSessionId) return;
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== currentSessionId) return s;
        return {
          ...s,
          messages: s.messages.map((m) => (m.id === messageId ? { ...m, rating } : m)),
        };
      })
    );
  };

  // Export current chat session as Markdown
  const handleExportChat = () => {
    if (!currentSession || currentMessages.length === 0) return;

    let md = `# ${currentSession.title}\n`;
    md += `*Thời gian: ${new Date(currentSession.createdAt).toLocaleString()}*\n\n---\n\n`;

    currentMessages.forEach((m) => {
      const sender = m.role === 'user' ? '👤 Người dùng' : '🤖 Chat 4.0';
      md += `### ${sender} (${new Date(m.timestamp).toLocaleTimeString()}):\n\n${m.content}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSession.title.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9-]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isDarkMode = settings.darkMode;

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden ${
        isDarkMode ? 'bg-black text-white' : 'bg-white text-slate-800'
      }`}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleCreateNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onClearAll={handleClearAllSessions}
        uiLanguage={settings.uiLanguage}
        onChangeUiLanguage={(lang: LanguageCode) => setSettings((prev) => ({ ...prev, uiLanguage: lang }))}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }))}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
        t={t}
        userPlan={userPlan}
        onOpenUpgradeModal={() => setIsProModalOpen(true)}
      />

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden relative ${isDarkMode ? 'bg-black' : 'bg-slate-50'}`}>
        {/* Top Navbar */}
        <header
          className={`h-14 px-4 border-b flex items-center justify-between gap-3 shrink-0 transition-colors ${
            isDarkMode ? 'bg-black/90 border-neutral-900 backdrop-blur-md' : 'bg-white/90 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-slate-200 transition-colors"
              title="Toggle sidebar"
            >
              <Menu size={18} />
            </button>

            <div className="flex items-center gap-2 truncate">
              <img
                src="/src/assets/images/chat_star_logo_1791721110607.jpg"
                alt="Chat 4.0 Logo"
                className="w-6 h-6 rounded-md object-cover bg-black ring-1 ring-white/10 shrink-0"
                referrerPolicy="no-referrer"
              />
              <h2 className="text-sm font-semibold truncate">
                {currentSession ? currentSession.title : t.appName}
              </h2>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Pro Upgrade / Status Button */}
            {userPlan.tier === 'pro_medium' ? (
              <button
                onClick={() => setIsProModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
                title="Quản lý gói Pro Medium"
              >
                <span>⭐ PRO MEDIUM</span>
              </button>
            ) : (
              <button
                onClick={() => setIsProModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-black hover:brightness-110 shadow-sm transition-all cursor-pointer"
              >
                <span>⭐ Nâng cấp Pro (20k/tháng)</span>
              </button>
            )}

            {currentSession && currentMessages.length > 0 && (
              <button
                onClick={handleExportChat}
                className="p-2 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-slate-200 transition-colors"
                title={t.exportChat}
              >
                <Download size={16} />
              </button>
            )}

            <button
              onClick={handleResetAll}
              className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors border border-transparent hover:border-neutral-700 cursor-pointer"
              title="Làm mới toàn bộ (Reset)"
            >
              <RotateCcw size={14} />
              <span className="hidden md:inline">Làm mới</span>
            </button>

            <button
              onClick={handleCreateNewChat}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>{t.newChat}</span>
            </button>
          </div>
        </header>

        {/* Message Feed / Welcome Screen */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {currentMessages.length === 0 ? (
            <WelcomeScreen
              onSelectPrompt={(prompt) => handleSendMessage(prompt)}
              isDarkMode={isDarkMode}
              t={t}
            />
          ) : (
            <div className="flex-1 divide-y divide-inherit">
              {currentMessages.map((msg, idx) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isLast={idx === currentMessages.length - 1}
                  onRegenerate={handleRegenerate}
                  onRate={(rating) => handleRateMessage(msg.id, rating)}
                  isDarkMode={isDarkMode}
                  t={t}
                />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Bottom Floating Prompt Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          onStopStreaming={handleStopStreaming}
          responseMode={currentSession?.responseMode || settings.responseMode}
          onChangeResponseMode={handleChangeResponseMode}
          targetLanguage={currentSession?.targetLanguage || settings.responseLanguage}
          onChangeTargetLanguage={handleChangeTargetLanguage}
          isDarkMode={isDarkMode}
          t={t}
          userPlan={userPlan}
          onOpenUpgradeModal={() => setIsProModalOpen(true)}
        />
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
        onExportCurrentChat={handleExportChat}
        isDarkMode={isDarkMode}
        t={t}
      />

      {/* Pro Medium Upgrade Modal */}
      <ProUpgradeModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        onUpgradeSuccess={handleUpgradeSuccess}
        isDarkMode={isDarkMode}
        t={t}
        currentTier={userPlan.tier}
        proExpiresAt={userPlan.proExpiresAt}
      />
    </div>
  );
}
