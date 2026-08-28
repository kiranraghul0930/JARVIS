import React, { useState } from 'react';
import {
  ShieldAlert,
  Activity,
  Cpu,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Server,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { TelemetryLog } from '../types';
import { playBlip } from '../utils/audioEffects';

interface TelemetryViewProps {
  logs: TelemetryLog[];
  onRefresh: () => void;
}

export const TelemetryView: React.FC<TelemetryViewProps> = ({ logs, onRefresh }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const filteredLogs = logs.filter(
    (l) => selectedFilter === 'ALL' || l.type === selectedFilter
  );

  return (
    <div className="space-y-4">
      {/* Tactical Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-4 bg-slate-900/80 border border-cyan-500/20 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-tech text-cyan-500/70 uppercase">
              NEURAL INFERENCE ENGINE
            </div>
            <div className="text-sm font-tech font-bold text-cyan-300 flex items-center gap-1.5 mt-1">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Gemini 3.7 Flash
            </div>
            <div className="text-[10px] font-mono-code text-emerald-400 mt-1">
              LATENCY: ~680ms NOMINAL
            </div>
          </div>
          <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse" />
        </div>

        <div className="p-4 bg-slate-900/80 border border-cyan-500/20 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-tech text-cyan-500/70 uppercase">
              ANDROID ACCESSIBILITY DAEMON
            </div>
            <div className="text-sm font-tech font-bold text-cyan-300 flex items-center gap-1.5 mt-1">
              <Server className="w-4 h-4 text-emerald-400" />
              com.kiran.jarvis
            </div>
            <div className="text-[10px] font-mono-code text-cyan-400/90 mt-1">
              KEY/WINDOW EVENT INGESTION: ON
            </div>
          </div>
          <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
        </div>

        <div className="p-4 bg-slate-900/80 border border-cyan-500/20 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-tech text-cyan-500/70 uppercase">
              SECURITY AUDIT LEVEL
            </div>
            <div className="text-sm font-tech font-bold text-cyan-300 flex items-center gap-1.5 mt-1">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              ENCRYPTED • ZERO-TRUST
            </div>
            <div className="text-[10px] font-mono-code text-amber-400/90 mt-1">
              ZERO TELEMETRY LEAKS
            </div>
          </div>
          <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
        </div>
      </div>

      {/* Logs Feed Container */}
      <div className="p-4 bg-slate-900/90 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="font-tech text-sm font-bold text-cyan-300 uppercase tracking-wider">
              JARVIS System Audit & Action Telemetry
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Buttons */}
            <div className="flex items-center gap-1">
              {['ALL', 'ACTION', 'API', 'SECURITY', 'VOICE'].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    playBlip(500);
                    setSelectedFilter(type);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-tech uppercase ${
                    selectedFilter === type
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-950/60 text-slate-400 hover:text-cyan-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                playBlip(700);
                onRefresh();
              }}
              className="p-1 text-slate-400 hover:text-cyan-300 rounded transition-colors"
              title="Refresh Logs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Logs List */}
        <div className="max-h-[480px] overflow-y-auto space-y-2 font-mono-code text-xs">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No telemetry events recorded.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 bg-slate-950/80 border border-cyan-500/10 rounded-xl flex items-start justify-between gap-3 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase mt-0.5 shrink-0 ${
                      log.type === 'SECURITY'
                        ? 'bg-amber-950 text-amber-400 border border-amber-500/40'
                        : log.type === 'ACTION'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                        : log.type === 'API'
                        ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {log.type}
                  </span>

                  <div className="min-w-0">
                    <div className="font-bold text-cyan-200 truncate">
                      {log.action}
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5 break-all">
                      {log.details}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 text-[10px] text-cyan-500/60 flex flex-col items-end">
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  {log.latencyMs && (
                    <span className="text-cyan-400 font-bold">{log.latencyMs}ms</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
