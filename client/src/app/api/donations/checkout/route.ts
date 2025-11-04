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

  const { amount = 5000, currency = 'usd', description = 'PetConnect Donation', metadata = {} } = await req.json();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: Number(amount),
            product_data: {
              name: 'Donation',
              description,
            },
          },
        },
      ],
      success_url: `${env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: env.STRIPE_CANCEL_URL,
      metadata: metadata,
    });

    const newDonation = new Donation({
      stripeSessionId: session.id,
      amount: Number(amount) / 100,
      currency: currency,
      description: description,
      donorEmail: metadata.donorEmail || metadata.userName,
      status: 'pending',
    });
    await newDonation.save();

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating Stripe Checkout session or pending donation:', error);
    return NextResponse.json({ message: 'Error al iniciar el proceso de donación.' }, { status: 500 });
  }
}