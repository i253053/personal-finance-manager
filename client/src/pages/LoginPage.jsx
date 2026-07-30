import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Logo from '../components/brand/Logo';
import { EyeIcon, EyeOffIcon, ShieldIcon, ReportsIcon, GoalsIcon } from '../components/ui/icons';
import { useAuth } from '../context/AuthContext';
import { setTokenPersistence } from '../api/client';
import { BRAND } from '../brand';

const DEMO_CREDENTIALS = { email: 'demo@financeapp.com', password: 'Demo1234' };

const highlights = [
  {
    icon: ReportsIcon,
    title: 'See where it all goes',
    text: 'Every transaction, categorized and charted by month.',
  },
  {
    icon: GoalsIcon,
    title: 'Budgets and goals that stick',
    text: 'Set monthly limits and savings targets, then track progress.',
  },
  {
    icon: ShieldIcon,
    title: 'Your data stays yours',
    text: 'Private by default. No bank logins required.',
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  const signIn = async (credentials) => {
    setLoading(true);
    try {
      setTokenPersistence(remember);
      await login(credentials);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Incorrect email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signIn(form);
  };

  const handleDemo = () => {
    setForm(DEMO_CREDENTIALS);
    signIn(DEMO_CREDENTIALS);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    toast('Password reset isn\u2019t available yet. Use the demo account or create a new one.', {
      icon: 'ℹ️',
    });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-slate-950">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-900 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(60% 50% at 20% 10%, rgba(37,99,235,0.35) 0%, transparent 70%), radial-gradient(50% 40% at 90% 90%, rgba(79,70,229,0.3) 0%, transparent 70%)',
          }}
        />
        <div className="relative">
          <Logo size={40} textClass="text-2xl text-white" />
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
            Every account, budget, and goal in one place.
          </h1>
          <p className="mt-4 text-slate-400">{BRAND.tagline}.</p>

          <ul className="mt-10 space-y-6">
            {highlights.map(({ icon: Ico, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-blue-300">
                  <Ico size={18} />
                </span>
                <div>
                  <p className="font-medium text-white">{title}</p>
                  <p className="text-sm text-slate-400">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">
          &copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-10 flex justify-center">
            <Logo size={36} textClass="text-xl" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Welcome back. Enter your details to continue.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <a
                  href="#"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Keep me signed in
            </label>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-3 text-xs text-slate-400">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            or
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>

          <button
            type="button"
            onClick={handleDemo}
            disabled={loading}
            className="mt-6 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Explore with the demo account
          </button>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            New to {BRAND.name}?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
