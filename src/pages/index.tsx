/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useGetUserQuery } from 'src/redux/apiSlice';
import Head from "next/head";

import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { data: user, isLoading } = useGetUserQuery();

  const initializeClient = useCallback(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    initializeClient();
  }, [initializeClient]);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Charsoft - Professional Software Development Services</title>
        <meta name="description" content="Charsoft provides professional software development services, custom solutions, and technical consulting." />
      </Head>
      <main className="min-h-screen bg-slate-100">
        {/* Hero Section */}
        <div className="relative bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block">Professional Software</span>
                    <span className="block text-blue-600">Development Services</span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Transform your ideas into reality with our expert software development services. We create custom solutions that drive business growth.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link
                        href="/charsoft/services"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                      >
                        Our Services
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link
                        href="/charsoft/contact"
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10"
                      >
                        Contact Us
                      </Link>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Why Choose Charsoft?
              </p>
            </div>

            <div className="mt-10">
              <div className="grid grid-cols-1 gap-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome Back!</h2>
                  <p className="text-gray-600 mb-4">
                    Continue your learning journey and explore new technologies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-700">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Ready to get started?</span>
              <span className="block">Contact us today.</span>
            </h2>
            <p className="mt-6 text-lg leading-6 text-blue-200">
              Let's discuss how we can help transform your business with custom software solutions.
            </p>
            <Link
              href="/charsoft/contact"
              className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 sm:w-auto"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
