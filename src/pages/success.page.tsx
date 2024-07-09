import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const SuccessPage: React.FC = () => {
  return (
    <div className="from-green-50 to-green-100 flex min-h-screen items-center justify-center bg-gradient-to-br px-4">
      <Head>
        <title>Payment Successful | Hello Human</title>
        <meta name="description" content="Your payment was successful" />
      </Head>
      <div className="bg-white w-full max-w-md rounded-lg p-8 text-center shadow-lg">
        <svg
          className="text-green-500 mx-auto h-16 w-16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h1 className="text-gray-900 mt-4 text-3xl font-bold">Payment Successful!</h1>
        <p className="text-gray-600 mt-2 text-lg">
          Thank you for your subscription. Your account has been upgraded.
        </p>
        <p className="text-gray-500 mt-4">
          You can now return to the Telegram bot to continue using the premium features.
        </p>
        <Link
          href="/"
          className="bg-green-500 hover:bg-green-600 text-white mt-8 inline-block rounded py-2 px-4 font-bold transition duration-300"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default SuccessPage;
