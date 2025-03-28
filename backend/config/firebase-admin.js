const admin = require('firebase-admin');
require('dotenv').config();

try {
  // Initialize Firebase Admin with Google CLI credentials
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: "admin-dashboard-7a9b3"
  });

  // Get Firestore instance
  const db = admin.firestore();

  // Enable offline persistence
  db.settings({
    cacheSizeBytes: admin.firestore.CACHE_SIZE_UNLIMITED,
    ssl: true
  });

  // Export the Firestore instance
  module.exports = {
    db,
    admin
  };

} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  throw error;
}

// Add error handling for Firestore operations
const handleFirestoreError = (error, operation) => {
  console.error(`Firestore ${operation} error:`, error);
  throw new Error(`Failed to ${operation}: ${error.message}`);
};

// Export error handling function
module.exports.handleFirestoreError = handleFirestoreError; 