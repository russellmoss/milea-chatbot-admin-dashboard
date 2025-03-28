#!/bin/bash

# Start the Node.js server in the background
node server.js &

# Wait a moment for the server to start
sleep 2

# Start ngrok
ngrok http --url=milea-chatbot.ngrok.io 3001 