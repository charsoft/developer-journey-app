# Copyright 2023 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# syntax = docker/dockerfile:1.2  

#######################################
FROM node:18-slim AS builder
#######################################

WORKDIR /app 

# Copy package files
COPY package*.json ./

# Install dependencies with clean npm cache
RUN npm cache clean --force && \
    npm install

# Copy source files
COPY . .

# Disable telemetry before building
ENV NEXT_TELEMETRY_DISABLED 1

# Build the application
RUN npm run build

#######################################
FROM node:18-slim AS runner
#######################################
 
WORKDIR /app

# Create non-root user
RUN adduser --system --uid 1001 nextjs
RUN addgroup --system --gid 1001 nodejs

# Copy necessary files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Set environment variables
ENV NODE_ENV production
ENV PORT 8080

# Switch to non-root user
USER nextjs

# Expose the port
EXPOSE 8080

# Start the application
CMD ["node", "server.js"]