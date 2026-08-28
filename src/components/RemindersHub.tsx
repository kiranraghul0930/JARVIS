import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Plus,
  Trash2,
  AlertCircle,
  Bell,
  Sparkles,
  Tag,
  Repeat,
  Volume2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ReminderItem } from '../types';
import { playBlip, playSuccessChime, playAlertTone } from '../utils/audioEffects';

interface RemindersHubProps {
  reminders: ReminderItem[];
  onCreateReminder: (reminder: Omit<ReminderItem, 'id' | 'createdAt' | 'completed'>) => void;
  onToggleReminder: (id: string, completed: boolean) => void;
  onDeleteReminder: (id: string) => void;
}

export const RemindersHub: React.FC<RemindersHubProps> = ({
  reminders,
  onCreateReminder,
  onToggleReminder,
  onDeleteReminder,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDueTime, setNewDueTime] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [newCategory, setNewCategory] = useState<'work' | 'personal' | 'health' | 'system' | 'general'>('work');
  const [newRecurring, setNewRecurring] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [activeAlarmReminder, setActiveAlarmReminder] = useState<ReminderItem | null>(null);

  const filteredReminders = reminders.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || item.priority === selectedPriority;
    return matchesCategory && matchesPriority;
  });

  const handleToggle = (item: ReminderItem) => {
    const nextState = !item.completed;
    if (nextState) {
      playSuccessChime();
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#06b6d4', '#10b981', '#38bdf8'],
      });
    } else {
      playBlip(500);
    }
    onToggleReminder(item.id, nextState);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    playSuccessChime();
    const formatted = newDueTime ? `Today at ${newDueTime}` : 'Today';

    onCreateReminder({
      title: newTitle.trim(),
      notes: newNotes.trim(),
      dueTimestamp: Date.now() + 1000 * 60 * 60 * 2,
      dueDateFormatted: formatted,
      priority: newPriority,
      category: newCategory,
      recurring: newRecurring,
    });

    setNewTitle('');
    setNewNotes('');
    setNewDueTime('');
    setIsAdding(false);
  };

  const triggerSimulatedAlarm = (item: ReminderItem) => {
    playAlertTone();
    setActiveAlarmReminder(item);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-950/80 text-red-400 border-red-500/50';
      case 'high':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/50';
      case 'medium':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="p-4 bg-slate-900/90 backdrop-blur-xl border border-cyan-500/20 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div>
          <h3 className="font-tech text-base font-bold text-cyan-300 tracking-wider uppercase flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Temporal Directives & Reminder Engine
          </h3>
          <p className="text-xs font-mono-code text-cyan-500/70">
            AUTO-SYNCED WITH ANDROID ALARM MANAGER & NOTIFICATION DAEMON
          </p>
        </div>

        <button
          onClick={() => {
            playBlip(700);
            setIsAdding(true);
          }}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-tech font-bold rounded-xl text-xs flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Reminder</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-tech">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {(['all', 'work', 'personal', 'health', 'system'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                playBlip(500);
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1 rounded-lg uppercase tracking-wider transition-colors ${
                selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-cyan-300 border border-cyan-500/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-cyan-500/70 font-mono-code text-[11px]">PRIORITY:</span>
          {(['all', 'critical', 'high', 'medium', 'low'] as const).map((pri) => (
            <button
              key={pri}
              onClick={() => {
                playBlip(500);
                setSelectedPriority(pri);
              }}
              className={`px-2 py-0.5 rounded text-[11px] uppercase ${
                selectedPriority === pri
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-400 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {pri}
            </button>
          ))}
        </div>
      </div>

      {/* Reminders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredReminders.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 font-mono-code text-xs bg-slate-900/40 rounded-2xl border border-cyan-500/10">
            No scheduled reminders matching current filters.
          </div>
        ) : (
          filteredReminders.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all relative group flex flex-col justify-between ${
                item.completed
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  : 'bg-slate-900/80 border-cyan-500/20 hover:border-cyan-400/50 shadow-lg'
              }`}
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-mono-code font-bold uppercase px-2 py-0.5 rounded-full border ${getPriorityBadge(
                      item.priority
                    )}`}
                  >
                    {item.priority}
                  </span>

                  <div className="flex items-center gap-1">
                    {item.recurring && item.recurring !== 'none' && (
                      <span className="text-[10px] font-mono-code text-cyan-400 flex items-center gap-1 bg-cyan-950/60 px-1.5 py-0.5 rounded">
                        <Repeat className="w-3 h-3" />
                        {item.recurring}
                      </span>
                    )}
                    <button
                      onClick={() => triggerSimulatedAlarm(item)}
                      className="p-1 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded transition-colors"
                      title="Test Notification Alert"
                    >
                      <Bell className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        playBlip(400);
                        onDeleteReminder(item.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      title="Delete Directive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title and Notes */}
                <div className="flex items-start gap-2.5 mt-1">
                  <button
                    onClick={() => handleToggle(item)}
                    className="mt-0.5 text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    {item.completed ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-cyan-500/60 hover:text-cyan-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h4
                      className={`text-sm font-sans font-semibold leading-tight ${
                        item.completed ? 'line-through text-slate-500' : 'text-slate-100'
                      }`}
                    >
                      {item.title}
                    </h4>
                    {item.notes && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Due Time */}
              <div className="mt-4 pt-2.5 border-t border-cyan-500/10 flex items-center justify-between text-[11px] font-mono-code text-cyan-500/70">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  {item.dueDateFormatted}
                </span>
                <span className="uppercase text-slate-500">{item.category}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Reminder Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleAddSubmit}
            className="w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <div className="flex items-center gap-2 font-tech font-bold text-cyan-300">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>NEW TEMPORAL DIRECTIVE</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-slate-400 hover:text-slate-100 text-xs font-mono-code"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-tech text-cyan-400 mb-1">
                TASK OR DIRECTIVE TITLE
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Calibrate Stark flight thrusters"
                required
                className="w-full px-3 py-2 bg-slate-950 border border-cyan-500/30 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-tech text-cyan-400 mb-1">
                ADDITIONAL NOTES
              </label>
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="e.g. Ensure telemetry diagnostic logs are archived"
                className="w-full px-3 py-2 bg-slate-950 border border-cyan-500/30 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-tech text-cyan-400 mb-1">
                  TARGET TIME
                </label>
                <input
                  type="time"
                  value={newDueTime}
                  onChange={(e) => setNewDueTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-cyan-500/30 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono-code"
                />
              </div>

              <div>
                <label className="block text-xs font-tech text-cyan-400 mb-1">
                  CATEGORY
                </label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-cyan-500/30 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono-code"
                >
                  <option value="work">Work</option>
                  <option value="personal">Personal</option>
                  <option value="health">Health</option>
                  <option value="system">System</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-tech text-cyan-400 mb-1">
                  PRIORITY
                </label>
                <select
                  value={newPriority}
                  onChange={(e: any) => setNewPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-cyan-500/30 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono-code"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-tech text-cyan-400 mb-1">
                  RECURRENCE
                </label>
                <select
                  value={newRecurring}
                  onChange={(e: any) => setNewRecurring(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-cyan-500/30 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono-code"
                >
                  <option value="none">None (One-time)</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-tech font-bold rounded-lg text-xs"
              >
                Save Directive
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Simulated Active Alarm Toast Notification */}
      {activeAlarmReminder && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-950 border-2 border-amber-400 rounded-2xl p-4 shadow-[0_0_30px_rgba(245,158,11,0.4)] animate-bounce">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-tech font-bold text-sm">
              <Bell className="w-5 h-5 animate-pulse" />
              <span>JARVIS TEMPORAL ALERT TRIGGERED</span>
            </div>
            <button
              onClick={() => setActiveAlarmReminder(null)}
              className="text-slate-400 hover:text-slate-100 text-xs"
            >
              ✕
            </button>
          </div>
          <p className="text-sm font-semibold text-slate-100 mt-2">
            {activeAlarmReminder.title}
          </p>
          <p className="text-xs text-amber-300/80 mt-0.5">
            Due {activeAlarmReminder.dueDateFormatted} • Priority {activeAlarmReminder.priority}
          </p>
          <div className="mt-3 flex justify-end gap-2">
            <button
              onClick={() => {
                handleToggle(activeAlarmReminder);
                setActiveAlarmReminder(null);
              }}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-tech font-bold rounded-lg"
            >
              Mark Done
            </button>
            <button
              onClick={() => setActiveAlarmReminder(null)}
              className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
