import { Conversation, Message, MessageTemplate } from '../types/sms';

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

// export const MOCK_CONVERSATIONS: Conversation[] = [
//   {
//     id: 'conv1',
//     phoneNumber: '+15551234567',
//     customerName: 'John Smith',
//     messages: [
//       {
//         id: 'msg1',
//         direction: 'inbound',
//         content: "Hello! I'm interested in booking a tasting for this Saturday",
//         timestamp: '2023-05-15T14:30:00',
//         read: false,
//         status: 'received'
//       },
//       {
//         id: 'msg2',
//         direction: 'outbound',
//         content: "Hi John! We'd be happy to help you book a tasting. What time were you thinking?",
//         timestamp: '2023-05-15T14:35:00',
//         read: true,
//         status: 'delivered'
//       },
//       {
//         id: 'msg3',
//         direction: 'inbound',
//         content: "How about 2 PM?",
//         timestamp: '2023-05-15T14:40:00',
//         read: true,
//         status: 'received'
//       }
//     ],
//     archived: false,
//     deleted: false,
//     unreadCount: 1,
//     lastMessageAt: '2023-05-15T14:40:00',
//     timestamp: '2023-05-15T14:30:00'
//   },
//   {
//     id: 'conv2',
//     phoneNumber: '+15559876543',
//     customerName: 'Sarah Johnson',
//     messages: [
//       {
//         id: 'msg4',
//         direction: 'inbound',
//         content: "Thank you! I'll bring my receipt when I come to pick up my wine club shipment.",
//         timestamp: '2023-05-14T11:20:00',
//         read: true,
//         status: 'received'
//       }
//     ],
//     archived: false,
//     deleted: false,
//     unreadCount: 0,
//     lastMessageAt: '2023-05-14T11:20:00',
//     timestamp: '2023-05-14T11:15:00'
//   },
//   {
//     id: 'conv3',
//     phoneNumber: '+15552223333',
//     customerName: 'Michael Brown',
//     messages: [
//       {
//         id: 'msg5',
//         direction: 'inbound',
//         content: 'Great event last weekend!',
//         timestamp: '2023-05-10T16:45:00',
//         read: true,
//         status: 'received'
//       }
//     ],
//     archived: true,
//     deleted: false,
//     unreadCount: 0,
//     lastMessageAt: '2023-05-10T16:45:00',
//     timestamp: '2023-05-10T16:45:00'
//   },
//   {
//     id: 'conv4',
//     phoneNumber: '+15554445555',
//     customerName: 'Emily Davis',
//     messages: [
//       {
//         id: 'msg6',
//         direction: 'inbound',
//         content: 'Spam message',
//         timestamp: '2023-05-01T09:15:00',
//         read: true,
//         status: 'received'
//       }
//     ],
//     archived: false,
//     deleted: true,
//     unreadCount: 0,
//     lastMessageAt: '2023-05-01T09:15:00',
//     timestamp: '2023-05-01T09:15:00'
//   }
// ];

export const MOCK_TEMPLATES: MessageTemplate[] = [
  {
    id: 'template1',
    name: 'Tasting Confirmation',
    content: 'Your tasting reservation for {date} at {time} is confirmed. We look forward to welcoming you to Milea Estate Vineyard!',
    category: 'Reservations',
    variables: ['date', 'time'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'template2',
    name: 'Wine Club Pickup',
    content: 'Hello {name}, your wine club shipment for {month} is ready for pickup at the tasting room. We\'re open daily from 10 AM to 5 PM.',
    category: 'Wine Club',
    variables: ['name', 'month'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'template3',
    name: 'Event Reminder',
    content: 'Reminder: You\'re registered for our {event} on {date} at {time}. We look forward to seeing you!',
    category: 'Events',
    variables: ['event', 'date', 'time'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'template4',
    name: 'Thank You',
    content: 'Thank you for visiting Milea Estate Vineyard today! We hope you enjoyed your experience. Don\'t forget to follow us on social media and sign up for our newsletter for updates on events and new releases.',
    category: 'General',
    variables: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];