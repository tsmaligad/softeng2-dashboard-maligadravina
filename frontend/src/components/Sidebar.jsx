import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import folder from '../assets/softeng2_folder.png';
import settings from '../assets/softeng2_settings.png';
import logoutIcon from '../assets/softeng2_logout.png';
import logo from '../assets/sweettreats_logo.png';
import { api } from '../utils/api'; // ✅ make sure api.logout points to backend/logout.php

const Sidebar = () => {
  const [userEmail, setUserEmail] = useState('Loading...');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) throw new Error('Failed to fetch user data');
        const data = await response.json();
        setUserEmail(data.email);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setUserEmail('Error loading email');
      }
    })();
  }, []);

  const baseItem =
    'flex items-center gap-3 py-2 px-3 rounded-full transition-colors duration-200 no-underline text-[#1D1B20] hover:bg-[#F2F2F2]';

  async function handleLogout(e) {
    e.preventDefault();
    try {
      await api.logout(); // ✅ clear session on backend
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      navigate('/'); // ✅ go back to homepage
    }
  }

  return (
    <div className="w-72 bg-white p-4 shadow-lg flex flex-col min-h-screen">
      {/* User Profile Section */}
      <div className="flex flex-col items-center pb-4 mb-4">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center mb-2 shadow-inner">
          <img src={logo} alt="User Avatar" className="w-full h-full object-cover" />
        </div>
        <div className="text-center">
          <p className="font-bold text-xl text-gray-800">Welcome!</p>
          <p className="text-[10px] text-gray-500">{userEmail}</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1">
        <ul className="list-none space-y-5 px-3">
          <li>
            <NavLink
              to="/admin-dashboard"  // ✅ fixed
              className={({ isActive }) =>
                `${baseItem} ${isActive ? 'bg-[#F2F2F2]' : ''}`
              }
            >
              <img src={folder} alt="Dashboard" className="w-[15px] h-[15px]" />
              <span>Dashboard</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/userlist"  // ✅ matches your App.jsx
              className={({ isActive }) =>
                `${baseItem} ${isActive ? 'bg-[#F2F2F2]' : ''}`
              }
            >
              <img src={folder} alt="Users" className="w-[15px] h-[15px]" />
              <span>User List</span>
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `${baseItem} ${isActive ? 'bg-[#F2F2F2]' : ''}`
              }
            >
              <img src={settings} alt="Settings" className="w-[15px] h-[15px]" />
              <span>Settings</span>
            </NavLink>
          </li>

          {/* Logout button without border */}
          <li>
            <button
              onClick={handleLogout}
              className={`${baseItem} w-full text-left bg-transparent border-none`}
              style={{ border: 'none', outline: 'none' }}
            >
              <img src={logoutIcon} alt="Logout" className="w-[15px] h-[15px]" />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
