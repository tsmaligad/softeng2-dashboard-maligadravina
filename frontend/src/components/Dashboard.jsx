import React, { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import MainContent from './MainContent.jsx';

const Dashboard = () => {
  // The tasks state is now initialized with an empty array
  const [tasks, setTasks] = useState([]);

  return (
    <div className="flex gap-4 bg-[#F5F5F5] min-h-screen">
      <Sidebar />
      <div className="flex-1 p-4">
        {/* We pass the tasks and the function to update them to MainContent */}
        <MainContent tasks={tasks} setTasks={setTasks} />
      </div>
    </div>
  );
};

export default Dashboard;