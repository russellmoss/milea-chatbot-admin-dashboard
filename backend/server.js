const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const twilio = require('twilio');
const { db, handleFirestoreError } = require('./config/firebase-admin');
const dotenv = require('dotenv');
const admin = require('firebase-admin');

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`
  });
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Handle message read status
  socket.on('markMessageRead', async ({ messageId, conversationId }) => {
    try {
      const messageRef = db.collection('messages').doc(messageId);
      await messageRef.update({ read: true });

      // Update conversation unread count
      const conversationRef = db.collection('conversations').doc(conversationId);
      const conversation = await conversationRef.get();
      const currentUnread = conversation.data().unreadCount;
      
      if (currentUnread > 0) {
        await conversationRef.update({
          unreadCount: currentUnread - 1
        });
      }

      // Emit update to all connected clients
      io.emit('messageRead', { messageId, conversationId });
    } catch (error) {
      handleFirestoreError(error, 'mark message as read');
    }
  });
});

// Helper function to create or update conversation
async function handleConversation(phoneNumber, message) {
  try {
    // Find existing conversation
    const conversationsRef = db.collection('conversations');
    const querySnapshot = await conversationsRef
      .where('phoneNumber', '==', phoneNumber)
      .where('deleted', '==', false)
      .limit(1)
      .get();

    let conversationId;
    let conversationRef;

    if (!querySnapshot.empty) {
      // Update existing conversation
      conversationId = querySnapshot.docs[0].id;
      conversationRef = conversationsRef.doc(conversationId);
      await conversationRef.update({
        lastMessageAt: new Date().toISOString(),
        unreadCount: admin.firestore.FieldValue.increment(1)
      });
    } else {
      // Create new conversation
      conversationRef = await conversationsRef.add({
        phoneNumber,
        messages: [],
        unreadCount: 1,
        lastMessageAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        archived: false,
        deleted: false,
        userId: 'system' // Replace with actual user ID when auth is implemented
      });
      conversationId = conversationRef.id;
    }

    return conversationId;
  } catch (error) {
    handleFirestoreError(error, 'handle conversation');
  }
}

// Helper function to store message
async function storeMessage(messageData, conversationId) {
  try {
    const messageRef = await db.collection('messages').add({
      ...messageData,
      conversationId,
      timestamp: new Date().toISOString(),
      read: false
    });

    // Update conversation's messages array
    const conversationRef = db.collection('conversations').doc(conversationId);
    await conversationRef.update({
      messages: admin.firestore.FieldValue.arrayUnion(messageRef.id)
    });

    return messageRef.id;
  } catch (error) {
    handleFirestoreError(error, 'store message');
  }
}

// Twilio webhook for receiving SMS
app.post('/api/receive-sms', async (req, res) => {
  try {
    const { Body, From, To, MessageSid } = req.body;
    
    console.log(`Received message from ${From}: ${Body}`);
    
    // Create or update conversation
    const conversationId = await handleConversation(From, Body);
    
    // Store incoming message
    const messageData = {
      id: MessageSid,
      content: Body,
      direction: 'inbound',
      phoneNumber: From,
      timestamp: new Date().toISOString(),
      read: false,
      status: 'received',
      twilioSid: MessageSid
    };
    
    const messageId = await storeMessage(messageData, conversationId);
    
    // Emit new message to connected clients
    io.emit('newMessage', {
      messageId,
      conversationId,
      message: messageData
    });

    // Send a TwiML response
    const twiml = new twilio.twiml.MessagingResponse();
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
  } catch (error) {
    console.error('Error handling incoming SMS:', error);
    res.status(500).send('Error processing message');
  }
});

// API endpoint for sending SMS
app.post('/api/send-sms', authenticateUser, async (req, res) => {
  try {
    const { to, message, conversationId } = req.body;
    const userId = req.user.uid;

    // Validate required fields
    if (!to || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Send message via Twilio
    const twilioMessage = await twilioClient.messages.create({
      body: message,
      to: to,
      from: process.env.TWILIO_PHONE_NUMBER,
      statusCallback: `${process.env.NGROK_URL}/api/message-status`,
      statusCallbackMethod: 'POST'
    });

    // Store outgoing message
    const messageData = {
      content: message,
      direction: 'outbound',
      phoneNumber: to,
      status: 'sent',
      twilioSid: twilioMessage.sid,
      userId,
      timestamp: new Date().toISOString()
    };

    const messageId = await storeMessage(messageData, conversationId);

    // Update conversation
    const conversationRef = db.collection('conversations').doc(conversationId);
    await conversationRef.update({
      lastMessageAt: new Date().toISOString(),
      userId // Ensure conversation is associated with the user
    });

    // Emit new message to connected clients
    io.emit('newMessage', {
      messageId,
      conversationId,
      message: messageData
    });

    res.json({ 
      success: true, 
      messageId,
      twilioSid: twilioMessage.sid
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      details: error.message 
    });
  }
});

// Twilio status callback webhook
app.post('/api/message-status', async (req, res) => {
  try {
    const { MessageSid, MessageStatus } = req.body;
    console.log(`Message ${MessageSid} status: ${MessageStatus}`);

    // Find the message in Firestore
    const messagesRef = db.collection('messages');
    const querySnapshot = await messagesRef
      .where('twilioSid', '==', MessageSid)
      .limit(1)
      .get();

    if (!querySnapshot.empty) {
      const messageDoc = querySnapshot.docs[0];
      await messageDoc.ref.update({
        status: MessageStatus,
        updatedAt: new Date().toISOString()
      });

      // Emit status update to connected clients
      io.emit('messageStatusUpdate', {
        messageId: messageDoc.id,
        status: MessageStatus
      });
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling message status:', error);
    res.status(500).send('Error processing status update');
  }
});

// API endpoint to fetch conversations
app.get('/api/conversations', async (req, res) => {
  try {
    const conversationsRef = db.collection('conversations');
    const querySnapshot = await conversationsRef
      .where('deleted', '==', false)
      .orderBy('lastMessageAt', 'desc')
      .get();

    const conversations = [];
    for (const doc of querySnapshot.docs) {
      const conversation = doc.data();
      const messages = await Promise.all(
        conversation.messages.map(async (messageId) => {
          const messageDoc = await db.collection('messages').doc(messageId).get();
          return messageDoc.data();
        })
      );
      
      conversations.push({
        id: doc.id,
        ...conversation,
        messages: messages.sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        )
      });
    }

    res.json(conversations);
  } catch (error) {
    handleFirestoreError(error, 'fetch conversations');
  }
});

// API endpoint to fetch messages for a conversation
app.get('/api/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversation = await conversationRef.get();

    if (!conversation.exists) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const messages = await Promise.all(
      conversation.data().messages.map(async (messageId) => {
        const messageDoc = await db.collection('messages').doc(messageId).get();
        return messageDoc.data();
      })
    );

    res.json(messages.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    ));
  } catch (error) {
    handleFirestoreError(error, 'fetch messages');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});