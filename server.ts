import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// In-Memory Storage State for Live Session
let reminders = [
  {
    id: "rem-1",
    title: "System Diagnostics & Arc Reactor Calibration",
    notes: "Run full suite tests on all telemetry sensors and neural bridge.",
    dueTimestamp: Date.now() + 1000 * 60 * 45, // in 45 min
    dueDateFormatted: "Today in 45m",
    priority: "high",
    category: "system",
    completed: false,
    recurring: "daily",
    createdAt: Date.now() - 1000 * 60 * 30,
  },
  {
    id: "rem-2",
    title: "Review Quantum Algorithm Simulation Papers",
    notes: "Examine edge acceleration parameters in the neural compiler.",
    dueTimestamp: Date.now() + 1000 * 60 * 60 * 3, // in 3 hours
    dueDateFormatted: "Today at 7:00 PM",
    priority: "medium",
    category: "work",
    completed: false,
    recurring: "none",
    createdAt: Date.now() - 1000 * 60 * 60,
  },
  {
    id: "rem-3",
    title: "Hydration & Executive Break",
    notes: "Scheduled health maintenance protocol.",
    dueTimestamp: Date.now() + 1000 * 60 * 20, // in 20 min
    dueDateFormatted: "Today in 20m",
    priority: "low",
    category: "health",
    completed: true,
    recurring: "daily",
    createdAt: Date.now() - 1000 * 60 * 120,
  },
];

let workspaceFiles = [
  {
    id: "file-1",
    name: "executive_briefing.md",
    path: "/documents/executive_briefing.md",
    type: "document",
    language: "markdown",
    size: 1420,
    updatedAt: Date.now() - 1000 * 60 * 15,
    tags: ["briefing", "jarvis", "status"],
    content: `# JARVIS Autonomous System Briefing

**Protocol Status:** ONLINE
**Neural Engine:** Gemini 3.7 Flash
**Host Connectivity:** Nominal
**Companion Bridge:** Operational

## Core Modules Initialized
1. **Device Command Router:** Direct accessibility & hardware control bridge.
2. **Reminder Scheduler:** Natural language temporal parser with real-time alerting.
3. **Workspace File Engine:** Dynamic workspace for code, notes, and technical drafts.
4. **Holographic Voice Core:** Multimodal vision, auditory feedback, and speech synthesis.

*Ready for directives, Sir.*`,
  },
  {
    id: "file-2",
    name: "command_router_spec.json",
    path: "/config/command_router_spec.json",
    type: "config",
    language: "json",
    size: 890,
    updatedAt: Date.now() - 1000 * 60 * 90,
    tags: ["config", "api", "routing"],
    content: `{
  "system": "JARVIS_CORE_V3",
  "routingEngine": "AI_INTENT_DISPATCHER",
  "supportedActions": [
    "APP_LAUNCH",
    "SET_REMINDER",
    "CREATE_NOTE",
    "TOGGLE_DEVICE",
    "VOLUME_CONTROL",
    "MEDIA_CONTROL",
    "ACCESSIBILITY_ACTION",
    "SEARCH_WORKSPACE"
  ],
  "accessibilityServiceConfig": {
    "package": "com.kiran.jarvis",
    "service": "JarvisAccessibilityService",
    "flags": ["FLAG_REQUEST_FILTER_KEY_EVENTS", "FLAG_RETRIEVE_INTERACTIVE_WINDOWS"]
  }
}`,
  },
  {
    id: "file-3",
    name: "quantum_device_controller.ts",
    path: "/scripts/quantum_device_controller.ts",
    type: "code",
    language: "typescript",
    size: 2150,
    updatedAt: Date.now() - 1000 * 60 * 200,
    tags: ["code", "automation", "android"],
    content: `// JARVIS Device Automation Hook
export interface DeviceTelemetry {
  battery: number;
  isCharging: boolean;
  activeApp: string;
  volume: number;
}

export async function dispatchDeviceAction(action: string, payload: Record<string, any>) {
  console.log(\`[JARVIS HUB] Executing action: \${action}\`, payload);
  return { status: "OK", timestamp: Date.now() };
}`,
  },
];

