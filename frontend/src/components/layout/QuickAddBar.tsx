import { useState, useEffect, useRef } from 'react';
import { getIcon } from '@/lib/iconMap';

interface QuickAddBarProps {
  onCommand?: (command: string) => void;
  onExpand?: (initialTitle?: string) => void;
}

export default function QuickAddBar({ onCommand, onExpand }: QuickAddBarProps) {
  const [command, setCommand] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const PlusCircleIcon = getIcon('add_circle');
  const MaximizeIcon = getIcon('open_in_full');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && command.trim()) {
      // Shift+Enter opens full modal with current text
      if (e.shiftKey) {
        onExpand?.(command);
        setCommand('');
      } else {
        onCommand?.(command);
        setCommand('');
      }
    }
  };

  // Global keyboard shortcut: Cmd/Ctrl + K to focus quick add
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Cmd/Ctrl + Shift + N to open full modal
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'n') {
        e.preventDefault();
        onExpand?.();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [onExpand]);

  return (
    <div className="h-14 sm:h-16 border-t border-gray-200 bg-white flex items-center px-3 sm:px-6 gap-2 sm:gap-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
      <div className="flex-1 relative">
        <PlusCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-primary h-5 w-5" />
        <input
          ref={inputRef}
          className="w-full bg-gray-50 border border-gray-200 rounded-lg h-10 pl-10 pr-12 sm:pr-24 text-gray-900 placeholder:text-gray-400 focus:outline-0 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
          placeholder="快速添加任务..."
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <span className="text-xs text-gray-400 hidden lg:inline">⌘⇧N</span>
          <button
            onClick={() => onExpand?.(command || undefined)}
            className="text-gray-400 hover:text-primary p-1 rounded-md hover:bg-gray-100 transition-colors"
            title="展开完整表单 (⌘⇧N)"
          >
            <MaximizeIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
