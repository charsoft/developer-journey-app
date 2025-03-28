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
import type { NextApiRequest, NextApiResponse } from 'next'
import { Database } from "../../lib/database";
import { User } from 'src/models/User';
import { getSession } from 'next-auth/react';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User>
) {
  console.log("API Request received:", {
    method: req.method,
    body: req.body,
    headers: req.headers,
    url: req.url
  });

  const fs = new Database();
  const session = await getSession({ req });
  console.log("Session info:", { 
    hasSession: !!session,
    user: session?.user,
    expires: session?.expires
  });

  const username = session?.user?.name || '';
  if (!username) {
    console.error("No username provided");
    return res.status(400).json({ 
      id: '',
      username: '',
      completedMissions: [],
      itemsCollected: [],
      error: 'Username is required' 
    } as User & { error: string });
  }

  if (req.method === 'GET') {
    try {
      console.log("Getting user data for:", username);
      const userData = await fs.getUser(username);
      console.log("Retrieved user data:", userData);
      return res.status(200).json(userData);
    } catch (error) {
      console.error("Error getting user:", {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return res.status(500).json({ 
        id: username,
        username,
        completedMissions: [],
        itemsCollected: [],
        error: 'Failed to get user data' 
      } as User & { error: string });
    }
  }

  if (req.method === 'POST') {
    try {
      console.log("Received POST request to /api/user:", {
        body: req.body,
        headers: req.headers,
        session: session?.user
      });

      const { id: missionId } = req.body;
      console.log("Processing mission completion for missionId:", missionId);

      if (!missionId) {
        console.error("No mission ID provided in request body");
        return res.status(400).json({ 
          id: username,
          username,
          completedMissions: [],
          itemsCollected: [],
          error: 'Mission ID is required' 
        } as User & { error: string });
      }

      if (!username) {
        console.error("No username found in session");
        return res.status(401).json({ 
          id: '',
          username: '',
          completedMissions: [],
          itemsCollected: [],
          error: 'User not authenticated' 
        } as User & { error: string });
      }

      const result = await fs.addCompletedMission(username, missionId);
      console.log("Mission completion result:", result);

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in POST /api/user:", {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        username,
        missionId: req.body?.id
      });
      return res.status(500).json({ 
        id: username,
        username,
        completedMissions: [],
        itemsCollected: [],
        error: 'Failed to complete mission' 
      } as User & { error: string });
    }
  }
}
