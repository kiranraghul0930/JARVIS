import React, { useState, useEffect, useRef } from 'react';
import { TopNavbar } from './components/TopNavbar';
import { ArcReactorCore } from './components/ArcReactorCore';
import { AssistantChat } from './components/AssistantChat';
import { DeviceController } from './components/DeviceController';
import { FileWorkspaceView } from './components/FileWorkspaceView';
import { RemindersHub } from './components/RemindersHub';
import { TelemetryView } from './components/TelemetryView';
import { CompanionSyncModal } from './components/CompanionSyncModal';
import { DynamicModulesHub } from './components/DynamicModulesHub';
import {
  ChatMessage,
  ReminderItem,
  WorkspaceFile,
  DeviceState,
  TelemetryLog,
  ActiveTab,
  Attachment,
  CustomFeatureModule,
} from './types';
import { playSuccessChime, playAlertTone, playBlip } from './utils/audioEffects';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('hud');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFile[]>([]);
  const [deviceState, setDeviceState] = useState<DeviceState>({
    batteryLevel: 88,
    isCharging: true,
    volumeLevel: 75,
    brightness: 80,
    flashlight: false,
    wifi: true,
    bluetooth: true,
    dnd: false,
    screenLocked: false,
    mediaPlaying: false,
    currentTrack: {
      title: 'Back in Black',
      artist: 'AC/DC',
      progress: 42,
    },
    accessibilityActive: true,
    activeApp: 'JARVIS Command Center',
    storageUsedGb: 48.4,
    storageTotalGb: 128.0,
    ramUsagePercent: 41,
    cpuUsagePercent: 18,
  });
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLog[]>([]);
  const [featureModules, setFeatureModules] = useState<CustomFeatureModule[]>([]);
  const [isSynthesizingFeature, setIsSynthesizingFeature] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isAiGeneratingDoc, setIsAiGeneratingDoc] = useState(false);
  const [isCompanionModalOpen, setIsCompanionModalOpen] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Initial load
  useEffect(() => {
    fetchInitialData();
    // Welcome message from JARVIS
    setMessages([
      {
        id: 'msg-welcome',
        sender: 'jarvis',
        text: "Good day, Sir. J.A.R.V.I.S. neural automation core is online and operating within optimal parameters. All telemetry sensors, file workspace matrices, self-evolving feature synthesis, and companion accessibility bridges are ready for your directives.",
        timestamp: Date.now(),
      },
    ]);
  }, []);

  const fetchInitialData = async () => {
    try {
      const [remRes, workRes, devRes, telRes, featRes] = await Promise.all([
        fetch('/api/jarvis/reminders'),
        fetch('/api/jarvis/workspace'),
        fetch('/api/jarvis/device-status'),
        fetch('/api/jarvis/telemetry'),
        fetch('/api/jarvis/features'),
      ]);

      if (remRes.ok) {
        const data = await remRes.json();
        setReminders(data.reminders || []);
      }
      if (workRes.ok) {
        const data = await workRes.json();
        setWorkspaceFiles(data.files || []);
      }
      if (devRes.ok) {
        const data = await devRes.json();
        setDeviceState(data.device || deviceState);
      }
      if (telRes.ok) {
        const data = await telRes.json();
        setTelemetryLogs(data.logs || []);
      }
      if (featRes.ok) {
        const data = await featRes.json();
        setFeatureModules(data.modules || []);
      }
    } catch (e) {
      console.error('Failed to fetch initial state:', e);
    }
  };

  // Voice Speech Synthesis Handler
  const speakText = (text: string) => {
    if (!text || typeof window === 'undefined') return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 0.95;

      // Select refined British/English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.name.includes('Daniel') ||
          v.name.includes('Oliver') ||
          v.name.includes('George') ||
          v.name.includes('UK') ||
          v.name.includes('English')
      );
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Voice Input Handler (Web Speech API)
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser environment. You can use the text input below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        if (transcript) {
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error('Error starting recognition:', e);
      setIsListening(false);
    }
  };

  // Main Message Transmission Function
  const handleSendMessage = async (text: string, attachments: Attachment[] = []) => {
    if (!text && attachments.length === 0) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      attachments,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const res = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history: messages.slice(-5),
          attachments,
        }),
      });

      const data = await res.json();
      setIsProcessing(false);

      if (res.ok) {
        const jarvisMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'jarvis',
          text: data.text,
          commandResult: data.commandResult,
          latencyMs: data.latencyMs,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, jarvisMessage]);

        // Auto speak if enabled
        if (autoSpeak) {
          speakText(data.text);
        }

        // Side effect updates: reload state if command executed
        if (data.commandResult) {
          playSuccessChime();
          fetchInitialData();
        }
      } else {
        const fallbackMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          sender: 'jarvis',
          text: data.fallbackText || 'My apologies, Sir. A communication anomaly occurred.',
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }
    } catch (e: any) {
      setIsProcessing(false);
      console.error('Chat error:', e);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'jarvis',
          text: "System communication link was momentarily interrupted, Sir. I am ready to retry your instruction.",
          timestamp: Date.now(),
        },
      ]);
    }
  };

  // File Operations
  const handleSaveFile = async (updated: Partial<WorkspaceFile> & { id: string }) => {
    try {
      const res = await fetch(`/api/jarvis/workspace/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaceFiles((prev) =>
          prev.map((f) => (f.id === updated.id ? data.file : f))
        );
      }
    } catch (e) {
      console.error('Failed to save file:', e);
    }
  };

  const handleCreateFile = async (newFileData: Omit<WorkspaceFile, 'id' | 'updatedAt' | 'size'>) => {
    try {
      const res = await fetch('/api/jarvis/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFileData),
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaceFiles((prev) => [data.file, ...prev]);
      }
    } catch (e) {
      console.error('Failed to create file:', e);
    }
  };

  const handleDeleteFile = async (id: string) => {
    try {
      const res = await fetch(`/api/jarvis/workspace/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setWorkspaceFiles((prev) => prev.filter((f) => f.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete file:', e);
    }
  };

  const handleAiGenerateDoc = async (topic: string) => {
    setIsAiGeneratingDoc(true);
    try {
      const prompt = `Generate a complete, structured, professional markdown technical document on the topic: "${topic}". Include title, sections, key parameters, architecture bullet points, and code/config examples where appropriate.`;
      const res = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setIsAiGeneratingDoc(false);

      if (res.ok && data.text) {
        const cleanName = topic
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .substring(0, 24) + '.md';

        handleCreateFile({
          name: cleanName,
          path: `/documents/${cleanName}`,
          content: data.text,
          type: 'document',
          language: 'markdown',
          tags: ['ai-generated', 'briefing', 'jarvis'],
        });
      }
    } catch (e) {
      setIsAiGeneratingDoc(false);
      console.error('Failed to generate doc:', e);
    }
  };

  // Reminders Operations
  const handleCreateReminder = async (newRem: Omit<ReminderItem, 'id' | 'createdAt' | 'completed'>) => {
    try {
      const res = await fetch('/api/jarvis/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRem),
      });
      if (res.ok) {
        const data = await res.json();
        setReminders((prev) => [data.reminder, ...prev]);
      }
    } catch (e) {
      console.error('Failed to create reminder:', e);
    }
  };

  const handleToggleReminder = async (id: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/jarvis/reminders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });
      if (res.ok) {
        setReminders((prev) =>
          prev.map((r) => (r.id === id ? { ...r, completed } : r))
        );
      }
    } catch (e) {
      console.error('Failed to toggle reminder:', e);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      const res = await fetch(`/api/jarvis/reminders/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setReminders((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete reminder:', e);
    }
  };

  // Device State Update
  const handleUpdateDevice = async (updated: Partial<DeviceState>) => {
    const nextState = { ...deviceState, ...updated };
    setDeviceState(nextState);
    try {
      await fetch('/api/jarvis/device-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextState),
      });
    } catch (e) {
      console.error('Failed to update device state:', e);
    }
  };

  const handleLaunchApp = (appName: string) => {
    handleUpdateDevice({ activeApp: appName });
    // Also post a simulated command message to chat
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'jarvis',
        text: `Initiating launch protocol for application: ${appName}. Displaying active viewport window on host screen.`,
        commandResult: {
          id: `cmd-${Date.now()}`,
          action: 'APP_LAUNCH',
          label: `Launch ${appName}`,
          status: 'success',
          summary: `Application ${appName} brought to foreground.`,
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
      },
    ]);
  };

  // Feature Module Synthesizer & Handlers
  const handleSynthesizeModule = async (promptText: string) => {
    setIsSynthesizingFeature(true);
    playBlip(700);
    try {
      const res = await fetch('/api/jarvis/features/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestDescription: promptText }),
      });
      const data = await res.json();
      if (res.ok && data.module) {
        setFeatureModules((prev) => [data.module, ...prev]);
        playSuccessChime();
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: 'jarvis',
            text: `Sir, I have synthesized and installed a new feature module: "${data.module.name}". It is now actively operational in your Modular Matrix tab.`,
            commandResult: {
              id: `cmd-${Date.now()}`,
              action: 'INSTALL_FEATURE',
              label: `Synthesized ${data.module.name}`,
              status: 'success',
              summary: data.module.description,
              timestamp: Date.now(),
            },
            timestamp: Date.now(),
          },
        ]);
      } else {
        playAlertTone();
      }
    } catch (e) {
      console.error('Failed to synthesize module:', e);
      playAlertTone();
    } finally {
      setIsSynthesizingFeature(false);
    }
  };

  const handleToggleModule = async (id: string, enabled: boolean) => {
    setFeatureModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled } : m))
    );
    try {
      await fetch(`/api/jarvis/features/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
    } catch (e) {
      console.error('Failed to update module state:', e);
    }
  };

  const handleDeleteModule = async (id: string) => {
    setFeatureModules((prev) => prev.filter((m) => m.id !== id));
    try {
      await fetch(`/api/jarvis/features/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('Failed to delete module:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <TopNavbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        autoSpeak={autoSpeak}
        onToggleAutoSpeak={() => setAutoSpeak(!autoSpeak)}
        onOpenCompanion={() => setIsCompanionModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {activeTab === 'hud' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Arc Reactor Hologram & Quick Status */}
            <div className="lg:col-span-4 space-y-4">
              <ArcReactorCore
                isListening={isListening}
                isProcessing={isProcessing}
                isSpeaking={isSpeaking}
                onToggleListen={toggleListening}
                batteryLevel={deviceState.batteryLevel}
                cpuUsage={deviceState.cpuUsagePercent}
              />

              {/* Mini Quick Access Widget */}
              <div className="p-4 bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs font-tech text-cyan-300 font-bold uppercase tracking-wider">
                  <span>Companion Bridge Snapshot</span>
                  <span className="text-[10px] text-emerald-400 font-mono-code">
                    SYNCED
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono-code">
                  <div className="p-2 bg-slate-950/60 rounded-lg border border-cyan-500/10">
                    <span className="text-[10px] text-slate-400 block">MODULES</span>
                    <span className="text-cyan-300 font-bold">
                      {featureModules.length} Active
                    </span>
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded-lg border border-cyan-500/10">
                    <span className="text-[10px] text-slate-400 block">REMINDERS</span>
                    <span className="text-cyan-300 font-bold">
                      {reminders.filter((r) => !r.completed).length} Pending
                    </span>
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded-lg border border-cyan-500/10">
                    <span className="text-[10px] text-slate-400 block">WORKSPACE</span>
                    <span className="text-cyan-300 font-bold">
                      {workspaceFiles.length} Docs
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Neural Comms Channel Feed */}
            <div className="lg:col-span-8 h-[650px]">
              <AssistantChat
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isProcessing}
                onClearHistory={() => setMessages([])}
                onPlaySpeech={speakText}
                isSpeaking={isSpeaking}
              />
            </div>
          </div>
        )}

        {activeTab === 'modules' && (
          <DynamicModulesHub
            modules={featureModules}
            onSynthesizeModule={handleSynthesizeModule}
            onToggleModule={handleToggleModule}
            onDeleteModule={handleDeleteModule}
            isSynthesizing={isSynthesizingFeature}
          />
        )}

        {activeTab === 'device' && (
          <DeviceController
            deviceState={deviceState}
            onUpdateDevice={handleUpdateDevice}
            onLaunchApp={handleLaunchApp}
          />
        )}

        {activeTab === 'workspace' && (
          <FileWorkspaceView
            files={workspaceFiles}
            onSaveFile={handleSaveFile}
            onCreateFile={handleCreateFile}
            onDeleteFile={handleDeleteFile}
            onAiGenerateDoc={handleAiGenerateDoc}
            isAiGenerating={isAiGeneratingDoc}
          />
        )}

        {activeTab === 'reminders' && (
          <RemindersHub
            reminders={reminders}
            onCreateReminder={handleCreateReminder}
            onToggleReminder={handleToggleReminder}
            onDeleteReminder={handleDeleteReminder}
          />
        )}

        {activeTab === 'telemetry' && (
          <TelemetryView
            logs={telemetryLogs}
            onRefresh={fetchInitialData}
          />
        )}
      </main>

      {/* Companion Sync Information Modal */}
      <CompanionSyncModal
        isOpen={isCompanionModalOpen}
        onClose={() => setIsCompanionModalOpen(false)}
      />
    </div>
  );
}
