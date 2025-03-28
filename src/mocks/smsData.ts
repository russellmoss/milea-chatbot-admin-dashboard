import { Conversation, Message, Contact, MessageTemplate, BulkMessageCampaign, ContactList } from '../types/sms';

// Mock messages
const generateMessages = (conversationId: string, count: number = 5): Message[] => {
  const messages: Message[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const isEven = i % 2 === 0;
    const minutesAgo = (count - i) * 15; // Oldest message first
    const timestamp = new Date(now.getTime() - minutesAgo * 60000).toISOString();
    
    messages.push({
      id: `msg_${conversationId}_${i}`,
      direction: isEven ? 'inbound' : 'outbound',
      content: isEven 
        ? mockInboundMessages[Math.floor(Math.random() * mockInboundMessages.length)]
        : mockOutboundMessages[Math.floor(Math.random() * mockOutboundMessages.length)],
      timestamp,
      status: isEven ? 'received' : 'delivered',
      read: i < (count - 2), // Last two messages unread if inbound
      conversationId
    });
  }
  
  return messages;
};

// Sample inbound messages
const mockInboundMessages = [
  "Hi, I'd like to book a wine tasting for this weekend. Do you have availability?",
  "Are you open on Monday?",
  "What are your current wine club options?",
  "Can I bring my dog to the winery?",
  "How much is shipping for 6 bottles to California?",
  "Do you have the 2022 Cabernet in stock?",
  "We loved our visit last weekend! Can we order a case of the Merlot we tried?",
  "What time do you close today?",
  "Can I make a reservation for dinner at your restaurant?",
  "Is there a cost for the tastings?",
  "Do you offer any discounts for wine club members?",
];

// Sample outbound messages
const mockOutboundMessages = [
  "We'd be happy to book you for a tasting this weekend! We have availability at 2pm and 4pm on Saturday, or 1pm and 3pm on Sunday. Would any of those times work for you?",
  "We're open 7 days a week from 10am to 5pm, including Mondays!",
  "We have three wine club levels: Silver, Gold, and Platinum. Each includes quarterly shipments with exclusive member benefits. Would you like me to email you the details?",
  "Yes, we are dog-friendly as long as they're leashed. We even have a water station for your furry friends!",
  "Shipping for 6 bottles to California is $18, but it's complimentary for orders over $300 or for wine club members.",
  "Yes, the 2022 Cabernet is in stock! It's $45 per bottle or $486 per case for non-members (10% discount).",
  "We're so glad you enjoyed your visit! I'd be happy to process an order for a case of the Merlot. Would you like to use the card we have on file?",
  "We close at 5pm today, with the last tasting starting at 4pm.",
  "Our restaurant is open Thursday through Sunday for dinner, 5pm to 9pm. I'd be happy to make a reservation for you. What day and time were you thinking?",
  "Tastings are $25 per person, which is waived with a 2-bottle purchase or for wine club members.",
];

// Helper function to generate timestamps
const generateTimestamp = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

