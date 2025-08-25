import React, { useState } from 'react';
import CreateTaskModal from './CreateTaskModal.jsx';

const MainContent = ({ tasks, setTasks }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="flex-1 bg-[#F5F5F5] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl text-gray-800">Dashboard</h1>
          <h2 className="text-lg text-gray-600 mt-2">Tasks</h2>
        </div>
        <button 
          onClick={openModal}
          className="flex items-center gap-2 bg-[#1D1B20] text-white px-4 py-2 rounded-full font-bold text-sm mr-4"
        >
          <span>Create task</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white p-4 rounded-[15px] shadow-md flex-1">
        <div className="grid grid-cols-6 gap-4 font-semibold text-gray-500 border-b pb-2 mb-2">
          <div>Priority</div>
          <div>Tasks</div>
          <div>Description</div>
          <div>Status</div>
          <div>Assigned to</div>
          <div>Due Date</div>
        </div>

        {/* Render tasks */}
        {tasks.map((task, idx) => (
          <div key={idx} className="grid grid-cols-6 gap-4 py-2 border-b text-gray-700">
            <div>{task.priority}</div>
            <div>{task.taskName}</div>
            <div>{task.description}</div>
            <div>{task.status}</div>
            <div>{task.assignedTo}</div>
            <div>{task.dueDate}</div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <CreateTaskModal 
          onClose={closeModal} 
          onSubmit={(newTask) => {
            setTasks([...tasks, newTask]);
            closeModal();
          }}
        />
      )}
    </div>
  );
};

export default MainContent;
