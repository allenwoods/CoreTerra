import { useState } from 'react';
import { getIcon } from '@/lib/iconMap';

interface QuickAddBarProps {
  onCommand?: (command: string) => void;
  onExpand?: () => void;
}

export default function QuickAddBar({ onCommand, onExpand }: QuickAddBarProps) {
  const [command, setCommand] = useState('');
  const PlusCircleIcon = getIcon('add_circle');
  const MaximizeIcon = getIcon('open_in_full');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && command.trim()) {
      onCommand?.(command);
      setCommand('');
    }
  };

  return (
    <div className="h-16 border-t border-gray-200 bg-white flex items-center px-6 gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
      <div className="flex-1 relative">
        <PlusCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-primary h-5 w-5" />
        <input
          className="w-full bg-gray-50 border border-gray-200 rounded-lg h-10 pl-10 pr-12 text-gray-900 placeholder:text-gray-400 focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
          placeholder="Quick add task to Inbox..."
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={() => onExpand?.()}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary p-1 rounded-md hover:bg-gray-100 transition-colors"
        >
          <MaximizeIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
