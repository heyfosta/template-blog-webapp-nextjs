import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const config = {
  api: {
    bodyParser: false,
  },
};

async function updateUserSubscription(
  userId: string,
  modelId: string,
  subscriptionType: string,
): Promise<void> {
  console.log(
    `Attempting to update subscription for user ${userId}, model ${modelId} to ${subscriptionType}`,
  );
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ subscription_type: subscriptionType })
      .eq('user_id', userId)
      .eq('model_id', modelId);
    if (error) {
      console.error('Error updating user subscription:', JSON.stringify(error));
    } else {
      console.log('User subscription updated successfully:', JSON.stringify(data));
    }
  } catch (error) {
    console.error('Exception in updateUserSubscription:', error);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('-------- Webhook Request Received --------');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request method:', req.method);
  console.log('Request headers:', JSON.stringify(req.headers, null, 2));

  if (req.method === 'POST') {
    console.log('Processing POST request');
    let buf;
    try {
      buf = await buffer(req);
      console.log('Request body buffered successfully');
    } catch (error) {
      console.error('Error buffering request:', error);
      return res.status(400).send(`Webhook Error: Unable to buffer request`);
    }

    const sig = req.headers['stripe-signature'] as string;
    console.log('Stripe signature:', sig);

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
      console.log('Stripe event constructed successfully');
      console.log('Event type:', event.type);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          console.log('Processing checkout.session.completed event');
          const session = event.data.object as Stripe.Checkout.Session;
          console.log('Session details:', JSON.stringify(session, null, 2));
          const clientReferenceId = session.client_reference_id;
          if (clientReferenceId) {
            console.log('Client reference ID:', clientReferenceId);
            const [userId, modelId] = clientReferenceId.split('_');
            console.log(`Extracted user ID: ${userId}, model ID: ${modelId}`);
            await updateUserSubscription(userId, modelId, 'premium');
          } else {
            console.error('No client_reference_id found in session');
          }
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      console.log('Webhook processed successfully');
      res.json({ received: true });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Exception in updateUserSubscription:', error.message);
      } else {
        console.error('Exception in updateUserSubscription:', String(error));
      }
    }
  } else {
    console.log(`Received non-POST request: ${req.method}`);
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
  console.log('-------- Webhook Request Completed --------');
}
