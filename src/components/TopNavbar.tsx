import React, { useState, useEffect } from 'react';
import {
  Zap,
  Radio,
  FolderOpen,
  Calendar,
  Smartphone,
  Activity,
  Volume2,
  VolumeX,
  Mic,
  Settings,
  ShieldCheck,
  Cpu,
  Share2,
  Sparkles,
} from 'lucide-react';
import { ActiveTab } from '../types';
import { playBlip, isSoundEnabled, setSoundEnabled } from '../utils/audioEffects';

interface TopNavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
  onOpenCompanion: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  onSelectTab,
  autoSpeak,
  onToggleAutoSpeak,
  onOpenCompanion,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTabClick = (tab: ActiveTab) => {
    playBlip(700);
    onSelectTab(tab);
  };

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playBlip(900);
  };

  return (
    <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-cyan-500/20 px-4 py-2.5 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Arc Reactor Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full bg-slate-900 border border-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)]">
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#06b6d4]" />
            <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/40 animate-rotate-slow pointer-events-none" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-tech text-base font-extrabold tracking-widest text-cyan-300">
                J.A.R.V.I.S.
              </h1>
              <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                V3.7-AI
              </span>
            </div>
            <p className="text-[10px] font-mono-code text-cyan-500/60 leading-none">
              AUTONOMOUS ASSISTANT & DEVICE CORE
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-cyan-500/20 overflow-x-auto no-scrollbar">
          <button
            onClick={() => handleTabClick('hud')}
            className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              activeTab === 'hud'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Command HUD</span>
          </button>

          <button
            onClick={() => handleTabClick('modules')}
            className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              activeTab === 'modules'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Self-Add Features</span>
          </button>

          <button
            onClick={() => handleTabClick('device')}
            className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              activeTab === 'device'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Device Bridge</span>
          </button>

          <button
            onClick={() => handleTabClick('workspace')}
            className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              activeTab === 'workspace'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Workspace</span>
          </button>

          <button
            onClick={() => handleTabClick('reminders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              activeTab === 'reminders'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Reminders</span>
          </button>

          <button
            onClick={() => handleTabClick('telemetry')}
            className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
              activeTab === 'telemetry'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Telemetry</span>
          </button>
        </nav>

        {/* Right Status & Controls */}
        <div className="flex items-center gap-2">
          {/* Live Clock */}
          <div className="hidden sm:flex flex-col text-right font-mono-code text-xs text-cyan-400">
            <span className="font-bold tracking-wider">{timeStr}</span>
            <span className="text-[9px] text-emerald-400 uppercase">SYS ONLINE</span>
          </div>

          {/* Sound FX Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-xl border transition-colors ${
              soundOn
                ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={soundOn ? 'Mute Procedural Sound Effects' : 'Enable Procedural Sound Effects'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Vocal Synthesis Autoread Toggle */}
          <button
            onClick={() => {
              playBlip(600);
              onToggleAutoSpeak();
            }}
            className={`p-2 rounded-xl border transition-colors ${
              autoSpeak
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={autoSpeak ? 'Voice Speech Output: Active' : 'Voice Speech Output: Muted'}
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Android Companion Setup */}
          <button
            onClick={() => {
              playBlip(750);
              onOpenCompanion();
            }}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-cyan-950 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-tech flex items-center gap-1.5 transition-colors"
            title="Companion Setup & Connection Guide"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline font-bold">Android Link</span>
          </button>
        </div>
      </div>
    </header>
  );
};
