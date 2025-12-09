import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TaskProvider, useTaskContext } from '@/context/TaskContext';
import { UserProvider } from '@/context/UserContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CreateTaskModal from '@/components/task/CreateTaskModal';
import KanbanPage from '@/pages/KanbanPage';
import InboxPage from '@/pages/InboxPage';

function AppRoutes() {
  const { createTask } = useTaskContext();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalTitle, setCreateModalTitle] = useState('');

  const handleUserClick = () => {
    console.log('User clicked - UserProfileModal will be implemented in Phase 8');
  };

  const handleQuickAdd = (title: string) => {
    createTask(title);
  };

  const handleCreateFull = (initialTitle?: string) => {
    setCreateModalTitle(initialTitle || '');
    setCreateModalOpen(true);
  };

  return (
    <>
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

      <CreateTaskModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        initialTitle={createModalTitle}
      />
    </>
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
