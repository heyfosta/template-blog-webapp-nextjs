//src\pages\api\pages\api\check-subscription.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { user_id, model_id } = req.query;

    if (!user_id || !model_id) {
      return res.status(400).json({ error: 'Missing user_id or model_id' });
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('subscription_type')
        .eq('user_id', user_id)
        .eq('model_id', model_id)
        .single();

      if (error) throw error;

      if (data) {
        res.status(200).json(data);
      } else {
        res.status(404).json({ error: 'Subscription not found' });
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      res.status(500).json({ error: 'Failed to check subscription' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}