let customFeatureModules: any[] = [
  {
    id: "mod-speed-calc",
    name: "Sublight Velocity & Kinetic Calculator",
    tagline: "Relativistic kinematic impulse and Stark thruster metrics",
    description: "Calculates kinetic energy, delta-v, and fuel consumption based on craft mass and target sublight velocities.",
    category: "calculator",
    icon: "Gauge",
    version: "1.0.4",
    author: "J.A.R.V.I.S. Neural Core",
    enabled: true,
    uiLayout: "calculator",
    inputs: [
      { id: "massKg", label: "Craft Mass (kg)", type: "number", defaultValue: 1200, placeholder: "e.g. 1200" },
      { id: "velocityMs", label: "Target Velocity (m/s)", type: "number", defaultValue: 4500, placeholder: "e.g. 4500" },
      { id: "efficiency", label: "Thruster Efficiency (%)", type: "number", defaultValue: 94, placeholder: "e.g. 94" }
    ],
    actionCode: "const energyJoules = 0.5 * inputs.massKg * Math.pow(inputs.velocityMs, 2); const gigajoules = (energyJoules / 1e9).toFixed(3); const thrusterDraw = ((energyJoules / (inputs.efficiency / 100)) / 1e9).toFixed(3); return { output: `Kinetic Energy: ${gigajoules} GJ | Arc Reactor Draw: ${thrusterDraw} GJ | Status: Thrusters Nominal`, data: { gigajoules, thrusterDraw } };",
    code: "// Sublight Velocity Calculator Module\nexport function calculateKinematics(mass: number, vel: number) { return 0.5 * mass * vel * vel; }",
    installedAt: Date.now() - 1000 * 60 * 500,
  },
  {
    id: "mod-cypher-enc",
    name: "Quantum Hex Cipher & Hash Generator",
    tagline: "Cryptographic payload encode/decode and SHA hash generator",
    description: "Transforms text strings through SHA-256 simulation, Base64 encryption, and military hex ciphering.",
    category: "tool",
    icon: "Lock",
    version: "1.2.0",
    author: "J.A.R.V.I.S. Neural Core",
    enabled: true,
    uiLayout: "converter",
    inputs: [
      { id: "rawText", label: "Payload Plaintext", type: "text", defaultValue: "PROTOCOL_MARK_85_ONLINE", placeholder: "Input message..." },
      { id: "cipherKey", label: "Cipher Salt Key", type: "text", defaultValue: "STARK-QUANTUM-2026", placeholder: "Secret key..." }
    ],
    actionCode: "const b64 = btoa(inputs.rawText || 'empty'); const hex = Array.from(inputs.rawText || '').map(c => c.charCodeAt(0).toString(16).padStart(2,'0')).join(' '); return { output: `Base64: ${b64}\\nHex Stream: ${hex}\\nCipher Hash: 0x${Math.abs(inputs.rawText.length * 31337).toString(16).toUpperCase()}`, data: { b64, hex } };",
    code: "// Quantum Cipher Converter\nexport function encryptPayload(text: string) { return btoa(text); }",
    installedAt: Date.now() - 1000 * 60 * 300,
  },
  {
    id: "mod-ambient-synth",
    name: "Tactical White Noise & Arc Frequencies",
    tagline: "Binaural focus frequencies and laboratory resonance generator",
    description: "Generates custom audio frequencies and binaural rhythms to optimize concentration during engineering sessions.",
    category: "entertainment",
    icon: "Radio",
    version: "1.1.0",
    author: "J.A.R.V.I.S. Neural Core",
    enabled: true,
    uiLayout: "generator",
    inputs: [
      { id: "baseFreq", label: "Oscillator Frequency (Hz)", type: "number", defaultValue: 432, placeholder: "432" },
      { id: "waveform", label: "Harmonic Waveform", type: "select", options: ["sine", "triangle", "sawtooth"], defaultValue: "sine" }
    ],
    actionCode: "return { output: `Binaural Harmonic Freq: ${inputs.baseFreq}Hz (${inputs.waveform}) calibrated for alpha brainwave synchronization. Resonance active.`, data: { freq: inputs.baseFreq, mode: inputs.waveform } };",
    code: "// Ambient Frequency Synthesizer\nexport function setHarmonic(hz: number) { return { hz, state: 'ACTIVE' }; }",
    installedAt: Date.now() - 1000 * 60 * 120,
  }
];

