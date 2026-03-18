import { useState } from 'react';
import { useSermons, useGallery } from '@/hooks/useApi';
import { Play, Headphones, Image, Video, Clock, User, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Real church photos from public/images/
const churchPhotos = [
  { src: '/images/herobg.jpg',                 caption: 'Worship Service' },
  { src: '/images/IMG_20250308_095513.jpg',     caption: 'Youth Fellowship' },
  { src: '/images/IMG_20250308_090922.jpg',     caption: 'Youth Community' },
  { src: '/images/IMG_20241215_115457.jpg',     caption: 'December Event 2024' },
  { src: '/images/IMG_20250209_131746.jpg',     caption: 'February 2025' },
  { src: '/images/IMG_20240831_130946.jpg',     caption: 'August 2024 Service' },
  { src: '/images/IMG_20240831_131023.jpg',     caption: 'Youth Gathering' },
  { src: '/images/IMG_20240831_152147.jpg',     caption: 'Fellowship' },
  { src: '/images/IMG_20250308_122824.jpg',     caption: 'March 2025 Event' },
  { src: '/images/schoolvisit.jpg',             caption: 'School Outreach' },
  { src: '/images/schoolvisitimg2.jpg',         caption: 'School Visit' },
  { src: '/images/schoolvisitimg3.jpg',         caption: 'Community Outreach' },
  { src: '/images/schoolvisitimg4.jpg',         caption: 'Youth Outreach' },
];

const Media = () => {
  const [tab, setTab] = useState<'sermons' | 'gallery'>('sermons');
  const [sermonFilter, setSermonFilter] = useState<'all' | 'video' | 'audio'>('all');

  const { data: sermons = [], isLoading: sermonsLoading } = useSermons();
  const { data: galleryItems = [], isLoading: galleryLoading } = useGallery();

  const isLoading = sermonsLoading || galleryLoading;

  const filteredSermons = sermonFilter === 'all'
    ? sermons
    : sermons.filter(s => s.type === sermonFilter);

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
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            tab === 'sermons' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          Sermons
        </button>
        <button
          onClick={() => setTab('gallery')}
          className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            tab === 'gallery' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
          }`}
        >
          <Image className="w-3.5 h-3.5" />
          Gallery
        </button>
      </div>

      {tab === 'sermons' && (
        <>
          {/* Sermon Filters */}
          <div className="flex gap-2">
            {(['all', 'video', 'audio'] as const).map(f => (
              <button
                key={f}
                onClick={() => setSermonFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                  sermonFilter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Sermons Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSermons.map((sermon, i) => (
              <motion.div
                key={sermon.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm"
              >
                <div className={`h-32 lg:h-40 flex items-center justify-center ${
                  sermon.type === 'video' ? 'gradient-primary' : 'gradient-hero'
                }`}>
                  <div className="w-14 h-14 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-primary-foreground/30 transition-colors">
                    {sermon.type === 'video' ? (
                      <Play className="w-6 h-6 text-primary-foreground ml-1" />
                    ) : (
                      <Headphones className="w-6 h-6 text-primary-foreground" />
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      sermon.type === 'video' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent-foreground'
                    }`}>
                      {sermon.type === 'video' ? <><Video className="w-2.5 h-2.5 inline mr-0.5" /> Video</> : <><Headphones className="w-2.5 h-2.5 inline mr-0.5" /> Audio</>}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold">{sermon.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{sermon.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{sermon.speaker}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{sermon.duration}</span>
                    <span className="ml-auto">{new Date(sermon.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredSermons.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-2 text-center py-8">No sermons found.</p>
            )}
          </div>
        </>
      )}

      {tab === 'gallery' && (
        <div className="space-y-6">
          {/* Church Photos — static assets */}
          <div>
            <h2 className="text-sm font-semibold mb-3">Our Photos</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {churchPhotos.map((photo, i) => (
                <motion.div
                  key={photo.caption}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl overflow-hidden shadow-sm border border-border group cursor-pointer"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={photo.src}
                      alt={photo.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2 bg-card">
                    <p className="text-xs font-medium truncate">{photo.caption}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Gallery items from DB */}
          {galleryItems.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold mb-3">Events Gallery</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {galleryItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-xl border border-border overflow-hidden shadow-sm cursor-pointer hover:shadow-church transition-all group"
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
                        <div className={`w-full h-full flex items-center justify-center ${
                          i % 3 === 0 ? 'gradient-primary' : i % 3 === 1 ? 'gradient-gold' : 'gradient-hero'
                        }`}>
                          {item.type === 'video' ? (
                            <Play className="w-8 h-8 text-primary-foreground" />
                          ) : (
                            <Image className="w-8 h-8 text-primary-foreground/70" />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium truncate">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground">{item.event}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Media;
