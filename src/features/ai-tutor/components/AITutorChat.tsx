import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, Mic, ThumbsUp, ThumbsDown, Copy, Plus, 
  ArrowUp, Globe, Check
} from 'lucide-react';
import type { ChatMessage } from '../../../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';

interface AITutorChatProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onSendMessage: (text: string, forceCloud?: boolean) => void;
  suggestedPrompts?: string[];
  embedded?: boolean;
  onSourceClick?: (link: string) => void;
  onSaveToNotes?: (text: string) => void;
}

export const MarkdownWithCodeBlocks: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent text-[13px]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
        code(props) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
          const { children, className, node, ref, ...rest } = props as any;
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          const codeString = String(children).replace(/\n$/, '');
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const [copied, setCopied] = useState(false);

          const handleCopy = () => {
            navigator.clipboard.writeText(codeString);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          };

          if (!match) {
            return (
              <code {...rest} className={`bg-line/30 px-1.5 py-0.5 rounded text-cyan ${className || ''}`}>
                {children}
              </code>
            );
          }

          return (
            <div className="relative group mt-2 mb-2 rounded-lg overflow-hidden border border-line">
              <div className="flex items-center justify-between px-3 py-1.5 bg-panel2 border-b border-line">
                <span className="text-[9px] font-bold text-muted uppercase tracking-wider">{language}</span>
                <button
                  onClick={handleCopy}
                  className="text-muted hover:text-cyan transition-colors"
                  title="Copy code"
                >
                  {copied ? <Check size={12} className="text-green" /> : <Copy size={12} />}
                </button>
              </div>
              <SyntaxHighlighter
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                {...(rest as any)}
                PreTag="div"
                children={codeString}
                language={language}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                style={vscDarkPlus as any}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                customStyle={{ margin: 0, padding: '12px', fontSize: '13px', background: 'var(--panel)', border: 'none', maxHeight: '250px', overflowY: 'auto' } as any}
              />
            </div>
          );
        }
      }}
    >
      {content}
      </ReactMarkdown>
    </div>
  );
};

const RichMessage: React.FC<{ text: string; sender: 'user' | 'tutor' | 'system' }> = ({ text, sender }) => {
  if (sender === 'system') {
    return <div className="text-center italic text-muted text-[10px] my-4 px-8 border-y border-line/30 py-2 truncate">{text}</div>;
  }

  return (
    <div className="whitespace-pre-wrap break-words leading-relaxed overflow-hidden">
      <MarkdownWithCodeBlocks content={text} />
    </div>
  );
};

const AutoExpandingTextarea: React.FC<{
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
  disabled?: boolean;
}> = ({ value, onChange, onSend, disabled }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      if (!value) {
        textareaRef.current.style.height = '40px';
      } else {
        textareaRef.current.style.height = '40px';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      placeholder="Ask a question..."
      rows={1}
      className="flex-1 min-w-0 w-full bg-transparent border-none !border-none !outline-none text-sm py-2.5 text-text focus:outline-none focus:ring-0 focus:shadow-none outline-none resize-none min-h-[40px] max-h-[200px] transition-all"
    />
  );
};

