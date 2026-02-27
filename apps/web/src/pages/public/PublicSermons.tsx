import { useState } from 'react';
import { Play, Headphones, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSermons } from '@/hooks/useApi';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const PublicSermons = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'audio' | 'video'>('all');
  const { data: allSermons = [], isLoading } = useSermons();

  const filtered = allSermons.filter((s: { title: string; speaker: string; type: string }) => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.speaker.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || s.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero py-14 sm:py-20">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-3">Sermons & Teachings</h1>
            <p className="text-primary-foreground/80 max-w-xl mx-auto">
              Powerful messages to strengthen your faith. Watch and listen anytime.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-10 sm:py-16 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search sermons by title or speaker..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'video', 'audio'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                    typeFilter === type
                      ? 'bg-primary text-primary-foreground shadow-church'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {type === 'all' ? 'All' : type}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-16 text-muted-foreground">
              <Headphones className="w-12 h-12 mx-auto mb-3 opacity-40 animate-pulse" />
              <p>Loading sermons...</p>
            </div>
          )}

          {/* Sermons Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((sermon: {
                id: string;
                type: string;
                title: string;
                description?: string;
                speaker: string;
                date: string;
                duration?: string;
              }, i: number) => (
                <motion.div
                  key={sermon.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="h-full hover:shadow-church transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          {sermon.type === 'video' ? (
                            <Play className="w-6 h-6 text-primary" />
                          ) : (
                            <Headphones className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Badge variant="outline" className="text-xs capitalize mb-1">{sermon.type}</Badge>
                          <h3 className="font-semibold text-base">{sermon.title}</h3>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{sermon.description}</p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                        <div>
                          <p className="font-medium text-foreground">{sermon.speaker}</p>
                          <p>{new Date(sermon.date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        {sermon.duration && (
                          <Badge variant="secondary" className="text-xs">{sermon.duration}</Badge>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-border">
                        <Link
                          to="/login"
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          Sign in to listen <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Headphones className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No sermons found matching your search.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PublicSermons;
