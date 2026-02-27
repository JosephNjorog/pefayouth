import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Phone, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInitiateStkPush, usePayment } from '@/hooks/useApi';
import { toast } from 'sonner';

type PaymentStep = 'details' | 'phone' | 'processing' | 'success' | 'failed';

interface PaymentModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
  eventTitle: string;
  price: number;
  eventId: string;
}

const PaymentModal = ({ show, onClose, onSuccess, eventTitle, price, eventId }: PaymentModalProps) => {
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('details');
  const [phoneNumber, setPhoneNumber] = useState('+254 ');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { mutateAsync: initiateStkPush, isPending: stkLoading } = useInitiateStkPush();
  const { data: paymentData, refetch: refetchPayment } = usePayment(paymentId ?? undefined);

  // Poll for payment status when processing
  useEffect(() => {
    if (paymentStep === 'processing' && paymentId) {
      pollIntervalRef.current = setInterval(async () => {
        setPollCount(c => c + 1);
        try {
          const result = await refetchPayment();
          const payment = result.data;
          if (payment) {
            if (payment.status === 'confirmed') {
              clearInterval(pollIntervalRef.current!);
              setPaymentStep('success');
              onSuccess();
            } else if (payment.status === 'failed' || payment.status === 'cancelled') {
              clearInterval(pollIntervalRef.current!);
              setPaymentStep('failed');
            }
          }
        } catch {
          // Continue polling on error
        }
      }, 3000);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [paymentStep, paymentId]);

  // Stop polling after 60 seconds (20 polls at 3s intervals)
  useEffect(() => {
    if (pollCount >= 20 && paymentStep === 'processing') {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setPaymentStep('failed');
    }
  }, [pollCount, paymentStep]);

  const handleSTKPush = async () => {
    const cleaned = phoneNumber.replace(/\s/g, '');
    if (cleaned.length < 12) {
      toast.error('Please enter a valid phone number');
      return;
    }
    try {
      setPaymentStep('processing');
      const result = await initiateStkPush({
        phone: cleaned,
        amount: price,
        eventId,
        eventTitle,
      });
      setPaymentId(result.paymentId);
      setPollCount(0);
    } catch (err: unknown) {
      setPaymentStep('failed');
      toast.error(err instanceof Error ? err.message : 'Failed to initiate payment');
    }
  };

  const handleClose = () => {
    if (paymentStep === 'details' || paymentStep === 'success' || paymentStep === 'failed') {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setPaymentStep('details');
      setPhoneNumber('+254 ');
      setPaymentId(null);
      setPollCount(0);
      onClose();
    }
  };

  const transactionId = paymentData?.transactionId ?? paymentData?.mpesaCheckoutRequestId ?? '—';

  return createPortal(
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 z-[60]"
            onClick={handleClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[60] bg-card rounded-t-3xl border-t border-border max-h-[80vh] overflow-y-auto"
          >
            <div className="w-10 h-1 rounded-full bg-muted mx-auto mt-3" />
            <div className="p-5">
              {paymentStep === 'details' && (
                <div>
                  <h3 className="text-lg font-bold mb-1">Payment Details</h3>
                  <p className="text-sm text-muted-foreground mb-5">{eventTitle}</p>
                  <div className="bg-muted rounded-xl p-4 mb-5">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Event Fee</span>
                      <span className="font-medium">KES {price.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-border pt-2">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-primary">KES {price.toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setPaymentStep('phone')}
                    className="w-full py-3.5 rounded-xl gradient-gold text-accent-foreground font-semibold text-sm shadow-gold"
                  >
                    Pay with M-Pesa
                  </button>
                </div>
              )}

              {paymentStep === 'phone' && (
                <div>
                  <h3 className="text-lg font-bold mb-1">M-Pesa Payment</h3>
                  <p className="text-sm text-muted-foreground mb-5">Enter your M-Pesa phone number to receive the STK push</p>
                  <div className="mb-5">
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                      <Phone className="w-3 h-3 inline mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+254 7XX XXX XXX"
                      className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    A prompt will appear on your phone. Enter your M-Pesa PIN to complete the payment of KES {price.toLocaleString()}.
                  </p>
                  <button
                    onClick={handleSTKPush}
                    disabled={stkLoading}
                    className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm shadow-church flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {stkLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    Send STK Push
                  </button>
                </div>
              )}

              {paymentStep === 'processing' && (
                <div className="text-center py-8">
                  <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-1">Processing Payment</h3>
                  <p className="text-sm text-muted-foreground">Check your phone for the M-Pesa prompt...</p>
                  <p className="text-xs text-muted-foreground mt-2">Enter your PIN to complete payment</p>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="text-center py-8">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                    <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-lg font-bold mb-1">Payment Successful!</h3>
                  <p className="text-sm text-muted-foreground mb-2">KES {price.toLocaleString()} paid successfully</p>
                  <p className="text-xs text-muted-foreground mb-6">Transaction ID: {transactionId}</p>
                  <button
                    onClick={handleClose}
                    className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm"
                  >
                    Done
                  </button>
                </div>
              )}

              {paymentStep === 'failed' && (
                <div className="text-center py-8">
                  <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-1">Payment Failed</h3>
                  <p className="text-sm text-muted-foreground mb-6">The transaction was not completed. Please try again.</p>
                  <button
                    onClick={() => { setPaymentStep('phone'); setPaymentId(null); setPollCount(0); }}
                    className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm mb-2"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleClose}
                    className="w-full py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default PaymentModal;
