// src/mocks/smsData.ts
import { Conversation, Message, Contact, MessageTemplate, BulkMessageCampaign, ContactList } from '../types/sms';

// Helper function to generate timestamps
const generateTimestamp = (daysAgo: number, hoursAgo: number = 0, minutesAgo: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  date.setMinutes(date.getMinutes() - minutesAgo);
  return date.toISOString();
};

// Generate a series of messages for a conversation
const generateConversationMessages = (
  conversationId: string, 
  count: number = 5, 
  startDaysAgo: number = 1
): Message[] => {
  const messages: Message[] = [];
  
  for (let i = 0; i < count; i++) {
    const isOutbound = i % 2 === 0;
    const daysAgo = startDaysAgo;
    const hoursAgo = Math.floor((count - i) / 2);
    const minutesAgo = (count - i) * 10;
    
    messages.push({
      id: `msg_${conversationId}_${i}`,
      direction: isOutbound ? 'outbound' : 'inbound',
      content: isOutbound 
        ? mockOutboundMessages[Math.floor(Math.random() * mockOutboundMessages.length)]
        : mockInboundMessages[Math.floor(Math.random() * mockInboundMessages.length)],
      timestamp: generateTimestamp(daysAgo, hoursAgo, minutesAgo),
      status: isOutbound ? 'delivered' : 'received',
      read: i < count - (isOutbound ? 0 : 1), // Mark last inbound message as unread
      conversationId
    });
  }
  
  return messages;
};

// Sample inbound messages (customer to winery)
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
  "I'm interested in bringing a group of 10 people next month. What's the process for booking a group tasting?",
  "Could you tell me more about your Rosé?",
  "Do you have any events happening this weekend?",
  "Are children allowed at the winery?"
];

// Sample outbound messages (winery to customer)
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
  "Yes, wine club members receive 15-25% off all purchases depending on their membership level, complimentary tastings, and access to exclusive events.",
  "For groups of 10 or more, we recommend booking at least 2 weeks in advance. We offer special group rates of $20 per person. Would you like me to check availability for any specific dates?",
  "Our 2023 Rosé is a dry style made from Pinot Noir grapes. It has notes of strawberry, watermelon, and a crisp, refreshing finish. It's $28 per bottle and very popular in the summer months!",
  "This weekend we're hosting a live music event on Saturday from 1-4pm and a winemaker dinner on Sunday at 6pm. Would you like more details about either event?",
  "Yes, children are welcome at the winery! We have a dedicated picnic area for families and offer grape juice tastings for kids."
];

