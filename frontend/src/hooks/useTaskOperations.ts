import { useCallback } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import type { Task, TaskStatus } from '@/types/task';

/**
 * Hook that provides common task operations
 * Wraps TaskContext operations with additional logic
 */
export function useTaskOperations() {
  const { updateTask, createTask, deleteTask } = useTaskContext();

  /**
   * Move a task from inbox to the board (next status)
   * Validates required fields before moving
   */
  const moveToBoard = useCallback(
    (task: Task) => {
      if (!task.role_owner || !task.due_date) {
        throw new Error('Task must have role_owner and due_date before moving to board');
      }

      const updatedTask: Task = {
        ...task,
        status: 'next',
        commitment_timestamp: new Date().toISOString(),
      };

      updateTask(updatedTask, `MOVED: ${task.id} moved to board (Next)`);
    },
    [updateTask]
  );

  /**
   * Change task status
   */
  const changeStatus = useCallback(
    (task: Task, newStatus: TaskStatus) => {
      const updatedTask: Task = {
        ...task,
        status: newStatus,
      };

      // Add completion timestamp if moving to done/completed
      if (newStatus === 'done' || newStatus === 'completed') {
        updatedTask.completion_timestamp = new Date().toISOString();
      }

      updateTask(updatedTask, `UPDATE: ${task.id} - Changed status to '${newStatus}'`);
    },
    [updateTask]
  );

  /**
   * Update task field
   */
  const updateField = useCallback(
    (task: Task, field: keyof Task, value: any) => {
      const updatedTask: Task = {
        ...task,
        [field]: value,
      };

      updateTask(updatedTask, `UPDATE: ${task.id} - Changed ${field} to '${value}'`);
    },
    [updateTask]
  );

  return {
    moveToBoard,
    changeStatus,
    updateField,
    createTask,
    deleteTask,
    updateTask,
  };
}
