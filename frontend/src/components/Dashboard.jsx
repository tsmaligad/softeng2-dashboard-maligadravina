import React from "react";
import Sidebar from "./Sidebar.jsx";

const Dashboard = () => {
  return (
    <div className="flex gap-4 bg-[#F5F5F5] min-h-screen">
      <Sidebar />
      <div className="flex-1 p-4 flex items-center justify-center">
        <h1 className="text-3xl font-bold text-[#332601]">Coming Soon</h1>
      </div>
    </div>
  );
};

export default Dashboard;
