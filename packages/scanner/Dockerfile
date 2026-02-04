FROM node:18-alpine

# Install ClamAV
RUN apk add --no-cache clamav clamav-daemon clamav-libunrar

# Create directories
RUN mkdir -p /var/log/clamav /var/lib/clamav
RUN chown -R clamav:clamav /var/log/clamav /var/lib/clamav

# Update virus definitions
RUN freshclam

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm build

# Start ClamAV daemon and scanner service
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

EXPOSE 4000

ENTRYPOINT ["/docker-entrypoint.sh"]
