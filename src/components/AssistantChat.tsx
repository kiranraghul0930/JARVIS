import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Play,
  Calendar,
  FileText,
  Smartphone,
  Sliders,
  Sun,
  Zap,
  Trash2,
  Copy,
  Check,
  Radio,
} from 'lucide-react';
import { ChatMessage, Attachment } from '../types';
import { playBlip, playSuccessChime } from '../utils/audioEffects';

interface AssistantChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, attachments?: Attachment[]) => void;
  isLoading: boolean;
  onClearHistory: () => void;
  onPlaySpeech: (text: string) => void;
  isSpeaking: boolean;
}

export const AssistantChat: React.FC<AssistantChatProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onClearHistory,
  onPlaySpeech,
  isSpeaking,
}) => {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && attachments.length === 0) || isLoading) return;

    playBlip(720);
    onSendMessage(inputText.trim(), attachments);
    setInputText('');
    setAttachments([]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type || 'text/plain',
            size: file.size,
            dataUrl: result,
            base64: result,
          },
        ]);
        playBlip(950);
      };
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsDataURL(file);
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    playBlip(400);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    playBlip(1000);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    { label: 'Add Currency Tool', prompt: 'Add a new feature module for a Multi-Currency and Crypto Exchange Rate Converter with USD, EUR, GBP, and Stark Credits.' },
    { label: 'Today\'s Briefing', prompt: 'Brief me on today\'s schedule and system diagnostics.' },
    { label: 'Set 4PM Reminder', prompt: 'Set a reminder to review project architecture today at 4:00 PM.' },
    { label: 'Create Project Note', prompt: 'Create a note named quantum_core_spec.md summarizing our neural assistant setup.' },
    { label: 'Launch Spotify', prompt: 'Launch Spotify and start the focus playlist.' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900/90 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header Bar */}
      <div className="px-5 py-3 border-b border-cyan-500/20 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-tech font-bold tracking-wider text-cyan-300 uppercase">
              JARVIS Neural Comms Channel
            </h2>
            <p className="text-[11px] text-cyan-500/70 font-mono-code">
              MODALITY: TEXT / VISION / DIRECTIVES
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            playBlip(500);
            onClearHistory();
          }}
          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-xs flex items-center gap-1"
          title="Clear Conversation Stream"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline font-mono-code text-[11px]">Clear</span>
        </button>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-3">
              <Zap className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="font-tech text-base font-bold text-cyan-300 tracking-wider">
              SYSTEM STANDBY • READY FOR DIRECTIVES
            </h3>
            <p className="text-xs text-slate-400 max-w-md mt-1 mb-4 leading-relaxed">
              Issue voice commands, ask technical inquiries, schedule reminders, create documents, or dispatch simulated Android automation tasks.
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {quickPrompts.slice(0, 3).map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    playBlip(700);
                    onSendMessage(item.prompt);
                  }}
                  className="px-3 py-1.5 bg-slate-800/80 hover:bg-cyan-950/80 border border-cyan-500/30 hover:border-cyan-400/70 text-cyan-300 text-xs rounded-lg transition-all font-mono-code"
                >
                  ⚡ {item.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-mono-code text-cyan-500/70">
                <span>{msg.sender === 'user' ? 'COMMANDER' : 'J.A.R.V.I.S.'}</span>
                <span>•</span>
                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                {msg.latencyMs && (
                  <span className="text-cyan-400/90 font-mono-code">[{msg.latencyMs}ms]</span>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-xl p-3.5 relative group ${
                  msg.sender === 'user'
                    ? 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-50 shadow-md'
                    : 'bg-slate-950/80 border border-cyan-500/20 text-slate-200 shadow-lg'
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-wrap leading-relaxed font-sans text-sm">
                  {msg.text}
                </div>

                {/* Attachments Preview */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-cyan-500/20 flex flex-wrap gap-2">
                    {msg.attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-1.5 bg-slate-900/90 border border-cyan-500/30 rounded-lg text-xs"
                      >
                        {att.type.startsWith('image/') && att.dataUrl ? (
                          <img
                            src={att.dataUrl}
                            alt={att.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <FileText className="w-4 h-4 text-cyan-400" />
                        )}
                        <span className="text-[11px] font-mono-code truncate max-w-[120px]">
                          {att.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Executed Command Widget Pill */}
                {msg.commandResult && (
                  <div className="mt-3 p-2.5 bg-cyan-950/40 border border-cyan-500/40 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-tech font-bold text-cyan-300">
                        {msg.commandResult.action === 'APP_LAUNCH' && <Smartphone className="w-3.5 h-3.5 text-cyan-400" />}
                        {msg.commandResult.action === 'SET_REMINDER' && <Calendar className="w-3.5 h-3.5 text-amber-400" />}
                        {msg.commandResult.action === 'CREATE_NOTE' && <FileText className="w-3.5 h-3.5 text-emerald-400" />}
                        {msg.commandResult.action === 'VOLUME_CONTROL' && <Sliders className="w-3.5 h-3.5 text-cyan-400" />}
                        {msg.commandResult.action === 'FLASHLIGHT_TOGGLE' && <Sun className="w-3.5 h-3.5 text-amber-400" />}
                        {msg.commandResult.action === 'MEDIA_CONTROL' && <Play className="w-3.5 h-3.5 text-purple-400" />}
                        <span>{msg.commandResult.label}</span>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono-code font-bold uppercase">
                        <CheckCircle2 className="w-3 h-3" />
                        EXECUTED
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans">
                      {msg.commandResult.summary}
                    </p>
                  </div>
                )}

                {/* Action Hover Controls for Model Messages */}
                {msg.sender === 'jarvis' && (
                  <div className="mt-2 pt-2 border-t border-cyan-500/10 flex items-center justify-end gap-1 text-slate-400 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onPlaySpeech(msg.text)}
                      className="p-1 hover:text-cyan-300 hover:bg-cyan-500/10 rounded transition-colors text-[11px] flex items-center gap-1"
                      title="Vocalize Response"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-mono-code">Read</span>
                    </button>
                    <button
                      onClick={() => handleCopyText(msg.text, msg.id)}
                      className="p-1 hover:text-cyan-300 hover:bg-cyan-500/10 rounded transition-colors text-[11px] flex items-center gap-1"
                      title="Copy text"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span className="text-[10px] font-mono-code">
                        {copiedId === msg.id ? 'Copied' : 'Copy'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading / Computing Indicator */}
        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] font-mono-code text-cyan-400 animate-pulse">
              <span>J.A.R.V.I.S. PROCESSING</span>
            </div>
            <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-3 text-cyan-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-tech">Accessing neural matrix & executing directives...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Directive Chips */}
      <div className="px-4 py-1.5 bg-slate-950/40 border-t border-cyan-500/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-tech text-cyan-500/70 shrink-0 uppercase tracking-wider">
          Quick Directives:
        </span>
        {quickPrompts.map((item, idx) => (
          <button
            key={idx}
            onClick={() => {
              playBlip(700);
              onSendMessage(item.prompt);
            }}
            className="px-2.5 py-1 bg-slate-900/80 hover:bg-cyan-950/80 border border-cyan-500/20 hover:border-cyan-400 text-cyan-300 text-[11px] rounded whitespace-nowrap transition-colors font-mono-code shrink-0"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Staged Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 bg-slate-950/90 border-t border-cyan-500/20 flex flex-wrap gap-2">
          {attachments.map((att, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-2.5 py-1 bg-cyan-950/60 border border-cyan-500/40 rounded-lg text-xs text-cyan-200"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono-code text-[11px] max-w-[140px] truncate">{att.name}</span>
              <button
                onClick={() => removeAttachment(idx)}
                className="text-slate-400 hover:text-red-400 ml-1"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-slate-950/80 border-t border-cyan-500/20 flex items-center gap-2"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          className="hidden"
          accept="image/*,.txt,.md,.json,.ts,.js"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 text-cyan-400/80 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-xl border border-cyan-500/20 transition-colors"
          title="Attach Image or Document"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <input
          type="text"
          id="jarvis-chat-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Speak or type directive... (e.g. 'Launch Spotify', 'Set reminder for 5 PM')"
          className="flex-1 px-3.5 py-2.5 bg-slate-900/90 border border-cyan-500/30 rounded-xl text-slate-100 placeholder-cyan-500/40 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 font-sans"
        />

        <button
          type="submit"
          disabled={(!inputText.trim() && attachments.length === 0) || isLoading}
          className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-slate-950 font-tech font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-600/30 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline text-xs tracking-wider uppercase">Transmit</span>
        </button>
      </form>
    </div>
  );
};
