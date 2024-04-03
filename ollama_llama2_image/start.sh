#!/bin/bash

# Start the server in the background
bin/ollama serve &

echo "start to run llama2..."

sleep 2

# Execute the next command
until bin/ollama run llama2; do
  echo "Command failed with exit code $?. Retrying..."
  sleep 1 # 等待1秒钟再次尝试，以避免过于频繁地尝试
done