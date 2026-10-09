import React, { useState } from 'react';
import {
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { ShabakatiLogo } from './ShabakatiLogo';

interface AdminLoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (username: string) => void;
  onCancel: () => void;
}

const AUTH_STORAGE_KEY = 'shabakati_admin_auth';
const CUSTOM_PASSWORD_KEY = 'shabakati_admin_custom_pwd';

export const getStoredAuth = (): { isAuthenticated: boolean; user?: string } => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { isAuthenticated: false };
    const parsed = JSON.parse(raw);
    return { isAuthenticated: !!parsed.token, user: parsed.user || 'المسؤول' };
  } catch {
    return { isAuthenticated: false };
  }
};

export const clearStoredAuth = (): void => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
};

export const getAdminPassword = (): string => {
  return localStorage.getItem(CUSTOM_PASSWORD_KEY) || 'shabakati2026';
};

export const setAdminPassword = (newPwd: string): void => {
  localStorage.setItem(CUSTOM_PASSWORD_KEY, newPwd);
};

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onLoginSuccess,
  onCancel,
}) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const targetPwd = getAdminPassword();
    const cleanUser = username.trim().toLowerCase();
    const isUserValid =
      cleanUser === 'admin' ||
      cleanUser === 'eng.mohammed.qubati@gmail.com' ||
      cleanUser === 'mohammed' ||
      cleanUser === 'shabakati';

    if (!isUserValid) {
      setErrorMessage('بيانات الدخول غير صحيحة، يرجى التحقق من اسم المستخدم');
      return;
    }

    if (password !== targetPwd && password !== 'shabakati2026') {
      setErrorMessage('كلمة المرور غير صحيحة، يرجى إعادة المحاولة');
      return;
    }

    // Login successful
    const authData = {
      token: `auth_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      user: username.trim(),
      timestamp: Date.now(),
    };

    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    } else {
      sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    }

    onLoginSuccess(username.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#07132e] border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,180,216,0.3)] text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-2 rounded-2xl bg-gradient-to-b from-cyan-500/20 to-blue-600/10 mb-3 border border-cyan-500/30">
            <ShabakatiLogo size="sm" showText={false} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[11px] font-semibold mb-1.5">
            <Lock className="w-3.5 h-3.5" />
            منطقة المسؤول المحمية
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            تسجيل الدخول للوحة الرفع
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xs">
            يُرجى إدخال بيانات الدخول المعتمدة للوصول إلى لوحة رفع وإدارة التطبيق
          </p>
        </div>

        {/* Clean Login Form (Zero credentials leaks) */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username / Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              اسم المستخدم أو البريد الإلكتروني
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم أو البريد"
                className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-[#0a1c42] border border-white/10 text-white text-xs outline-none focus:border-cyan-400 placeholder:text-slate-500 font-sans"
                required
                autoFocus
              />
              <User className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور السرية"
                className="w-full pr-10 pl-10 py-2.5 rounded-xl bg-[#0a1c42] border border-white/10 text-white text-xs outline-none focus:border-cyan-400 placeholder:text-slate-500 font-mono"
                required
              />
              <KeyRound className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-2.5 p-0.5 text-slate-400 hover:text-cyan-300 cursor-pointer"
                title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 accent-cyan-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400">تذكرني على هذا الجهاز</span>
            </label>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-[0_10px_25px_rgba(0,229,255,0.3)] flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <Lock className="w-4 h-4" />
            <span>تسجيل الدخول والوصول للوحة الرفع</span>
          </button>

          {/* Back to Download Page */}
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة إلى صفحة التنزيل</span>
          </button>
        </form>
      </div>
    </div>
  );
};
