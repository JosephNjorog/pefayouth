import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent, useRegisterForEvent } from '@/hooks/useApi';
import { ArrowLeft, MapPin, Clock, Users, CheckCircle, Loader2 } from 'lucide-react';
import PaymentModal from '@/components/PaymentModal';
import { toast } from 'sonner';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: event, isLoading, isError } = useEvent(id);
  const registerForEvent = useRegisterForEvent();

  const [rsvpd, setRsvpd] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-muted-foreground">Event not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-primary font-medium">Go back</button>
      </div>
    );
  }

  const handleRSVP = async () => {
    if (event.isPaid) {
      setShowPayment(true);
    } else {
      try {
        await registerForEvent.mutateAsync(event.id);
        setRsvpd(true);
        toast.success("You're registered! See you there.");
      } catch (err: any) {
        toast.error(err.message || 'Registration failed. Please try again.');
      }
    }
  };

  const spotsLeft = event.capacity - event.registered;
  const progress = (event.registered / event.capacity) * 100;
  const price = Number(event.price ?? 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="relative max-w-3xl mx-auto">
        <div className={`h-48 lg:h-56 lg:rounded-b-2xl ${event.isPaid ? 'gradient-gold' : 'gradient-primary'} flex items-end`}>
          <div className="absolute top-4 left-4">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-foreground/10 backdrop-blur-sm flex items-center justify-center text-primary-foreground">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
          <div className="w-full p-5 pb-0">
            <div className="bg-card rounded-t-2xl px-5 pt-5">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground capitalize">{event.type}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 max-w-3xl mx-auto">
        <div className="bg-card rounded-b-2xl border border-t-0 border-border p-5 lg:p-8 shadow-sm -mt-0.5">
          <h1 className="text-xl lg:text-2xl font-bold mb-2">{event.title}</h1>
          <p className="text-sm text-muted-foreground mb-4">{event.description}</p>

          <div className="space-y-3 mb-5">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0"><Clock className="w-4 h-4 text-primary" /></div>
              <div>
                <p className="font-medium">{new Date(event.date).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                <p className="text-xs text-muted-foreground">{event.time}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0"><MapPin className="w-4 h-4 text-primary" /></div>
              <p className="font-medium">{event.location}</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0"><Users className="w-4 h-4 text-primary" /></div>
              <div className="flex-1">
                <p className="font-medium">{event.registered} / {event.capacity} registered</p>
                <div className="w-full h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{spotsLeft} spots left</p>
              </div>
            </div>
          </div>

          {event.isPaid && (
            <div className="bg-accent/10 rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Event Fee</span>
                <span className="text-xl font-bold text-accent-foreground">KES {price.toLocaleString()}</span>
              </div>
            </div>
          )}

          {rsvpd ? (
            <div className="bg-secondary rounded-xl p-4 text-center">
              <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-semibold text-secondary-foreground">You're registered!</p>
              <p className="text-xs text-muted-foreground mt-1">{event.isPaid ? 'Payment confirmed. See you there!' : "We'll see you there!"}</p>
            </div>
          ) : spotsLeft <= 0 ? (
            <div className="bg-muted rounded-xl p-4 text-center">
              <p className="text-sm font-semibold text-muted-foreground">Event is fully booked</p>
            </div>
          ) : (
            <button
              onClick={handleRSVP}
              disabled={registerForEvent.isPending}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 ${
                event.isPaid ? 'gradient-gold text-accent-foreground shadow-gold' : 'gradient-primary text-primary-foreground shadow-church'
              }`}
            >
              {registerForEvent.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {event.isPaid ? `Pay & Register — KES ${price.toLocaleString()}` : 'RSVP — Free Event'}
            </button>
          )}
        </div>
      </div>

      {event.isPaid && (
        <PaymentModal
          show={showPayment}
          onClose={() => setShowPayment(false)}
          onSuccess={() => { setRsvpd(true); setShowPayment(false); }}
          eventTitle={event.title}
          price={price}
          eventId={event.id}
        />
      )}
    </div>
  );
};

export default EventDetail;
