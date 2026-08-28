import React, { useState } from 'react';
import {
  FileText,
  Code,
  FileCode,
  FileSpreadsheet,
  Plus,
  Trash2,
  Save,
  Download,
  Search,
  Sparkles,
  Check,
  FolderOpen,
  Tag,
  Eye,
  Edit3,
} from 'lucide-react';
import { WorkspaceFile } from '../types';
import { playBlip, playSuccessChime } from '../utils/audioEffects';

interface FileWorkspaceViewProps {
  files: WorkspaceFile[];
  onSaveFile: (file: Partial<WorkspaceFile> & { id: string }) => void;
  onCreateFile: (file: Omit<WorkspaceFile, 'id' | 'updatedAt' | 'size'>) => void;
  onDeleteFile: (id: string) => void;
  onAiGenerateDoc: (topic: string) => void;
  isAiGenerating: boolean;
}

export const FileWorkspaceView: React.FC<FileWorkspaceViewProps> = ({
  files,
  onSaveFile,
  onCreateFile,
  onDeleteFile,
  onAiGenerateDoc,
  isAiGenerating,
}) => {
  const [selectedFileId, setSelectedFileId] = useState<string>(files[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'document' | 'code' | 'config' | 'log'>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'document' | 'code' | 'config'>('document');
  const [newFileTags, setNewFileTags] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const [editedContent, setEditedContent] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const activeFile = files.find((f) => f.id === selectedFileId) || files[0];

  // Sync edited content when active file changes
  React.useEffect(() => {
    if (activeFile) {
      setEditedContent(activeFile.content);
      setHasUnsavedChanges(false);
    }
  }, [activeFile?.id]);

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = selectedFilter === 'all' || file.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleSelectFile = (file: WorkspaceFile) => {
    playBlip(600);
    setSelectedFileId(file.id);
    setEditedContent(file.content);
    setHasUnsavedChanges(false);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    if (!activeFile) return;
    playSuccessChime();
    onSaveFile({
      id: activeFile.id,
      content: editedContent,
    });
    setHasUnsavedChanges(false);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    playSuccessChime();
    const extension = newFileType === 'document' ? '.md' : newFileType === 'config' ? '.json' : '.ts';
    const finalName = newFileName.includes('.') ? newFileName : `${newFileName}${extension}`;
    const tagsList = newFileTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onCreateFile({
      name: finalName,
      path: `/workspace/${finalName}`,
      content: `# ${finalName}\n\nCreated: ${new Date().toLocaleString()}\n`,
      type: newFileType,
      language: newFileType === 'document' ? 'markdown' : newFileType === 'config' ? 'json' : 'typescript',
      tags: tagsList.length > 0 ? tagsList : ['workspace'],
    });

    setNewFileName('');
    setNewFileTags('');
    setIsCreating(false);
  };

  const handleDownload = () => {
    if (!activeFile) return;
    playBlip(900);
    const blob = new Blob([editedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;
    playBlip(750);
    onAiGenerateDoc(aiTopic.trim());
    setAiTopic('');
    setShowAiModal(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full min-h-[600px]">
      {/* File List Explorer Sidebar */}
      <div className="md:col-span-4 bg-slate-900/90 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4 flex flex-col h-full shadow-xl">
        {/* Header and Actions */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-cyan-400" />
            <h3 className="font-tech text-sm font-bold text-cyan-300 uppercase tracking-wider">
              JARVIS Workspace
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                playBlip(600);
                setShowAiModal(true);
              }}
              className="p-1.5 bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 rounded-lg text-xs flex items-center gap-1 transition-colors"
              title="AI Document Synthesizer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-tech font-bold hidden sm:inline">AI DRAFT</span>
            </button>
            <button
              onClick={() => {
                playBlip(700);
                setIsCreating(true);
              }}
              className="p-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-transform active:scale-95 shadow-md shadow-cyan-500/20"
              title="Create New File"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="my-3 relative">
          <Search className="w-3.5 h-3.5 text-cyan-500/60 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter files by name or tag..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-cyan-500/20 rounded-xl text-xs text-slate-200 placeholder-cyan-500/40 focus:outline-none focus:border-cyan-400 font-sans"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1 mb-3 overflow-x-auto no-scrollbar pb-1 text-[11px] font-tech">
          {(['all', 'document', 'code', 'config'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => {
                playBlip(500);
                setSelectedFilter(filter);
              }}
              className={`px-2.5 py-0.5 rounded-md uppercase tracking-wider transition-colors ${
                selectedFilter === filter
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-950/60 text-slate-400 hover:text-cyan-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Files List */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {filteredFiles.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 font-mono-code">
              No files located in workspace.
            </div>
          ) : (
            filteredFiles.map((file) => {
              const isSelected = file.id === activeFile?.id;
              return (
                <button
                  key={file.id}
                  onClick={() => handleSelectFile(file)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-start justify-between gap-2 transition-all ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/50 border-cyan-500/10 text-slate-300 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-start gap-2 min-w-0">
                    {file.type === 'document' ? (
                      <FileText className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    ) : file.type === 'code' ? (
                      <Code className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <FileCode className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div className="truncate">
                      <div className="text-xs font-mono-code font-bold truncate">
                        {file.name}
                      </div>
                      <div className="text-[10px] text-cyan-500/70 font-mono-code flex items-center gap-1.5 mt-0.5">
                        <span>{file.size} B</span>
                        <span>•</span>
                        <span>{file.tags.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Editor & Viewer Canvas */}
      <div className="md:col-span-8 bg-slate-900/90 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4 flex flex-col h-full shadow-xl">
        {activeFile ? (
          <>
            {/* Active File Header */}
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-cyan-500/20 gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <div>
                  <h3 className="text-sm font-mono-code font-bold text-cyan-200">
                    {activeFile.name}
                  </h3>
                  <div className="text-[10px] font-mono-code text-cyan-500/70 flex items-center gap-2">
                    <span>PATH: {activeFile.path}</span>
                    {hasUnsavedChanges && (
                      <span className="text-amber-400 font-bold">• UNSAVED CHANGES</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    playBlip(500);
                    setPreviewMode(previewMode === 'edit' ? 'preview' : 'edit');
                  }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-tech flex items-center gap-1 transition-colors"
                >
                  {previewMode === 'edit' ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleSave}
                  className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-tech font-bold rounded-lg text-xs flex items-center gap-1 transition-transform active:scale-95 shadow-md shadow-cyan-500/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    playBlip(400);
                    onDeleteFile(activeFile.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete File"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Editor Textarea / Markdown Display */}
            <div className="flex-1 mt-3 overflow-y-auto">
              {previewMode === 'edit' ? (
                <textarea
                  value={editedContent}
                  onChange={handleContentChange}
                  spellCheck={false}
                  placeholder="Enter file contents, markdown, or code..."
                  className="w-full h-full min-h-[400px] p-4 bg-slate-950/80 border border-cyan-500/20 rounded-xl text-slate-100 font-mono-code text-xs leading-relaxed focus:outline-none focus:border-cyan-400 resize-none selection:bg-cyan-500/30"
                />
              ) : (
                <div className="w-full h-full min-h-[400px] p-5 bg-slate-950/80 border border-cyan-500/20 rounded-xl text-slate-200 font-sans text-sm leading-relaxed overflow-y-auto prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-mono-code text-xs bg-slate-900/90 p-4 rounded-lg border border-cyan-500/10">
                    {editedContent}
                  </pre>
                </div>
              )}
            </div>

            {/* Bottom Status bar */}
            <div className="mt-3 pt-2 border-t border-cyan-500/10 flex items-center justify-between text-[11px] font-mono-code text-cyan-500/60">
              <div className="flex items-center gap-2">
                <span>LINES: {editedContent.split('\n').length}</span>
                <span>•</span>
                <span>CHARACTERS: {editedContent.length}</span>
              </div>
              <div>LAST MODIFIED: {new Date(activeFile.updatedAt).toLocaleTimeString()}</div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-center text-slate-500 font-mono-code text-xs">
            Select a file from the explorer or create a new document.
          </div>
        )}
      </div>

      {/* Create New File Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <h4 className="font-tech text-sm font-bold text-cyan-300 uppercase">
                Initialize New Workspace Document
              </h4>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-slate-100 text-xs font-mono-code"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-tech text-cyan-400 mb-1">
                DOCUMENT NAME
              </label>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="e.g. system_architecture_v2"
                required
                className="w-full px-3 py-2 bg-slate-950 border border-cyan-500/30 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono-code"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['document', 'code', 'config'] as const).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setNewFileType(type)}
                  className={`p-2 rounded-xl border text-xs font-tech font-bold uppercase transition-all ${
                    newFileType === type
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-tech text-cyan-400 mb-1">
                METADATA TAGS (COMMA SEPARATED)
              </label>
              <input
                type="text"
                value={newFileTags}
                onChange={(e) => setNewFileTags(e.target.value)}
                placeholder="e.g. jarvis, protocol, mission"
                className="w-full px-3 py-2 bg-slate-950 border border-cyan-500/30 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-mono-code"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-tech font-bold rounded-lg text-xs"
              >
                Create Document
              </button>
            </div>
          </form>
        </div>
      )}

      {/* AI Note Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleAiSubmit}
            className="w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-2xl p-5 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <div className="flex items-center gap-2 font-tech font-bold text-cyan-300">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>JARVIS NEURAL DOCUMENT COMPILER</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-100 text-xs font-mono-code"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-tech text-cyan-400 mb-1">
                TOPIC OR PURPOSE FOR DOCUMENT
              </label>
              <textarea
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="e.g. Write a comprehensive technical briefing on deploying neural accessibility services on mobile Android devices..."
                rows={4}
                required
                className="w-full px-3 py-2 bg-slate-950 border border-cyan-500/30 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-400 font-sans"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAiGenerating || !aiTopic.trim()}
                className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-tech font-bold rounded-lg text-xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAiGenerating ? 'Synthesizing...' : 'Generate Document'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
