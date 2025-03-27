// Create a new file: src/services/twilioService.js
import axios from 'axios';

const API_URL = 'http://localhost:3001/api'; // Update with your backend URL

export const sendSMS = async (phoneNumber, message) => {
  try {
    const response = await axios.post(`${API_URL}/send-sms`, {
      to: phoneNumber,
      body: message
    });
    return response.data;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
};