// Mock conversations
// export const mockConversations: Conversation[] = [
//   {
//     id: 'conv_001',
//     customerName: 'Sarah Johnson',
//     phoneNumber: '+15551234567',
//     messages: [
//       {
//         id: 'msg_001_1',
//         direction: 'inbound',
//         content: "Hi! I'd like to make a reservation for a wine tasting this Saturday at 2pm. Do you have availability?",
//         phoneNumber: '+15551234567',
//         timestamp: generateTimestamp(1, 5, 30),
//         status: 'received',
//         read: true,
//         conversationId: 'conv_001'
//       },
//       {
//         id: 'msg_001_2',
//         direction: 'outbound',
//         content: "Hello Sarah! Yes, we have availability for a wine tasting this Saturday at 2pm. Would you like to book it? We offer tastings of 5 wines for $25 per person.",
//         phoneNumber: '+15551234567',
//         timestamp: generateTimestamp(1, 5, 15),
//         status: 'delivered',
//         read: true,
//         conversationId: 'conv_001'
//       },
//       {
//         id: 'msg_001_3',
//         direction: 'inbound',
//         content: "Yes, that sounds perfect! I'll be bringing my husband. Can you confirm the reservation?",
//         phoneNumber: '+15551234567',
//         timestamp: generateTimestamp(1, 4, 45),
//         status: 'received',
//         read: true,
//         conversationId: 'conv_001'
//       },
//       {
//         id: 'msg_001_4',
//         direction: 'outbound',
//         content: "Great! I've confirmed your reservation for 2 people this Saturday at 2pm. The tasting will last approximately 1 hour. We look forward to seeing you then!",
//         phoneNumber: '+15551234567',
//         timestamp: generateTimestamp(1, 4, 30),
//         status: 'delivered',
//         read: true,
//         conversationId: 'conv_001'
//       },
//       {
//         id: 'msg_001_5',
//         direction: 'inbound',
//         content: "Thank you! Quick question - is there food available or should we eat before we come?",
//         phoneNumber: '+15551234567',
//         timestamp: generateTimestamp(0, 3, 15),
//         status: 'received',
//         read: false,
//         conversationId: 'conv_001'
//       }
//     ],
//     unreadCount: 1,
//     lastMessageAt: generateTimestamp(0, 3, 15),
//     timestamp: generateTimestamp(1, 5, 30),
//     archived: false,
//     deleted: false
//   },
//   {
//     id: 'conv_002',
//     customerName: 'Michael Chen',
//     phoneNumber: '+15552345678',
//     messages: [
//       {
//         id: 'msg_002_1',
//         direction: 'inbound',
//         content: "I received my wine club shipment today but one of the bottles was broken. What should I do?",
//         phoneNumber: '+15552345678',
//         timestamp: generateTimestamp(0, 1, 45),
//         status: 'received',
//         read: false,
//         conversationId: 'conv_002'
//       }
//     ],
//     unreadCount: 1,
//     lastMessageAt: generateTimestamp(0, 1, 45),
//     timestamp: generateTimestamp(0, 1, 45),
//     archived: false,
//     deleted: false
//   },
//   {
//     id: 'conv_003',
//     customerName: 'Emma Rodriguez',
//     phoneNumber: '+15553456789',
//     messages: generateConversationMessages('conv_003', 6, 3),
//     unreadCount: 0,
//     lastMessageAt: generateTimestamp(3, 0, 0),
//     timestamp: generateTimestamp(3, 6, 0),
//     archived: false,
//     deleted: false
//   },
//   {
//     id: 'conv_004',
//     customerName: 'David Thompson',
//     phoneNumber: '+15554567890',
//     messages: generateConversationMessages('conv_004', 4, 0),
//     unreadCount: 1,
//     lastMessageAt: generateTimestamp(0, 0, 30),
//     timestamp: generateTimestamp(0, 2, 0),
//     archived: false,
//     deleted: false
//   },
//   {
//     id: 'conv_005',
//     customerName: 'Lisa Anderson',
//     phoneNumber: '+15555678901',
//     messages: generateConversationMessages('conv_005', 8, 4),
//     unreadCount: 0,
//     lastMessageAt: generateTimestamp(4, 0, 0),
//     timestamp: generateTimestamp(4, 8, 0),
//     archived: true,
//     deleted: false
//   },
//   {
//     id: 'conv_006',
//     customerName: 'James Wilson',
//     phoneNumber: '+15556789012',
//     messages: generateConversationMessages('conv_006', 3, 2),
//     unreadCount: 1,
//     lastMessageAt: generateTimestamp(2, 0, 0),
//     timestamp: generateTimestamp(2, 3, 0),
//     archived: false,
//     deleted: false
//   },
//   {
//     id: 'conv_007',
//     customerName: 'Maria Garcia',
//     phoneNumber: '+15557890123',
//     messages: generateConversationMessages('conv_007', 5, 5),
//     unreadCount: 0,
//     lastMessageAt: generateTimestamp(5, 0, 0),
//     timestamp: generateTimestamp(5, 5, 0),
//     archived: false,
//     deleted: false
//   }
// ];

