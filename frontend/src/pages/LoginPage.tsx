import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary text-white text-2xl font-bold mb-4 shadow-lg">
            CT
          </div>
          <h1 className="text-2xl font-bold text-gray-900">CoreTerra</h1>
          <p className="text-gray-500 mt-1">团队协作与任务管理平台</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">登录您的账户</CardTitle>
            <CardDescription>输入您的邮箱和密码以继续</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          还没有账户？{' '}
          <button className="text-primary hover:text-primary/80 font-medium transition-colors">
            联系管理员
          </button>
        </p>
      </div>
    </div>
  );
}
