import React, { useState } from 'react';

const CreateTaskModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    taskName: '',
    description: '',
    priority: '',
    status: '',
    assignedTo: '',
    dueDate: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#333333] text-white p-8 rounded-md w-full max-w-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl text-white font-bold">Create New Task</h2>
          <button onClick={onClose} className="text-white hover:text-gray-400 text-3xl font-light leading-none">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="taskName" className="mb-1 text-sm text-gray-400">Task Name</label>
            <input 
              type="text" id="taskName" value={formData.taskName} onChange={handleChange}
              className="bg-[#444444] text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="description" className="mb-1 text-sm text-gray-400">Description</label>
            <textarea 
              id="description" value={formData.description} onChange={handleChange}
              className="bg-[#444444] text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="priority" className="mb-1 text-sm text-gray-400">Priority</label>
              <select id="priority" value={formData.priority} onChange={handleChange}
                className="bg-[#444444] text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select a priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="status" className="mb-1 text-sm text-gray-400">Status</label>
              <select id="status" value={formData.status} onChange={handleChange}
                className="bg-[#444444] text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select a status</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="assignedTo" className="mb-1 text-sm text-gray-400">Assigned to</label>
              <input 
                type="text" id="assignedTo" value={formData.assignedTo} onChange={handleChange}
                className="bg-[#444444] text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="dueDate" className="mb-1 text-sm text-gray-400">Due Date</label>
              <input 
                type="date" id="dueDate" value={formData.dueDate} onChange={handleChange}
                className="bg-[#444444] text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-gray-200 text-black font-semibold py-2 px-6 rounded-md hover:bg-gray-300 transition-colors">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
