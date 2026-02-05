FROM node:18-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY turbo.json ./

# Copy shared package
COPY packages/shared ./packages/shared

# Copy API package
COPY apps/api ./apps/api

# Install dependencies
RUN pnpm install --filter @fileduck/api --filter @fileduck/shared

# Build shared package first
WORKDIR /app/packages/shared
RUN pnpm build || echo "Shared build skipped"

# Build API package
WORKDIR /app/apps/api
RUN ls -la && pnpm build

# Verify build worked and show structure
RUN ls -la dist || (echo "Build failed - no dist folder" && exit 1)
RUN ls -la dist/lib || echo "No lib folder"
RUN ls -la dist/api || echo "No api folder"

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "dist/server.js"]
