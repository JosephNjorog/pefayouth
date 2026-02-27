import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, payments } from '../../db/client';
import { eq } from 'drizzle-orm';
import { parseMpesaCallback, type DarajaCallbackBody } from '../../lib/mpesa';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const body = req.body as DarajaCallbackBody;
    const { checkoutRequestId, success, transactionId } = parseMpesaCallback(body);

    // Find the payment by checkout request ID
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.mpesaCheckoutRequestId, checkoutRequestId))
      .limit(1);

    if (payment) {
      await db
        .update(payments)
        .set({
          status: success ? 'confirmed' : 'failed',
          transactionId: transactionId || null,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, payment.id));
    }

    // Always return 200 to Daraja
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (e) {
    console.error('M-Pesa callback error:', e);
    return res.status(200).json({ ResultCode: 0, ResultDesc: 'Acknowledged' });
  }
}
