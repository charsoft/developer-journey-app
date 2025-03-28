import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function SignIn() {
  const router = useRouter();

  useEffect(() => {
    console.log('Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
    
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin',
        ux_mode: 'popup'
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
        }
      );
    }
  }, []);

  const handleCredentialResponse = async (response: any) => {
    console.log('Credential response:', response);
    const token = response.credential;
    
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        throw new Error('Authentication failed');
      }

      const user = await res.json();
      console.log('Signed in user:', user);
      
      // Redirect to home page after successful sign-in
      router.push('/');
    } catch (error) {
      console.error('Error during sign-in:', error);
      // Handle error (you might want to show an error message to the user)
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Image
            src="/Google_Cloud_logo.svg"
            alt="Google Cloud Logo"
            width={80}
            height={80}
            className="h-12 w-auto"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Start your developer journey today
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="flex justify-center">
              <div id="google-signin-button"></div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Learn more about our platform
                </span>
              </div>
            </div>

            <div className="text-sm text-center text-gray-600">
              <p>
                By signing in, you agree to our{' '}
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 