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
import MissionHistory from 'src/components/mission-history';
import Head from "next/head";

export default function MissionHistoryPage() {
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

  if (!user) {
    router.push('/signin');
    return null;
  }

  return (
    <>
      <Head>
        <title>Mission History | Developer Journey App</title>
      </Head>
      <main>
        <div className="grid grid-cols-12 gap-3">
          <MissionHistory />
        </div>
      </main>
    </>
  );
}
