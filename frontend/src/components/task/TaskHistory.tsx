import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, History } from 'lucide-react';
import { getTaskHistory } from '@/lib/api';
import type { TaskHistoryItem } from '@/types/task';

interface TaskHistoryProps {
  taskId: string;
}

export function TaskHistory({ taskId }: TaskHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<TaskHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && history.length === 0) {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await getTaskHistory(taskId, 50);
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-t border-gray-200 pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        <div className="flex items-center gap-2">
          <History className="h-4 w-4" />
          <span>Change History</span>
          {history.length > 0 && (
            <span className="text-xs text-gray-500">({history.length})</span>
          )}
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2">
          {isLoading ? (
            <div className="text-sm text-gray-500 italic">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="text-sm text-gray-500 italic">No history available</div>
          ) : (
            <div className="space-y-1">
              {history.map((item) => (
                <div
                  key={item.commit_hash}
                  className="text-xs text-gray-600 bg-gray-50 p-2 rounded border-l-2 border-gray-300 hover:bg-gray-100 transition-colors"
                  title={`${item.author_name} <${item.author_email}>\nCommit: ${item.commit_hash}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="flex-1 font-mono text-gray-700">{item.message}</span>
                    <span className="text-gray-500 whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
