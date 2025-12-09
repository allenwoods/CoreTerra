import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { getIcon } from '@/lib/iconMap';

interface NavLinkProps {
  icon: string;
  text: string;
  to: string;
  active?: boolean;
}

const NavLink = ({ icon, text, to, active = false }: NavLinkProps) => {
  const Icon = getIcon(icon);

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 cursor-pointer rounded-md transition-colors ${
        active
          ? 'bg-gray-100 text-gray-900 font-medium'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon className="h-5 w-5" />
      <p className="text-sm">{text}</p>
    </Link>
  );
};

interface NavGroupProps {
  color: string;
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const NavGroup = ({ color, title, children, defaultExpanded = true }: NavGroupProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const ChevronRight = getIcon('chevron_right');
  const ChevronDown = getIcon('expand_more');
  const Icon = expanded ? ChevronDown : ChevronRight;

  return (
    <div className="flex flex-col gap-0.5">
      <div
        className="flex items-center gap-2 py-1.5 px-2 cursor-pointer hover:bg-gray-100 rounded-md"
        onClick={() => setExpanded(!expanded)}
      >
        <Icon className="h-[18px] w-[18px] text-gray-400" />
        <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
        <p className="text-gray-700 text-sm font-medium">{title}</p>
      </div>
      {expanded && <div className="pl-9 flex flex-col gap-0.5">{children}</div>}
    </div>
  );
};

interface NavSubItemProps {
  color: string;
  text: string;
}

const NavSubItem = ({ color, text }: NavSubItemProps) => (
  <div className="flex items-center gap-2 py-1 px-2 hover:bg-gray-100 rounded-md cursor-pointer">
    <div className={`w-2 h-2 rounded-full ${color}`}></div>
    <p className="text-gray-600 text-sm">{text}</p>
  </div>
);

interface SidebarProps {
  onUserClick?: () => void;
}

export default function Sidebar({ onUserClick }: SidebarProps) {
  const location = useLocation();
  const FolderIcon = getIcon('folder_managed');
  const SettingsIcon = getIcon('settings');
  const HelpIcon = getIcon('help');

  return (
    <aside className="w-[260px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* User Info Section */}
      <div className="p-4 border-b border-gray-100 flex items-center gap-3">
        <div
          className="bg-center bg-no-repeat bg-cover w-10 h-10 rounded-full bg-gray-200 border border-gray-100 shadow-sm cursor-pointer hover:ring-2 ring-primary transition-all"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDSOR72eK1H5cCfSa1I3VSaTQGtjYThNG9XIAbrPmHmFGdwj00ApRaoTp5Thj60nEoKEszuJwFg5I_T1xNWHmuBA5dTPbJxhBlQeksRAA8fXppcaZQEAnayvUoputQ0j8H5kRMKpnLtwG51hcZPEMZq-ijB2VVeRl3yxDmQU4x5oMoL-rpqbRiGe1AKLw7NH3sSbrD-RLgacDfcn4Hh-LaOER-CuWCCK0Klz7i97I48cXYBCuj3HDs_xqM-R-8IdlhlKq0gt9QIMEYB")',
          }}
          onClick={() => onUserClick?.()}
        ></div>
        <div className="flex flex-col">
          <h1 className="text-gray-900 font-semibold text-sm">CoreTerra</h1>
          <p className="text-gray-500 text-xs">Level 5 (250/500 XP)</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col gap-1 p-3">
        <NavLink icon="dashboard" text="Kanban" to="/" active={location.pathname === '/'} />
        <NavLink icon="inbox" text="Inbox" to="/inbox" active={location.pathname === '/inbox'} />

        <button className="flex items-center gap-3 px-3 py-2 cursor-pointer rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900">
          <FolderIcon className="h-5 w-5" />
          <p className="text-sm">Role Index</p>
        </button>

        {/* Role Groups */}
        <div className="flex flex-col gap-1 mt-4">
          <NavGroup color="bg-green-500" title="Project Lead" defaultExpanded={true}>
            <NavSubItem color="bg-green-500" text="Brenda" />
          </NavGroup>
          <NavGroup color="bg-red-500" title="Backend Dev" defaultExpanded={true}>
            <NavSubItem color="bg-red-500" text="Charles" />
            <NavSubItem color="bg-green-500" text="David" />
          </NavGroup>
        </div>
      </div>

      {/* Bottom Settings */}
      <div className="mt-auto flex flex-col gap-1 p-3 border-t border-gray-100">
        <button className="flex items-center gap-3 px-3 py-2 cursor-pointer rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900">
          <SettingsIcon className="h-5 w-5" />
          <p className="text-sm">Settings</p>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 cursor-pointer rounded-md transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900">
          <HelpIcon className="h-5 w-5" />
          <p className="text-sm">Help</p>
        </button>
      </div>
    </aside>
  );
}
