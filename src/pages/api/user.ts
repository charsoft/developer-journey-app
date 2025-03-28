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
import { NextApiRequest, NextApiResponse } from 'next';
import { Database } from 'src/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = new Database();

  if (req.method === 'GET') {
    try {
      // Get username from session cookie
      const sessionCookie = req.cookies.session;
      if (!sessionCookie) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Verify the session token with Google
      const ticket = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + sessionCookie);
      const payload = await ticket.json();

      if (!payload.email) {
        return res.status(401).json({ message: 'Invalid session' });
      }

      const username = payload.email.split('@')[0];
      const user = await db.getUser({ username });
      res.status(200).json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { mission } = req.body;
      const sessionCookie = req.cookies.session;
      if (!sessionCookie) {
        return res.status(401).json({ message: 'Not authenticated' });
      }

      // Verify the session token with Google
      const ticket = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + sessionCookie);
      const payload = await ticket.json();

      if (!payload.email) {
        return res.status(401).json({ message: 'Invalid session' });
      }

      const username = payload.email.split('@')[0];
      await db.addCompletedMission({ username, missionId: mission.id });
      res.status(200).json({ message: 'Mission completed' });
    } catch (error) {
      console.error('Error adding completed mission:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}