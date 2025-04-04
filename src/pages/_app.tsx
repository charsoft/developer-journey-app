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
import 'src/styles/globals.css'
import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import { store } from '../redux/store'
import Head from 'next/head';
import Navbar from 'src/components/navbar';
import { Toaster } from 'react-hot-toast'
import { useEffect, useCallback } from 'react';

export default function App({
  Component,
  pageProps }: AppProps) {
  
  const loadGoogleScript = useCallback(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('Google Identity Services script loaded');
    };
    
    script.onerror = (error) => {
      console.error('Error loading Google Identity Services script:', error);
    };
    
    document.body.appendChild(script);
    return script;
  }, []);

  useEffect(() => {
    const script = loadGoogleScript();
    return () => {
      document.body.removeChild(script);
    };
  }, [loadGoogleScript]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Charsoft - Professional Software Development Services" />
      </Head>
      <Provider store={store}>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Component {...pageProps} />
          </main>
        </div>
        <Toaster position="top-center" />
      </Provider>
    </>
  );
};
