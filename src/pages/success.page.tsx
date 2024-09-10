import React from 'react';

export default function PaymentSuccessPage() {
  return (
    <div className="font-sans max-w-2xl mx-auto p-6 text-center">
      <h1 className="text-4xl font-bold mb-2">HELLO HUMAN</h1>
      <h2 className="text-2xl text-gray-700 mb-6">Payment Status</h2>
      <p className="text-xl font-semibold text-green-600 mb-4">Payment Successful!</p>
      <p className="text-lg mb-3">
        Thank you for your payment. Your subscription has been activated.
      </p>
      <p className="text-lg mb-6">
        Please return to the Telegram bot to continue using the service.
      </p>
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <p className="text-md text-gray-700">
          On your bank statement, this charge will appear as:
        </p>
        <p className="text-lg font-semibold text-blue-600 mt-2">
          https://rainforeststudio.co.uk/
        </p>
      </div>
      <footer className="mt-12 pt-6 border-t border-gray-300">
        <p className="text-gray-600 my-1">footer.aboutUs</p>
        <p className="text-gray-600 my-1">footer.description</p>
        <p className="text-gray-600 my-1">footer.powerBy Contentful</p>
      </footer>
    </div>
  );
}