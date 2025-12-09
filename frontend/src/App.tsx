import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import KanbanPage from '@/pages/KanbanPage';
import InboxPage from '@/pages/InboxPage';

function App() {
  return (
    <BrowserRouter>
      <div className="h-screen w-full bg-gray-50">
        <Routes>
          <Route path="/" element={<KanbanPage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
