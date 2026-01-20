import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { RefreshCcw, ScanLine } from 'lucide-react';

const MainLayout = () => {
  const { user } = useAuth();

  // 1. STATE: Sidebar Collapse
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 2. STATE: Global Loading Indicators (For Dashboard)
  const [isSyncing, setIsSyncing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  return (
    <div className="flex h-screen bg-[#0B0E14] overflow-hidden text-slate-100">

      {/* 3. Pass Control to Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
      />

      {/* 4. Main Content Area */}
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden transition-all duration-300">

        {/* Global Status Bar (Optional: Shows when Syncing/Scanning) */}
        {(isSyncing || isScanning) && (
            <div className="fixed top-0 left-0 w-full h-1 bg-slate-800 z-50">
                <div className="h-full bg-blue-500 animate-progress"></div>
            </div>
        )}

        <div className="p-4 md:p-6 lg:p-8 relative z-10 max-w-[1920px] mx-auto min-h-screen">
           {/* 5. CRITICAL: Pass Context to Children (Dashboard)
              This fixes "useOutletContext" errors in Dashboard.jsx
           */}
           <Outlet context={{
               user,
               isCollapsed,
               isSyncing, setIsSyncing,
               isScanning, setIsScanning
           }} />
        </div>
      </main>

    </div>
  );
};

export default MainLayout;