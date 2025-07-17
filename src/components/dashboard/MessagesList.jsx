import React, { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Copy, Image as ImageIcon, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { loadOlderMessages, copyMessage } from '../../store/slices/chatSlice';
import toast from 'react-hot-toast';

const MessagesList = () => {
  const dispatch = useDispatch();
  const { currentChatroom, isTyping, isLoading, hasMoreMessages } = useSelector((state) => state.chat);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [hoveredMessage, setHoveredMessage] = React.useState(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentChatroom?.messages, isTyping, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container || isLoading || !hasMoreMessages) return;

    if (container.scrollTop === 0) {
      const currentScrollHeight = container.scrollHeight;
      dispatch(loadOlderMessages({
        chatroomId: currentChatroom.id,
        offset: currentChatroom.messages.length
      })).then(() => {
        setTimeout(() => {
          container.scrollTop = container.scrollHeight - currentScrollHeight;
        }, 100);
      });
    }
  }, [dispatch, currentChatroom, isLoading, hasMoreMessages]);

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Message copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy message');
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    console.log('Message status:', status);
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'failed':
        return <XCircle className="w-3 h-3 text-red-500" />;
      default:
        return <CheckCircle className="w-3 h-3 text-green-500" />;
    }
  };

  if (!currentChatroom) return null;

  return (
    <div
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {isLoading && (
        <div className="text-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-gray-500 mx-auto" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Loading older messages...</p>
        </div>
      )}

      {currentChatroom.messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          onMouseEnter={() => setHoveredMessage(message.id)}
          onMouseLeave={() => setHoveredMessage(null)}
        >
          <div className={`relative max-w-xs lg:max-w-md xl:max-w-lg ${message.sender === 'user' ? 'order-2' : 'order-1'
            }`}>
            <div className={`rounded-2xl px-4 py-2 ${message.sender === 'user'
                ? `bg-indigo-600 text-white ${message.status === 'sending' ? 'opacity-70' : ''}`
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}>
              {message.image && (
                <div className="mb-2">
                  <img
                    src={message.image}
                    alt="Uploaded"
                    className="max-w-full rounded-lg"
                  />
                </div>
              )}

              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
            </div>

            <div className={`flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 mt-1 ${message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}>
              <span>{formatTime(message.timestamp)}</span>
              {message.sender === 'user' && (
                <span className="flex items-center">
                  {console.log('Rendering message:', message.id, 'status:', message.status)}
                  {getStatusIcon(message.status)}
                  {(message.status === 'sending' || message.status === undefined) && <Loader2 className="w-3 h-3 animate-spin text-gray-400 ml-1" />}
                </span>
              )}
            </div>

            {hoveredMessage === message.id && (
              <button
                onClick={() => handleCopyMessage(message.text)}
                className={`absolute top-0 p-1 bg-gray-800 text-white rounded-full opacity-75 hover:opacity-100 transition-opacity ${message.sender === 'user' ? '-left-8' : '-right-8'
                  }`}
                title="Copy message"
              >
                <Copy className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${message.sender === 'user'
              ? 'bg-indigo-600 text-white order-1 mr-2'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 order-2 ml-2'
            }`}>
            {message.sender === 'user' ? 'U' : 'AI'}
          </div>
        </div>
      ))}

      {isTyping && (
        <div className="flex justify-start">
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-300 mr-2">
            AI
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2 max-w-xs">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Gemini is typing...</p>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;