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
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useGetUserQuery } from 'src/redux/apiSlice';
import Head from "next/head";
import SignInRecommendation from "src/components/sign-in-recommendation";

export default function Home() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { data: user, isLoading } = useGetUserQuery();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Developer Journey App</title>
        <meta name="description" content="Start your developer journey with interactive learning missions" />
      </Head>
      <main className="min-h-screen bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Welcome to Developer Journey
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Start your developer journey with interactive learning missions. Learn, practice, and grow your skills.
            </p>
          </div>

          {!user ? (
            <div className="mt-10 text-center">
              <SignInRecommendation />
            </div>
          ) : (
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
          )}
        </div>
      </main>
    </>
  );
}