// Mock conversations with winery-related content
export const mockConversations: Conversation[] = [
  {
    id: 'conv_001',
    customerName: 'Sarah Johnson',
    phoneNumber: '+1 (555) 123-4567',
    messages: [
      {
        id: 'msg_001_1',
        direction: 'inbound',
        content: 'Hi! I\'d like to make a reservation for a wine tasting this Saturday at 2pm. Do you have availability?',
        phoneNumber: '+1 (555) 123-4567',
        timestamp: generateTimestamp(2),
        status: 'received',
        read: true,
        conversationId: 'conv_001'
      },
      {
        id: 'msg_001_2',
        direction: 'outbound',
        content: 'Hello Sarah! Yes, we have availability for a wine tasting this Saturday at 2pm. Would you like to book it? We offer tastings of 5 wines for $25 per person.',
        phoneNumber: '+1 (555) 123-4567',
        timestamp: generateTimestamp(2),
        status: 'delivered',
        read: true,
        conversationId: 'conv_001'
      },
      {
        id: 'msg_001_3',
        direction: 'inbound',
        content: 'Yes, that sounds perfect! I\'ll be bringing my husband. Can you confirm the reservation?',
        phoneNumber: '+1 (555) 123-4567',
        timestamp: generateTimestamp(2),
        status: 'received',
        read: true,
        conversationId: 'conv_001'
      }
    ],
    unreadCount: 0,
    lastMessageAt: generateTimestamp(2),
    timestamp: generateTimestamp(2),
    archived: false,
    deleted: false
  },
  {
    id: 'conv_002',
    customerName: 'Michael Chen',
    phoneNumber: '+1 (555) 234-5678',
    messages: [
      {
        id: 'msg_002_1',
        direction: 'inbound',
        content: 'I received my wine club shipment today but one of the bottles was broken. What should I do?',
        phoneNumber: '+1 (555) 234-5678',
        timestamp: generateTimestamp(1),
        status: 'received',
        read: false,
        conversationId: 'conv_002'
      }
    ],
    unreadCount: 1,
    lastMessageAt: generateTimestamp(1),
    timestamp: generateTimestamp(1),
    archived: false,
    deleted: false
  },
  {
    id: 'conv_003',
    customerName: 'Emma Rodriguez',
    phoneNumber: '+1 (555) 345-6789',
    messages: [
      {
        id: 'msg_003_1',
        direction: 'inbound',
        content: 'I\'m interested in joining your wine club. What are the benefits and pricing?',
        phoneNumber: '+1 (555) 345-6789',
        timestamp: generateTimestamp(3),
        status: 'received',
        read: true,
        conversationId: 'conv_003'
      },
      {
        id: 'msg_003_2',
        direction: 'outbound',
        content: 'Hi Emma! Our wine club offers quarterly shipments of 3 bottles, exclusive member events, and 15% off all purchases. Membership is $150/quarter. Would you like more details?',
        phoneNumber: '+1 (555) 345-6789',
        timestamp: generateTimestamp(3),
        status: 'delivered',
        read: true,
        conversationId: 'conv_003'
      }
    ],
    unreadCount: 0,
    lastMessageAt: generateTimestamp(3),
    timestamp: generateTimestamp(3),
    archived: false,
    deleted: false
  },
  {
    id: 'conv_004',
    customerName: 'David Thompson',
    phoneNumber: '+1 (555) 456-7890',
    messages: [
      {
        id: 'msg_004_1',
        direction: 'inbound',
        content: 'I ordered a case of your 2018 Cabernet Sauvignon but haven\'t received a shipping confirmation yet. Can you check the status?',
        phoneNumber: '+1 (555) 456-7890',
        timestamp: generateTimestamp(0),
        status: 'received',
        read: false,
        conversationId: 'conv_004'
      }
    ],
    unreadCount: 1,
    lastMessageAt: generateTimestamp(0),
    timestamp: generateTimestamp(0),
    archived: false,
    deleted: false
  },
  {
    id: 'conv_005',
    customerName: 'Lisa Anderson',
    phoneNumber: '+1 (555) 567-8901',
    messages: [
      {
        id: 'msg_005_1',
        direction: 'inbound',
        content: 'I\'m planning a bridal shower and would like to know if you offer private events?',
        phoneNumber: '+1 (555) 567-8901',
        timestamp: generateTimestamp(4),
        status: 'received',
        read: true,
        conversationId: 'conv_005'
      },
      {
        id: 'msg_005_2',
        direction: 'outbound',
        content: 'Hi Lisa! Yes, we offer private events in our tasting room and outdoor patio. We can accommodate up to 40 guests. Would you like to schedule a tour?',
        phoneNumber: '+1 (555) 567-8901',
        timestamp: generateTimestamp(4),
        status: 'delivered',
        read: true,
        conversationId: 'conv_005'
      },
      {
        id: 'msg_005_3',
        direction: 'inbound',
        content: 'That would be great! What times are available for tours this week?',
        phoneNumber: '+1 (555) 567-8901',
        timestamp: generateTimestamp(4),
        status: 'received',
        read: true,
        conversationId: 'conv_005'
      }
    ],
    unreadCount: 0,
    lastMessageAt: generateTimestamp(4),
    timestamp: generateTimestamp(4),
    archived: false,
    deleted: false
  }
];

