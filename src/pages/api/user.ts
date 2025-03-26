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
    console.log("No username found in session");
    return res.status(200).send({ username, completedMissions: [] });
  }

  if (req.method === 'POST') {
    console.log("Processing POST request", {
      username,
      missionId: req.body.id,
      body: req.body
    });
    try {
      const missionId = req.body.id;
      await fs.addCompletedMission({ username, missionId });
      console.log("Successfully added mission", { username, missionId });
    } catch (error) {
      console.error("Error adding mission:", error);
      return res.status(500).json({ username, completedMissions: [], error: 'Failed to add mission' } as any);
    }
  }

  try {
    console.log("Attempting to get user data for:", username);
    const user = await fs.getUser({ username });
    console.log("Retrieved user data:", user);
    res.status(200).json(user);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ username, completedMissions: [], error: 'Failed to get user' } as any);
  }
}
