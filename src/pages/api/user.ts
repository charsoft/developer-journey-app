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
import { OAuth2Client } from 'google-auth-library';
import { Database } from 'src/lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get the session cookie from the request
    const sessionCookie = req.cookies.session;
    if (!sessionCookie) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Verify the session cookie with Google
    const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
    let payload;
    
    try {
      const ticket = await client.verifyIdToken({
        idToken: sessionCookie,
        audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    } catch (error) {
      console.error('Error verifying session:', error);
      return res.status(401).json({ message: 'Invalid session' });
    }

    // Extract email from payload
    const email = payload?.email;
    if (!email) {
      return res.status(401).json({ message: 'Invalid user data' });
    }

    // Get username from email (everything before @)
    const username = email.split('@')[0];

    // Create a Database instance
    const db = new Database();

    if (req.method === 'GET') {
      try {
        const user = await db.getUser({ username });
        return res.status(200).json(user);
      } catch (error) {
        console.error('Error getting user:', error);
        return res.status(500).json({ message: 'Failed to get user' });
      }
    } else if (req.method === 'POST') {
      try {
        // Update user data
        const { completedMissions } = req.body;
        await db.setUser({ username, completedMissions });
        
        // Return updated user data
        const updatedUser = await db.getUser({ username });
        return res.status(200).json(updatedUser);
      } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ message: 'Failed to update user' });
      }
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in user API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}