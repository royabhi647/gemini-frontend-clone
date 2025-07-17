import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const initializeCounters = () => {
  const storedChatrooms = JSON.parse(localStorage.getItem('chatrooms')) || [];
  let maxMessageId = 1000;
  let maxChatroomId = 100;

  storedChatrooms.forEach(chatroom => {
    if (chatroom.id > maxChatroomId) {
      maxChatroomId = chatroom.id;
    }
    chatroom.messages?.forEach(message => {
      if (message.id > maxMessageId) {
        maxMessageId = message.id;
      }
    });
  });

  return {
    messageIdCounter: maxMessageId + 1,
    chatroomIdCounter: maxChatroomId + 1
  };
};

const { messageIdCounter: initialMessageId, chatroomIdCounter: initialChatroomId } = initializeCounters();

let messageIdCounter = initialMessageId;
let chatroomIdCounter = initialChatroomId;

console.log('Initialized counters - messageId:', messageIdCounter, 'chatroomId:', chatroomIdCounter);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatroomId, message, image }, { dispatch }) => {
    const userMessageId = messageIdCounter++;
    const userMessage = {
      id: userMessageId,
      text: message,
      image: image,
      sender: 'user',
      timestamp: new Date().toISOString(),
      status: 'sending'
    };

    console.log('Adding user message with sending status:', userMessageId);
    dispatch(addMessageWithStatus({ chatroomId, message: userMessage }));

    try {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

      console.log('Updating message status to sent:', userMessageId);
      dispatch(updateMessageStatus({ chatroomId, messageId: userMessageId, status: 'sent' }));

      const aiResponses = [
        "That's an interesting question! Let me help you with that.",
        "I understand what you're asking. Here's my response...",
        "Based on what you've shared, I think...",
        "That's a great point! Let me elaborate on that.",
        "I can help you with that. Here's what I suggest...",
      ];

      const aiMessageId = messageIdCounter++;
      const aiMessage = {
        id: aiMessageId,
        text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        sender: 'ai',
        timestamp: new Date().toISOString(),
        status: 'sent'
      };

      console.log('Created AI message with ID:', aiMessageId);
      return { aiMessage, chatroomId };
    } catch (error) {
      console.error('Error sending message, updating status to failed:', userMessageId);
      dispatch(updateMessageStatus({ chatroomId, messageId: userMessageId, status: 'failed' }));
      throw error;
    }
  }
);

export const loadOlderMessages = createAsyncThunk(
  'chat/loadOlderMessages',
  async ({ chatroomId, offset }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const olderMessages = Array.from({ length: 10 }, (_, index) => ({
      id: messageIdCounter++,
      text: `Older message ${offset + index + 1}`,
      sender: Math.random() > 0.5 ? 'user' : 'ai',
      timestamp: new Date(Date.now() - (offset + index + 1) * 3600000).toISOString(),
      status: 'sent'
    }));

    return { chatroomId, messages: olderMessages };
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chatrooms: JSON.parse(localStorage.getItem('chatrooms')) || [
      {
        id: 1,
        title: 'General Chat',
        lastMessage: 'Hello there!',
        timestamp: new Date().toISOString(),
        messages: [
          {
            id: 1,
            text: 'Hello! How can I help you today?',
            sender: 'ai',
            timestamp: new Date().toISOString(),
            status: 'sent'
          }
        ]
      }
    ],
    currentChatroom: null,
    isTyping: false,
    isLoading: false,
    searchQuery: '',
    hasMoreMessages: true,
  },
  reducers: {
    setCurrentChatroom: (state, action) => {
      state.currentChatroom = action.payload;
    },
    createChatroom: (state, action) => {
      const newChatroom = {
        id: chatroomIdCounter++,
        title: action.payload.title,
        lastMessage: '',
        timestamp: new Date().toISOString(),
        messages: []
      };
      state.chatrooms.unshift(newChatroom);
      localStorage.setItem('chatrooms', JSON.stringify(state.chatrooms));
    },
    deleteChatroom: (state, action) => {
      state.chatrooms = state.chatrooms.filter(room => room.id !== action.payload);
      if (state.currentChatroom?.id === action.payload) {
        state.currentChatroom = null;
      }
      localStorage.setItem('chatrooms', JSON.stringify(state.chatrooms));
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setTyping: (state, action) => {
      state.isTyping = action.payload;
    },
    copyMessage: (state, action) => {
      navigator.clipboard.writeText(action.payload);
    },
    addMessageWithStatus: (state, action) => {
      const { chatroomId, message } = action.payload;
      const chatroom = state.chatrooms.find(room => room.id === chatroomId);

      console.log('Adding message with status:', message.id, message.status);

      if (chatroom) {
        const existingMessage = chatroom.messages.find(msg => msg.id === message.id);
        if (existingMessage) {
          console.warn('Message already exists, skipping:', message.id);
          return;
        }

        chatroom.messages.push(message);
        if (state.currentChatroom?.id === chatroomId) {
          state.currentChatroom = chatroom;
        }
        localStorage.setItem('chatrooms', JSON.stringify(state.chatrooms));
      }
    },
    updateMessageStatus: (state, action) => {
      const { chatroomId, messageId, status } = action.payload;
      const chatroom = state.chatrooms.find(room => room.id === chatroomId);

      console.log('Updating message status:', messageId, 'to:', status);

      if (chatroom) {
        const message = chatroom.messages.find(msg => msg.id === messageId);
        if (message) {
          console.log('Message found, updating status from:', message.status, 'to:', status);
          message.status = status;
        } else {
          console.error('Message not found:', messageId);
        }
        if (state.currentChatroom?.id === chatroomId) {
          state.currentChatroom = chatroom;
        }
        localStorage.setItem('chatrooms', JSON.stringify(state.chatrooms));
      } else {
        console.error('Chatroom not found:', chatroomId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isTyping = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { aiMessage, chatroomId } = action.payload;
        const chatroom = state.chatrooms.find(room => room.id === chatroomId);

        console.log('Adding AI message:', aiMessage.id);

        if (chatroom) {
          const existingAiMessage = chatroom.messages.find(msg => msg.id === aiMessage.id);
          if (existingAiMessage) {
            console.warn('AI message already exists, skipping:', aiMessage.id);
            state.isTyping = false;
            return;
          }

          chatroom.messages.push(aiMessage);
          chatroom.lastMessage = aiMessage.text;
          chatroom.timestamp = aiMessage.timestamp;

          state.chatrooms = [chatroom, ...state.chatrooms.filter(room => room.id !== chatroomId)];
          localStorage.setItem('chatrooms', JSON.stringify(state.chatrooms));

          if (state.currentChatroom?.id === chatroomId) {
            state.currentChatroom = chatroom;
          }
        }
        state.isTyping = false;
      })
      .addCase(sendMessage.rejected, (state) => {
        state.isTyping = false;
      })
      .addCase(loadOlderMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadOlderMessages.fulfilled, (state, action) => {
        const { chatroomId, messages } = action.payload;
        const chatroom = state.chatrooms.find(room => room.id === chatroomId);

        if (chatroom) {
          chatroom.messages = [...messages, ...chatroom.messages];
          localStorage.setItem('chatrooms', JSON.stringify(state.chatrooms));
        }
        state.isLoading = false;
        state.hasMoreMessages = messages.length === 10;
      })
      .addCase(loadOlderMessages.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const {
  setCurrentChatroom,
  createChatroom,
  deleteChatroom,
  setSearchQuery,
  setTyping,
  copyMessage,
  addMessageWithStatus,
  updateMessageStatus
} = chatSlice.actions;
export default chatSlice.reducer;