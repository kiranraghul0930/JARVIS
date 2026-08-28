import React, { useState } from 'react';
import {
  Smartphone,
  Wifi,
  WifiOff,
  Bluetooth,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Flashlight,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Camera,
  Youtube,
  Music,
  MapPin,
  MessageSquare,
  Settings,
  Terminal,
  Shield,
  Activity,
  HardDrive,
  Cpu,
  Zap,
} from 'lucide-react';
import { DeviceState } from '../types';
import { playBlip, playSuccessChime, playAlertTone } from '../utils/audioEffects';

interface DeviceControllerProps {
  deviceState: DeviceState;
  onUpdateDevice: (updated: Partial<DeviceState>) => void;
  onLaunchApp: (appName: string) => void;
}

export const DeviceController: React.FC<DeviceControllerProps> = ({
  deviceState,
  onUpdateDevice,
  onLaunchApp,
}) => {
  const [activeCameraModal, setActiveCameraModal] = useState(false);

  const apps = [
    { name: 'Spotify', icon: Music, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40' },
    { name: 'YouTube', icon: Youtube, color: 'text-red-400 border-red-500/40 bg-red-950/40' },
    { name: 'Google Maps', icon: MapPin, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40' },
    { name: 'Camera', icon: Camera, color: 'text-amber-400 border-amber-500/40 bg-amber-950/40' },
    { name: 'WhatsApp', icon: MessageSquare, color: 'text-green-400 border-green-500/40 bg-green-950/40' },
    { name: 'Settings', icon: Settings, color: 'text-slate-300 border-slate-500/40 bg-slate-800/40' },
    { name: 'Terminal', icon: Terminal, color: 'text-cyan-300 border-cyan-500/40 bg-slate-900/60' },
  ];

  const toggleWifi = () => {
    playBlip(deviceState.wifi ? 400 : 800);
    onUpdateDevice({ wifi: !deviceState.wifi });
  };

  const toggleBluetooth = () => {
    playBlip(deviceState.bluetooth ? 400 : 800);
    onUpdateDevice({ bluetooth: !deviceState.bluetooth });
  };

  const toggleFlashlight = () => {
    playBlip(deviceState.flashlight ? 500 : 1100);
    onUpdateDevice({ flashlight: !deviceState.flashlight });
  };

  const toggleDnd = () => {
    playBlip(600);
    onUpdateDevice({ dnd: !deviceState.dnd });
  };

  const toggleMedia = () => {
    playBlip(deviceState.mediaPlaying ? 440 : 880);
    onUpdateDevice({ mediaPlaying: !deviceState.mediaPlaying });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onUpdateDevice({ volumeLevel: val });
  };

  const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onUpdateDevice({ brightness: val });
  };

  const handleAppClick = (name: string) => {
    if (name === 'Camera') {
      setActiveCameraModal(true);
    }
    playSuccessChime();
    onLaunchApp(name);
  };

  return (
    <div className="space-y-4">
      {/* Device Status Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-900/80 border border-cyan-500/20 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-tech text-cyan-500/70 uppercase">Battery Status</div>
            <div className="text-lg font-tech font-bold text-cyan-300 flex items-center gap-1.5 mt-0.5">
              <Zap className={`w-4 h-4 ${deviceState.isCharging ? 'text-amber-400 animate-pulse' : 'text-cyan-400'}`} />
              {deviceState.batteryLevel}%
            </div>
          </div>
          <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {deviceState.isCharging ? 'CHARGING' : 'DISCHARGE'}
          </span>
        </div>

        <div className="p-3 bg-slate-900/80 border border-cyan-500/20 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-tech text-cyan-500/70 uppercase">RAM Utilization</div>
            <div className="text-lg font-tech font-bold text-cyan-300 flex items-center gap-1.5 mt-0.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              {deviceState.ramUsagePercent}%
            </div>
          </div>
          <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            NOMINAL
          </span>
        </div>

        <div className="p-3 bg-slate-900/80 border border-cyan-500/20 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-tech text-cyan-500/70 uppercase">Processor Load</div>
            <div className="text-lg font-tech font-bold text-cyan-300 flex items-center gap-1.5 mt-0.5">
              <Cpu className="w-4 h-4 text-amber-400" />
              {deviceState.cpuUsagePercent}%
            </div>
          </div>
          <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            ACTIVE
          </span>
        </div>

        <div className="p-3 bg-slate-900/80 border border-cyan-500/20 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-tech text-cyan-500/70 uppercase">Internal Storage</div>
            <div className="text-lg font-tech font-bold text-cyan-300 flex items-center gap-1.5 mt-0.5">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              {deviceState.storageUsedGb} GB
            </div>
          </div>
          <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            /{deviceState.storageTotalGb}G
          </span>
        </div>
      </div>

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick Toggles & Sliders */}
        <div className="p-4 bg-slate-900/90 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <h3 className="font-tech text-sm font-bold text-cyan-300 tracking-wider uppercase flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              Hardware & Wireless Directives
            </h3>
            <span className="text-[11px] font-mono-code text-emerald-400 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              ACCESSIBILITY BRIDGE: ONLINE
            </span>
          </div>

          {/* Buttons Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={toggleWifi}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                deviceState.wifi
                  ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {deviceState.wifi ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
              <span className="text-[11px] font-tech font-bold">WI-FI</span>
              <span className="text-[9px] font-mono-code text-cyan-500/80">
                {deviceState.wifi ? 'CONNECTED' : 'DISABLED'}
              </span>
            </button>

            <button
              onClick={toggleBluetooth}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                deviceState.bluetooth
                  ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Bluetooth className="w-5 h-5" />
              <span className="text-[11px] font-tech font-bold">BLUETOOTH</span>
              <span className="text-[9px] font-mono-code text-cyan-500/80">
                {deviceState.bluetooth ? 'PAIRED' : 'STANDBY'}
              </span>
            </button>

            <button
              onClick={toggleFlashlight}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                deviceState.flashlight
                  ? 'bg-amber-950/60 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Flashlight className={`w-5 h-5 ${deviceState.flashlight ? 'text-amber-400 animate-pulse' : ''}`} />
              <span className="text-[11px] font-tech font-bold">FLASHLIGHT</span>
              <span className="text-[9px] font-mono-code text-amber-500/80">
                {deviceState.flashlight ? 'EMITTING' : 'OFF'}
              </span>
            </button>

            <button
              onClick={toggleDnd}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                deviceState.dnd
                  ? 'bg-purple-950/60 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              {deviceState.dnd ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span className="text-[11px] font-tech font-bold">SILENT DND</span>
              <span className="text-[9px] font-mono-code text-purple-400/80">
                {deviceState.dnd ? 'ACTIVE' : 'NORMAL'}
              </span>
            </button>
          </div>

          {/* Level Sliders */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-tech text-cyan-300 mb-1.5">
                <span className="flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  AUDIO OUTPUT LEVEL: {deviceState.volumeLevel}%
                </span>
                <span className="font-mono-code text-[11px] text-cyan-500/80">
                  {deviceState.volumeLevel > 0 ? 'AMPLIFIED' : 'MUTED'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={deviceState.volumeLevel}
                onChange={handleVolumeChange}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-tech text-cyan-300 mb-1.5">
                <span className="flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  DISPLAY ILLUMINATION: {deviceState.brightness}%
                </span>
                <span className="font-mono-code text-[11px] text-amber-500/80">
                  DYNAMIC
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={deviceState.brightness}
                onChange={handleBrightnessChange}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Media Player & App Launcher */}
        <div className="p-4 bg-slate-900/90 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-xl space-y-4">
          {/* Media Player HUD */}
          <div className="p-3.5 bg-slate-950/90 border border-cyan-500/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center">
                  <Music className="w-4 h-4 text-cyan-300" />
                </div>
                <div>
                  <div className="text-xs font-tech font-bold text-cyan-200">
                    {deviceState.currentTrack.title}
                  </div>
                  <div className="text-[10px] text-cyan-500/70 font-mono-code">
                    {deviceState.currentTrack.artist}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => playBlip(500)}
                  className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded transition-colors"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={toggleMedia}
                  className="p-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-full transition-transform active:scale-95 shadow-md shadow-cyan-500/30"
                >
                  {deviceState.mediaPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => playBlip(650)}
                  className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded transition-colors"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Playback progress bar */}
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div
                className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${deviceState.currentTrack.progress}%` }}
              />
            </div>
          </div>

          {/* App Launcher Suite */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-tech text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Companion App Launcher Matrix
              </h4>
              <span className="text-[10px] font-mono-code text-cyan-500/70">
                ACTIVE: {deviceState.activeApp}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {apps.map((app) => {
                const IconComponent = app.icon;
                const isActive = deviceState.activeApp.toLowerCase().includes(app.name.toLowerCase());
                return (
                  <button
                    key={app.name}
                    onClick={() => handleAppClick(app.name)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all text-left ${
                      isActive
                        ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200 shadow-md shadow-cyan-500/20'
                        : `${app.color} hover:border-cyan-400/60`
                    }`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span className="text-xs font-tech font-bold truncate">
                      {app.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Camera Feed Viewfinder Modal */}
      {activeCameraModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <div className="flex items-center gap-2 font-tech font-bold text-cyan-300">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>OPTICAL SENSOR VIEWFINDER • 4K HUD</span>
              </div>
              <button
                onClick={() => {
                  playBlip(400);
                  setActiveCameraModal(false);
                }}
                className="text-slate-400 hover:text-slate-100 font-mono-code text-xs px-2 py-1 rounded bg-slate-800"
              >
                CLOSE [ESC]
              </button>
            </div>

            {/* Viewfinder Target simulation */}
            <div className="relative w-full h-56 bg-slate-950 rounded-xl border border-cyan-500/30 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-4 border border-dashed border-cyan-400/40 rounded-lg pointer-events-none" />
              <div className="absolute w-12 h-12 border-2 border-cyan-400 rounded-full animate-ping pointer-events-none opacity-40" />
              <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_#06b6d4]" />
              
              <div className="absolute top-2 left-3 text-[10px] font-mono-code text-cyan-400">
                ISO: 400 • F/1.8 • 1/120s
              </div>
              <div className="absolute bottom-2 right-3 text-[10px] font-mono-code text-emerald-400">
                AUTOFOCUS: LOCKED [99.8%]
              </div>
            </div>

            <div className="flex justify-between items-center text-xs font-mono-code text-cyan-500/80">
              <span>FACIAL GEOMETRY RECOGNITION: ENGAGED</span>
              <button
                onClick={() => {
                  playSuccessChime();
                  setActiveCameraModal(false);
                }}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-tech font-bold rounded-lg transition-colors"
              >
                CAPTURE FRAME
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
