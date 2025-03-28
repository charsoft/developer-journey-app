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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Starting Firestore diagnostic test");
  try {
    const db = new Database();
    console.log("Database instance created");
    
    // Test connection
    const isConnected = await db.isConnected();
    console.log(`Firestore connection check: ${isConnected ? 'successful' : 'failed'}`);
    
    if (isConnected) {
      // Test 3: Creating and retrieving a test user
      await db.testConnection();
      console.log("Test user created successfully");

      const user = await db.getUser({ username: 'diagnostic-test-user' });
      console.log("Test user retrieved:", user);
      
      res.status(200).json({ 
        success: true, 
        message: "Firestore connection successful",
        projectId: process.env.PROJECT_ID,
        environment: process.env.NODE_ENV,
        user 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: "Failed to connect to Firestore",
        projectId: process.env.PROJECT_ID,
        environment: process.env.NODE_ENV
      });
    }
  } catch (error: unknown) {
    console.error("Firestore diagnostic test failed:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    res.status(500).json({ 
      success: false, 
      error: errorMessage,
      stack: errorStack,
      projectId: process.env.PROJECT_ID,
      environment: process.env.NODE_ENV
    });
  }
} 