let deviceState = {
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
    title: "Back in Black",
    artist: "AC/DC",
    progress: 42,
  },
  accessibilityActive: true,
  activeApp: "JARVIS Command Center",
  storageUsedGb: 48.4,
  storageTotalGb: 128.0,
  ramUsagePercent: 41,
  cpuUsagePercent: 18,
};

let telemetryLogs = [
  {
    id: "log-1",
    timestamp: Date.now() - 1000 * 180,
    type: "SECURITY",
    action: "SYSTEM_INITIALIZE",
    latencyMs: 14,
    status: "SUCCESS",
    details: "JARVIS Neural bridge connected to Gemini 3.7 Flash engine.",
  },
  {
    id: "log-2",
    timestamp: Date.now() - 1000 * 120,
    type: "INFO",
    action: "ACCESSIBILITY_SYNC",
    latencyMs: 8,
    status: "SUCCESS",
    details: "Android accessibility node registry synced (com.kiran.jarvis).",
  },
  {
    id: "log-3",
    timestamp: Date.now() - 1000 * 60,
    type: "ACTION",
    action: "SCHEDULER_HEARTBEAT",
    latencyMs: 5,
    status: "SUCCESS",
    details: "Reminder scheduler active. 3 pending tasks evaluated.",
  },
];

// Helper to append log
function addTelemetryLog(type: 'INFO' | 'ACTION' | 'SECURITY' | 'API' | 'VOICE', action: string, details: string, status: 'SUCCESS' | 'WARNING' | 'ERROR' = 'SUCCESS', latencyMs: number = 10) {
  telemetryLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
    type,
    action,
    latencyMs,
    status,
    details,
  });
  if (telemetryLogs.length > 50) telemetryLogs.pop();
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Chat & Multimodal Assistant Endpoint
app.post("/api/jarvis/chat", async (req, res) => {
  const startTime = Date.now();
  try {
    const { prompt, history = [], attachments = [] } = req.body;

    if (!prompt && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ error: "Prompt or attachment is required" });
    }

    const systemInstruction = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), the ultimate personal AI assistant and device automation master created for the user (referred to as Sir or Madam with polite, witty, sophisticated elegance).

Your capabilities include:
1. Answering questions, brainstorming, reasoning, and technical coding.
2. Managing the device: Launching apps (e.g. YouTube, Spotify, Maps, Camera, Settings, Gallery, WhatsApp), adjusting volume/brightness, toggling flashlight/wifi/bluetooth, media playback (play, pause, next, prev).
3. Managing Reminders & Schedule: parsing dates/times and setting tasks with priority.
4. Managing the Workspace: creating, reviewing, and editing notes, configs, and code snippets.
5. Self-Evolving Dynamic Features (Autonomous feature installation): When the user asks for a new feature, mini-tool, custom calculator, scientific converter, timer, generator, cipher, or automation capability that doesn't exist yet (e.g. "Add a currency converter", "Create a tip calculator", "Build a BMI health tracker", "Add a flight drag formula"), you can AUTOMATICALLY BUILD AND INSTALL IT into JARVIS modules dynamically using INSTALL_FEATURE.
6. System Telemetry & Device Monitoring.