// Mock contacts
export const mockContacts: Contact[] = [
  {
    id: 'contact_1',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+12345678901',
    email: 'john.doe@example.com',
    optIn: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    lists: ['VIP', 'Newsletter'],
    tags: ['Customer', 'VIP'],
    notes: 'Preferred customer'
  },
  {
    id: 'contact_2',
    firstName: 'Jane',
    lastName: 'Smith',
    phoneNumber: '+19876543210',
    email: 'jane.smith@example.com',
    optIn: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    lists: ['Newsletter'],
    tags: ['Customer'],
    notes: 'Regular customer'
  }
];

// Mock templates
export const mockTemplates: MessageTemplate[] = [
  {
    id: 'template_1',
    name: 'Welcome Message',
    content: 'Welcome to our service! We\'re glad to have you on board.',
    variables: [],
    category: 'General',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'template_2',
    name: 'Order Confirmation',
    content: 'Thank you for your order! Your order number is {orderNumber}.',
    variables: ['orderNumber'],
    category: 'Orders',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 172800000).toISOString()
  }
];

// Mock contact lists
export const mockContactLists: ContactList[] = [
  {
    id: 'wine-club-platinum',
    name: 'Wine Club - Platinum',
    description: 'Platinum tier wine club members',
    contacts: ['contact2', 'contact10'],
    createdAt: new Date(Date.now() - 365 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 3600000).toISOString()
  },
  {
    id: 'wine-club-gold',
    name: 'Wine Club - Gold',
    description: 'Gold tier wine club members',
    contacts: ['contact1', 'contact8'],
    createdAt: new Date(Date.now() - 365 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 3600000).toISOString()
  },
  {
    id: 'wine-club-silver',
    name: 'Wine Club - Silver',
    description: 'Silver tier wine club members',
    contacts: ['contact6'],
    createdAt: new Date(Date.now() - 365 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 3600000).toISOString()
  },
  {
    id: 'newsletter',
    name: 'Newsletter Subscribers',
    description: 'Contacts who subscribe to our monthly newsletter',
    contacts: ['contact1', 'contact3', 'contact6', 'contact7'],
    createdAt: new Date(Date.now() - 400 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString()
  },
  {
    id: 'event-invites',
    name: 'Event Invitations',
    description: 'Contacts to invite to special events',
    contacts: ['contact6', 'contact10'],
    createdAt: new Date(Date.now() - 180 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString()
  }
];

// Mock campaigns
export const mockCampaigns: BulkMessageCampaign[] = [
  {
    id: 'campaign1',
    name: 'Spring Release Announcement',
    message: 'Our Spring Release is now available for Wine Club Members! Reply SPRING to pre-order your allocation before general release.',
    recipients: {
      listIds: ['wine-club-platinum', 'wine-club-gold', 'wine-club-silver']
    },
    status: 'completed',
    stats: {
      total: 150,
      sent: 150,
      delivered: 143,
      failed: 7,
      responses: 68
    },
    createdAt: new Date(Date.now() - 60 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 58 * 24 * 3600000).toISOString()
  },
  {
    id: 'campaign2',
    name: 'Summer Concert Series',
    message: 'Join us for our Summer Concert Series, starting June 15th! Wine Club Members get priority seating. Reply CONCERT for details and to reserve your spot.',
    recipients: {
      listIds: ['wine-club-platinum', 'wine-club-gold', 'wine-club-silver', 'newsletter']
    },
    status: 'scheduled',
    scheduledTime: new Date(Date.now() + 15 * 24 * 3600000).toISOString(),
    createdAt: new Date(Date.now() - 10 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 3600000).toISOString()
  },
  {
    id: 'campaign3',
    name: 'Memorial Day Weekend Tasting',
    message: 'Extended hours for Memorial Day Weekend! Join us for special tastings and live music. Wine club members receive complimentary cheese boards. No reservation needed.',
    recipients: {
      listIds: ['wine-club-platinum', 'wine-club-gold', 'wine-club-silver', 'newsletter', 'event-invites']
    },
    status: 'draft',
    createdAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString()
  }
];