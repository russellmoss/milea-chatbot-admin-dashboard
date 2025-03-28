@echo off

:: Start the Node.js server in a new window
start cmd /k "node server.js"

:: Wait a moment for the server to start
timeout /t 2 /nobreak

:: Start ngrok
ngrok http --url=milea-chatbot.ngrok.io 3001 