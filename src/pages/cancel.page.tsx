import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const CancelPage: React.FC = () => {
  return (
    <div className="from-red-50 to-red-100 flex min-h-screen items-center justify-center bg-gradient-to-br px-4">
      <Head>
        <title>Payment Cancelled | Hello Human</title>
        <meta name="description" content="Your payment was cancelled" />
      </Head>
      <div className="bg-white w-full max-w-md rounded-lg p-8 text-center shadow-lg">
        <svg
          className="text-red-500 mx-auto h-16 w-16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
        <h1 className="text-gray-900 mt-4 text-3xl font-bold">Payment Cancelled</h1>
        <p className="text-gray-600 mt-2 text-lg">
          Your payment was cancelled. No charges were made.
        </p>
        <p className="text-gray-500 mt-4">
          If you encountered any issues, please try again or contact our support.
        </p>
        <div className="mt-8 space-y-4">
          <Link
            href="/"
            className="bg-red-500 hover:bg-red-600 text-white inline-block rounded py-2 px-4 font-bold transition duration-300"
          >
            Return to Home
          </Link>
          <Link
            href="/support"
            className="text-red-500 hover:text-red-600 block font-medium transition duration-300"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CancelPage;
