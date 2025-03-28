const admin = require('firebase-admin');
const { db } = require('../config/firebase-admin');

/**
 * Creates a new conversation or updates an existing one
 * @param {string} phoneNumber - The phone number associated with the conversation
 * @param {string} userId - The ID of the user who owns the conversation
 * @param {Object} options - Additional options for conversation creation
 * @returns {Promise<string>} The conversation ID
 */
async function createOrUpdateConversation(phoneNumber, userId, options = {}) {
  try {
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
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
        unreadCount: admin.firestore.FieldValue.increment(1),
        ...options
      });
    } else {
      // Create new conversation
      conversationRef = await conversationsRef.add({
        phoneNumber,
        messages: [],
        unreadCount: 1,
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        archived: false,
        deleted: false,
        userId,
        ...options
      });
      conversationId = conversationRef.id;
    }

    return conversationId;
  } catch (error) {
    console.error('Error in createOrUpdateConversation:', error);
    throw error;
  }
}

/**
 * Updates the unread count for a conversation
 * @param {string} conversationId - The ID of the conversation
 * @param {number} count - The new unread count
 * @returns {Promise<void>}
 */
async function updateUnreadCount(conversationId, count) {
  try {
    const conversationRef = db.collection('conversations').doc(conversationId);
    await conversationRef.update({
      unreadCount: count,
      lastMessageAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error in updateUnreadCount:', error);
    throw error;
  }
}

/**
 * Marks all messages in a conversation as read
 * @param {string} conversationId - The ID of the conversation
 * @param {string} userId - The ID of the user who read the messages
 * @returns {Promise<void>}
 */
async function markConversationAsRead(conversationId, userId) {
  try {
    const conversationRef = db.collection('conversations').doc(conversationId);
    const conversation = await conversationRef.get();

    if (!conversation.exists) {
      throw new Error('Conversation not found');
    }

    // Update conversation unread count
    await conversationRef.update({
      unreadCount: 0,
      lastMessageAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update all messages in the conversation
    const messagesRef = db.collection('messages');
    const messagesSnapshot = await messagesRef
      .where('conversationId', '==', conversationId)
      .where('read', '==', false)
      .get();

    const batch = db.batch();
    messagesSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        read: true,
        readAt: admin.firestore.FieldValue.serverTimestamp(),
        readBy: userId
      });
    });

    await batch.commit();
  } catch (error) {
    console.error('Error in markConversationAsRead:', error);
    throw error;
  }
}

/**
 * Archives or unarchives a conversation
 * @param {string} conversationId - The ID of the conversation
 * @param {boolean} archived - Whether to archive or unarchive
 * @returns {Promise<void>}
 */
async function updateConversationArchiveStatus(conversationId, archived) {
  try {
    const conversationRef = db.collection('conversations').doc(conversationId);
    await conversationRef.update({
      archived,
      archivedAt: archived ? admin.firestore.FieldValue.serverTimestamp() : null,
      lastMessageAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error in updateConversationArchiveStatus:', error);
    throw error;
  }
}

/**
 * Soft deletes or restores a conversation
 * @param {string} conversationId - The ID of the conversation
 * @param {boolean} deleted - Whether to delete or restore
 * @returns {Promise<void>}
 */
async function updateConversationDeleteStatus(conversationId, deleted) {
  try {
    const conversationRef = db.collection('conversations').doc(conversationId);
    await conversationRef.update({
      deleted,
      deletedAt: deleted ? admin.firestore.FieldValue.serverTimestamp() : null,
      lastMessageAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error in updateConversationDeleteStatus:', error);
    throw error;
  }
}

/**
 * Updates the customer name for a conversation
 * @param {string} conversationId - The ID of the conversation
 * @param {string} customerName - The new customer name
 * @returns {Promise<void>}
 */
async function updateCustomerName(conversationId, customerName) {
  try {
    const conversationRef = db.collection('conversations').doc(conversationId);
    await conversationRef.update({
      customerName,
      lastMessageAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error in updateCustomerName:', error);
    throw error;
  }
}

/**
 * Adds a message to a conversation
 * @param {string} conversationId - The ID of the conversation
 * @param {Object} message - The message to add
 * @returns {Promise<string>} The message ID
 */
async function addMessageToConversation(conversationId, message) {
  try {
    // Create the message
    const messageRef = await db.collection('messages').add({
      ...message,
      conversationId,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      read: false
    });

    // Update conversation's messages array
    const conversationRef = db.collection('conversations').doc(conversationId);
    await conversationRef.update({
      messages: admin.firestore.FieldValue.arrayUnion(messageRef.id),
      lastMessageAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return messageRef.id;
  } catch (error) {
    console.error('Error in addMessageToConversation:', error);
    throw error;
  }
}

/**
 * Updates a message's status
 * @param {string} messageId - The ID of the message
 * @param {string} status - The new status
 * @returns {Promise<void>}
 */
async function updateMessageStatus(messageId, status) {
  try {
    const messageRef = db.collection('messages').doc(messageId);
    await messageRef.update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error in updateMessageStatus:', error);
    throw error;
  }
}

/**
 * Marks a message as read
 * @param {string} messageId - The ID of the message
 * @param {string} userId - The ID of the user who read the message
 * @returns {Promise<void>}
 */
async function markMessageAsRead(messageId, userId) {
  try {
    const messageRef = db.collection('messages').doc(messageId);
    await messageRef.update({
      read: true,
      readAt: admin.firestore.FieldValue.serverTimestamp(),
      readBy: userId
    });
  } catch (error) {
    console.error('Error in markMessageAsRead:', error);
    throw error;
  }
}

module.exports = {
  createOrUpdateConversation,
  updateUnreadCount,
  markConversationAsRead,
  updateConversationArchiveStatus,
  updateConversationDeleteStatus,
  updateCustomerName,
  addMessageToConversation,
  updateMessageStatus,
  markMessageAsRead
}; 