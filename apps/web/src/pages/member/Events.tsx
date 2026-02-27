import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '@/hooks/useApi';
import { ChevronLeft, ChevronRight, MapPin, Clock, Users, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const typeColors: Record<string, string> = {
  service: 'bg-primary/10 text-primary',
  seminar: 'bg-accent/10 text-accent-foreground',
  retreat: 'bg-chart-3/10 text-chart-3',
  camp: 'bg-chart-4/10 text-chart-4',
  fellowship: 'bg-secondary text-secondary-foreground',
  outreach: 'bg-chart-5/10 text-chart-5',
};

const Events = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filter, setFilter] = useState<string>('all');

  const { data: events = [], isLoading } = useEvents();

  const month = currentMonth.getMonth();
  const year = currentMonth.getFullYear();

  const monthEvents = events.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  const filteredEvents = filter === 'all'
    ? monthEvents
    : monthEvents.filter(e => e.type === filter);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const eventDates = new Set(monthEvents.map(e => new Date(e.date).getDate()));

  const today = new Date();
  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const allTypes = [...new Set(events.map(e => e.type))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 py-5 lg:py-8 space-y-5">
      {/* Desktop: Calendar sidebar + Events list layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Card */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-2xl border border-border p-4 shadow-sm lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-sm font-semibold">
                {currentMonth.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
              </h2>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Mini Calendar */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-[10px] font-medium text-muted-foreground py-1">{d}</div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const hasEvent = eventDates.has(day);
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                return (
                  <div
                    key={day}
                    className={`relative py-1.5 text-xs rounded-lg cursor-default ${
                      isToday ? 'bg-primary text-primary-foreground font-bold' : ''
                    }`}
                  >
                    {day}
                    {hasEvent && !isToday && (
                      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Filters - inside calendar card on desktop */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Filter by type</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  All
                </button>
                {allTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                      filter === type ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="lg:col-span-2">
          {/* Mobile-only filters */}
          <div className="lg:hidden flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
            <button
              onClick={() => setFilter('all')}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              All
            </button>
            {allTypes.map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                  filter === type ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No events this month
              </div>
            ) : (
              filteredEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/member/events/${event.id}`}
                    className="block bg-card rounded-2xl border border-border p-4 shadow-sm hover:shadow-church transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full capitalize mb-1.5 ${typeColors[event.type] || 'bg-muted text-muted-foreground'}`}>
                          {event.type}
                        </span>
                        <h3 className="text-sm font-semibold">{event.title}</h3>
                      </div>
                      {event.isPaid && (
                        <span className="text-sm font-bold text-accent shrink-0 ml-2">
                          KES {Number(event.price ?? 0).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{event.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(event.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })} · {event.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                      <span className="flex items-center gap-1 ml-auto">
                        <Users className="w-3 h-3" />
                        {event.registered}/{event.capacity}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
