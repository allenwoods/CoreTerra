import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, Mail, Users } from 'lucide-react';

interface NotificationOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  defaultEnabled: boolean;
}

const notificationOptions: NotificationOption[] = [
  {
    id: 'email',
    label: '邮件通知',
    description: '通过邮件接收重要任务更新和提醒',
    icon: <Mail className="w-5 h-5" />,
    defaultEnabled: true,
  },
  {
    id: 'taskReminder',
    label: '任务提醒',
    description: '在任务截止日期前收到提醒通知',
    icon: <Bell className="w-5 h-5" />,
    defaultEnabled: true,
  },
  {
    id: 'teamActivity',
    label: '团队活动',
    description: '接收团队成员的任务状态更新通知',
    icon: <Users className="w-5 h-5" />,
    defaultEnabled: false,
  },
];

export default function NotificationSettings() {
  const [settings, setSettings] = useState<Record<string, boolean>>(() =>
    notificationOptions.reduce(
      (acc, opt) => ({ ...acc, [opt.id]: opt.defaultEnabled }),
      {}
    )
  );

  const handleToggle = (id: string) => {
    setSettings((prev) => ({ ...prev, [id]: !prev[id] }));
    // Mock: In real app, this would save to backend
    console.log(`Notification setting ${id} toggled to:`, !settings[id]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">通知设置</h3>
        <p className="text-sm text-gray-500 mt-1">
          管理您希望接收的通知类型
        </p>
      </div>

      <div className="space-y-4">
        {notificationOptions.map((option) => (
          <div
            key={option.id}
            className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
              {option.icon}
            </div>
            <div className="flex-1 min-w-0">
              <Label
                htmlFor={option.id}
                className="text-sm font-medium text-gray-900 cursor-pointer"
              >
                {option.label}
              </Label>
              <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
            </div>
            <Checkbox
              id={option.id}
              checked={settings[option.id]}
              onCheckedChange={() => handleToggle(option.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
