import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

let messageIdCounter = 1000;
let chatroomIdCounter = 100;

// Simulate AI response
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatroomId, message, image }) => {
    const userMessage = {
      id: messageIdCounter++,
      text: message,
      image: image,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    // Simulate AI thinking delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

    const aiResponses = [
      "That's an interesting question! Let me help you with that.",
      "I understand what you're asking. Here's my response...",
      "Based on what you've shared, I think...",
      "That's a great point! Let me elaborate on that.",
      "I can help you with that. Here's what I suggest...",
    ];

    const aiMessage = {
      id: messageIdCounter++,
      text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
      sender: 'ai',
      timestamp: new Date().toISOString(),
    };

    return { userMessage, aiMessage, chatroomId };
  }
);

// Load older messages (simulate infinite scroll)
export const loadOlderMessages = createAsyncThunk(
  'chat/loadOlderMessages',
  async ({ chatroomId, offset }) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const olderMessages = Array.from({ length: 10 }, (_, index) => ({
      id: messageIdCounter++,
      text: `Older message ${offset + index + 1}`,
      sender: Math.random() > 0.5 ? 'user' : 'ai',
      timestamp: new Date(Date.now() - (offset + index + 1) * 3600000).toISOString(),
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isTyping = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { userMessage, aiMessage, chatroomId } = action.payload;
        const chatroom = state.chatrooms.find(room => room.id === chatroomId);
        
        if (chatroom) {
          chatroom.messages.push(userMessage, aiMessage);
          chatroom.lastMessage = aiMessage.text;
          chatroom.timestamp = aiMessage.timestamp;
          
          // Move chatroom to top
          state.chatrooms = [chatroom, ...state.chatrooms.filter(room => room.id !== chatroomId)];
          localStorage.setItem('chatrooms', JSON.stringify(state.chatrooms));
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
  copyMessage 
} = chatSlice.actions;
export default chatSlice.reducer;