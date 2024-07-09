import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const ContactPage: React.FC = () => {
  return (
    <div className="from-blue-50 to-blue-100 flex min-h-screen items-center justify-center bg-gradient-to-br px-4">
      <Head>
        <title>Contact Us | Hello Human</title>
        <meta name="description" content="Get in touch with Hello Human" />
      </Head>
      <div className="bg-white w-full max-w-md rounded-lg p-8 text-center shadow-lg">
        <h1 className="text-gray-900 text-3xl font-bold">Contact Us</h1>
        <p className="text-gray-600 mt-4 text-lg">We&apos;d love to hear from you!</p>

        <div className="mt-8">
          <p className="text-gray-700">For any inquiries, please email us at:</p>
          <a
            href="mailto:contact@hello-human.com"
            className="text-blue-600 hover:text-blue-800 mt-2 inline-block text-xl font-medium transition duration-300"
          >
            contact@hello-human.com
          </a>
        </div>

        <div className="mt-12">
          <Link
            href="/"
            className="bg-blue-500 hover:bg-blue-600 text-white inline-block rounded py-2 px-4 font-bold transition duration-300"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
