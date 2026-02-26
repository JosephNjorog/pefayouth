import { useState } from 'react';
import { sermons, galleryItems } from '@/data/mockData';
import { Upload, Play, Image, Trash2, Plus, Video, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

const MediaManagement = () => {
  const [tab, setTab] = useState<'sermons' | 'gallery'>('sermons');
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage sermons and gallery content</p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-church hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Upload</span>
        </button>
      </div>

      {/* Upload Area */}
      {showUpload && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-card rounded-xl border border-border p-5 shadow-sm"
        >
          <h3 className="text-sm font-semibold mb-3">Upload New Content</h3>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">Drag & drop files here</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
            <p className="text-[10px] text-muted-foreground mt-2">Supports: MP3, MP4, JPG, PNG (max 50MB)</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            <input
              placeholder="Title"
              className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
            <input
              placeholder="Speaker / Event"
              className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowUpload(false)}
              className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium">
              Upload
            </button>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex bg-muted rounded-xl p-1">
        <button
          onClick={() => setTab('sermons')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            tab === 'sermons' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          Sermons ({sermons.length})
        </button>
        <button
          onClick={() => setTab('gallery')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            tab === 'gallery' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
          }`}
        >
          <Image className="w-3.5 h-3.5" />
          Gallery ({galleryItems.length})
        </button>
      </div>

      {tab === 'sermons' && (
        <div className="space-y-3">
          {sermons.map((sermon, i) => (
            <motion.div
              key={sermon.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-4 shadow-sm flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                sermon.type === 'video' ? 'gradient-primary' : 'gradient-hero'
              }`}>
                {sermon.type === 'video' ? (
                  <Video className="w-5 h-5 text-primary-foreground" />
                ) : (
                  <Headphones className="w-5 h-5 text-primary-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium truncate">{sermon.title}</h3>
                <p className="text-xs text-muted-foreground">{sermon.speaker} · {sermon.duration}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(sermon.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <button className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'gallery' && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {galleryItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border overflow-hidden shadow-sm group"
            >
              <div className={`aspect-square flex items-center justify-center relative ${
                i % 3 === 0 ? 'gradient-primary' : i % 3 === 1 ? 'gradient-gold' : 'gradient-hero'
              }`}>
                {item.type === 'video' ? (
                  <Play className="w-8 h-8 text-primary-foreground" />
                ) : (
                  <Image className="w-8 h-8 text-primary-foreground/70" />
                )}
                <button className="absolute top-2 right-2 p-1.5 rounded-lg bg-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity text-primary-foreground hover:bg-destructive">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="p-3">
                <p className="text-xs font-medium truncate">{item.title}</p>
                <p className="text-[10px] text-muted-foreground">{item.event} · {new Date(item.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaManagement;