// Mock contacts
export const mockContacts: Contact[] = [
  {
    id: 'contact_1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    phoneNumber: '+15551234567',
    email: 'sarah.johnson@example.com',
    optIn: true,
    createdAt: generateTimestamp(30, 0, 0),
    updatedAt: generateTimestamp(5, 0, 0),
    lists: ['wine-club', 'newsletter'],
    tags: ['Platinum Member', 'Frequent Visitor'],
    notes: 'Prefers red wines. Allergic to sulfites.'
  },
  {
    id: 'contact_2',
    firstName: 'Michael',
    lastName: 'Chen',
    phoneNumber: '+15552345678',
    email: 'michael.chen@example.com',
    optIn: true,
    createdAt: generateTimestamp(60, 0, 0),
    updatedAt: generateTimestamp(10, 0, 0),
    lists: ['wine-club'],
    tags: ['Gold Member'],
    notes: 'Likes to bring friends for tastings. Interested in wine education.'
  },
  {
    id: 'contact_3',
    firstName: 'Emma',
    lastName: 'Rodriguez',
    phoneNumber: '+15553456789',
    email: 'emma.rodriguez@example.com',
    optIn: true,
    createdAt: generateTimestamp(45, 0, 0),
    updatedAt: generateTimestamp(15, 0, 0),
    lists: ['newsletter'],
    tags: ['Potential Member'],
    notes: 'Recently attended Spring Release event. Expressed interest in joining wine club.'
  },
  {
    id: 'contact_4',
    firstName: 'David',
    lastName: 'Thompson',
    phoneNumber: '+15554567890',
    email: 'david.thompson@example.com',
    optIn: true,
    createdAt: generateTimestamp(90, 0, 0),
    updatedAt: generateTimestamp(7, 0, 0),
    lists: ['wine-club', 'vip'],
    tags: ['Platinum Member', 'Industry'],
    notes: 'Works as sommelier at local restaurant. Good connection for wholesale.'
  },
  {
    id: 'contact_5',
    firstName: 'Lisa',
    lastName: 'Anderson',
    phoneNumber: '+15555678901',
    email: 'lisa.anderson@example.com',
    optIn: false,
    createdAt: generateTimestamp(120, 0, 0),
    updatedAt: generateTimestamp(20, 0, 0),
    lists: [],
    tags: ['Opted Out'],
    notes: 'Requested to be removed from communication list on 3/15/2023.'
  },
  {
    id: 'contact_6',
    firstName: 'James',
    lastName: 'Wilson',
    phoneNumber: '+15556789012',
    email: 'james.wilson@example.com',
    optIn: true,
    createdAt: generateTimestamp(75, 0, 0),
    updatedAt: generateTimestamp(12, 0, 0),
    lists: ['wine-club', 'newsletter'],
    tags: ['Silver Member', 'Event Attendee'],
    notes: 'Enjoys our Chardonnay and Pinot Noir. Usually purchases 6+ bottles per visit.'
  },
  {
    id: 'contact_7',
    firstName: 'Maria',
    lastName: 'Garcia',
    phoneNumber: '+15557890123',
    email: 'maria.garcia@example.com',
    optIn: true,
    createdAt: generateTimestamp(110, 0, 0),
    updatedAt: generateTimestamp(25, 0, 0),
    lists: ['newsletter'],
    tags: ['Event Attendee'],
    notes: 'Attended several winemaker dinners. Interested in food and wine pairing events.'
  }
];

