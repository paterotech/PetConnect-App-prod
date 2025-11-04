import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { env } from '@/lib/config/env';
import { Donation } from '@/lib/models/Donation';
import {connectDB} from '@/lib/config/db';

export async function POST(req: Request) {
  await connectDB();

  if (!env.STRIPE_SECRET) {
    return NextResponse.json({ message: 'Stripe no configurado' }, { status: 500 });
  }
  const stripe = new Stripe(env.STRIPE_SECRET, { apiVersion: '2025-08-27' as any });

  const { sessionId } = await req.json();

  if (!sessionId) {
    return NextResponse.json({ message: 'Falta el ID de sesión de Stripe.' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const donation = await Donation.findOneAndUpdate(
        { stripeSessionId: sessionId, status: 'pending' },
        { status: 'completed' },
        { new: true }
      );

      if (!donation) {
        console.warn(`Donation with session ID ${sessionId} not found or already completed.`);
        return NextResponse.json({ message: 'Donación no encontrada o ya completada.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, donation });
    } else {
      console.warn(`Payment for session ${sessionId} is not paid. Status: ${session.payment_status}`);
      return NextResponse.json({ message: `El pago no se ha completado. Estado: ${session.payment_status}` }, { status: 400 });
    }
  } catch (error) {
    console.error('Error confirming Stripe payment:', error);
    return NextResponse.json({ message: 'Error al confirmar el pago.' }, { status: 500 });
  }
}