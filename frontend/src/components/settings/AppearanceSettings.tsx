import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Sun, Moon, Monitor } from 'lucide-react';

type ThemeOption = 'light' | 'dark' | 'system';

interface ThemeConfig {
  id: ThemeOption;
  label: string;
  icon: React.ReactNode;
}

const themeOptions: ThemeConfig[] = [
  { id: 'light', label: '浅色', icon: <Sun className="w-5 h-5" /> },
  { id: 'dark', label: '深色', icon: <Moon className="w-5 h-5" /> },
  { id: 'system', label: '跟随系统', icon: <Monitor className="w-5 h-5" /> },
];

export default function AppearanceSettings() {
  const [theme, setTheme] = useState<ThemeOption>('light');
  const [compactMode, setCompactMode] = useState(false);

  const handleThemeChange = (newTheme: ThemeOption) => {
    setTheme(newTheme);
    // Mock: In real app, this would apply theme and save preference
    console.log('Theme changed to:', newTheme);
  };

  const handleCompactToggle = () => {
    setCompactMode((prev) => !prev);
    // Mock: In real app, this would apply compact mode
    console.log('Compact mode toggled to:', !compactMode);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">外观设置</h3>
        <p className="text-sm text-gray-500 mt-1">
          自定义应用的视觉外观
        </p>
      </div>

      {/* Theme Selection */}
      <div className="space-y-3">
        <Label>主题</Label>
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handleThemeChange(option.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                theme === option.id
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              {option.icon}
              <span className="text-sm font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Compact Mode */}
      <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-200">
        <div className="flex-1 min-w-0">
          <Label htmlFor="compactMode" className="text-sm font-medium text-gray-900 cursor-pointer">
            紧凑模式
          </Label>
          <p className="text-sm text-gray-500 mt-0.5">
            减少界面元素的间距，在屏幕上显示更多内容
          </p>
        </div>
        <Checkbox
          id="compactMode"
          checked={compactMode}
          onCheckedChange={handleCompactToggle}
        />
      </div>

      {/* Preview hint */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          <strong>提示：</strong>主题设置功能即将推出，敬请期待。
        </p>
      </div>
    </div>
  );
}
