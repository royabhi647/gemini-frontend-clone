// README.md content
# Gemini Frontend Clone

A fully functional, responsive, and visually appealing frontend for a Gemini-style conversational AI chat application built with React and Redux Toolkit.

## 🚀 Features

### Authentication
- OTP-based login/signup with country code selection
- Form validation using React Hook Form + Zod
- Simulated OTP verification (use `123456` for demo)
- Country data fetched from external API

### Dashboard
- Responsive sidebar with chatroom management
- Create and delete chatrooms with confirmation
- Debounced search to filter chatrooms
- Dark mode toggle with persistence

### Chat Interface
- Real-time chat simulation with AI responses
- Typing indicators ("Gemini is typing...")
- Auto-scroll to latest messages
- Reverse infinite scroll for older messages
- Image upload support (drag & drop, preview)
- Copy-to-clipboard on message hover
- Message timestamps

### UX Features
- Mobile-responsive design
- Toast notifications for all actions
- Loading skeletons and states
- Keyboard accessibility
- LocalStorage persistence
- Throttled AI responses for realism

## 🛠️ Tech Stack

- **Framework**: React 18
- **State Management**: Redux Toolkit
- **Form Validation**: React Hook Form + Zod
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Routing**: React Router DOM

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gemini-frontend-clone
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── AuthPage.jsx
│   │   ├── LoginForm.jsx
│   │   └── OTPForm.jsx
│   └── dashboard/
│       ├── Dashboard.jsx
│       ├── Sidebar.jsx
│       ├── ChatArea.jsx
│       ├── MessagesList.jsx
│       └── MessageInput.jsx
├── store/
│   ├── index.js
│   └── slices/
│       ├── authSlice.js
│       ├── chatSlice.js
│       └── uiSlice.js
├── hooks/
│   └── useDebounce.js
├── utils/
│   ├── storage.js
│   ├── constants.js
│   └── helpers.js
├── App.js
├── index.js
└── index.css
```

## 🔧 Configuration

### Environment Variables
No environment variables required for basic functionality. The app uses:
- REST Countries API for country data
- LocalStorage for data persistence
- Simulated API calls with setTimeout

### Customization
- Modify AI responses in `utils/constants.js`
- Adjust theme colors in `tailwind.config.js`
- Update typing delays and animations in component files

## 🎯 Key Implementations

### Form Validation
```javascript
const loginSchema = z.object({
  countryCode: z.string().min(1, 'Please select a country'),
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\d+$/, 'Phone number can only contain digits'),
});
```

### Throttled AI Responses
```javascript
const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatroomId, message, image }) => {
    // Simulate AI thinking delay
    await new Promise(resolve => 
      setTimeout(resolve, Math.random() * 2000 + 1000)
    );
    // ... AI response logic
  }
);
```

### Infinite Scroll Implementation
```javascript
const handleScroll = useCallback(() => {
  const container = messagesContainerRef.current;
  if (container.scrollTop === 0 && hasMoreMessages) {
    dispatch(loadOlderMessages({ 
      chatroomId: currentChatroom.id, 
      offset: currentChatroom.messages.length 
    }));
  }
}, [dispatch, currentChatroom, hasMoreMessages]);
```

### Debounced Search
```javascript
useEffect(() => {
  const timer = setTimeout(() => {
    dispatch(setSearchQuery(searchInput));
  }, 300);
  return () => clearTimeout(timer);
}, [searchInput, dispatch]);
```

## 🚀 Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy to Vercel:
```bash
npm i -g vercel
vercel --prod
```

Or deploy to Netlify by dragging the `build` folder to Netlify's deploy interface.

## 🔐 Demo Credentials

- **Phone Number**: Any valid number with country code
- **OTP**: `123456` (for demo purposes)

## 🎨 Features Showcase

- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Mode**: Toggle between light and dark themes
- **Real-time Feel**: Typing indicators and smooth animations
- **Image Support**: Upload and preview images in chat
- **Accessibility**: Keyboard navigation and screen reader support
- **Performance**: Optimized with lazy loading and efficient state management

## 📱 Mobile Experience

The app is fully responsive with:
- Collapsible sidebar for mobile
- Touch-friendly interface
- Optimized chat bubbles
- Mobile-first design approach

## 🙏 Acknowledgments

- REST Countries API for country data
- Tailwind CSS for styling
- Lucide React for icons
- React ecosystem for robust tooling