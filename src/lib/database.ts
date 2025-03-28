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
    console.log("Initializing Database with NODE_ENV:", process.env.NODE_ENV);
    if (process.env.NODE_ENV === 'development') {
      // use the firestore emulator
      this.db = new Firestore({
        host: "localhost:9999",
        projectId: "demo-test",
        ssl: false,
      });
    } else {
      // use the PROJECT_ID environment variable
      const projectId = process.env.PROJECT_ID;
      if (!projectId) {
        const errMessage = "PROJECT_ID environment variable must be defined.";
        console.error(errMessage);
        throw new Error(errMessage);
      }
      console.log("Initializing Firestore with projectId:", projectId);
      this.db = new Firestore({
        projectId: projectId,
      });
    }
  }

  async setUser(userData: User): Promise<User> {
    try {
      console.log("Setting user data:", userData);
      await this.db.collection('users').doc(userData.username).set(userData);
      console.log("User data set successfully.");
      return userData;
    } catch (error) {
      console.error("Error setting user:", error);
      throw error;
    }
  }

  async getUser(username: string): Promise<User> {
    try {
      console.log("Getting user data for:", username);
      const userDoc = await this.db.collection('users').doc(username).get();
      
      if (!userDoc.exists) {
        console.log("User not found, creating new user");
        const newUser: User = {
          id: username, // Using username as ID
          username,
          completedMissions: [],
          itemsCollected: [],
          currentMission: undefined,
          position: undefined
        };
        await this.db.collection('users').doc(username).set(newUser);
        console.log("Created new user:", newUser);
        return newUser;
      }

      const userData = userDoc.data() as User;
      // Ensure the user has an ID
      if (!userData.id) {
        console.log("User exists but has no ID, updating with ID");
        const updatedUser = {
          ...userData,
          id: username
        };
        await this.db.collection('users').doc(username).set(updatedUser, { merge: true });
        console.log("Updated user with ID:", updatedUser);
        return updatedUser;
      }

      console.log("Retrieved user data:", userData);
      return userData;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  }

  async addCompletedMission(username: string, missionId: string): Promise<User> {
    try {
      console.log("Adding completed mission:", { username, missionId });
      const userRef = this.db.collection('users').doc(username);
      
      const result = await this.db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists) {
          throw new Error('User not found');
        }

        const userData = userDoc.data() as User;
        if (!userData.id) {
          throw new Error('User has no ID');
        }

        const updatedCompletedMissions = userData.completedMissions?.length 
          ? [...userData.completedMissions, missionId]
          : [missionId];
        
        transaction.update(userRef, {
          completedMissions: updatedCompletedMissions
        });

        return {
          ...userData,
          completedMissions: updatedCompletedMissions
        };
      });

      console.log("Successfully added completed mission:", result);
      return result;
    } catch (error) {
      console.error("Error adding completed mission:", error);
      throw error;
    }
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

  // Adding a new method to test connection with detailed logging
  async testConnection() {
    console.log("Testing Firestore connection...");
    try {
      // Try a basic Firestore operation
      const testDoc = this.db.collection('_connection_test').doc('test');
      await testDoc.set({ timestamp: new Date().toISOString() });
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
