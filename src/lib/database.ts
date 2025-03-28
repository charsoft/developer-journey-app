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
import { Firestore } from "@google-cloud/firestore";
import { User } from "src/models/User";

export class Database {
  private db: Firestore;

  constructor() {
    const projectId = process.env.PROJECT_ID;
    if (!projectId) {
      const errMessage = "PROJECT_ID environment variable must be defined.";
      console.error(errMessage);
      throw new Error(errMessage);
    }

    // In Cloud Run, we don't need to specify credentials as it uses the service account
    // assigned to the Cloud Run service
    if (process.env.NODE_ENV === 'production') {
      this.db = new Firestore({
        projectId: projectId,
      });
    } else {
      // Local development uses the service account JSON file
      this.db = new Firestore({
        projectId: projectId,
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });
    }
  }

  async setUser({ username, completedMissions }: { username: string, completedMissions?: string[] }): Promise<any> {
    const userDoc = this.db.collection('users').doc(username);

    return userDoc.set({
      username,
      completedMissions: completedMissions || [],
    }, { merge: true });
  }

  async getUser({ username }: { username: string }): Promise<User> {
    const userDoc = this.db.collection('users').doc(username);
    const snapshot = await userDoc.get();
    const completedMissions = snapshot.data()?.completedMissions || [];
    console.log("User Info:", username);
    return { username, completedMissions }
  }

  async addCompletedMission({ username, missionId }: { username: string, missionId: string }): Promise<any> {
    const { completedMissions } = await this.getUser({ username });
    const updatedMissions = [...completedMissions, missionId]


    return this.setUser({
      username,
      completedMissions: updatedMissions,
    });
  }

  async setUserProfile({
    username,
    firstName,
    lastName,
    email,
    phoneNumber,
    technologyInterest,
  }: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    technologyInterest: string;
  }): Promise<void> {
    const userProfileRef = this.db.collection('UserProfiles').doc(username);
    await userProfileRef.set({
      username,
      firstName,
      lastName,
      email,
      phoneNumber,
      technologyInterest,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }

  async getUserProfile(username: string): Promise<any> {
    const userProfileRef = this.db.collection('UserProfiles').doc(username);
    const doc = await userProfileRef.get();
    return doc.exists ? doc.data() : null;
  }

  /**
   * Returns true if able to connect to the Firestore instance.
   * The Firestore API times out a request after 60 seconds. This method
   * implements a configurable override that defaults to 5 seconds, but there's
   * no point in setting it higher than 60 seconds.
   * @param timeout seconds
   */
  async isConnected(timeout: number = 5): Promise<boolean> {
    try {
      timeout = Math.min(timeout, 60) * 1000;
      // eslint-disable-next-line no-undef
      let timerId: NodeJS.Timeout;

      const timer = new Promise<boolean>((resolve) => {
        timerId = setTimeout(() => resolve(false), timeout);
      });

      // TODO: research if there's a lighter weight way to status a connection.
      const connectionCheck = this.db.listCollections();

      return Promise.race([connectionCheck, timer]).then(result => {
        clearTimeout(timerId);
        return !!result;
      });

    } catch (err) {
      // GoogleError: Total timeout of API google.firestore.v1.Firestore
      // exceeded 60000 milliseconds before any response was received.
      return false;
    }
  }

  /**
   * Tests the Firestore connection by performing basic read and write operations.
   * @returns Promise<boolean> - true if connection test succeeds, false otherwise
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try a basic Firestore operation
      const testDoc = this.db.collection('users').doc('test-user');
      await testDoc.set({ username: 'diagnostic-test-user2' });
      console.log("Successfully wrote to Firestore!");
      
      // Try reading it back
      const doc = await testDoc.get();
      console.log("Successfully read from Firestore:", doc.data());
      
      return true;
    } catch (error: unknown) {
      console.error("Firestore connection test failed:", error instanceof Error ? error.message : error);
      return false;
    }
  }
}