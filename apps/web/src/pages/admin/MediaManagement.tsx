import { useState, useRef } from 'react';
import {
  useSermons, useCreateSermon, useDeleteSermon,
  useGallery, useCreateGalleryItem, useDeleteGalleryItem, useUpdateGalleryItem,
} from '@/hooks/useApi';
import {
  Upload, Play, Image, Trash2, Plus, Video, Headphones, Loader2,
  Link2, ChevronDown, CloudUpload, X, Download, FolderOpen,
  Pencil, Check, FolderInput, ChevronRight, ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { uploadToCloudinary } from '@/lib/cloudinary';
import JSZip from 'jszip';
import type { GalleryItem } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
interface UploadFile {
  file: File;
  preview: string;
  title: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  url?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function groupByFolder(items: GalleryItem[]): Record<string, GalleryItem[]> {
  const groups: Record<string, GalleryItem[]> = {};
  for (const item of items) {
    const key = item.event?.trim() || '(No Folder)';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

async function downloadImage(url: string, filename: string) {
  try {
    const resp = await fetch(url);
    const blob = await resp.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  } catch {
    toast.error('Failed to download image');
  }
}

async function downloadFolderAsZip(items: GalleryItem[], folderName: string) {
  const zip = new JSZip();
  const folder = zip.folder(folderName) as JSZip;
  const toastId = toast.loading(`Preparing ZIP for "${folderName}"…`);
  try {
    await Promise.all(
      items.map(async (item) => {
        if (!item.url) return;
        const resp = await fetch(item.url);
        const blob = await resp.blob();
        const ext = blob.type.split('/')[1] || 'jpg';
        folder.file(`${item.title.replace(/[/\\?%*:|"<>]/g, '_')}.${ext}`, blob);
      })
    );
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(zipBlob);
    a.download = `${folderName}.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success('ZIP downloaded!', { id: toastId });
  } catch {
    toast.error('ZIP download failed', { id: toastId });
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
const MediaManagement = () => {
  const [tab, setTab] = useState<'sermons' | 'gallery'>('sermons');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadSubTab, setUploadSubTab] = useState<'sermon' | 'gallery'>('sermon');

  // Sermon form
  const [formTitle, setFormTitle] = useState('');
  const [formSpeaker, setFormSpeaker] = useState('');
  const [formType, setFormType] = useState<'audio' | 'video'>('audio');
  const [formUrl, setFormUrl] = useState('');
  const [formDuration, setFormDuration] = useState('');

  // Gallery multi-upload
  const [folderName, setFolderName] = useState('');
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Folder collapse state
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());

  // Edit state per item
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editFolder, setEditFolder] = useState('');

  // Folder rename state
  const [renamingFolder, setRenamingFolder] = useState<string | null>(null);
  const [renameFolderVal, setRenameFolderVal] = useState('');

  const { data: sermons = [], isLoading: sermonsLoading } = useSermons();
  const { data: galleryItems = [], isLoading: galleryLoading } = useGallery();
  const { mutateAsync: createSermon, isPending: creatingSermon } = useCreateSermon();
  const { mutateAsync: deleteSermon } = useDeleteSermon();
  const { mutateAsync: createGalleryItem } = useCreateGalleryItem();
  const { mutateAsync: deleteGalleryItem } = useDeleteGalleryItem();
  const { mutateAsync: updateGalleryItem } = useUpdateGalleryItem();

  const isLoading = sermonsLoading || galleryLoading;
  const grouped = groupByFolder(galleryItems);
  const folders = Object.keys(grouped).sort((a, b) => a === '(No Folder)' ? 1 : b === '(No Folder)' ? -1 : a.localeCompare(b));

  // ── Sermon handlers ────────────────────────────────────────────────────────
  const handleSermonUpload = async () => {
    if (!formTitle || !formSpeaker) { toast.error('Title and speaker are required'); return; }
    try {
      await createSermon({ title: formTitle, speaker: formSpeaker, date: new Date().toISOString().split('T')[0], type: formType, duration: formDuration, url: formUrl || undefined });
      toast.success('Sermon added');
      setFormTitle(''); setFormSpeaker(''); setFormType('audio'); setFormUrl(''); setFormDuration('');
      setShowUpload(false);
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const handleDeleteSermon = async (id: string, title: string) => {
    if (!confirm(`Delete sermon "${title}"?`)) return;
    try { await deleteSermon(id); toast.success('Deleted'); }
    catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  // ── Gallery multi-upload ───────────────────────────────────────────────────
  const handleFilesSelect = (files: FileList | File[]) => {
    const arr = Array.from(files);
    const valid = arr.filter(f => f.type.startsWith('image/') && f.size <= 20 * 1024 * 1024);
    if (valid.length < arr.length) toast.warning('Some files skipped (not images or >20 MB)');
    const newItems: UploadFile[] = valid.map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
      title: f.name.replace(/\.[^.]+$/, ''),
      status: 'pending',
    }));
    setUploadFiles(prev => [...prev, ...newItems]);
  };

  const removeUploadFile = (idx: number) => {
    setUploadFiles(prev => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const updateUploadTitle = (idx: number, title: string) => {
    setUploadFiles(prev => prev.map((f, i) => i === idx ? { ...f, title } : f));
  };

  const handleGalleryUpload = async () => {
    if (uploadFiles.length === 0) { toast.error('Select at least one image'); return; }
    setIsUploading(true);
    const date = new Date().toISOString().split('T')[0];
    let successCount = 0;

    for (let i = 0; i < uploadFiles.length; i++) {
      const uf = uploadFiles[i];
      if (uf.status === 'done') { successCount++; continue; }
      setUploadFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'uploading' } : f));
      try {
        const url = await uploadToCloudinary(uf.file, 'pefayouth/gallery');
        await createGalleryItem({ title: uf.title || uf.file.name, event: folderName.trim() || undefined, date, type: 'image', url });
        setUploadFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'done', url } : f));
        successCount++;
      } catch {
        setUploadFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: 'error' } : f));
      }
    }

    setIsUploading(false);
    if (successCount > 0) toast.success(`${successCount} image${successCount > 1 ? 's' : ''} uploaded`);
    const hasErrors = uploadFiles.some(f => f.status === 'error');
    if (!hasErrors) {
      setUploadFiles([]);
      setFolderName('');
      setShowUpload(false);
    }
  };

  // ── Gallery item edit ──────────────────────────────────────────────────────
  const startEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditFolder(item.event ?? '');
  };

  const saveEdit = async (id: string) => {
    try {
      await updateGalleryItem({ id, data: { title: editTitle, event: editFolder.trim() || undefined } });
      toast.success('Updated');
    } catch { toast.error('Update failed'); }
    setEditingId(null);
  };

  // ── Folder rename ──────────────────────────────────────────────────────────
  const startFolderRename = (folder: string) => {
    setRenamingFolder(folder);
    setRenameFolderVal(folder === '(No Folder)' ? '' : folder);
  };

  const saveFolderRename = async () => {
    if (!renamingFolder) return;
    const items = grouped[renamingFolder] ?? [];
    const newFolder = renameFolderVal.trim();
    try {
      await Promise.all(items.map(item => updateGalleryItem({ id: item.id, data: { event: newFolder || undefined } })));
      toast.success(`Folder renamed to "${newFolder || '(No Folder)'}"`)
    } catch { toast.error('Rename failed'); }
    setRenamingFolder(null);
  };

  const handleDeleteGallery = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try { await deleteGalleryItem(id); toast.success('Deleted'); }
    catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Failed'); }
  };

  const toggleFolder = (folder: string) => {
    setCollapsedFolders(prev => {
      const next = new Set(prev);
      next.has(folder) ? next.delete(folder) : next.add(folder);
      return next;
    });
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage sermons and gallery content</p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-church hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Content</span>
        </button>
      </div>

      {/* Upload Panel */}
      <AnimatePresence>
        {showUpload && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">Add New Content</h3>
                <button onClick={() => setShowUpload(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Sub tabs */}
              <div className="flex bg-muted rounded-xl p-1 mb-4">
                <button onClick={() => setUploadSubTab('sermon')} className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${uploadSubTab === 'sermon' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>
                  Sermon / Teaching
                </button>
                <button onClick={() => setUploadSubTab('gallery')} className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${uploadSubTab === 'gallery' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>
                  Gallery Photos
                </button>
              </div>

              {uploadSubTab === 'sermon' ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  <input placeholder="Sermon Title *" value={formTitle} onChange={e => setFormTitle(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 sm:col-span-2" />
                  <input placeholder="Speaker *" value={formSpeaker} onChange={e => setFormSpeaker(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
                  <input placeholder="Duration (e.g. 45 min)" value={formDuration} onChange={e => setFormDuration(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
                  <div className="relative">
                    <select value={formType} onChange={e => setFormType(e.target.value as 'audio' | 'video')}
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring/20">
                      <option value="audio">Audio</option>
                      <option value="video">Video</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                  <div className="relative sm:col-span-2">
                    <Link2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input placeholder="Media URL (YouTube, SoundCloud, etc.)" value={formUrl} onChange={e => setFormUrl(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
                  </div>
                  <div className="sm:col-span-2 flex justify-end gap-2">
                    <button onClick={() => setShowUpload(false)} className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                    <button onClick={handleSermonUpload} disabled={creatingSermon}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-60">
                      {creatingSermon && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Add Sermon
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Folder name */}
                  <div className="relative">
                    <FolderInput className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      placeholder="Folder / Album name (optional)"
                      value={folderName}
                      onChange={e => setFolderName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                  </div>

                  {/* Drop zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); if (e.dataTransfer.files.length) handleFilesSelect(e.dataTransfer.files); }}
                    className="border-2 border-dashed border-border rounded-xl h-28 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all group"
                  >
                    <CloudUpload className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
                    <p className="text-sm text-muted-foreground">Click or drag & drop images</p>
                    <p className="text-[10px] text-muted-foreground">Multiple files supported · up to 20 MB each</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={e => { if (e.target.files?.length) handleFilesSelect(e.target.files); }} />

                  {/* File list */}
                  {uploadFiles.length > 0 && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {uploadFiles.map((uf, i) => (
                        <div key={i} className="flex items-center gap-3 bg-muted/40 rounded-xl px-3 py-2">
                          <img src={uf.preview} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          <input
                            value={uf.title}
                            onChange={e => updateUploadTitle(i, e.target.value)}
                            disabled={uf.status === 'uploading' || uf.status === 'done'}
                            className="flex-1 min-w-0 text-xs bg-transparent border-b border-border focus:outline-none focus:border-primary py-0.5 disabled:opacity-60"
                            placeholder="Photo title"
                          />
                          <div className="shrink-0 w-5 flex items-center justify-center">
                            {uf.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                            {uf.status === 'done' && <Check className="w-4 h-4 text-green-500" />}
                            {uf.status === 'error' && <X className="w-4 h-4 text-destructive" />}
                            {uf.status === 'pending' && (
                              <button onClick={() => removeUploadFile(i)} className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setShowUpload(false); setUploadFiles([]); setFolderName(''); }}
                      className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                    <button onClick={handleGalleryUpload} disabled={isUploading || uploadFiles.length === 0}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-60">
                      {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      {isUploading ? 'Uploading…' : `Upload ${uploadFiles.length > 0 ? uploadFiles.length : ''} Photo${uploadFiles.length !== 1 ? 's' : ''}`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main tabs */}
      <div className="flex bg-muted rounded-xl p-1">
        <button onClick={() => setTab('sermons')} className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${tab === 'sermons' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>
          <Play className="w-3.5 h-3.5" /> Sermons ({sermons.length})
        </button>
        <button onClick={() => setTab('gallery')} className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${tab === 'gallery' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>
          <Image className="w-3.5 h-3.5" /> Gallery ({galleryItems.length})
        </button>
      </div>

      {/* ── Sermons tab ── */}
      {tab === 'sermons' && (
        <div className="space-y-3">
          {sermons.map((sermon, i) => (
            <motion.div key={sermon.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-4 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${sermon.type === 'video' ? 'gradient-primary' : 'gradient-hero'}`}>
                {sermon.type === 'video' ? <Video className="w-5 h-5 text-primary-foreground" /> : <Headphones className="w-5 h-5 text-primary-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium truncate">{sermon.title}</h3>
                <p className="text-xs text-muted-foreground">{sermon.speaker}{sermon.duration ? ` · ${sermon.duration}` : ''}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(sermon.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
              {sermon.url && (
                <a href={sermon.url} target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors shrink-0" title="Open media link">
                  <Upload className="w-4 h-4" />
                </a>
              )}
              <button onClick={() => handleDeleteSermon(sermon.id, sermon.title)}
                className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
          {sermons.length === 0 && <p className="text-center py-10 text-sm text-muted-foreground">No sermons yet. Add your first one above.</p>}
        </div>
      )}

      {/* ── Gallery tab ── */}
      {tab === 'gallery' && (
        <div className="space-y-6">
          {folders.length === 0 && (
            <p className="text-center py-10 text-sm text-muted-foreground">No gallery items yet. Upload some above.</p>
          )}

          {folders.map(folder => {
            const items = grouped[folder];
            const isCollapsed = collapsedFolders.has(folder);
            const isRenaming = renamingFolder === folder;

            return (
              <div key={folder} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                {/* Folder header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
                  <button onClick={() => toggleFolder(folder)} className="flex items-center gap-2 flex-1 min-w-0 text-left group">
                    <FolderOpen className="w-4 h-4 text-primary shrink-0" />
                    {isRenaming ? (
                      <input
                        autoFocus
                        value={renameFolderVal}
                        onChange={e => setRenameFolderVal(e.target.value)}
                        onClick={e => e.stopPropagation()}
                        onKeyDown={e => { if (e.key === 'Enter') saveFolderRename(); if (e.key === 'Escape') setRenamingFolder(null); }}
                        className="flex-1 text-sm font-semibold bg-background border border-primary rounded-lg px-2 py-0.5 focus:outline-none"
                      />
                    ) : (
                      <span className="text-sm font-semibold truncate">{folder}</span>
                    )}
                    <span className="text-xs text-muted-foreground ml-1 shrink-0">({items.length})</span>
                    {isCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0" /> : <ChevronUp className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0" />}
                  </button>

                  <div className="flex items-center gap-1 shrink-0">
                    {isRenaming ? (
                      <>
                        <button onClick={saveFolderRename} className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors" title="Save rename">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setRenamingFolder(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors" title="Cancel">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => startFolderRename(folder)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Rename folder">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => downloadFolderAsZip(items, folder === '(No Folder)' ? 'gallery' : folder)}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                      title="Download folder as ZIP"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Items grid */}
                {!isCollapsed && (
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {items.map(item => (
                      <div key={item.id} className="group relative bg-muted rounded-xl overflow-hidden border border-border">
                        {/* Image */}
                        <div className="aspect-square relative overflow-hidden bg-muted">
                          {item.url ? (
                            <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          ) : (
                            <div className="w-full h-full gradient-hero flex items-center justify-center">
                              <Image className="w-8 h-8 text-primary-foreground/70" />
                            </div>
                          )}
                          {/* Hover actions */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              onClick={() => item.url && downloadImage(item.url, `${item.title}.jpg`)}
                              className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                              title="Download"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => startEdit(item)}
                              className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteGallery(item.id, item.title)}
                              className="p-2 rounded-lg bg-white/20 backdrop-blur-sm text-white hover:bg-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Caption / edit */}
                        {editingId === item.id ? (
                          <div className="p-2 space-y-1.5">
                            <input
                              autoFocus
                              value={editTitle}
                              onChange={e => setEditTitle(e.target.value)}
                              className="w-full text-xs px-2 py-1 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                              placeholder="Title"
                            />
                            <input
                              value={editFolder}
                              onChange={e => setEditFolder(e.target.value)}
                              className="w-full text-xs px-2 py-1 rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                              placeholder="Folder (album)"
                            />
                            <div className="flex gap-1">
                              <button onClick={() => saveEdit(item.id)} className="flex-1 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                                Save
                              </button>
                              <button onClick={() => setEditingId(null)} className="flex-1 py-1 rounded-lg bg-muted text-muted-foreground text-xs hover:bg-muted/80 transition-colors">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-2">
                            <p className="text-xs font-medium truncate">{item.title}</p>
                            <p className="text-[10px] text-muted-foreground">{new Date(item.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MediaManagement;
