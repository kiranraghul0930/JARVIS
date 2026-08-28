import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Cpu, ShieldCheck, Zap } from 'lucide-react';
import { playBlip, playListeningTone } from '../utils/audioEffects';

interface ArcReactorCoreProps {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  onToggleListen: () => void;
  batteryLevel: number;
  cpuUsage: number;
}

export const ArcReactorCore: React.FC<ArcReactorCoreProps> = ({
  isListening,
  isProcessing,
  isSpeaking,
  onToggleListen,
  batteryLevel,
  cpuUsage,
}) => {
  const [waveBars, setWaveBars] = useState<number[]>([40, 60, 30, 80, 50, 70, 90, 45, 65, 35, 75, 55]);

  // Simulate audio reactive waveform when speaking or listening
  useEffect(() => {
    if (!isListening && !isSpeaking && !isProcessing) return;

    const interval = setInterval(() => {
      setWaveBars(
        Array.from({ length: 14 }, () =>
          isProcessing
            ? Math.floor(Math.random() * 40 + 30)
            : isSpeaking
            ? Math.floor(Math.random() * 70 + 30)
            : Math.floor(Math.random() * 85 + 15)
        )
      );
    }, 90);

    return () => clearInterval(interval);
  }, [isListening, isSpeaking, isProcessing]);

  const handleCoreClick = () => {
    if (!isListening) {
      playListeningTone();
    } else {
      playBlip(600);
    }
    onToggleListen();
  };

  const getStatusColor = () => {
    if (isListening) return 'border-amber-400 text-amber-400 shadow-amber-500/50';
    if (isProcessing) return 'border-cyan-400 text-cyan-300 shadow-cyan-500/50';
    if (isSpeaking) return 'border-emerald-400 text-emerald-300 shadow-emerald-500/50';
    return 'border-cyan-500/60 text-cyan-400 shadow-cyan-900/30';
  };

  const getGlowBg = () => {
    if (isListening) return 'bg-amber-500/20';
    if (isProcessing) return 'bg-cyan-500/20';
    if (isSpeaking) return 'bg-emerald-500/20';
    return 'bg-cyan-500/10';
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-2xl overflow-hidden group">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

      {/* Top Tactical Status Header */}
      <div className="w-full flex items-center justify-between text-xs text-cyan-400/80 mb-4 font-tech tracking-wider uppercase">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>SECURITY LEVEL: OMEGA</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            PWR: {batteryLevel}%
          </span>
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyan-400" />
            CPU: {cpuUsage}%
          </span>
        </div>
      </div>

      {/* Holographic Arc Reactor Centerpiece */}
      <div className="relative my-4 flex items-center justify-center">
        {/* Outer Rotating Arc Ring */}
        <div
          className={`absolute w-52 h-52 rounded-full border border-dashed border-cyan-500/30 animate-rotate-slow pointer-events-none transition-all duration-700 ${
            isListening ? 'border-amber-400/60 scale-105' : isSpeaking ? 'border-emerald-400/60' : ''
          }`}
        />

        {/* Counter-rotating Segment Ring */}
        <div
          className={`absolute w-44 h-44 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-cyan-500/40 border-l-transparent animate-rotate-reverse pointer-events-none transition-all duration-700 ${
            isListening ? 'border-t-amber-400 border-b-amber-500/40' : isSpeaking ? 'border-t-emerald-400 border-b-emerald-500/40' : ''
          }`}
        />

        {/* Pulsing Energy Glow Ring */}
        <div
          className={`absolute w-36 h-36 rounded-full ${getGlowBg()} animate-pulse-ring pointer-events-none transition-all duration-500`}
        />

        {/* Interactive Main Core Button */}
        <button
          id="jarvis-arc-core-btn"
          onClick={handleCoreClick}
          aria-label={isListening ? "Stop Voice Listening" : "Start Voice Listening"}
          className={`relative z-10 w-28 h-28 rounded-full bg-slate-950/90 border-2 ${getStatusColor()} flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg group-hover:border-cyan-400 cursor-pointer focus:outline-none`}
        >
          {isListening ? (
            <div className="flex flex-col items-center gap-1 animate-pulse">
              <Mic className="w-8 h-8 text-amber-400" />
              <span className="text-[10px] font-tech font-bold tracking-widest text-amber-300">LISTENING</span>
            </div>
          ) : isProcessing ? (
            <div className="flex flex-col items-center gap-1">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" />
              <span className="text-[10px] font-tech font-bold tracking-widest text-cyan-300">COMPUTING</span>
            </div>
          ) : isSpeaking ? (
            <div className="flex flex-col items-center gap-1">
              <Volume2 className="w-8 h-8 text-emerald-400 animate-bounce" />
              <span className="text-[10px] font-tech font-bold tracking-widest text-emerald-300">SPEAKING</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="relative">
                <div className="w-6 h-6 rounded-full bg-cyan-400/20 border border-cyan-400 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
                </div>
              </div>
              <span className="text-[11px] font-tech font-bold tracking-widest text-cyan-400">J.A.R.V.I.S.</span>
              <span className="text-[9px] font-tech text-cyan-500/70">CLICK FOR MIC</span>
            </div>
          )}
        </button>
      </div>

      {/* Dynamic Sound Wave Spectrum */}
      <div className="w-full max-w-xs h-8 flex items-center justify-center gap-1.5 px-4 mt-2">
        {waveBars.map((height, idx) => (
          <div
            key={idx}
            className={`w-1.5 rounded-full transition-all duration-100 ${
              isListening
                ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]'
                : isProcessing
                ? 'bg-cyan-400 shadow-[0_0_6px_#06b6d4]'
                : isSpeaking
                ? 'bg-emerald-400 shadow-[0_0_6px_#10b981]'
                : 'bg-cyan-800/40'
            }`}
            style={{
              height: isListening || isProcessing || isSpeaking ? `${height}%` : '15%',
            }}
          />
        ))}
      </div>

      {/* Bottom Status Text */}
      <div className="mt-3 text-center">
        <p className="text-xs font-tech text-cyan-300/90 font-medium tracking-wide">
          {isListening
            ? 'Capturing acoustic frequencies... Speak now, Sir.'
            : isProcessing
            ? 'Neural matrices compiling directive...'
            : isSpeaking
            ? 'Broadcasting vocal response synthesized via neural speech.'
            : 'Core Neural Link: Online & Nominal'}
        </p>
      </div>
    </div>
  );
};
