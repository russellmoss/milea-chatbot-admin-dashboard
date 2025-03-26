import { Conversation, Message, MessageTemplate } from '../components/sms/MessagingInbox';

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  birthdate: string;
  tags: string[];
  notes: string;
  optIn: boolean;
  lists: string[];
  createdAt: string;
  updatedAt: string;
}

export const MOCK_CONTACTS: Contact[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    phoneNumber: '+15551234567',
    email: 'john.smith@example.com',
    birthdate: '1980-05-15',
    tags: ['VIP', 'Wine Club'],
    notes: 'Prefers red wines, especially Cabernet Sauvignon. Regular visitor to the tasting room.',
    optIn: true,
    lists: ['Wine Club', 'Newsletter', 'Events'],
    createdAt: '2023-01-15T10:00:00Z',
    updatedAt: '2023-05-15T14:30:00Z'
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    phoneNumber: '+15559876543',
    email: 'sarah.j@example.com',
    birthdate: '1985-08-22',
    tags: ['Wine Club', 'Events'],
    notes: 'Interested in wine education classes. Has attended two wine pairing events.',
    optIn: true,
    lists: ['Wine Club', 'Events', 'Education'],
    createdAt: '2023-02-01T15:45:00Z',
    updatedAt: '2023-05-14T11:20:00Z'
  }
];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv1',
    phoneNumber: '+15551234567',
    customerName: 'John Smith',
    lastMessage: "I'm interested in booking a tasting for this Saturday",
    lastMessageTime: '2023-05-15T14:30:00',
    unread: true,
    messages: [
      {
        id: 'msg1',
        direction: 'inbound',
        content: "Hello! I'm interested in booking a tasting for this Saturday",
        timestamp: '2023-05-15T14:30:00'
      },
      {
        id: 'msg2',
        direction: 'outbound',
        content: 'Hi John! Thank you for your interest. We have openings at 11 AM, 1 PM, and 3 PM this Saturday. Would any of those times work for you?',
        timestamp: '2023-05-15T14:35:00',
        status: 'delivered'
      }
    ]
  },
  {
    id: 'conv2',
    phoneNumber: '+15559876543',
    customerName: 'Sarah Johnson',
    lastMessage: "Thank you! I'll bring my receipt when I come to pick up my wine club shipment.",
    lastMessageTime: '2023-05-14T11:20:00',
    unread: false,
    messages: [
      {
        id: 'msg3',
        direction: 'outbound',
        content: "Hello Sarah, your wine club shipment for May is ready for pickup at the tasting room. We're open daily from 10 AM to 5 PM.",
        timestamp: '2023-05-14T11:15:00',
        status: 'read'
      },
      {
        id: 'msg4',
        direction: 'inbound',
        content: "Thank you! I'll bring my receipt when I come to pick up my wine club shipment.",
        timestamp: '2023-05-14T11:20:00'
      }
    ]
  }
];

export const MOCK_TEMPLATES: MessageTemplate[] = [
  {
    id: 'template1',
    name: 'Tasting Confirmation',
    content: 'Your tasting reservation for {date} at {time} is confirmed. We look forward to welcoming you to Milea Estate Vineyard!',
    category: 'Reservations'
  },
  {
    id: 'template2',
    name: 'Wine Club Pickup',
    content: 'Hello {name}, your wine club shipment for {month} is ready for pickup at the tasting room. We\'re open daily from 10 AM to 5 PM.',
    category: 'Wine Club'
  },
  {
    id: 'template3',
    name: 'Event Reminder',
    content: 'Reminder: You\'re registered for our {event} on {date} at {time}. We look forward to seeing you!',
    category: 'Events'
  },
  {
    id: 'template4',
    name: 'Thank You',
    content: 'Thank you for visiting Milea Estate Vineyard today! We hope you enjoyed your experience. Don\'t forget to follow us on social media and sign up for our newsletter for updates on events and new releases.',
    category: 'General'
  }
];