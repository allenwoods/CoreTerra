export default function InboxPage() {
  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
      <div className="px-8 py-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
        <p className="text-gray-500 text-sm mt-1">Review and process new tasks. Fill in mandatory fields to move them to the board.</p>
      </div>
      <div className="flex-1 flex items-center justify-center bg-gray-50/30">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Inbox View Coming Soon</h2>
          <p className="text-gray-500 mb-4">Phase 6: InboxPage with task list and processing workflow</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Try the quick add bar at the bottom!
          </div>
        </div>
      </div>
    </div>
  );
}
