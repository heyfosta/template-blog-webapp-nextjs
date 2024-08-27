//src\pages\api\stripe-webhook.page.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';

console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Set' : 'Not set');
console.log('STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? 'Set' : 'Not set');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Set' : 'Not set');

let stripe: Stripe;
try {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });
  console.log('Stripe initialized successfully');
} catch (error) {
  console.error('Error initializing Stripe:', error);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
let supabase;
try {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('Supabase client created successfully');
} catch (error) {
  console.error('Error creating Supabase client:', error);
}

export const config = {
  api: {
    bodyParser: false,
  },
};

async function updateUserSubscription(
  userId: string,
  modelId: string,
  subscriptionType: string,
  stripeSubscriptionId?: string,
  cancelAtPeriodEnd?: boolean
): Promise<void> {
  console.log(
    `Updating subscription for user ${userId}, model ${modelId} to ${subscriptionType}`,
  );
  try {
    const PREMIUM_TOKEN_LIMIT = 5000;
    const DEFAULT_TOKEN_LIMIT = 1000;
    const currentTime = new Date().toISOString();
    
    const updateData = {
      user_id: userId,
      model_id: modelId,
      subscription_type: subscriptionType,
      token_limit: subscriptionType === 'premium' ? PREMIUM_TOKEN_LIMIT : DEFAULT_TOKEN_LIMIT,
      tokens_used: 0,
      last_reset_date: currentTime,
      stripe_subscription_id: stripeSubscriptionId,
      cancel_at_period_end: cancelAtPeriodEnd
    };

    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(updateData, {
        onConflict: 'user_id,model_id'
      });

    if (error) {
      console.error('Error updating user subscription:', JSON.stringify(error));
    } else {
      console.log('User subscription updated successfully:', JSON.stringify(data));
    }
  } catch (error) {
    console.error('Exception in updateUserSubscription:', error);
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Handling checkout.session.completed');
  const clientReferenceId = session.client_reference_id;
  if (clientReferenceId) {
    console.log('Client reference ID:', clientReferenceId);
    const [userId, modelId] = clientReferenceId.split('_');
    console.log(`Extracted user ID: ${userId}, model ID: ${modelId}`);
    await updateUserSubscription(userId, modelId, 'premium', session.subscription as string);
  } else {
    console.error('No client_reference_id found in session');
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Handling customer.subscription.updated');
  const userId = subscription.metadata?.user_id;
  const modelId = subscription.metadata?.model_id;
  if (userId && modelId) {
    const subscriptionType = subscription.cancel_at_period_end ? 'cancelling' : 'premium';
    await updateUserSubscription(
      userId, 
      modelId, 
      subscriptionType, 
      subscription.id, 
      subscription.cancel_at_period_end
    );
  } else {
    console.error('Missing user_id or model_id in subscription metadata');
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Handling customer.subscription.deleted');
  const userId = subscription.metadata?.user_id;
  const modelId = subscription.metadata?.model_id;
  if (userId && modelId) {
    await updateUserSubscription(userId, modelId, 'default', undefined, false);
  } else {
    console.error('Missing user_id or model_id in subscription metadata');
  }
}

async function handleAsyncPaymentSuccess(session: Stripe.Checkout.Session) {
  console.log('Handling checkout.session.async_payment_succeeded');
  // Implement similar logic to handleCheckoutSessionCompleted
}

async function handleAsyncPaymentFailure(session: Stripe.Checkout.Session) {
  console.log('Handling checkout.session.async_payment_failed');
  // Implement logic to handle failed payments
}

async function handleSessionExpired(session: Stripe.Checkout.Session) {
  console.log('Handling checkout.session.expired');
  // Implement logic to clean up any pending operations
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('-------- Webhook Request Received --------');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request method:', req.method);

  if (req.method === 'POST') {
    let buf;
    try {
      buf = await buffer(req);
    } catch (error) {
      console.error('Error buffering request:', error);
      return res.status(400).send(`Webhook Error: Unable to buffer request`);
    }

    const sig = req.headers['stripe-signature'] as string;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!);
      console.log('Event type:', event.type);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case 'checkout.session.async_payment_succeeded':
          await handleAsyncPaymentSuccess(event.data.object as Stripe.Checkout.Session);
          break;
        case 'checkout.session.async_payment_failed':
          await handleAsyncPaymentFailure(event.data.object as Stripe.Checkout.Session);
          break;
        case 'checkout.session.expired':
          await handleSessionExpired(event.data.object as Stripe.Checkout.Session);
          break;
        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
          break;
        // Add more cases as needed
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      console.log('Webhook processed successfully');
      res.json({ received: true });
    } catch (error: unknown) {
      console.error('Exception in event processing:', error instanceof Error ? error.message : String(error));
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    console.log(`Received non-POST request: ${req.method}`);
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
  console.log('-------- Webhook Request Completed --------');
}