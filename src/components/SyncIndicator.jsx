import React from 'react';
import { RefreshCcw } from 'lucide-react';

const SyncIndicator = ({ isSyncing }) => {
  if (!isSyncing) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg shadow-blue-900/40 flex items-center gap-2 animate-bounce transition-all">
      <RefreshCcw size={14} className="animate-spin" />
      <span className="text-[10px] font-black uppercase tracking-widest">Syncing Live INR Data...</span>
    </div>
  );
};

export default SyncIndicator;