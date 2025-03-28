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

// Import the RTK Query methods from the React-specific entry point
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Mission } from 'src/models/Mission'
import { User } from 'src/models/User'
import { startMission } from './gameSlice';

// Define our single API slice object
export const apiSlice = createApi({
  // The cache reducer expects to be added at `state.api` (already default - this is optional)
  reducerPath: 'api',
  // All of our requests will have URLs starting with '/api'
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['User'],
  // The "endpoints" represent operations and requests for this server
  endpoints: builder => ({
    // The `getUser` endpoint is a "query" operation that returns data
    getUser: builder.query<User, void>({
      // The URL for the request is '/api/user', this is a GET request
      query: () => '/user',
      onCacheEntryAdded: (_, { dispatch }) => { 
        dispatch(startMission())
      },
      providesTags: ['User'],
    }),
    addCompletedMission: builder.mutation<User, { mission: Mission }>({
      query: ({ mission }) => ({
        url: '/user',
        method: 'POST',
        body: { id: mission.id }
      }),
      invalidatesTags: ['User'],
      // Add an onQueryStarted callback to log the request
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          console.log("Sending mission completion request:", {
            missionId: arg.mission.id,
            missionTitle: arg.mission.title
          });
          const { data } = await queryFulfilled;
          console.log("Mission completion request successful:", { 
            data,
            missionId: arg.mission.id 
          });
        } catch (error) {
          console.error("Mission completion request failed:", { 
            error,
            missionId: arg.mission.id 
          });
        }
      },
    }),
  })
})

// Export the auto-generated hook for the `getUser` query endpoint
export const { useGetUserQuery, useAddCompletedMissionMutation } = apiSlice