// Mock templates
export const mockTemplates: MessageTemplate[] = [
  {
    id: 'template_1',
    name: 'Tasting Confirmation',
    content: 'Thank you for booking a tasting with us! Your reservation is confirmed for {date} at {time} for {guests} guests. We look forward to seeing you soon!',
    variables: ['date', 'time', 'guests'],
    category: 'Reservations',
    createdAt: generateTimestamp(90, 0, 0),
    updatedAt: generateTimestamp(30, 0, 0)
  },
  {
    id: 'template_2',
    name: 'Wine Club Pickup Reminder',
    content: 'Hello {name}, your Wine Club {quarter} allocation is ready for pickup! You can visit us any day from 10am-5pm to collect your wines.',
    variables: ['name', 'quarter'],
    category: 'Wine Club',
    createdAt: generateTimestamp(120, 0, 0),
    updatedAt: generateTimestamp(45, 0, 0)
  },
  {
    id: 'template_3',
    name: 'Event Invitation',
    content: 'Join us for our {event} on {date} from {time}! Wine Club members receive {discount}% off tickets. Reply YES to RSVP.',
    variables: ['event', 'date', 'time', 'discount'],
    category: 'Events',
    createdAt: generateTimestamp(60, 0, 0),
    updatedAt: generateTimestamp(20, 0, 0)
  },
  {
    id: 'template_4',
    name: 'Order Confirmation',
    content: 'Thank you for your order! We\'ve processed your purchase of {items}. Your order #{orderNumber} will be ready for pickup or shipped according to your preferences.',
    variables: ['items', 'orderNumber'],
    category: 'Orders',
    createdAt: generateTimestamp(75, 0, 0),
    updatedAt: generateTimestamp(15, 0, 0)
  },
  {
    id: 'template_5',
    name: 'Welcome Message',
    content: 'Welcome to our messaging service! This is how we\'ll communicate about wine orders, events, and special offers. Save this number to stay in touch!',
    variables: [],
    category: 'General',
    createdAt: generateTimestamp(150, 0, 0),
    updatedAt: generateTimestamp(150, 0, 0)
  }
];

// Mock contact lists
export const mockContactLists: ContactList[] = [
  {
    id: 'wine-club',
    name: 'Wine Club Members',
    description: 'All active wine club members',
    contacts: ['contact_1', 'contact_2', 'contact_4', 'contact_6'],
    createdAt: generateTimestamp(180, 0, 0),
    updatedAt: generateTimestamp(10, 0, 0)
  },
  {
    id: 'newsletter',
    name: 'Newsletter Subscribers',
    description: 'Contacts who have opted in to receive our newsletter',
    contacts: ['contact_1', 'contact_3', 'contact_6', 'contact_7'],
    createdAt: generateTimestamp(200, 0, 0),
    updatedAt: generateTimestamp(5, 0, 0)
  },
  {
    id: 'vip',
    name: 'VIP Customers',
    description: 'High-value customers and industry connections',
    contacts: ['contact_4'],
    createdAt: generateTimestamp(150, 0, 0),
    updatedAt: generateTimestamp(30, 0, 0)
  }
];

// Mock campaigns
export const mockCampaigns: BulkMessageCampaign[] = [
  {
    id: 'campaign_1',
    name: 'Summer Wine Release',
    message: 'Our new summer wines are now available! As a valued customer, you have early access to our 2023 Rosé and Sauvignon Blanc. Reply ORDER to reserve yours before the public release.',
    recipients: {
      listIds: ['wine-club', 'vip']
    },
    status: 'completed',
    stats: {
      total: 25,
      sent: 25,
      delivered: 24,
      failed: 1,
      responses: 12
    },
    createdAt: generateTimestamp(45, 0, 0),
    updatedAt: generateTimestamp(44, 0, 0)
  },
  {
    id: 'campaign_2',
    name: 'Harvest Festival Invitation',
    message: 'Join us for our annual Harvest Festival on October 15-16! Wine club members get free entry and a complimentary glass. RSVP by replying YES to this message.',
    recipients: {
      listIds: ['wine-club', 'newsletter']
    },
    status: 'scheduled',
    scheduledTime: generateTimestamp(-30, 0, 0), // 30 days in the future
    createdAt: generateTimestamp(10, 0, 0),
    updatedAt: generateTimestamp(10, 0, 0)
  },
  {
    id: 'campaign_3',
    name: 'Special Holiday Offer',
    message: 'Happy Holidays from our winery family to yours! Enjoy 20% off all orders until December 31st with code HOLIDAY23. Perfect for gifting or stocking up!',
    recipients: {
      listIds: ['wine-club', 'newsletter', 'vip']
    },
    status: 'draft',
    createdAt: generateTimestamp(5, 0, 0),
    updatedAt: generateTimestamp(5, 0, 0)
  }
];