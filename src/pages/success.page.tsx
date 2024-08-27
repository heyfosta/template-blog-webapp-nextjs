// src\pages\success.page.tsx
import { useRouter } from "next/router"

export default function SuccessPage() {
  const router = useRouter()

  return (
    <div>
      <h1>Payment Successful!</h1>
      <p>Your subscription is being processed. You can now return to the Telegram bot.</p>
      <p>If your subscription doesn&#39;t activate immediately, please allow a few minutes for processing.</p>
    </div>
  )
}