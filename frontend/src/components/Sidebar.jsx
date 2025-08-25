import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import folder from '../assets/softeng2_folder.png';
import settings from '../assets/softeng2_settings.png';
import logout from '../assets/softeng2_logout.png';
import logo from '../assets/sweettreats_logo.png';

const Sidebar = () => {
  const activeBgColor = 'bg-[#F2F2F2]';
  const inactiveTextColor = 'text-[#1D1B20]';

  const [userEmail, setUserEmail] = useState('Loading...');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/profile');
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        
        setUserEmail(data.email);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Applying smaller text size to the error message as well.
        setUserEmail('Error loading email');
      }
    };
    
    fetchUserData();
  }, []);

  return (
    <div className="w-72 bg-white p-4 shadow-lg flex flex-col min-h-screen">
      {/* User Profile Section */}
      <div className="flex flex-col items-center pb-4 mb-4">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center mb-2 shadow-inner">
          <img src = {logo} alt ="User Avatar" className="w-full h-full object-cover" />
        </div>
        <div className="text-center">
          <p className="font-bold text-xl text-gray-800">Welcome!</p>
          <p className="text-[10px] text-gray-500">{userEmail}</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1">
        <ul className="list-none space-y-5 px-3">
          {/* Dashboard Link */}
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 py-2 px-3 rounded-full transition-colors duration-200 no-underline ${inactiveTextColor} hover:bg-[#F2F2F2] ${
                  isActive ? activeBgColor : ''
                }`
              }
            >
              <img src={folder} alt="Dashboard" className="w-[15px] h-[15px]" />
              <span>Dashboard</span>
            </NavLink>
          </li>
          
          {/* Settings Link */}
          <li>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 py-2 px-3 rounded-full transition-colors duration-200 no-underline ${inactiveTextColor} hover:bg-[#F2F2F2] ${
                  isActive ? activeBgColor : ''
                }`
              }
            >
              <img src={settings} alt="Settings" className="w-[15px] h-[15px]" />
              <span>Settings</span>
            </NavLink>
          </li>
          
          {/* Logout Link */}
          <li>
            <NavLink
              to="/logout"
              className={({ isActive }) =>
                `flex items-center gap-3 py-2 px-3 rounded-full transition-colors duration-200 no-underline ${inactiveTextColor} hover:bg-[#F2F2F2] ${
                  isActive ? activeBgColor : ''
                }`
              }
            >
              <img src={logout} alt="Logout" className="w-[15px] h-[15px]" />
              <span>Logout</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;