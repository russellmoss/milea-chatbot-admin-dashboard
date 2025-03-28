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

// Create mock conversations
export const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    customerName: 'Jane Smith',
    phoneNumber: '+15551234567',
    messages: generateMessages('conv1', 7),
    unreadCount: 2,
    lastMessageAt: new Date().toISOString(),
    timestamp: new Date().toISOString(),
    archived: false,
    deleted: false
  },
  {
    id: 'conv2',
    customerName: 'Michael Johnson',
    phoneNumber: '+15552345678',
    messages: generateMessages('conv2', 4),
    unreadCount: 1,
    lastMessageAt: new Date(Date.now() - 45 * 60000).toISOString(), // 45 minutes ago
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    archived: false,
    deleted: false
  },
  {
    id: 'conv3',
    customerName: 'Emily Davis',
    phoneNumber: '+15553456789',
    messages: generateMessages('conv3', 10),
    unreadCount: 0,
    lastMessageAt: new Date(Date.now() - 90 * 60000).toISOString(), // 1.5 hours ago
    timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
    archived: false,
    deleted: false
  },
  {
    id: 'conv4',
    customerName: 'Robert Wilson',
    phoneNumber: '+15554567890',
    messages: generateMessages('conv4', 3),
    unreadCount: 0,
    lastMessageAt: new Date(Date.now() - 6 * 3600000).toISOString(), // 6 hours ago
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), 
    archived: true, // Archived conversation
    deleted: false
  },
  {
    id: 'conv5',
    customerName: null, // Unknown customer
    phoneNumber: '+15555678901',
    messages: generateMessages('conv5', 2),
    unreadCount: 1,
    lastMessageAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    archived: false,
    deleted: false
  },
  {
    id: 'conv6',
    customerName: 'Sarah Thompson',
    phoneNumber: '+15556789012',
    messages: generateMessages('conv6', 8),
    unreadCount: 0,
    lastMessageAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), // 2 days ago
    timestamp: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    archived: false,
    deleted: false
  }
];

// Mock contacts (matching conversation people plus more)
export const mockContacts: Contact[] = [
  {
    id: 'contact1',
    firstName: 'Jane',
    lastName: 'Smith',
    phoneNumber: '+15551234567',
    email: 'jane.smith@example.com',
    optIn: true,
    createdAt: new Date(Date.now() - 90 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    lists: ['wine-club-gold', 'newsletter'],
    tags: ['regular', 'wine-club']
  },
  {
    id: 'contact2',
    firstName: 'Michael',
    lastName: 'Johnson',
    phoneNumber: '+15552345678',
    email: 'michael.johnson@example.com',
    optIn: true,
    createdAt: new Date(Date.now() - 120 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 3600000).toISOString(),
    lists: ['wine-club-platinum'],
    tags: ['VIP', 'high-value']
  },
  {
    id: 'contact3',
    firstName: 'Emily',
    lastName: 'Davis',
    phoneNumber: '+15553456789',
    email: 'emily.davis@example.com',
    optIn: true,
    createdAt: new Date(Date.now() - 60 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    lists: ['newsletter'],
    tags: ['local', 'event-attendee']
  },
  {
    id: 'contact4',
    firstName: 'Robert',
    lastName: 'Wilson',
    phoneNumber: '+15554567890',
    email: 'robert.wilson@example.com',
    optIn: false, // Opted out
    createdAt: new Date(Date.now() - 150 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
    lists: [],
    tags: ['former-member']
  },
  {
    id: 'contact5',
    firstName: 'Unknown',
    lastName: 'Customer',
    phoneNumber: '+15555678901',
    optIn: true,
    createdAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600000).toISOString()
  },
  {
    id: 'contact6',
    firstName: 'Sarah',
    lastName: 'Thompson',
    phoneNumber: '+15556789012',
    email: 'sarah.thompson@example.com',
    optIn: true,
    createdAt: new Date(Date.now() - 200 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 3600000).toISOString(),
    lists: ['wine-club-silver', 'newsletter', 'event-invites'],
    tags: ['wine-club', 'event-regular']
  },
  // Additional contacts that aren't in conversations yet
  {
    id: 'contact7',
    firstName: 'David',
    lastName: 'Brown',
    phoneNumber: '+15557890123',
    email: 'david.brown@example.com',
    optIn: true,
    createdAt: new Date(Date.now() - 45 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 24 * 3600000).toISOString(),
    lists: ['newsletter'],
    tags: ['prospect']
  },
  {
    id: 'contact8',
    firstName: 'Amanda',
    lastName: 'Miller',
    phoneNumber: '+15558901234',
    email: 'amanda.miller@example.com',
    optIn: true,
    createdAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
    lists: ['wine-club-gold'],
    tags: ['wine-club', 'referred']
  },
  {
    id: 'contact9',
    firstName: 'James',
    lastName: 'Taylor',
    phoneNumber: '+15559012345',
    email: 'james.taylor@example.com',
    optIn: false,
    createdAt: new Date(Date.now() - 180 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 24 * 3600000).toISOString(),
    lists: [],
    tags: ['unsubscribed']
  },
  {
    id: 'contact10',
    firstName: 'Olivia',
    lastName: 'Garcia',
    phoneNumber: '+15550123456',
    email: 'olivia.garcia@example.com',
    optIn: true,
    createdAt: new Date(Date.now() - 75 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    lists: ['wine-club-platinum', 'event-invites'],
    tags: ['VIP', 'wine-club', 'large-orders']
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

// Mock message templates
export const mockTemplates: MessageTemplate[] = [
  {
    id: 'template1',
    name: 'Wine Club Pickup Reminder',
    content: 'Hello {name}, your wine club shipment for {month} is ready for pickup at the tasting room. We\'re open daily from 10 AM to 5 PM.',
    variables: ['name', 'month'],
    category: 'Wine Club',
    createdAt: new Date(Date.now() - 90 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 90 * 24 * 3600000).toISOString()
  },
  {
    id: 'template2',
    name: 'Tasting Reservation Confirmation',
    content: 'Thank you for reserving a tasting on {date} at {time}. We look forward to hosting you at our winery! Please arrive 5-10 minutes early to check in.',
    variables: ['date', 'time'],
    category: 'Reservations',
    createdAt: new Date(Date.now() - 120 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString()
  },
  {
    id: 'template3',
    name: 'Event Invitation',
    content: 'You\'re invited to our {event} on {date} from {startTime} to {endTime}. RSVP by replying YES or NO to this message. We hope to see you there!',
    variables: ['event', 'date', 'startTime', 'endTime'],
    category: 'Events',
    createdAt: new Date(Date.now() - 60 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 24 * 3600000).toISOString()
  },
  {
    id: 'template4',
    name: 'Follow-up Thank You',
    content: 'Thank you for visiting us today, {name}! We hope you enjoyed your experience. Feel free to reach out if you have any questions about the wines you tasted.',
    variables: ['name'],
    category: 'General',
    createdAt: new Date(Date.now() - 150 * 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 24 * 3600000).toISOString()
  },
  {
    id: 'template5',
    name: 'New Release Announcement',
    content: 'We\'re excited to announce the release of our {wine} on {date}. As a valued customer, you have early access to purchase before public release!',
    variables: ['wine', 'date'],
    category: 'Marketing',
    createdAt: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
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