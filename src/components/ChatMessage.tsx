import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  ThumbsUp, 
  ThumbsDown 
} from 'lucide-react';
import { Message } from '../types/chat';
import { TranslationStrings } from '../i18n/translations';

interface ChatMessageProps {
  message: Message;
  isLast: boolean;
  onRegenerate?: () => void;
  onRate?: (rating: 'like' | 'dislike') => void;
  isDarkMode: boolean;
  t: TranslationStrings;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLast,
  onRegenerate,
  onRate,
  isDarkMode,
  t,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending utterances
    const cleanText = message.content.replace(/```[\s\S]*?```/g, 'Code block omitted.');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div
      className={`py-6 px-4 md:px-6 transition-colors ${
        isUser
          ? isDarkMode ? 'bg-black' : 'bg-transparent'
          : isDarkMode ? 'bg-[#09090b]/90 border-y border-neutral-900' : 'bg-slate-50/70 border-y border-slate-100'
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-3 md:gap-4 items-start">
        {/* Avatar */}
        <div
          className={`shrink-0 w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center text-xs font-medium shadow-xs ${
            isUser
              ? 'bg-slate-700 text-white'
              : 'bg-black text-white ring-1 ring-white/10'
          }`}
        >
          {isUser ? (
            <User size={16} />
          ) : (
            <img
              src="/src/assets/images/chat_star_logo_1791721110607.jpg"
              alt="Chat 4.0"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header Role info */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs tracking-tight">
              {isUser ? 'Bạn' : 'Chat 4.0'}
            </span>
            <span className="text-[10px] text-slate-400">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {!isUser && (
              <span className="text-[9px] px-1 py-0.2 rounded font-mono bg-blue-500/10 text-blue-500 border border-blue-500/20">
                GPT-4.0 AI
              </span>
            )}
          </div>

          {/* Message Markdown or Text */}
          <div
            className={`text-sm leading-relaxed break-words ${
              isDarkMode ? 'text-slate-200' : 'text-slate-800'
            }`}
          >
            {isUser ? (
              <div className="whitespace-pre-wrap">{message.content}</div>
            ) : (
              <div className={`prose max-w-none ${isDarkMode ? 'prose-invert' : ''} ${message.isStreaming ? 'streaming-cursor' : ''}`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-3 leading-relaxed last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    h1: ({ children }) => <h1 className="text-lg font-bold my-3">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-bold my-2.5">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-bold my-2">{children}</h3>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-blue-500 pl-3 my-2 italic text-slate-400">
                        {children}
                      </blockquote>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-3 border rounded-lg border-inherit">
                        <table className="w-full text-xs text-left border-collapse">{children}</table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="p-2 border-b border-inherit font-semibold bg-slate-500/10">{children}</th>
                    ),
                    td: ({ children }) => <td className="p-2 border-b border-inherit">{children}</td>,
                    code: ({ inline, className, children, ...props }: any) => {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeString = String(children).replace(/\n$/, '');
                      
                      if (!inline && (match || codeString.includes('\n'))) {
                        return (
                          <CodeBlock
                            language={match ? match[1] : 'code'}
                            code={codeString}
                            isDarkMode={isDarkMode}
                            t={t}
                          />
                        );
                      }
                      return (
                        <code
                          className={`px-1.5 py-0.5 rounded text-xs font-mono font-medium ${
                            isDarkMode ? 'bg-slate-800 text-blue-300' : 'bg-slate-100 text-blue-700'
                          }`}
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Action toolbar for Assistant messages */}
          {!isUser && !message.isStreaming && (
            <div className="flex items-center gap-1 pt-1.5 text-slate-400">
              {/* Copy */}
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 p-1.5 rounded-md text-xs hover:text-slate-200 hover:bg-slate-700/30 transition-colors"
                title={copied ? t.copied : t.copy}
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                {copied && <span className="text-[11px] text-emerald-500">{t.copied}</span>}
              </button>

              {/* Text-to-Speech */}
              <button
                onClick={handleSpeak}
                className={`flex items-center gap-1 p-1.5 rounded-md text-xs hover:text-slate-200 hover:bg-slate-700/30 transition-colors ${
                  isSpeaking ? 'text-blue-500 bg-blue-500/10' : ''
                }`}
                title={isSpeaking ? t.stopAudio : t.readAloud}
              >
                {isSpeaking ? <VolumeX size={13} /> : <Volume2 size={13} />}
              </button>

              {/* Rating */}
              <button
                onClick={() => onRate?.('like')}
                className={`p-1.5 rounded-md text-xs hover:text-slate-200 hover:bg-slate-700/30 transition-colors ${
                  message.rating === 'like' ? 'text-emerald-500' : ''
                }`}
                title="Hữu ích"
              >
                <ThumbsUp size={13} />
              </button>

              <button
                onClick={() => onRate?.('dislike')}
                className={`p-1.5 rounded-md text-xs hover:text-slate-200 hover:bg-slate-700/30 transition-colors ${
                  message.rating === 'dislike' ? 'text-rose-500' : ''
                }`}
                title="Chưa hài lòng"
              >
                <ThumbsDown size={13} />
              </button>

              {/* Regenerate if this is the last message */}
              {isLast && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1 p-1.5 rounded-md text-xs hover:text-slate-200 hover:bg-slate-700/30 transition-colors ml-auto"
                  title={t.regenerate}
                >
                  <RotateCcw size={13} />
                  <span className="hidden sm:inline text-[11px]">{t.regenerate}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface CodeBlockProps {
  language: string;
  code: string;
  isDarkMode: boolean;
  t: TranslationStrings;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code, isDarkMode, t }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-lg overflow-hidden border border-slate-700/60 bg-slate-950 text-slate-100 shadow-md">
      {/* Code Header */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-xs">
        <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider">
          {language}
        </span>
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
          <span>{copied ? t.copied : t.copyCode}</span>
        </button>
      </div>

      {/* Code Body */}
      <pre className="p-3.5 overflow-x-auto text-xs leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
};
