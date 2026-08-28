export type MessageSender = 'user' | 'jarvis' | 'system';

export interface Attachment {
  name: string;
  type: string;
  size: number;
  dataUrl?: string;
  base64?: string;
}

export type CommandActionType = 
  | 'APP_LAUNCH'
  | 'SET_REMINDER'
  | 'CREATE_NOTE'
  | 'READ_NOTE'
  | 'TOGGLE_DEVICE'
  | 'VOLUME_CONTROL'
  | 'BRIGHTNESS_CONTROL'
  | 'MEDIA_CONTROL'
  | 'FLASHLIGHT_TOGGLE'
  | 'ACCESSIBILITY_ACTION'
  | 'QUERY_STATUS'
  | 'SEARCH_WORKSPACE'
  | 'VOICE_BRIEFING'
  | 'INSTALL_FEATURE'
  | 'EXECUTE_FEATURE'
  | 'GENERAL_QUERY';

export interface CustomFeatureModule {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: 'tool' | 'widget' | 'automation' | 'entertainment' | 'diagnostic';
  icon: string;
  version: string;
  author: string;
  enabled: boolean;
  code: string;
  uiLayout: 'calculator' | 'converter' | 'generator' | 'monitor' | 'custom';
  inputs?: Array<{
    id: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'boolean';
    options?: string[];
    defaultValue?: any;
    placeholder?: string;
  }>;
  actionCode?: string;
  installedAt: number;
}

export interface SystemCommandResult {
  id: string;
  action: CommandActionType;
  label: string;
  status: 'pending' | 'success' | 'failed';
  summary: string;
  details?: Record<string, any>;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: number;
  attachments?: Attachment[];
  commandResult?: SystemCommandResult;
  isStreaming?: boolean;
  audioUrl?: string;
  latencyMs?: number;
}

export interface ReminderItem {
  id: string;
  title: string;
  notes?: string;
  dueTimestamp: number;
  dueDateFormatted: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'work' | 'personal' | 'health' | 'system' | 'general';
  completed: boolean;
  recurring?: 'none' | 'daily' | 'weekly' | 'monthly';
  createdAt: number;
}

export interface WorkspaceFile {
  id: string;
  name: string;
  path: string;
  content: string;
  type: 'note' | 'code' | 'log' | 'config' | 'document';
  language?: string;
  size: number;
  updatedAt: number;
  tags: string[];
}

export interface DeviceState {
  batteryLevel: number;
  isCharging: boolean;
  volumeLevel: number;
  brightness: number;
  flashlight: boolean;
  wifi: boolean;
  bluetooth: boolean;
  dnd: boolean;
  screenLocked: boolean;
  mediaPlaying: boolean;
  currentTrack: {
    title: string;
    artist: string;
    progress: number;
  };
  accessibilityActive: boolean;
  activeApp: string;
  storageUsedGb: number;
  storageTotalGb: number;
  ramUsagePercent: number;
  cpuUsagePercent: number;
}

export interface TelemetryLog {
  id: string;
  timestamp: number;
  type: 'INFO' | 'ACTION' | 'SECURITY' | 'API' | 'VOICE';
  action: string;
  latencyMs?: number;
  status: 'SUCCESS' | 'WARNING' | 'ERROR';
  details: string;
}

export type ActiveTab = 'hud' | 'modules' | 'workspace' | 'reminders' | 'device' | 'telemetry' | 'companion';
