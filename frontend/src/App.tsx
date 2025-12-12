import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TaskProvider, useTaskContext } from '@/context/TaskContext';
import { UserProvider } from '@/context/UserContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CreateTaskModal from '@/components/task/CreateTaskModal';
import UserProfileModal from '@/components/user/UserProfileModal';
import KanbanPage from '@/pages/KanbanPage';
import InboxPage from '@/pages/InboxPage';
import LoginPage from '@/pages/LoginPage';
import SettingsPage from '@/pages/SettingsPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function AppRoutes() {
  const { createTask } = useTaskContext();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createModalTitle, setCreateModalTitle] = useState('');
  const [userModalOpen, setUserModalOpen] = useState(false);

  const handleUserClick = () => {
    setUserModalOpen(true);
  };

  const handleQuickAdd = (title: string) => {
    createTask({ title });
  };

  const handleCreateFull = (initialTitle?: string) => {
    setCreateModalTitle(initialTitle || '');
    setCreateModalOpen(true);
  };

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
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
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <CreateTaskModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        initialTitle={createModalTitle}
      />

      <UserProfileModal
        open={userModalOpen}
        onOpenChange={setUserModalOpen}
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
