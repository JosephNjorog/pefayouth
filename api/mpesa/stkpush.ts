import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, payments } from '../../db/client';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../../lib/auth';
import { initiateStkPush } from '../../lib/mpesa';
import { ok, err } from '../../lib/helpers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405);

  const user = await requireAuth(req, res);
  if (!user) return;

  const { phone, amount, eventId, eventTitle, paymentId } = req.body || {};
  if (!phone || !amount || !eventId) {
    return err(res, 'phone, amount, and eventId are required');
  }

  try {
    const callbackUrl =
      process.env.MPESA_CALLBACK_URL ||
      `https://${req.headers.host}/api/mpesa/callback`;

    const result = await initiateStkPush({
      phone,
      amount: Number(amount),
      accountRef: eventTitle || 'PEFA Youth',
      description: 'Event Payment',
      callbackUrl,
    });

    if (result.ResponseCode !== '0') {
      return err(res, result.ResponseDescription || 'STK Push failed');
    }

    // Create or update payment record with checkout request ID
    const today = new Date().toISOString().split('T')[0];

    let payment;
    if (paymentId) {
      const [updated] = await db
        .update(payments)
        .set({
          mpesaCheckoutRequestId: result.CheckoutRequestID,
          phoneNumber: phone,
          status: 'pending',
          updatedAt: new Date(),
        })
        .where(eq(payments.id, paymentId))
        .returning();
      payment = updated;
    } else {
      const [created] = await db.insert(payments).values({
        memberId: user.memberId || null,
        eventId,
        amount: String(amount),
        status: 'pending',
        date: today,
        phoneNumber: phone,
        mpesaCheckoutRequestId: result.CheckoutRequestID,
      }).returning();
      payment = created;
    }

    return ok(res, {
      paymentId: payment.id,
      checkoutRequestId: result.CheckoutRequestID,
      customerMessage: result.CustomerMessage,
    });
  } catch (e: any) {
    console.error('STK Push error:', e);
    return err(res, e.message || 'Failed to initiate M-Pesa payment', 500);
  }
}
