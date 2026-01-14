import { Message, Thread } from "~~/types/messages";

export const MOCK_THREADS: Thread[] = [
  {
    id: "1",
    participant: {
      id: "user1",
      name: "Alex Rivers",
      handle: "@alexrivers",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      isVerified: true,
    },
    lastMessage: "Thanks for the amazing content! 🔥",
    timestamp: "2m",
    unreadCount: 2,
  },
  {
    id: "2",
    participant: {
      id: "user2",
      name: "Sarah Chen",
      handle: "@sarahchen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      isVerified: true,
    },
    lastMessage: "Would love to collaborate sometime!",
    timestamp: "15m",
    unreadCount: 0,
  },
  {
    id: "3",
    participant: {
      id: "user3",
      name: "Mike Johnson",
      handle: "@mikej",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    },
    lastMessage: "Hey, when's the next exclusive drop?",
    timestamp: "1h",
    unreadCount: 1,
  },
  {
    id: "4",
    participant: {
      id: "user4",
      name: "Emma Wilson",
      handle: "@emmaw",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
      isVerified: true,
    },
    lastMessage: "Just subscribed to your premium tier!",
    timestamp: "3h",
    unreadCount: 0,
  },
  {
    id: "5",
    participant: {
      id: "user5",
      name: "David Park",
      handle: "@davidp",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    },
    lastMessage: "The tutorial was super helpful, thanks!",
    timestamp: "1d",
    unreadCount: 0,
  },
];

export const MOCK_MESSAGES: Message[] = [
  {
    id: "m1",
    text: "Hey! I just wanted to say your content has been amazing lately!",
    timestamp: "10:30 AM",
    isMe: false,
  },
  {
    id: "m2",
    text: "Thank you so much! That really means a lot to me 💜",
    timestamp: "10:32 AM",
    isMe: true,
  },
  {
    id: "m3",
    text: "I especially loved the behind-the-scenes stuff you posted last week",
    timestamp: "10:33 AM",
    isMe: false,
  },
  {
    id: "m4",
    text: "Oh nice! I'm planning to do more of those. Any specific topics you'd like to see?",
    timestamp: "10:35 AM",
    isMe: true,
  },
  {
    id: "m5",
    text: "Maybe something about your creative process? How you come up with ideas and stuff",
    timestamp: "10:36 AM",
    isMe: false,
  },
  {
    id: "m6",
    text: "That's a great idea! I'll definitely add that to my content calendar",
    timestamp: "10:38 AM",
    isMe: true,
  },
  {
    id: "m7",
    text: "Thanks for the amazing content! 🔥",
    timestamp: "10:40 AM",
    isMe: false,
  },
];
