import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Search, 
  Plus, 
  Menu, 
  X, 
  Moon, 
  Sun, 
  LogOut,
  MessageSquare,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { 
  createChatroom, 
  deleteChatroom, 
  setCurrentChatroom, 
  setSearchQuery 
} from '../../store/slices/chatSlice';
import { toggleDarkMode, toggleSidebar, closeSidebar } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const dispatch = useDispatch();
  const { chatrooms, searchQuery } = useSelector((state) => state.chat);
  const { darkMode, sidebarOpen } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChatroomTitle, setNewChatroomTitle] = useState('');
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [showDropdown, setShowDropdown] = useState(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setSearchQuery(searchInput));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, dispatch]);

  const filteredChatrooms = chatrooms.filter(room =>
    room.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateChatroom = () => {
    if (!newChatroomTitle.trim()) {
      toast.error('Please enter a chatroom title');
      return;
    }

    dispatch(createChatroom({ title: newChatroomTitle.trim() }));
    setNewChatroomTitle('');
    setShowCreateModal(false);
    toast.success('Chatroom created successfully!');
  };

  const handleDeleteChatroom = (chatroomId, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      dispatch(deleteChatroom(chatroomId));
      toast.success('Chatroom deleted successfully!');
    }
    setShowDropdown(null);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      dispatch(logout());
      toast.success('Logged out successfully!');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);

    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => dispatch(closeSidebar())}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Gemini</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => dispatch(toggleDarkMode())}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => dispatch(toggleSidebar())}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search chatrooms..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Create New Chat Button */}
          <div className="px-4 pb-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Chatrooms List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChatrooms.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No chatrooms found' : 'No chatrooms yet'}
              </div>
            ) : (
              <div className="space-y-1 px-2">
                {filteredChatrooms.map((room) => (
                  <div
                    key={room.id}
                    className="relative group"
                  >
                    <button
                      onClick={() => {
                        dispatch(setCurrentChatroom(room));
                        dispatch(closeSidebar());
                      }}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {room.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {room.lastMessage || 'No messages yet'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          <span className="text-xs text-gray-400">
                            {formatTime(room.timestamp)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDropdown(showDropdown === room.id ? null : room.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </button>

                    {/* Dropdown Menu */}
                    {showDropdown === room.id && (
                      <div className="absolute right-2 top-2 mt-8 w-32 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => handleDeleteChatroom(room.id, room.title)}
                          className="w-full text-left px-3 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg flex items-center space-x-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.phoneNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Chatroom Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Chatroom
            </h3>
            <input
              type="text"
              placeholder="Enter chatroom title..."
              value={newChatroomTitle}
              onChange={(e) => setNewChatroomTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateChatroom()}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewChatroomTitle('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateChatroom}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(null)}
        />
      )}
    </>
  );
};

export default Sidebar;