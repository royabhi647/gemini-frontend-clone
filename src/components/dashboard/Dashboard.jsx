import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import { toggleDarkMode } from '../../store/slices/uiSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state) => state.ui);

  useEffect(() => {
    // Apply dark mode on component mount
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <ChatArea />
    </div>
  );
};

export default Dashboard;