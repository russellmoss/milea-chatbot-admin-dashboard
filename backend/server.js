const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const twilio = require('twilio');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Twilio client setup
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });

  // Handle message read status updates
  socket.on('mark-message-read', (messageId) => {
    io.emit('message-read', messageId);
  });
});

// SMS webhook endpoint
app.post('/api/receive-sms', (req, res) => {
  const { From, To, Body, MessageSid } = req.body;
  
  console.log(`Received message from ${From}: ${Body}`);
  
  // Emit the message to all connected clients
  io.emit('new-message', {
    id: MessageSid,
    direction: 'inbound',
    content: Body,
    phoneNumber: From,
    timestamp: new Date().toISOString(),
    read: false
  });
  
  // Send a TwiML response
  const twiml = new twilio.twiml.MessagingResponse();
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

// Send SMS endpoint
app.post('/api/send-sms', async (req, res) => {
  const { to, body } = req.body;
  
  try {
    const message = await twilioClient.messages.create({
      body,
      to,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    
    // Emit the sent message to all connected clients
    io.emit('new-message', {
      id: message.sid,
      direction: 'outbound',
      content: body,
      phoneNumber: to,
      timestamp: new Date().toISOString(),
      read: false,
      status: 'sent'
    });
    
    res.json({ success: true, messageId: message.sid });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Message status webhook endpoint
app.post('/api/message-status', (req, res) => {
  const { MessageSid, MessageStatus } = req.body;
  
  console.log(`Message ${MessageSid} status: ${MessageStatus}`);
  
  // Emit the status update to all connected clients
  io.emit('message-status-update', {
    messageId: MessageSid,
    status: MessageStatus
  });
  
  res.sendStatus(200);
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});