import React from 'react';

const Modal = ({ isOpen, title, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm fade-in">
      <div className="bg-gray-900 neon-border rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
             <i className="ph ph-x text-xl"></i>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;