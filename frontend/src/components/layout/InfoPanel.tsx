import { getIcon } from '@/lib/iconMap';

interface InfoPanelProps {
  logs: string[];
  visible: boolean;
  onToggle: () => void;
}

export default function InfoPanel({ logs, visible, onToggle }: InfoPanelProps) {
  const CloseIcon = getIcon('close');

  return (
    <aside
      className={`flex-shrink-0 flex flex-col bg-white border-l border-gray-200 transition-all duration-300 ease-in-out ${
        visible ? 'w-[300px]' : 'w-0 overflow-hidden border-l-0'
      }`}
    >
      <div className="flex-1 p-5 overflow-y-auto w-[300px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Team Status
          </h2>
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Team Status */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Alex: Online</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span>Brenda: In-Focus (API)</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span>Charles: Blocked</span>
          </div>
        </div>

        {/* Activity Log */}
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Activity Log
        </h2>
        <div className="space-y-3">
          {logs.map((log, i) => (
            <div
              key={i}
              className="text-xs text-gray-600 leading-relaxed border-l-2 border-gray-100 pl-3 py-0.5"
            >
              {log}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
