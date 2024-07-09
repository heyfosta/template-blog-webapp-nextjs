//src\pages\api\stripe-webhook.page.ts

import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' as any });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateUserSubscription(
  userId: string,
  modelId: string,
  subscriptionType: string,
): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ subscription_type: subscriptionType })
      .eq('user_id', userId)
      .eq('model_id', modelId);

    if (error) {
      console.error('Error updating user subscription:', error);
    } else {
      console.log('User subscription updated successfully');
    }
  } catch (error) {
    console.error('Error updating user subscription:', error);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Webhook received:', new Date().toISOString());
  console.log('Request method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.method === 'POST') {
    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.error(err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        const clientReferenceId = session.client_reference_id;

        if (clientReferenceId) {
          const [userId, modelId] = clientReferenceId.split('_');

          // Update the user's subscription type to premium in Supabase
          await updateUserSubscription(userId, modelId, 'premium');
        }
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
