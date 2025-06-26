import { Chat, Message } from '@/types';

// Chat list data
export const chatsData: Chat[] = [
  {
    factoryId: '1',
    factoryName: 'Khader Leathers',
    lastMessage: 'We can definitely work with your timeline for the holiday collection.',
    timestamp: '2023-11-21T10:35:00',
    unread: 2,
  },
  {
    factoryId: '2',
    factoryName: 'Arora Fine Leathers',
    lastMessage: 'Your sample has been shipped. Tracking details attached.',
    timestamp: '2023-11-20T14:22:00',
    unread: 0,
  },
  {
    factoryId: '3',
    factoryName: 'Mehta Leather Works',
    lastMessage: 'Thank you for your sample request. We\'ll need some clarification on the stitching specifications.',
    timestamp: '2023-11-19T09:40:00',
    unread: 1,
  },
];

// Message conversations data
export const getConversation = (factoryId: string): Message[] => {
  if (factoryId === '1') {
    return [
      {
        id: '101',
        factoryId: '1',
        factoryName: 'Khader Leathers',
        text: 'Hello, we\'ve received your sample request for the crossbody bag design.',
        sender: 'factory',
        timestamp: '2023-11-20T09:30:00',
      },
      {
        id: '102',
        factoryId: '1',
        factoryName: 'Khader Leathers',
        text: 'Would you be able to clarify the hardware finish you\'re looking for?',
        sender: 'factory',
        timestamp: '2023-11-20T09:31:00',
      },
      {
        id: '103',
        factoryId: '1',
        factoryName: 'Khader Leathers',
        text: 'Yes, I\'m looking for an antique brass finish as referenced in the mood board. And do you have the capacity to produce this for our holiday collection?',
        sender: 'user',
        timestamp: '2023-11-20T09:45:00',
      },
      {
        id: '104',
        factoryId: '1',
        factoryName: 'Khader Leathers',
        text: 'Antique brass won\'t be a problem. What timeline are you looking at for the holiday collection?',
        sender: 'factory',
        timestamp: '2023-11-20T10:05:00',
      },
      {
        id: '105',
        factoryId: '1',
        factoryName: 'Khader Leathers',
        text: 'We\'d need finished products by early October. Is that feasible?',
        sender: 'user',
        timestamp: '2023-11-21T10:15:00',
      },
      {
        id: '106',
        factoryId: '1',
        factoryName: 'Khader Leathers',
        text: 'We can definitely work with your timeline for the holiday collection.',
        sender: 'factory',
        timestamp: '2023-11-21T10:35:00',
      },
    ];
  } else if (factoryId === '2') {
    return [
      {
        id: '201',
        factoryId: '2',
        factoryName: 'Arora Fine Leathers',
        text: 'We\'ve started working on your embossed wallet sample.',
        sender: 'factory',
        timestamp: '2023-11-18T13:10:00',
      },
      {
        id: '202',
        factoryId: '2',
        factoryName: 'Arora Fine Leathers',
        text: 'That\'s great! How long do you expect it will take?',
        sender: 'user',
        timestamp: '2023-11-18T13:25:00',
      },
      {
        id: '203',
        factoryId: '2',
        factoryName: 'Arora Fine Leathers',
        text: 'We should have it ready to ship within a week. We\'ll send you progress photos tomorrow.',
        sender: 'factory',
        timestamp: '2023-11-18T13:40:00',
      },
      {
        id: '204',
        factoryId: '2',
        factoryName: 'Arora Fine Leathers',
        text: 'Perfect, looking forward to seeing the progress!',
        sender: 'user',
        timestamp: '2023-11-18T14:05:00',
      },
      {
        id: '205',
        factoryId: '2',
        factoryName: 'Arora Fine Leathers',
        text: 'Your sample has been shipped. Tracking details attached.',
        sender: 'factory',
        timestamp: '2023-11-20T14:22:00',
        attachment: 'https://example.com/tracking.pdf',
      },
    ];
  } else {
    // Default or other factory conversations
    return [
      {
        id: '301',
        factoryId: '3',
        factoryName: 'Mehta Leather Works',
        text: 'Thank you for your sample request. We\'ll need some clarification on the stitching specifications.',
        sender: 'factory',
        timestamp: '2023-11-19T09:40:00',
      },
    ];
  }
};