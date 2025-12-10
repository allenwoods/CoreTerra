import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useUserContext } from '@/context/UserContext';

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useUserContext();
  const [username, setUsername] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(username);
      navigate('/');
    } catch (err) {
      setError('Login failed. Please check your username.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Username Field */}
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          placeholder="e.g. Alex"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          className="h-11"
        />
      </div>

      {error && (
        <div className="text-sm text-red-500 font-medium">
          {error}
        </div>
      )}

      {/* Remember Me */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="remember"
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked === true)}
        />
        <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
          Remember me
        </Label>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full h-11" disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Logging in...
          </span>
        ) : (
          'Login'
        )}
      </Button>

      <div className="text-center text-xs text-gray-500 mt-4">
        Try "Test User" or "Alex"
      </div>
    </form>
  );
}
