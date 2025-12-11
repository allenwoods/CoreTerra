import { memo } from 'react';
import { LogOut, Settings, User, Mail, Shield, Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useUserContext } from '@/context/UserContext';
import { useTaskContext } from '@/context/TaskContext';

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function UserProfileModal({ open, onOpenChange }: UserProfileModalProps) {
  const { currentUser, getRoleById } = useUserContext();
  const { tasks } = useTaskContext();

  if (!currentUser) {
    return null;
  }

  const role = getRoleById(currentUser.role);

  // Calculate user stats
  const allTasks = [...tasks.inbox, ...tasks.next, ...tasks.waiting, ...tasks.done];
  const userTasks = allTasks.filter(
    (t) => t.creator === currentUser.id || t.role_owner === currentUser.role
  );
  const completedTasks = userTasks.filter((t) => t.status === 'done').length;
  const activeTasks = userTasks.filter((t) => t.status === 'next').length;
  const totalTasks = userTasks.length;

  // Mock XP and level (would come from backend in production)
  const xp = 2450;
  const level = 12;
  const xpToNextLevel = 3000;
  const xpProgress = (xp / xpToNextLevel) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            用户资料
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Avatar & Basic Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback className={currentUser.color}>
                {currentUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{currentUser.name}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                {role?.name || currentUser.role}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  Level {level}
                </Badge>
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                  <Award className="w-3 h-3 mr-1" />
                  {xp} XP
                </Badge>
              </div>
            </div>
          </div>

          {/* XP Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>升级进度</span>
              <span>{xp} / {xpToNextLevel} XP</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>

          <Separator />

          {/* Task Stats */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              任务统计
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{activeTasks}</div>
                <div className="text-xs text-blue-600">进行中</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                <div className="text-xs text-green-600">已完成</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-gray-600">{totalTasks}</div>
                <div className="text-xs text-gray-600">总计</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{currentUser.name.toLowerCase()}@coreterra.io</span>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" disabled>
              <Settings className="w-4 h-4 mr-2" />
              设置
            </Button>
            <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700" disabled>
              <LogOut className="w-4 h-4 mr-2" />
              登出
            </Button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            设置和登出功能将在后端集成后启用
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default memo(UserProfileModal);
