import { useState } from 'react';
import { useNewsletters } from '@/hooks/useApi';
import { Newspaper, Loader2, ChevronDown, ChevronUp, Calendar, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const categoryColors: Record<string, string> = {
  announcement: 'bg-primary/10 text-primary',
  devotional:   'bg-accent/10 text-accent-foreground',
  prayer:       'bg-blue-500/10 text-blue-600',
  general:      'bg-muted text-muted-foreground',
};

const MemberNewsletters = () => {
  const { data: all = [], isLoading } = useNewsletters({ status: 'published' });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(all.map(n => n.category).filter(Boolean)))];
  const newsletters = filter === 'all' ? all : all.filter(n => n.category === filter);

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="px-4 lg:px-6 py-5 lg:py-8 space-y-5">
      <div>
        <h1 className="text-lg lg:text-xl font-bold">Newsletters</h1>
        <p className="text-sm text-muted-foreground mt-1">Announcements and messages from leadership</p>
      </div>

      {/* Category filters */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                filter === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {newsletters.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border py-16 flex flex-col items-center gap-3">
          <Newspaper className="w-10 h-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No newsletters yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {newsletters.map((nl, i) => {
            const isOpen = expandedId === nl.id;
            const colorClass = categoryColors[nl.category] ?? categoryColors.general;
            return (
              <motion.div
                key={nl.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm"
              >
                {/* Header — always visible, click to expand */}
                <button
                  onClick={() => setExpandedId(isOpen ? null : nl.id)}
                  className="w-full flex items-start gap-3 px-4 py-4 text-left hover:bg-muted/40 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${colorClass}`}>
                    <Newspaper className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${colorClass}`}>
                        {nl.category}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-snug">{nl.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />{nl.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(nl.date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    {!isOpen && nl.content && (
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 break-words">{nl.content}</p>
                    )}
                  </div>
                  {isOpen
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />}
                </button>

                {/* Full content */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-0 border-t border-border">
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words pt-3">
                          {nl.content || 'No content available.'}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MemberNewsletters;
