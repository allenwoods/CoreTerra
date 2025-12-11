import { useState, useEffect } from 'react';
import { User, Settings } from 'lucide-react';
import { useUserContext } from '@/context/UserContext';
import { checkHealth } from '@/lib/api';

type SettingsTab = 'profile' | 'config';

interface TabConfig {
  id: SettingsTab;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const UserProfileSettings = () => {
  const { currentUser } = useUserContext();

  if (!currentUser) return <div>Please login to view profile.</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900">User Profile</h3>
      <div className="flex items-center gap-6">
        <div
            className="bg-center bg-no-repeat bg-cover w-24 h-24 rounded-full bg-gray-200 border border-gray-100 shadow-sm"
            style={{
              backgroundImage: `url("${currentUser.avatar}")`,
            }}
        ></div>
        <div>
          <h4 className="text-xl font-bold text-gray-900">{currentUser.name}</h4>
          <p className="text-gray-500">{currentUser.email}</p>
          <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {currentUser.role}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">User ID</dt>
            <dd className="mt-1 text-sm text-gray-900">{currentUser.id}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Role ID</dt>
            <dd className="mt-1 text-sm text-gray-900">{currentUser.role}</dd>
          </div>
           <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Level</dt>
            <dd className="mt-1 text-sm text-gray-900">{currentUser.level}</dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Experience</dt>
            <dd className="mt-1 text-sm text-gray-900">{currentUser.experience} XP</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

const AppConfigSettings = () => {
  const [apiVersion, setApiVersion] = useState<string>('Loading...');
  const [healthStatus, setHealthStatus] = useState<string>('Checking...');

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await checkHealth();
        setHealthStatus(data.status);
        setApiVersion(data.version || 'Unknown');
      } catch (e) {
        setHealthStatus('Unreachable');
        setApiVersion('Unknown');
      }
    };
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900">System Configuration</h3>
      <div className="border-t border-gray-200 pt-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">API Backend URL</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
              {import.meta.env.VITE_API_URL || 'http://localhost:8000'}
            </dd>
          </div>
          <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500">Backend Version</dt>
            <dd className="mt-1 text-sm text-gray-900">{apiVersion}</dd>
          </div>
          <div className="sm:col-span-1">
             <dt className="text-sm font-medium text-gray-500">System Status</dt>
            <dd className="mt-1 text-sm text-gray-900 flex items-center gap-2">
               <span className={`w-2.5 h-2.5 rounded-full ${healthStatus === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}></span>
               {healthStatus}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs: TabConfig[] = [
    {
      id: 'profile',
      label: 'User Info',
      icon: <User className="w-4 h-4" />,
      component: <UserProfileSettings />,
    },
    {
      id: 'config',
      label: 'App Config',
      icon: <Settings className="w-4 h-4" />,
      component: <AppConfigSettings />,
    },
  ];

  const activeTabConfig = tabs.find((t) => t.id === activeTab);

  return (
    <div className="flex-1 flex min-h-0 bg-white">
      {/* Left Navigation */}
      <nav className="w-56 flex-shrink-0 border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Settings</h2>
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
