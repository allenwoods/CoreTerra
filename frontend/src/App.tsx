import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import KanbanPage from '@/pages/KanbanPage';
import InboxPage from '@/pages/InboxPage';

function App() {
  const handleUserClick = () => {
    console.log('User clicked - UserProfileModal will be implemented in Phase 8');
  };

  const handleQuickAdd = (title: string) => {
    console.log('Quick add task:', title);
    // Task creation will be implemented in Phase 7
  };

  const handleCreateFull = () => {
    console.log('Open full create modal');
    // CreateTaskModal will be implemented in Phase 7
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <DashboardLayout
              onUserClick={handleUserClick}
              onQuickAdd={handleQuickAdd}
              onCreateFull={handleCreateFull}
            />
          }
        >
          <Route path="/" element={<KanbanPage />} />
          <Route path="/inbox" element={<InboxPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
