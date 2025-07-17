import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, Image as ImageIcon, X } from 'lucide-react';
import { sendMessage } from '../../store/slices/chatSlice';
import toast from 'react-hot-toast';

const MessageInput = () => {
  const dispatch = useDispatch();
  const { currentChatroom, isTyping } = useSelector((state) => state.chat);
  const [message, setMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const textAreaRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(file);
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() && !selectedImage) {
      return;
    }

    if (!currentChatroom) {
      toast.error('Please select a chatroom');
      return;
    }

    try {
      await dispatch(sendMessage({
        chatroomId: currentChatroom.id,
        message: message.trim(),
        image: imagePreview
      })).unwrap();

      setMessage('');
      removeImage();
      
      // Reset textarea height
      if (textAreaRef.current) {
        textAreaRef.current.style.height = 'auto';
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextAreaResize = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${Math.min(textAreaRef.current.scrollHeight, 120)}px`;
    }
  };

  if (!currentChatroom) return null;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-4 relative inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-w-32 max-h-32 rounded-lg border border-gray-300 dark:border-gray-600"
          />
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* Image Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textAreaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTextAreaResize();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isTyping}
            className="w-full resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!message.trim() && !selectedImage) || isTyping}
          className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
};

export default MessageInput;