import { memo } from 'react';

interface TaskCardSkeletonProps {
  count?: number;
}

function TaskCardSkeleton({ count = 3 }: TaskCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm skeleton-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {/* Title skeleton */}
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />

          {/* Metadata skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 bg-gray-200 rounded w-12" />
              <div className="h-4 bg-gray-200 rounded-full w-8" />
            </div>
            <div className="w-6 h-6 bg-gray-200 rounded-full" />
          </div>
        </div>
      ))}
    </>
  );
}

export default memo(TaskCardSkeleton);