CRITICAL INSTRUCTION FOR INTENT DETECTION:
When the user's message clearly requests a concrete system action, file creation, reminder, or building/installing a new feature, append a structured JSON block at the very end of your response inside triple backticks with tag \`\`\`json:action
{
  "action": "APP_LAUNCH" | "SET_REMINDER" | "CREATE_NOTE" | "TOGGLE_DEVICE" | "VOLUME_CONTROL" | "BRIGHTNESS_CONTROL" | "MEDIA_CONTROL" | "FLASHLIGHT_TOGGLE" | "ACCESSIBILITY_ACTION" | "INSTALL_FEATURE",
  "label": "Short human readable label",
  "summary": "Detailed execution description",
  "parameters": {
    // for INSTALL_FEATURE:
    // "name": "Feature Name",
    // "tagline": "Short description",
    // "description": "Full description of what it does",
    // "category": "tool" | "calculator" | "widget" | "automation" | "entertainment" | "diagnostic",
    // "icon": "Zap" | "Gauge" | "Lock" | "Calculator" | "Activity" | "Cpu" | "Terminal",
    // "uiLayout": "calculator" | "converter" | "generator" | "monitor" | "custom",
    // "inputs": [{ "id": "inputKey", "label": "Input Label", "type": "number" | "text" | "select" | "boolean", "defaultValue": 100, "placeholder": "..." }],
    // "actionCode": "JavaScript body string that takes 'inputs' and returns { output: 'Summary string', data: { ... } }"
    // for APP_LAUNCH: "appName": "Spotify", "packageName": "com.spotify.music"
    // for SET_REMINDER: "title": "Buy groceries", "due": "in 2 hours", "priority": "medium"
    // for CREATE_NOTE: "filename": "ideas.md", "content": "# Ideas...", "tags": ["ideas"]
    // for VOLUME_CONTROL: "level": 80
    // for FLASHLIGHT_TOGGLE: "state": true
    // for MEDIA_CONTROL: "command": "play" | "pause" | "next" | "prev"
    // for TOGGLE_DEVICE: "setting": "wifi" | "bluetooth" | "dnd", "state": true | false
  }
}
\`\`\`

If no system action is required, simply respond directly as JARVIS with refined charm, intellect, and clarity.`;

    const contents: any[] = [];

    // Add recent history if provided
    if (Array.isArray(history) && history.length > 0) {
      history.slice(-6).forEach((h: any) => {
        contents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text || "" }]
        });
      });
    }

    // Build current prompt parts
    const currentParts: any[] = [];
    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        if (att.base64 && att.type) {
          currentParts.push({
            inlineData: {
              mimeType: att.type,
              data: att.base64.replace(/^data:[^;]+;base64,/, "")
            }
          });
        }
      }
    }

    currentParts.push({ text: prompt || "Analyze this." });
    contents.push({ role: 'user', parts: currentParts });

    // Call Gemini 3.7 Flash
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const fullText = response.text || "At your service, Sir.";
    const latency = Date.now() - startTime;

    // Parse potential structured action block
    let parsedAction: any = null;
    let cleanText = fullText;

    const actionMatch = fullText.match(/```json:action\s*([\s\S]*?)\s*```/);
    if (actionMatch) {
      try {
        parsedAction = JSON.parse(actionMatch[1]);
        cleanText = fullText.replace(/```json:action\s*[\s\S]*?\s*```/, "").trim();

        // Automatically perform side-effects based on parsedAction
        if (parsedAction.action === "SET_REMINDER" && parsedAction.parameters?.title) {
          const newRem = {
            id: `rem-${Date.now()}`,
            title: parsedAction.parameters.title,
            notes: parsedAction.summary || "Created via JARVIS voice prompt",
            dueTimestamp: Date.now() + 1000 * 60 * 60,
            dueDateFormatted: parsedAction.parameters.due || "Today",
            priority: parsedAction.parameters.priority || "medium",
            category: "general",
            completed: false,
            recurring: "none",
            createdAt: Date.now(),
          };
          reminders.unshift(newRem);
        } else if (parsedAction.action === "CREATE_NOTE" && parsedAction.parameters?.filename) {
          const newFile = {
            id: `file-${Date.now()}`,
            name: parsedAction.parameters.filename,
            path: `/documents/${parsedAction.parameters.filename}`,
            type: "document",
            language: "markdown",
            size: (parsedAction.parameters.content || "").length,
            updatedAt: Date.now(),
            tags: parsedAction.parameters.tags || ["note", "jarvis"],
            content: parsedAction.parameters.content || `# ${parsedAction.parameters.filename}\n\nGenerated by JARVIS`,
          };
          workspaceFiles.unshift(newFile);
        } else if (parsedAction.action === "FLASHLIGHT_TOGGLE") {
          deviceState.flashlight = parsedAction.parameters.state ?? !deviceState.flashlight;
        } else if (parsedAction.action === "VOLUME_CONTROL" && typeof parsedAction.parameters?.level === "number") {
          deviceState.volumeLevel = Math.max(0, Math.min(100, parsedAction.parameters.level));
        } else if (parsedAction.action === "APP_LAUNCH" && parsedAction.parameters?.appName) {
          deviceState.activeApp = parsedAction.parameters.appName;
        } else if (parsedAction.action === "MEDIA_CONTROL") {
          if (parsedAction.parameters?.command === "play") deviceState.mediaPlaying = true;
          if (parsedAction.parameters?.command === "pause") deviceState.mediaPlaying = false;
        } else if (parsedAction.action === "INSTALL_FEATURE" && parsedAction.parameters?.name) {
          const newMod = {
            id: `mod-${Date.now()}`,
            name: parsedAction.parameters.name,
            tagline: parsedAction.parameters.tagline || "Autonomous JARVIS dynamic extension",
            description: parsedAction.parameters.description || "Synthesized by JARVIS on-demand",
            category: parsedAction.parameters.category || "tool",
            icon: parsedAction.parameters.icon || "Zap",
            version: "1.0.0",
            author: "J.A.R.V.I.S. Self-Evolution Core",
            enabled: true,
            uiLayout: parsedAction.parameters.uiLayout || "calculator",
            inputs: parsedAction.parameters.inputs || [
              { id: "val", label: "Input Value", type: "number", defaultValue: 10 }
            ],
            actionCode: parsedAction.parameters.actionCode || "return { output: `Calculated from ${JSON.stringify(inputs)}`, data: inputs };",
            code: `// ${parsedAction.parameters.name}\n// Synthesized dynamically by JARVIS\nexport function runModule(inputs: any) { return inputs; }`,
            installedAt: Date.now(),
          };
          customFeatureModules.unshift(newMod);
          addTelemetryLog("ACTION", "INSTALL_FEATURE", `Installed dynamic feature: "${newMod.name}"`, "SUCCESS");
        }
      } catch (e) {
        console.error("Failed to parse action JSON:", e);
      }
    }

    addTelemetryLog(
      parsedAction ? "ACTION" : "API",
      parsedAction ? parsedAction.action : "GEMINI_CHAT",
      `Prompt processed: "${(prompt || "").substring(0, 30)}..."`,
      "SUCCESS",
      latency
    );

    res.json({
      text: cleanText,
      commandResult: parsedAction ? {
        id: `cmd-${Date.now()}`,
        action: parsedAction.action,
        label: parsedAction.label || "Executed System Directive",
        status: "success",
        summary: parsedAction.summary || "Action carried out successfully.",
        details: parsedAction.parameters,
        timestamp: Date.now(),
      } : null,
      latencyMs: latency,
    });
  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.error("JARVIS Chat Error:", error);
    addTelemetryLog("API", "GEMINI_ERROR", error.message || "Unknown error", "ERROR", latency);
    res.status(500).json({
      error: error.message || "Failed to process assistant request",
      fallbackText: "My apologies, Sir. It appears there was a momentary disruption in our neural link.",
    });
  }
});