export const AITutorChat: React.FC<AITutorChatProps> = ({ 
  messages, 
  isTyping, 
  onSendMessage, 
  suggestedPrompts,
  embedded = false,
  onSourceClick,
  onSaveToNotes
}) => {
  const [chatInput, setChatInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (textOverride?: string) => {
    const text = textOverride || chatInput;
    if (!text.trim()) return;
    onSendMessage(text);
    if (!textOverride) setChatInput('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bg relative overflow-hidden">
      
      {/* Embedded Header for Mode Selector (if not standalone) */}
      {embedded && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-panel/50 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center space-x-2">
            <h3 className="text-xs font-bold text-text">AI Tutor</h3>
            <span className="px-2 py-0.5 bg-cyan/10 text-cyan rounded text-[9px] font-bold uppercase tracking-widest">Active</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-3 md:p-6 space-y-8 pb-4 scroll-smooth" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex animate-cel-reveal ${
              msg.sender === 'user' ? 'justify-end' : msg.sender === 'system' ? 'justify-center w-full' : 'justify-start'
            }`}
          >
            <div className={`${
              msg.sender === 'system' 
                ? 'w-full px-4' 
                : 'max-w-[95%] md:max-w-[85%] p-4 rounded-2xl'
            } ${
              msg.sender === 'user' 
                ? 'bg-cyan text-bg rounded-tr-none [&_code]:text-bg [&_code]:bg-black/10' 
                : msg.sender === 'system' 
                  ? 'bg-transparent' 
                  : 'bg-panel border border-line rounded-tl-none text-text'
            }`}>
              <RichMessage text={msg.text} sender={msg.sender} />
              {msg.sender === 'tutor' && (
                <div className="mt-3 pt-3 border-t border-line/30 flex flex-wrap gap-2 items-center justify-between text-[9px]">
                  <div className="group relative">
                    {msg.sourceLink || (msg.source === 'Course docs' && onSourceClick) ? (
                      <button 
                        onClick={() => onSourceClick && onSourceClick(msg.sourceLink || '')} 
                        className={`flex items-center space-x-1.5 font-bold uppercase tracking-wider cursor-pointer hover:underline ${
                          msg.source === 'Cloud AI' ? 'text-cyan' : 'text-purple'
                        }`}
                      >
                        {msg.source === 'Cloud AI' ? <Globe size={11} /> : <BookOpen size={11} />}
                        <span className="truncate">{msg.source}</span>
                      </button>
                    ) : (
                      <div className={`flex items-center space-x-1.5 font-bold uppercase tracking-wider cursor-help ${
                        msg.source === 'Cloud AI' ? 'text-cyan' : 'text-purple'
                      }`}>
                        {msg.source === 'Cloud AI' ? <Globe size={11} /> : <BookOpen size={11} />}
                        <span className="truncate">{msg.source}</span>
                      </div>
                    )}
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-48 bg-panel2 border border-line p-2 rounded-lg shadow-xl z-50 text-text normal-case tracking-normal">
                      {msg.source === 'Cloud AI' 
                        ? 'Answer generated using global knowledge. Not restricted to course materials.' 
                        : 'Answer grounded strictly in the local course materials and verified transcripts.'}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 shrink-0 text-muted">
                    <button className="hover:text-cyan transition-colors" title="Helpful"><ThumbsUp size={15} /></button>
                    <button className="hover:text-red transition-colors" title="Not helpful"><ThumbsDown size={15} /></button>
                    <button onClick={() => navigator.clipboard.writeText(msg.text)} className="hover:text-cyan transition-colors" title="Copy to clipboard"><Copy size={15} /></button>
                    {onSaveToNotes && (
                      <button 
                        onClick={() => onSaveToNotes(msg.text)} 
                        className="hover:text-cyan transition-colors" 
                        title="Save to Notes"
                      >
                        <BookOpen size={15} />
                      </button>
                    )}
                  </div>
                </div>
              )}
              {msg.sender === 'tutor' && msg.source === 'Course docs' && msg.text.toLowerCase().includes('cloud ai') && (
                <button 
                  onClick={() => { 
                    onSendMessage(messages.filter(m => m.sender === 'user').slice(-1)[0]?.text || 'Use Cloud AI', true); 
                  }}
                  className="mt-3 bg-transparent border border-cyan text-cyan text-[10px] font-bold px-4 py-2 rounded-lg hover:bg-cyan hover:text-bg transition-all flex items-center justify-center space-x-2"
                >
                  <BookOpen size={14} />
                  <span>Ask Cloud AI</span>
                </button>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-panel border border-line p-4 rounded-2xl rounded-tl-none flex flex-col space-y-2">
              <span className="text-[10px] text-muted italic">Tutor is thinking...</span>
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-cyan rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1.5 h-1.5 bg-cyan rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1.5 h-1.5 bg-cyan rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-line bg-transparent shrink-0">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.filter(m => m.sender === 'user').length === 0 && suggestedPrompts && suggestedPrompts.length > 0 && (
            <div className="flex flex-wrap gap-2 px-2">
              {suggestedPrompts.map((p, i) => (
                <button 
                  key={i} 
                  onClick={() => handleSend(p)} 
                  className="text-[10px] bg-panel border border-line px-3 py-1.5 rounded-full text-muted hover:text-cyan truncate max-w-[200px] transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center space-x-2 bg-panel rounded-3xl px-4 py-1.5 transition-all relative">
            <button className="p-2 text-muted hover:text-cyan transition-colors grow-0 shrink-0" title="Attach file">
              <Plus size={20} />
            </button>
            
            <AutoExpandingTextarea value={chatInput} onChange={setChatInput} onSend={() => handleSend()} disabled={isTyping} />
            
            <div className="flex items-center shrink-0">
              {!chatInput.trim() && !isTyping ? (
                <div className="relative group">
                  <button className="p-2 text-muted hover:text-cyan transition-colors" disabled>
                    <Mic size={20} />
                  </button>
                  <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-32 text-center bg-panel2 border border-line p-2 rounded-lg shadow-xl text-[10px] text-text">
                    Voice input coming soon!
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => handleSend()} 
                  disabled={!chatInput.trim() || isTyping} 
                  className={`w-9 h-9 ml-1 rounded-full flex items-center justify-center transition-all shrink-0 shadow-lg ${
                    chatInput.trim() && !isTyping
                      ? 'bg-cyan text-bg scale-100 shadow-cyan/20 hover:scale-105' 
                      : 'bg-line/20 text-muted/40 scale-95 opacity-50'
                  }`}
                >
                  <ArrowUp size={20} className="shrink-0" />
                </button>
              )}
            </div>
          </div>
          <div className="text-center mt-1.5 flex flex-col items-center justify-center space-y-1">
            <p className="text-[10px] text-muted/80">AI-generated, may make mistakes. Please verify important information.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
