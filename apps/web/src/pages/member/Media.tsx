import { useState } from 'react';
import { useSermons, useGallery } from '@/hooks/useApi';
import {
  Play, Headphones, Image, Video, Clock, User, Loader2,
  FolderOpen, ChevronRight, ChevronDown, X, Download,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GalleryItem } from '@/lib/api';

// Static church photos shown as a built-in folder
const STATIC_PHOTOS: GalleryItem[] = [
  { id: 's2', title: 'Youth Fellowship',      url: '/images/IMG_20250308_095513.jpg',     event: 'Church Photos', date: '2025-03-08', type: 'image' },
  { id: 's3', title: 'Youth Community',       url: '/images/IMG_20250308_090922.jpg',     event: 'Church Photos', date: '2025-03-08', type: 'image' },
  { id: 's4', title: 'December Event 2024',   url: '/images/IMG_20241215_115457.jpg',     event: 'Church Photos', date: '2024-12-15', type: 'image' },
  { id: 's5', title: 'February 2025',         url: '/images/IMG_20250209_131746.jpg',     event: 'Church Photos', date: '2025-02-09', type: 'image' },
  { id: 's6', title: 'August 2024 Service',   url: '/images/IMG_20240831_130946.jpg',     event: 'Church Photos', date: '2024-08-31', type: 'image' },
  { id: 's7', title: 'Youth Gathering',       url: '/images/IMG_20240831_131023.jpg',     event: 'Church Photos', date: '2024-08-31', type: 'image' },
  { id: 's8', title: 'Fellowship',            url: '/images/IMG_20240831_152147.jpg',     event: 'Church Photos', date: '2024-08-31', type: 'image' },
  { id: 's9', title: 'March 2025 Event',      url: '/images/IMG_20250308_122824.jpg',     event: 'Church Photos', date: '2025-03-08', type: 'image' },
  { id: 's10', title: 'School Outreach',      url: '/images/schoolvisit.jpg',             event: 'School Visits', date: '2025-01-01', type: 'image' },
  { id: 's11', title: 'School Visit',         url: '/images/schoolvisitimg2.jpg',         event: 'School Visits', date: '2025-01-01', type: 'image' },
  { id: 's12', title: 'Community Outreach',   url: '/images/schoolvisitimg3.jpg',         event: 'School Visits', date: '2025-01-01', type: 'image' },
  { id: 's13', title: 'Youth Outreach',       url: '/images/schoolvisitimg4.jpg',         event: 'School Visits', date: '2025-01-01', type: 'image' },
];

function groupByFolder(items: GalleryItem[]): Record<string, GalleryItem[]> {
  const groups: Record<string, GalleryItem[]> = {};
  for (const item of items) {
    const key = item.event?.trim() || 'Uncategorised';
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
  } catch { /* silent */ }
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
const Lightbox = ({ item, onClose }: { item: GalleryItem; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
    onClick={onClose}
  >
    <button
      onClick={onClose}
      className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
    >
      <X className="w-5 h-5" />
    </button>
    <motion.img
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      src={item.url!}
      alt={item.title}
      className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
      onClick={e => e.stopPropagation()}
    />
    <div className="mt-3 flex items-center gap-3">
      <p className="text-white text-sm font-medium">{item.title}</p>
      <button
        onClick={e => { e.stopPropagation(); downloadImage(item.url!, `${item.title}.jpg`); }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs hover:bg-white/20 transition-colors"
      >
        <Download className="w-3.5 h-3.5" /> Download
      </button>
    </div>
  </motion.div>
);

// ── Folder ─────────────────────────────────────────────────────────────────────
const FolderSection = ({ name, items }: { name: string; items: GalleryItem[] }) => {
  const [open, setOpen] = useState(false);
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      {/* Folder header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <FolderOpen className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{name}</p>
          <p className="text-xs text-muted-foreground">{items.length} photo{items.length !== 1 ? 's' : ''}</p>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>

      {/* Images grid */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => item.url && setLightbox(item)}
                  className="cursor-pointer group rounded-xl overflow-hidden border border-border bg-muted shadow-sm"
                >
                  <div className="aspect-square overflow-hidden">
                    {item.url ? (
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full gradient-hero flex items-center justify-center">
                        <Image className="w-7 h-7 text-primary-foreground/50" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-[11px] font-medium truncate">{item.title}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && <Lightbox item={lightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const Media = () => {
  const [tab, setTab] = useState<'sermons' | 'gallery'>('sermons');
  const [sermonFilter, setSermonFilter] = useState<'all' | 'video' | 'audio'>('all');

  const { data: sermons = [], isLoading: sermonsLoading } = useSermons();
  const { data: dbItems = [], isLoading: galleryLoading } = useGallery();

  const isLoading = sermonsLoading || galleryLoading;

  const filteredSermons = sermonFilter === 'all' ? sermons : sermons.filter(s => s.type === sermonFilter);

  // Merge static + DB items then group by folder
  const allItems = [...STATIC_PHOTOS, ...dbItems];
  const grouped = groupByFolder(allItems);
  const folders = Object.keys(grouped).sort((a, b) =>
    a === 'Church Photos' ? -1 : b === 'Church Photos' ? 1 : a.localeCompare(b)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 py-5 lg:py-8 space-y-5">
      <h1 className="text-lg lg:text-xl font-bold">Media</h1>

      {/* Tabs */}
      <div className="flex bg-muted rounded-xl p-1 max-w-sm">
        <button
          onClick={() => setTab('sermons')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${tab === 'sermons' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}
        >
          <Play className="w-3.5 h-3.5" /> Sermons
        </button>
        <button
          onClick={() => setTab('gallery')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${tab === 'gallery' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}
        >
          <Image className="w-3.5 h-3.5" /> Gallery
        </button>
      </div>

      {/* ── Sermons ── */}
      {tab === 'sermons' && (
        <>
          <div className="flex gap-2">
            {(['all', 'video', 'audio'] as const).map(f => (
              <button
                key={f}
                onClick={() => setSermonFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${sermonFilter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSermons.map((sermon, i) => (
              <motion.div
                key={sermon.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm"
              >
                <div className={`h-32 lg:h-40 flex items-center justify-center ${sermon.type === 'video' ? 'gradient-primary' : 'gradient-hero'}`}>
                  <div className="w-14 h-14 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-primary-foreground/30 transition-colors">
                    {sermon.type === 'video'
                      ? <Play className="w-6 h-6 text-primary-foreground ml-1" />
                      : <Headphones className="w-6 h-6 text-primary-foreground" />}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${sermon.type === 'video' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent-foreground'}`}>
                      {sermon.type === 'video'
                        ? <><Video className="w-2.5 h-2.5 inline mr-0.5" />Video</>
                        : <><Headphones className="w-2.5 h-2.5 inline mr-0.5" />Audio</>}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold">{sermon.title}</h3>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{sermon.speaker}</span>
                    {sermon.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{sermon.duration}</span>}
                    <span className="ml-auto">{new Date(sermon.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  {sermon.url && (
                    <a
                      href={sermon.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      <Play className="w-3.5 h-3.5" /> Listen / Watch
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
            {filteredSermons.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-2 text-center py-8">No sermons found.</p>
            )}
          </div>
        </>
      )}

      {/* ── Gallery (folder view) ── */}
      {tab === 'gallery' && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {folders.length} folder{folders.length !== 1 ? 's' : ''} · tap a folder to view photos
          </p>
          {folders.map(folder => (
            <FolderSection key={folder} name={folder} items={grouped[folder]} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Media;
