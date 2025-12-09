import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TaskProvider, useTaskContext } from '@/context/TaskContext';
import { UserProvider } from '@/context/UserContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import KanbanPage from '@/pages/KanbanPage';
import InboxPage from '@/pages/InboxPage';

function AppRoutes() {
  const { createTask } = useTaskContext();

  const handleUserClick = () => {
    console.log('User clicked - UserProfileModal will be implemented in Phase 8');
  };

  const handleQuickAdd = (title: string) => {
    createTask(title);
  };

  const handleCreateFull = () => {
    console.log('Open full create modal');
    // CreateTaskModal will be implemented in Phase 7
  };

  return (
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
  );
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <TaskProvider>
          <AppRoutes />
        </TaskProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
