import { useState } from 'react';
import { Bell, Filter, Palette } from 'lucide-react';
import NotificationSettings from '@/components/settings/NotificationSettings';
import FilterSettings from '@/components/settings/FilterSettings';
import AppearanceSettings from '@/components/settings/AppearanceSettings';

type SettingsTab = 'notifications' | 'filters' | 'appearance';

interface TabConfig {
  id: SettingsTab;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const tabs: TabConfig[] = [
  {
    id: 'notifications',
    label: '通知',
    icon: <Bell className="w-4 h-4" />,
    component: <NotificationSettings />,
  },
  {
    id: 'filters',
    label: '过滤器',
    icon: <Filter className="w-4 h-4" />,
    component: <FilterSettings />,
  },
  {
    id: 'appearance',
    label: '外观',
    icon: <Palette className="w-4 h-4" />,
    component: <AppearanceSettings />,
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('notifications');

  const activeTabConfig = tabs.find((t) => t.id === activeTab);

  return (
    <div className="flex-1 flex min-h-0 bg-white">
      {/* Left Navigation */}
      <nav className="w-56 flex-shrink-0 border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">设置</h2>
        <ul className="space-y-1">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Right Content Area */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl">
          {activeTabConfig?.component}
        </div>
      </main>
    </div>
  );
}
