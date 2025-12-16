import { defineStore } from 'pinia';

type MessageSender = 'user' | 'app' | 'system';

export interface Message {
  id: number;
  content: string;
  sender: MessageSender;
  timestamp: Date;
}

export const useMessageStore = defineStore('message', {
  state: () => ({
    messages: [] as Message[],
    nextId: 1,
  }),

  getters: {
    messageCount: (state) => state.messages.length,
    sentMessages: (state) =>
      state.messages.filter((msg) => msg.sender === 'user'),
    receivedMessages: (state) =>
      state.messages.filter((msg) => msg.sender === 'app'),
    systemMessages: (state) =>
      state.messages.filter((msg) => msg.sender === 'system'),
  },

  actions: {
    addMessage(content: string, sender: MessageSender) {
      const message: Message = {
        id: this.nextId++,
        content,
        sender,
        timestamp: new Date(),
      };
      this.messages.push(message);
      return message;
    },

    clearMessages() {
      this.messages = [];
      this.nextId = 1;
    },

    deleteMessage(id: number) {
      const index = this.messages.findIndex((msg) => msg.id === id);
      if (index !== -1) {
        this.messages.splice(index, 1);
      }
    },
  },
});
