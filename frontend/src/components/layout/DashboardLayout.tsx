import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import InfoPanel from './InfoPanel';
import QuickAddBar from './QuickAddBar';
import { getIcon } from '@/lib/iconMap';
import { useTaskContext } from '@/context/TaskContext';

interface DashboardLayoutProps {
  onUserClick?: () => void;
  onQuickAdd?: (title: string) => void;
  onCreateFull?: (initialTitle?: string) => void;
}

export default function DashboardLayout({
  onUserClick,
  onQuickAdd,
  onCreateFull,
}: DashboardLayoutProps) {
  const [infoPanelOpen, setInfoPanelOpen] = useState(true);
  const { activityLog } = useTaskContext();
  const PanelLeftIcon = getIcon('dock_to_left');

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Left Sidebar */}
      <Sidebar onUserClick={onUserClick} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile header spacer for menu button */}
        <div className="h-14 md:hidden flex-shrink-0" />

        <div className="flex-1 flex min-h-0 relative">
          {/* Page Content from Routes */}
          <Outlet />

          {/* Toggle Button (when InfoPanel is closed) - hidden on mobile */}
          <div className="absolute right-4 top-4 z-10 hidden lg:block">
            {!infoPanelOpen && (
              <button
                onClick={() => setInfoPanelOpen(true)}
                className="bg-white border border-gray-200 p-2 rounded-md shadow-md text-gray-500 hover:text-primary transition-all"
                title="Show Info Panel"
              >
                <PanelLeftIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Right Info Panel - hidden on mobile */}
          <div className="hidden lg:block">
            <InfoPanel logs={activityLog} visible={infoPanelOpen} onToggle={() => setInfoPanelOpen(!infoPanelOpen)} />
          </div>
        </div>

        {/* Bottom Quick Add Bar */}
        <QuickAddBar onCommand={onQuickAdd} onExpand={onCreateFull} />
      </main>
    </div>
  );
}
