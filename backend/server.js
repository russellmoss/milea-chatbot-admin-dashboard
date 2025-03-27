const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const twilio = require('twilio');
const dotenv = require('dotenv');
const admin = require('firebase-admin');

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
const serviceAccount = require('./firebase-credentials.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const app = express();
const server = http.createServer(app);

// Configure CORS for both Express and Socket.io
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Firebase Authentication Middleware
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

const io = socketIo(server, {
  cors: corsOptions,
  path: '/socket.io',
  transports: ['websocket', 'polling']
});

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    socket.user = decodedToken;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Middleware
app.use(express.json());

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

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  // Handle message read status updates
  socket.on('mark-message-read', async (messageId) => {
    try {
      // Update message in Firestore
      const messageRef = db.collection('messages').doc(messageId);
      await messageRef.update({
        read: true,
        readAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Emit to all clients
      io.emit('message-read', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });
});

// Webhook endpoint to receive SMS
app.post('/api/receive-sms', async (req, res) => {
  const { From, To, Body, MessageSid } = req.body;
  
  console.log(`Received message from ${From}: ${Body}`);
  
  try {
    // Format the message consistently
    const message = {
      id: MessageSid,
      direction: 'inbound',
      content: Body,
      phoneNumber: From,
      timestamp: new Date().toISOString(),
      read: false,
      status: 'received'
    };

    // Store message in Firestore
    const messageRef = await db.collection('messages').add({
      ...message,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Get or create conversation
    const conversationQuery = await db.collection('conversations')
      .where('phoneNumber', '==', From)
      .limit(1)
      .get();

    let conversationId;
    if (conversationQuery.empty) {
      // Create new conversation
      const conversationRef = await db.collection('conversations').add({
        phoneNumber: From,
        messages: [messageRef.id],
        unreadCount: 1,
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        archived: false,
        deleted: false
      });
      conversationId = conversationRef.id;
    } else {
      // Update existing conversation
      const conversationDoc = conversationQuery.docs[0];
      conversationId = conversationDoc.id;
      await conversationDoc.ref.update({
        messages: admin.firestore.FieldValue.arrayUnion(messageRef.id),
        unreadCount: admin.firestore.FieldValue.increment(1),
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Emit the message to all connected clients with conversationId
    io.emit('new-message', {
      ...message,
      conversationId,
      phoneNumber: From
    });
    
    // Send a TwiML response
    const twiml = new twilio.twiml.MessagingResponse();
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
  } catch (error) {
    console.error('Error processing incoming message:', error);
    res.status(500).send('Error processing message');
  }
});

// Send SMS endpoint
app.post('/api/send-sms', authenticateUser, async (req, res) => {
  const { to, body } = req.body;
  const userId = req.user.uid;
  
  try {
    const message = await twilioClient.messages.create({
      body,
      to,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    
    // Format message for storage
    const messageData = {
      id: message.sid,
      direction: 'outbound',
      content: body,
      phoneNumber: to,
      timestamp: new Date().toISOString(),
      read: false,
      status: 'sent',
      userId
    };

    // Store message in Firestore
    const messageRef = await db.collection('messages').add({
      ...messageData,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Get or create conversation
    const conversationQuery = await db.collection('conversations')
      .where('phoneNumber', '==', to)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    let conversationId;
    if (conversationQuery.empty) {
      // Create new conversation
      const conversationRef = await db.collection('conversations').add({
        phoneNumber: to,
        messages: [messageRef.id],
        unreadCount: 0,
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        archived: false,
        deleted: false,
        userId
      });
      conversationId = conversationRef.id;
    } else {
      // Update existing conversation
      const conversationDoc = conversationQuery.docs[0];
      conversationId = conversationDoc.id;
      await conversationDoc.ref.update({
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const twilio = require('twilio');
const dotenv = require('dotenv');
const admin = require('firebase-admin');

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
const serviceAccount = require('./firebase-credentials.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const app = express();
const server = http.createServer(app);

// Configure CORS for both Express and Socket.io
const corsOptions = {
  origin: '*', // Allow all origins in development
  methods: ['GET', 'POST'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

const io = socketIo(server, {
  cors: corsOptions,
  path: '/socket.io',
  transports: ['websocket', 'polling']
});

// Middleware
app.use(express.json());

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

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  // Handle message read status updates
  socket.on('mark-message-read', async (messageId) => {
    try {
      // Update message in Firestore
      const messageRef = db.collection('messages').doc(messageId);
      await messageRef.update({
        read: true,
        readAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Emit to all clients
      io.emit('message-read', messageId);
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  });
});

// Webhook endpoint to receive SMS
app.post('/api/receive-sms', async (req, res) => {
  const { From, To, Body, MessageSid } = req.body;
  
  console.log(`Received message from ${From}: ${Body}`);
  
  try {
    // Format the message consistently
    const message = {
      id: MessageSid,
      direction: 'inbound',
      content: Body,
      phoneNumber: From,
      timestamp: new Date().toISOString(),
      read: false,
      status: 'received'
    };

    // Store message in Firestore
    const messageRef = await db.collection('messages').add({
      ...message,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Get or create conversation
    const conversationQuery = await db.collection('conversations')
      .where('phoneNumber', '==', From)
      .limit(1)
      .get();

    let conversationId;
    if (conversationQuery.empty) {
      // Create new conversation
      const conversationRef = await db.collection('conversations').add({
        phoneNumber: From,
        messages: [messageRef.id],
        unreadCount: 1,
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        archived: false,
        deleted: false
      });
      conversationId = conversationRef.id;
    } else {
      // Update existing conversation
      const conversationDoc = conversationQuery.docs[0];
      conversationId = conversationDoc.id;
      await conversationDoc.ref.update({
        messages: admin.firestore.FieldValue.arrayUnion(messageRef.id),
        unreadCount: admin.firestore.FieldValue.increment(1),
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Emit the message to all connected clients with conversationId
    io.emit('new-message', {
      ...message,
      conversationId,
      phoneNumber: From
    });
    
    // Send a TwiML response
    const twiml = new twilio.twiml.MessagingResponse();
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
  } catch (error) {
    console.error('Error processing incoming message:', error);
    res.status(500).send('Error processing message');
  }
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
    
    // Format message for storage
    const messageData = {
      id: message.sid,
      direction: 'outbound',
      content: body,
      phoneNumber: to,
      timestamp: new Date().toISOString(),
      read: false,
      status: 'sent'
    };

    // Store message in Firestore
    const messageRef = await db.collection('messages').add({
      ...messageData,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Get or create conversation
    const conversationQuery = await db.collection('conversations')
      .where('phoneNumber', '==', to)
      .limit(1)
      .get();

    let conversationId;
    if (conversationQuery.empty) {
      // Create new conversation
      const conversationRef = await db.collection('conversations').add({
        phoneNumber: to,
        messages: [messageRef.id],
        unreadCount: 0,
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        archived: false,
        deleted: false
      });
      conversationId = conversationRef.id;
    } else {
      // Update existing conversation
      const conversationDoc = conversationQuery.docs[0];
      conversationId = conversationDoc.id;
      await conversationDoc.ref.update({
        messages: admin.firestore.FieldValue.arrayUnion(messageRef.id),
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    // Emit the sent message to all connected clients
    io.emit('new-message', {
      ...messageData,
      conversationId
    });
    
    res.json({ success: true, messageId: message.sid });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Message status webhook endpoint
app.post('/api/message-status', async (req, res) => {
  const { MessageSid, MessageStatus } = req.body;
  
  console.log(`Message ${MessageSid} status: ${MessageStatus}`);
  
  try {
    // Update message status in Firestore
    const messageQuery = await db.collection('messages')
      .where('id', '==', MessageSid)
      .limit(1)
      .get();

    if (!messageQuery.empty) {
      await messageQuery.docs[0].ref.update({
        status: MessageStatus
      });
    }
    
    // Emit the status update to all connected clients
    io.emit('message-status-update', {
      messageId: MessageSid,
      status: MessageStatus
    });
    
    res.sendStatus(200);
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).send('Error updating message status');
  }
});

// Get all messages endpoint
app.get('/api/messages', async (req, res) => {
  try {
    // Get all conversations
    const conversationsSnapshot = await db.collection('conversations')
      .orderBy('lastMessageAt', 'desc')
      .get();

    const conversations = await Promise.all(conversationsSnapshot.docs.map(async (doc) => {
      const conversation = doc.data();
      const messages = await Promise.all(
        conversation.messages.map(async (messageId) => {
          const messageDoc = await db.collection('messages').doc(messageId).get();
          return messageDoc.data();
        })
      );

      return {
        id: doc.id,
        ...conversation,
        messages: messages.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
      };
    }));

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});