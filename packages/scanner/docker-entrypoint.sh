#!/bin/sh
set -e

# Start ClamAV daemon
echo "Starting ClamAV daemon..."
clamd &

# Wait for ClamAV to be ready
echo "Waiting for ClamAV to start..."
sleep 5

# Start scanner service
echo "Starting scanner service..."
node dist/index.js
