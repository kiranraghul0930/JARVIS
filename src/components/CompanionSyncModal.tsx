import React, { useState } from 'react';
import {
  Smartphone,
  Server,
  Key,
  ShieldCheck,
  Copy,
  Check,
  Download,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { playBlip } from '../utils/audioEffects';

interface CompanionSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompanionSyncModal: React.FC<CompanionSyncModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    playBlip(1000);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-tech text-base font-bold text-cyan-300 uppercase">
                JARVIS Android Companion Link Matrix
              </h3>
              <p className="text-xs font-mono-code text-cyan-500/70">
                PACKAGE: com.kiran.jarvis • ACCESSIBILITY DAEMON
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playBlip(400);
              onClose();
            }}
            className="text-slate-400 hover:text-slate-100 text-xs font-mono-code px-2 py-1 bg-slate-800 rounded-lg"
          >
            CLOSE [ESC]
          </button>
        </div>

        {/* Server Endpoint Box */}
        <div className="p-4 bg-slate-950 border border-cyan-500/30 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-tech text-cyan-400 font-bold">
            <span>JARVIS CLOUD BACKEND ENDPOINT</span>
            <span className="text-[10px] font-mono-code text-emerald-400">ACTIVE & READY</span>
          </div>
          <div className="flex items-center justify-between gap-2 p-2 bg-slate-900 rounded-lg font-mono-code text-xs text-slate-200">
            <span className="truncate">{currentHost}/api/jarvis</span>
            <button
              onClick={() => copyToClipboard(`${currentHost}/api/jarvis`, 'endpoint')}
              className="p-1 text-cyan-400 hover:text-cyan-200"
            >
              {copiedKey === 'endpoint' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* API Specification Matrix */}
        <div className="space-y-2">
          <h4 className="font-tech text-xs font-bold text-cyan-300 uppercase">
            Synchronized Bridge Endpoints
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono-code">
            <div className="p-2.5 bg-slate-950/60 border border-cyan-500/10 rounded-lg">
              <span className="text-cyan-400 font-bold">POST</span> /api/jarvis/chat
              <p className="text-[11px] text-slate-400 mt-1 font-sans">
                Multimodal voice/text prompt routing with Gemini 3.7 Flash.
              </p>
            </div>

            <div className="p-2.5 bg-slate-950/60 border border-cyan-500/10 rounded-lg">
              <span className="text-cyan-400 font-bold">POST</span> /api/jarvis/command-route
              <p className="text-[11px] text-slate-400 mt-1 font-sans">
                Direct Android intent parser for automated device actions.
              </p>
            </div>

            <div className="p-2.5 bg-slate-950/60 border border-cyan-500/10 rounded-lg">
              <span className="text-amber-400 font-bold">GET/POST</span> /api/jarvis/reminders
              <p className="text-[11px] text-slate-400 mt-1 font-sans">
                Temporal alarms synced with AlarmManager.
              </p>
            </div>

            <div className="p-2.5 bg-slate-950/60 border border-cyan-500/10 rounded-lg">
              <span className="text-emerald-400 font-bold">GET/POST</span> /api/jarvis/workspace
              <p className="text-[11px] text-slate-400 mt-1 font-sans">
                Assistant file and document repository access.
              </p>
            </div>
          </div>
        </div>

        {/* Security and Architecture Note */}
        <div className="p-3.5 bg-cyan-950/30 border border-cyan-500/30 rounded-xl flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-xs font-sans text-slate-300 leading-relaxed">
            <span className="font-bold text-cyan-200 font-tech uppercase block mb-0.5">
              Secure Companion Architecture
            </span>
            JARVIS utilizes server-side AI reasoning powered by Gemini 3.7 Flash with zero client-side key exposure. The Android companion app integrates via <code className="text-cyan-300 font-mono-code">JarvisAccessibilityService</code> and <code className="text-cyan-300 font-mono-code">ReminderScheduler</code> for full-device automation.
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => {
              playBlip(500);
              onClose();
            }}
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-tech font-bold rounded-xl text-xs"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