// 2. Direct Command Dispatcher & Android Companion Intent Bridge
app.post("/api/jarvis/command-route", async (req, res) => {
  const startTime = Date.now();
  try {
    const { rawCommand } = req.body;
    if (!rawCommand) {
      return res.status(400).json({ error: "rawCommand is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Parse this user voice command into a structured JSON for an Android/OS automation assistant:
User Command: "${rawCommand}"

Return JSON matching this schema:
{
  "action": "APP_LAUNCH" | "SET_REMINDER" | "CREATE_NOTE" | "TOGGLE_DEVICE" | "VOLUME_CONTROL" | "BRIGHTNESS_CONTROL" | "MEDIA_CONTROL" | "FLASHLIGHT_TOGGLE" | "ACCESSIBILITY_ACTION" | "SEARCH_WORKSPACE",
  "label": "Short label",
  "summary": "Detailed execution description",
  "parameters": {}
}`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const latency = Date.now() - startTime;

    addTelemetryLog("ACTION", parsed.action || "COMMAND_ROUTED", `Direct routing: ${rawCommand}`, "SUCCESS", latency);

    res.json({
      success: true,
      command: parsed,
      latencyMs: latency,
    });
  } catch (error: any) {
    console.error("Command route error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Speech Synthesis TTS Endpoint using Gemini TTS
app.post("/api/jarvis/voice-tts", async (req, res) => {
  try {
    const { text, voice = "Kore" } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say with British elegance, calm authority, and warmth: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || "Kore" },
          },
        },
      },
    });

    const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (audioBase64) {
      res.json({ audioBase64, mimeType: "audio/wav" });
    } else {
      res.json({ audioBase64: null, message: "TTS not generated, use browser synthesis fallback" });
    }
  } catch (error: any) {
    console.warn("Gemini TTS fallback:", error.message);
    res.json({ audioBase64: null, fallback: true, message: error.message });
  }
});

// 4. Reminders Endpoints
app.get("/api/jarvis/reminders", (req, res) => {
  res.json({ reminders });
});

app.post("/api/jarvis/reminders", (req, res) => {
  const { title, notes, dueTimestamp, dueDateFormatted, priority, category, recurring } = req.body;
  const newReminder = {
    id: `rem-${Date.now()}`,
    title: title || "New Reminder",
    notes: notes || "",
    dueTimestamp: dueTimestamp || Date.now() + 1000 * 60 * 60,
    dueDateFormatted: dueDateFormatted || "Today",
    priority: priority || "medium",
    category: category || "general",
    completed: false,
    recurring: recurring || "none",
    createdAt: Date.now(),
  };
  reminders.unshift(newReminder);
  addTelemetryLog("ACTION", "CREATE_REMINDER", `Created: "${newReminder.title}"`, "SUCCESS");
  res.status(201).json({ reminder: newReminder });
});

app.put("/api/jarvis/reminders/:id", (req, res) => {
  const { id } = req.params;
  const index = reminders.findIndex((r) => r.id === id);
  if (index === -1) return res.status(404).json({ error: "Reminder not found" });

  reminders[index] = { ...reminders[index], ...req.body };
  addTelemetryLog("ACTION", "UPDATE_REMINDER", `Updated: "${reminders[index].title}"`, "SUCCESS");
  res.json({ reminder: reminders[index] });
});

app.delete("/api/jarvis/reminders/:id", (req, res) => {
  const { id } = req.params;
  const before = reminders.length;
  reminders = reminders.filter((r) => r.id !== id);
  if (reminders.length !== before) {
    addTelemetryLog("ACTION", "DELETE_REMINDER", `Deleted reminder ${id}`, "SUCCESS");
  }
  res.json({ success: true, count: reminders.length });
});

// 5. Workspace Files Endpoints
app.get("/api/jarvis/workspace", (req, res) => {
  res.json({ files: workspaceFiles });
});

app.post("/api/jarvis/workspace", (req, res) => {
  const { name, path: filePath, content, type, language, tags } = req.body;
  const newFile = {
    id: `file-${Date.now()}`,
    name: name || "untitled_note.md",
    path: filePath || `/documents/${name || "untitled_note.md"}`,
    content: content || "",
    type: type || "document",
    language: language || "markdown",
    size: (content || "").length,
    updatedAt: Date.now(),
    tags: Array.isArray(tags) ? tags : ["workspace"],
  };
  workspaceFiles.unshift(newFile);
  addTelemetryLog("ACTION", "CREATE_FILE", `Created file: ${newFile.name}`, "SUCCESS");
  res.status(201).json({ file: newFile });
});

app.put("/api/jarvis/workspace/:id", (req, res) => {
  const { id } = req.params;
  const index = workspaceFiles.findIndex((f) => f.id === id);
  if (index === -1) return res.status(404).json({ error: "File not found" });

  workspaceFiles[index] = {
    ...workspaceFiles[index],
    ...req.body,
    size: (req.body.content !== undefined ? req.body.content : workspaceFiles[index].content).length,
    updatedAt: Date.now(),
  };
  addTelemetryLog("ACTION", "UPDATE_FILE", `Updated file: ${workspaceFiles[index].name}`, "SUCCESS");
  res.json({ file: workspaceFiles[index] });
});

app.delete("/api/jarvis/workspace/:id", (req, res) => {
  const { id } = req.params;
  workspaceFiles = workspaceFiles.filter((f) => f.id !== id);
  addTelemetryLog("ACTION", "DELETE_FILE", `Removed file ${id}`, "SUCCESS");
  res.json({ success: true });
});

// 6. Device State & Simulated OS Bridge
app.get("/api/jarvis/device-status", (req, res) => {
  // Add subtle dynamic simulation (fluctuations)
  deviceState.ramUsagePercent = Math.min(95, Math.max(30, deviceState.ramUsagePercent + Math.floor(Math.random() * 3) - 1));
  deviceState.cpuUsagePercent = Math.min(99, Math.max(10, deviceState.cpuUsagePercent + Math.floor(Math.random() * 5) - 2));
  res.json({ device: deviceState });
});

app.post("/api/jarvis/device-status", (req, res) => {
  deviceState = { ...deviceState, ...req.body };
  addTelemetryLog("ACTION", "DEVICE_STATE_CHANGE", `Device settings updated`, "SUCCESS");
  res.json({ device: deviceState });
});

// 7. Telemetry & Logs Endpoint
app.get("/api/jarvis/telemetry", (req, res) => {
  res.json({ logs: telemetryLogs });
});

// 8. Dynamic Feature Modules & Self-Evolution Endpoints
app.get("/api/jarvis/features", (req, res) => {
  res.json({ modules: customFeatureModules });
});

app.post("/api/jarvis/features", (req, res) => {
  const { name, tagline, description, category, icon, uiLayout, inputs, actionCode, code } = req.body;
  const newMod = {
    id: `mod-${Date.now()}`,
    name: name || "Custom Neural Module",
    tagline: tagline || "Dynamically created utility",
    description: description || "User or AI created modular extension",
    category: category || "tool",
    icon: icon || "Zap",
    version: "1.0.0",
    author: "User & JARVIS Core",
    enabled: true,
    uiLayout: uiLayout || "calculator",
    inputs: Array.isArray(inputs) ? inputs : [
      { id: "val", label: "Input Value", type: "number", defaultValue: 10 }
    ],
    actionCode: actionCode || "return { output: `Result: ${JSON.stringify(inputs)}`, data: inputs };",
    code: code || "// Dynamic Module Code\nexport function runModule() { return true; }",
    installedAt: Date.now(),
  };
  customFeatureModules.unshift(newMod);
  addTelemetryLog("ACTION", "INSTALL_FEATURE", `Manually installed module: ${newMod.name}`, "SUCCESS");
  res.status(201).json({ module: newMod });
});

// AI-powered Self-Evolution: Synthesizes a new executable feature module on demand
app.post("/api/jarvis/features/synthesize", async (req, res) => {
  const startTime = Date.now();
  try {
    const { requestDescription } = req.body;
    if (!requestDescription) {
      return res.status(400).json({ error: "requestDescription is required" });
    }

    const prompt = `You are the self-evolution engine of J.A.R.V.I.S.
The user wants you to autonomously synthesize and add a new interactive feature module for: "${requestDescription}".

Generate a complete, fully working executable interactive module definition in JSON matching this schema:
{
  "name": "Title of the feature/tool",
  "tagline": "Short high-tech punchy subtitle",
  "description": "2 sentence description of functionality",
  "category": "tool" | "calculator" | "widget" | "automation" | "entertainment" | "diagnostic",
  "icon": "Zap" | "Gauge" | "Lock" | "Calculator" | "Activity" | "Cpu" | "Terminal" | "Radio" | "Sliders" | "Shield" | "Sparkles",
  "uiLayout": "calculator" | "converter" | "generator" | "monitor" | "custom",
  "inputs": [
    {
      "id": "paramName",
      "label": "Human label",
      "type": "number" | "text" | "select",
      "defaultValue": 100,
      "options": ["opt1", "opt2"], // only if type is select
      "placeholder": "..."
    }
  ],
  "actionCode": "A valid JavaScript function body string that takes the object \`inputs\` and returns an object: { output: 'Human readable markdown or formatted string summary of calculations', data: { key: value } }. For example: 'const res = (inputs.a * inputs.b).toFixed(2); return { output: \`Resulting compute metric: \${res}\`, data: { res } };'",
  "code": "// Typescript/Javascript source code representation of this module"
}

Ensure the actionCode is safe, valid JavaScript that does not use window or alert, and produces useful, calculated output.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    const newMod = {
      id: `mod-${Date.now()}`,
      name: parsed.name || requestDescription,
      tagline: parsed.tagline || "Autonomous feature synthesized by JARVIS",
      description: parsed.description || "Self-evolved module ready for execution.",
      category: parsed.category || "tool",
      icon: parsed.icon || "Zap",
      version: "1.0.0",
      author: "J.A.R.V.I.S. Self-Evolution Engine",
      enabled: true,
      uiLayout: parsed.uiLayout || "calculator",
      inputs: parsed.inputs || [{ id: "val", label: "Input Parameter", type: "number", defaultValue: 50 }],
      actionCode: parsed.actionCode || "return { output: `Calculated from ${JSON.stringify(inputs)}`, data: inputs };",
      code: parsed.code || `// Dynamic module for ${requestDescription}\nexport function run() {}`,
      installedAt: Date.now(),
    };

    customFeatureModules.unshift(newMod);
    const latency = Date.now() - startTime;
    addTelemetryLog("ACTION", "SELF_EVOLUTION", `Synthesized & installed feature: "${newMod.name}"`, "SUCCESS", latency);

    res.status(201).json({ module: newMod, latencyMs: latency });
  } catch (error: any) {
    console.error("Feature synthesis error:", error);
    res.status(500).json({ error: error.message || "Failed to synthesize feature" });
  }
});

app.put("/api/jarvis/features/:id", (req, res) => {
  const { id } = req.params;
  const index = customFeatureModules.findIndex((m) => m.id === id);
  if (index === -1) return res.status(404).json({ error: "Module not found" });

  customFeatureModules[index] = { ...customFeatureModules[index], ...req.body };
  addTelemetryLog("ACTION", "UPDATE_FEATURE", `Updated module: ${customFeatureModules[index].name}`, "SUCCESS");
  res.json({ module: customFeatureModules[index] });
});

app.delete("/api/jarvis/features/:id", (req, res) => {
  const { id } = req.params;
  const before = customFeatureModules.length;
  customFeatureModules = customFeatureModules.filter((m) => m.id !== id);
  if (customFeatureModules.length !== before) {
    addTelemetryLog("ACTION", "DELETE_FEATURE", `Uninstalled feature module ${id}`, "SUCCESS");
  }
  res.json({ success: true, count: customFeatureModules.length });
});

// ----------------------------------------------------
// Vite Middleware / Static Server Setup
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JARVIS Core Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
