import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, MessageSquare } from 'lucide-react';
import { toggleSidebar } from '../../store/slices/uiSlice';
import MessagesList from './MessagesList';
import MessageInput from './MessageInput';

const ChatArea = () => {
  const dispatch = useDispatch();
  const { currentChatroom } = useSelector((state) => state.chat);

  if (!currentChatroom) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="absolute top-4 left-4 p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Welcome to Gemini
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Select a chatroom to start messaging or create a new one
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentChatroom.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI Assistant
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <MessagesList />

      {/* Message Input */}
      <MessageInput />
    </div>
  );
};

export default ChatArea;