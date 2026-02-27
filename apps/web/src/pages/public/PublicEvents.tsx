import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEvents } from '@/hooks/useApi';

const eventTypes = ['all', 'service', 'fellowship', 'seminar', 'retreat', 'camp', 'outreach'] as const;

const PublicEvents = () => {
  const [activeType, setActiveType] = useState<string>('all');
  const { data: allEvents = [], isLoading } = useEvents();

  const filteredEvents = activeType === 'all'
    ? allEvents
    : allEvents.filter((e: { type: string }) => e.type === activeType);

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero py-14 sm:py-20">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-3">Events & Activities</h1>
            <p className="text-primary-foreground/80 max-w-xl mx-auto">
              Discover upcoming events, retreats, and gatherings. Everyone is welcome!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters & Events */}
      <section className="py-10 sm:py-16 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          {/* Type filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {eventTypes.map(type => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                  activeType === type
                    ? 'bg-primary text-primary-foreground shadow-church'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {type === 'all' ? 'All Events' : type}
              </button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-16 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40 animate-pulse" />
              <p>Loading events...</p>
            </div>
          )}

          {/* Event Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event: {
                id: string;
                type: string;
                isPaid: boolean;
                price?: string | number;
                title: string;
                description?: string;
                date: string;
                time: string;
                location: string;
                registered: number;
                capacity: number;
              }, i: number) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="h-full hover:shadow-church transition-shadow overflow-hidden">
                    <div className="h-2 gradient-primary" />
                    <CardContent className="pt-5">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge variant="secondary" className="text-xs capitalize">{event.type}</Badge>
                        {event.isPaid ? (
                          <Badge className="bg-accent/10 text-accent border-accent/30 text-xs">
                            KES {Number(event.price || 0).toLocaleString()}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Free</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold mb-2 text-base">{event.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>

                      <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          {new Date(event.date).toLocaleDateString('en-KE', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          {event.time}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-primary" />
                          {event.registered}/{event.capacity} registered
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border">
                        <Link
                          to="/login"
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                          Sign in to register <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && filteredEvents.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>No events found for this category.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default PublicEvents;
