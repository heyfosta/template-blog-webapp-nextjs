//src\pages\success.page.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

async function checkSubscriptionStatus(userId: string, modelId: string, expectedType: string) {
  let attempts = 0;
  const maxAttempts = 10;
  const delayMs = 2000;

  while (attempts < maxAttempts) {
    const response = await fetch(`/api/check-subscription?user_id=${userId}&model_id=${modelId}`);
    const data = await response.json();

    if (data.subscription_type === expectedType) {
      return data.subscription_type;
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  throw new Error('Subscription update not detected after multiple attempts');
}

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const { user_id, model_id, session_id } = router.query;
  const [status, setStatus] = useState('Processing');
  const [subscriptionType, setSubscriptionType] = useState('');

  useEffect(() => {
    if (user_id && model_id && session_id) {
      fetch(`/api/subscription-success?user_id=${user_id}&model_id=${model_id}&session_id=${session_id}`)
        .then(res => res.json())
        .then(data => {
          setStatus('Payment Successful');
          return checkSubscriptionStatus(user_id as string, model_id as string, data.expectedSubscriptionType);
        })
        .then(finalSubscriptionType => {
          setStatus('Subscription Confirmed');
          setSubscriptionType(finalSubscriptionType);
        })
        .catch(error => {
          console.error('Error:', error);
          setStatus('Error');
        });
    }
  }, [user_id, model_id, session_id]);

  return (
    <div>
      <h1>Subscription Status</h1>
      <p>Status: {status}</p>
      {subscriptionType && <p>Subscription Type: {subscriptionType}</p>}
    </div>
  );
}