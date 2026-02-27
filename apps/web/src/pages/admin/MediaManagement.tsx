import { useState } from 'react';
import { useSermons, useCreateSermon, useDeleteSermon, useGallery, useCreateGalleryItem, useDeleteGalleryItem } from '@/hooks/useApi';
import { Upload, Play, Image, Trash2, Plus, Video, Headphones, Loader2, Link2, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const MediaManagement = () => {
  const [tab, setTab] = useState<'sermons' | 'gallery'>('sermons');
  const [showUpload, setShowUpload] = useState(false);

  // Sermon form
  const [formTitle, setFormTitle] = useState('');
  const [formSpeaker, setFormSpeaker] = useState('');
  const [formType, setFormType] = useState<'audio' | 'video'>('audio');
  const [formUrl, setFormUrl] = useState('');
  const [formDuration, setFormDuration] = useState('');

  // Gallery form
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryEvent, setGalleryEvent] = useState('');
  const [galleryType, setGalleryType] = useState<'image' | 'video'>('image');
  const [galleryUrl, setGalleryUrl] = useState('');

  const { data: sermons = [], isLoading: sermonsLoading } = useSermons();
  const { data: galleryItems = [], isLoading: galleryLoading } = useGallery();
  const { mutateAsync: createSermon, isPending: creatingSermon } = useCreateSermon();
  const { mutateAsync: deleteSermon } = useDeleteSermon();
  const { mutateAsync: createGalleryItem, isPending: creatingGallery } = useCreateGalleryItem();
  const { mutateAsync: deleteGalleryItem } = useDeleteGalleryItem();

  const isLoading = sermonsLoading || galleryLoading;

  const handleSermonUpload = async () => {
    if (!formTitle || !formSpeaker) { toast.error('Title and speaker are required'); return; }
    try {
      await createSermon({ title: formTitle, speaker: formSpeaker, date: new Date().toISOString().split('T')[0], type: formType, duration: formDuration, url: formUrl || undefined });
      toast.success('Sermon added successfully');
      setFormTitle(''); setFormSpeaker(''); setFormType('audio'); setFormUrl(''); setFormDuration('');
      setShowUpload(false);
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Failed to add sermon'); }
  };

  const handleGalleryUpload = async () => {
    if (!galleryTitle) { toast.error('Title is required'); return; }
    try {
      await createGalleryItem({ title: galleryTitle, event: galleryEvent, date: new Date().toISOString().split('T')[0], type: galleryType, url: galleryUrl || undefined });
      toast.success('Gallery item added successfully');
      setGalleryTitle(''); setGalleryEvent(''); setGalleryType('image'); setGalleryUrl('');
      setShowUpload(false);
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Failed to add gallery item'); }
  };

  const handleDeleteSermon = async (id: string, title: string) => {
    if (!confirm(`Delete sermon "${title}"?`)) return;
    try { await deleteSermon(id); toast.success('Sermon deleted'); }
    catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Failed to delete sermon'); }
  };

  const handleDeleteGallery = async (id: string, title: string) => {
    if (!confirm(`Delete gallery item "${title}"?`)) return;
    try { await deleteGalleryItem(id); toast.success('Gallery item deleted'); }
    catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Failed to delete gallery item'); }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage sermons and gallery content</p>
        </div>
        <button onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-church hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Content</span>
        </button>
      </div>

      {showUpload && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Add New Content</h3>

          {/* Tabs inside upload */}
          <div className="flex bg-muted rounded-xl p-1 mb-4">
            <button onClick={() => setTab('sermons')} className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${tab === 'sermons' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>Sermon / Teaching</button>
            <button onClick={() => setTab('gallery')} className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${tab === 'gallery' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>Gallery Item</button>
          </div>

          {tab === 'sermons' ? (
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
            <div className="grid sm:grid-cols-2 gap-3">
              <input placeholder="Title *" value={galleryTitle} onChange={e => setGalleryTitle(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
              <input placeholder="Event Name" value={galleryEvent} onChange={e => setGalleryEvent(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
              <div className="relative">
                <select value={galleryType} onChange={e => setGalleryType(e.target.value as 'image' | 'video')}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-input bg-background text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-ring/20">
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <Link2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input placeholder="Image/Video URL" value={galleryUrl} onChange={e => setGalleryUrl(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20" />
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <button onClick={() => setShowUpload(false)} className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleGalleryUpload} disabled={creatingGallery}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium disabled:opacity-60">
                  {creatingGallery && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Add to Gallery
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex bg-muted rounded-xl p-1">
        <button onClick={() => setTab('sermons')} className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${tab === 'sermons' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>
          <Play className="w-3.5 h-3.5" /> Sermons ({sermons.length})
        </button>
        <button onClick={() => setTab('gallery')} className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${tab === 'gallery' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>
          <Image className="w-3.5 h-3.5" /> Gallery ({galleryItems.length})
        </button>
      </div>

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
              {(sermon as any).url && (
                <a href={(sermon as any).url} target="_blank" rel="noopener noreferrer"
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

      {tab === 'gallery' && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {galleryItems.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border overflow-hidden shadow-sm group">
              <div className={`aspect-square flex items-center justify-center relative ${i % 3 === 0 ? 'gradient-primary' : i % 3 === 1 ? 'gradient-gold' : 'gradient-hero'}`}>
                {(item as any).url ? (
                  <img src={(item as any).url} alt={item.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : item.type === 'video' ? (
                  <Play className="w-8 h-8 text-primary-foreground" />
                ) : (
                  <Image className="w-8 h-8 text-primary-foreground/70" />
                )}
                <button onClick={() => handleDeleteGallery(item.id, item.title)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity text-primary-foreground hover:bg-destructive">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="p-3">
                <p className="text-xs font-medium truncate">{item.title}</p>
                <p className="text-[10px] text-muted-foreground">{item.event} · {new Date(item.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p>
              </div>
            </motion.div>
          ))}
          {galleryItems.length === 0 && <p className="col-span-full text-center py-10 text-sm text-muted-foreground">No gallery items yet. Add your first one above.</p>}
        </div>
      )}
    </div>
  );
};

export default MediaManagement;
