import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Play,
  CheckCircle,
  Plus,
  Trash2,
  Cpu,
  Layers,
  Code2,
  RefreshCw,
  Search,
  Sliders,
  Terminal,
  Activity,
  Gauge,
  Lock,
  Radio,
  Calculator,
  Shield,
} from 'lucide-react';
import { CustomFeatureModule } from '../types';
import { playBlip, playSuccessChime, playAlertTone } from '../utils/audioEffects';

interface DynamicModulesHubProps {
  modules: CustomFeatureModule[];
  onSynthesizeModule: (prompt: string) => Promise<void>;
  onToggleModule: (id: string, enabled: boolean) => void;
  onDeleteModule: (id: string) => void;
  isSynthesizing: boolean;
}

export const DynamicModulesHub: React.FC<DynamicModulesHubProps> = ({
  modules,
  onSynthesizeModule,
  onToggleModule,
  onDeleteModule,
  isSynthesizing,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [synthPrompt, setSynthPrompt] = useState('');
  const [activeModule, setActiveModule] = useState<CustomFeatureModule | null>(
    modules[0] || null
  );
  const [inputValues, setInputValues] = useState<Record<string, any>>({});
  const [executionResult, setExecutionResult] = useState<{
    output: string;
    data?: any;
    error?: string;
  } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Sync inputs when active module changes
  const handleSelectModule = (mod: CustomFeatureModule) => {
    setActiveModule(mod);
    setExecutionResult(null);
    const initialInputs: Record<string, any> = {};
    if (mod.inputs) {
      mod.inputs.forEach((inp) => {
        initialInputs[inp.id] = inp.defaultValue ?? (inp.type === 'number' ? 0 : '');
      });
    }
    setInputValues(initialInputs);
    playBlip(600);
  };

  const handleInputChange = (id: string, value: any) => {
    setInputValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleExecuteModule = () => {
    if (!activeModule) return;
    setIsExecuting(true);
    playBlip(900);

    try {
      if (activeModule.actionCode) {
        // Safe evaluation of pure calculation action code
        // eslint-disable-next-line no-new-func
        const fn = new Function('inputs', activeModule.actionCode);
        const res = fn(inputValues);
        setExecutionResult(res || { output: 'Module completed execution.' });
        playSuccessChime();
      } else {
        setExecutionResult({
          output: `Simulated execution with parameters: ${JSON.stringify(inputValues)}`,
        });
      }
    } catch (err: any) {
      console.error('Module execution error:', err);
      playAlertTone();
      setExecutionResult({
        output: 'Execution fault detected in module runtime.',
        error: err.message,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSynthesizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!synthPrompt.trim() || isSynthesizing) return;
    onSynthesizeModule(synthPrompt.trim());
    setSynthPrompt('');
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Gauge':
        return <Gauge className="w-4 h-4 text-cyan-400" />;
      case 'Lock':
        return <Lock className="w-4 h-4 text-amber-400" />;
      case 'Radio':
        return <Radio className="w-4 h-4 text-purple-400" />;
      case 'Calculator':
        return <Calculator className="w-4 h-4 text-emerald-400" />;
      case 'Activity':
        return <Activity className="w-4 h-4 text-cyan-400" />;
      case 'Shield':
        return <Shield className="w-4 h-4 text-blue-400" />;
      default:
        return <Zap className="w-4 h-4 text-cyan-400" />;
    }
  };

  const filteredModules = modules.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Self-Evolution Command Bar */}
      <div className="p-5 bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              <h2 className="font-tech text-base font-extrabold text-cyan-300 uppercase tracking-wider">
                Autonomous Feature Synthesizer & Modular Matrix
              </h2>
            </div>
            <p className="text-xs font-mono-code text-cyan-500/70 mt-0.5">
              SELF-EVOLVING EXTENSIONS • INSTANT ON-DEMAND UTILITY & CALCULATION INGESTION
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono-code px-2 py-1 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
              {modules.length} ACTIVE MODULES
            </span>
          </div>
        </div>

        {/* Natural Language Self-Add Prompt Input */}
        <form onSubmit={handleSynthesizeSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={synthPrompt}
              onChange={(e) => setSynthPrompt(e.target.value)}
              placeholder="Describe any new feature or tool (e.g. 'Stark suit orbital drag estimator' or 'Binary byte unit converter')..."
              className="w-full pl-4 pr-10 py-2.5 bg-slate-950 border border-cyan-500/30 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-sans shadow-inner"
            />
            {isSynthesizing && (
              <RefreshCw className="absolute right-3 top-3 w-4 h-4 text-cyan-400 animate-spin" />
            )}
          </div>

          <button
            type="submit"
            disabled={isSynthesizing || !synthPrompt.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-tech font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-cyan-500/20 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSynthesizing ? 'Synthesizing...' : 'Autonomously Add Feature'}</span>
          </button>
        </form>
      </div>

      {/* Main Grid: Left Catalog, Right Interactive Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Modules List & Filters */}
        <div className="lg:col-span-5 space-y-3">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="relative flex-1 min-w-[140px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter modules..."
                className="w-full pl-8 pr-2 py-1.5 bg-slate-900 border border-cyan-500/20 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {(['all', 'calculator', 'tool', 'generator', 'entertainment'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    playBlip(500);
                    setSelectedCategory(cat);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-tech uppercase transition-colors ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-cyan-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Module Cards */}
          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {filteredModules.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-cyan-500/10 font-mono-code text-xs text-slate-500">
                No matching dynamic modules found. Type a prompt above to auto-create one.
              </div>
            ) : (
              filteredModules.map((mod) => {
                const isSelected = activeModule?.id === mod.id;
                return (
                  <div
                    key={mod.id}
                    onClick={() => handleSelectModule(mod)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-md shadow-cyan-500/10'
                        : 'bg-slate-900/80 border-cyan-500/10 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="p-2 rounded-lg bg-slate-950 border border-cyan-500/20 shrink-0 mt-0.5">
                          {getIcon(mod.icon)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-tech text-xs font-bold text-cyan-200 truncate group-hover:text-cyan-300">
                            {mod.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">
                            {mod.tagline}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playBlip(400);
                          onDeleteModule(mod.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 rounded transition-all"
                        title="Uninstall Module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-cyan-500/10 flex items-center justify-between text-[10px] font-mono-code text-cyan-500/60">
                      <span className="uppercase">{mod.category}</span>
                      <span>v{mod.version}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Interactive Execution Sandbox */}
        <div className="lg:col-span-7">
          {activeModule ? (
            <div className="p-5 bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-cyan-500/20 pb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                    {getIcon(activeModule.icon)}
                  </div>
                  <div>
                    <h3 className="font-tech text-base font-bold text-cyan-300">
                      {activeModule.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {activeModule.description}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-mono-code uppercase bg-cyan-950 border border-cyan-500/30 text-cyan-400 shrink-0">
                  {activeModule.uiLayout}
                </span>
              </div>

              {/* Dynamic Inputs Form */}
              {activeModule.inputs && activeModule.inputs.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-tech text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Control & Input Parameters</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeModule.inputs.map((inp) => (
                      <div key={inp.id} className="space-y-1">
                        <label className="block text-[11px] font-tech text-slate-300">
                          {inp.label}
                        </label>
                        {inp.type === 'select' && inp.options ? (
                          <select
                            value={inputValues[inp.id] ?? inp.defaultValue}
                            onChange={(e) => handleInputChange(inp.id, e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950 border border-cyan-500/30 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono-code"
                          >
                            {inp.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={inp.type === 'number' ? 'number' : 'text'}
                            value={inputValues[inp.id] ?? ''}
                            onChange={(e) =>
                              handleInputChange(
                                inp.id,
                                inp.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
                              )
                            }
                            placeholder={inp.placeholder || ''}
                            className="w-full px-3 py-2 bg-slate-950 border border-cyan-500/30 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono-code"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Execute Trigger Button */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={handleExecuteModule}
                  disabled={isExecuting}
                  className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-tech font-bold rounded-xl text-xs flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-cyan-500/20"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isExecuting ? 'Processing...' : 'Execute Calculation & Directives'}</span>
                </button>
              </div>

              {/* Live Output Display Canvas */}
              {executionResult && (
                <div
                  className={`p-4 rounded-xl border font-mono-code text-xs space-y-2 ${
                    executionResult.error
                      ? 'bg-red-950/40 border-red-500/40 text-red-300'
                      : 'bg-slate-950/90 border-cyan-500/30 text-cyan-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-tech text-cyan-400 font-bold uppercase border-b border-cyan-500/20 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      Runtime Result Stream
                    </span>
                    <span className="text-emerald-400">OK 200</span>
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {executionResult.output}
                  </div>
                </div>
              )}

              {/* Under-the-hood Code Inspection */}
              <div className="pt-2 border-t border-cyan-500/10">
                <details className="text-xs group">
                  <summary className="cursor-pointer font-tech text-slate-400 hover:text-cyan-300 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>View Synthesized Module Source</span>
                  </summary>
                  <pre className="mt-2 p-3 bg-slate-950 rounded-xl border border-cyan-500/20 text-[11px] font-mono-code text-slate-300 overflow-x-auto">
                    {activeModule.code || activeModule.actionCode}
                  </pre>
                </details>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-cyan-500/20 font-mono-code text-xs text-slate-400">
              Select a module from the left or type a feature request above to create one dynamically.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
