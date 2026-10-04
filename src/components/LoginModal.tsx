import React, { useState } from 'react';
import {
  X,
  Lock,
  User as UserIcon,
  ShieldCheck,
  GraduationCap,
  Users,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  availableUsers: User[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  availableUsers,
}) => {
  const [username, setUsername] = useState('rudimulyana72');
  const [password, setPassword] = useState('yunamaura28');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const user = await api.login(username.trim(), password.trim());
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Username atau password salah.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLoginAdmin = () => {
    setUsername('rudimulyana72');
    setPassword('yunamaura28');
    setErrorMsg('');
  };

  const teachersCount = availableUsers.filter((u) => u.role === 'GURU').length;
  const studentsCount = availableUsers.filter((u) => u.role === 'SISWA').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-900/60 via-slate-900 to-indigo-900/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Login Sistem LMS SD</h2>
              <p className="text-[11px] text-slate-400">Masuk sesuai hak akses (Admin, Guru, Siswa)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Admin Credentials Helper Callout */}
          <div className="p-3.5 bg-gradient-to-r from-purple-950/50 to-indigo-950/40 border border-purple-500/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" /> Kredensial Admin SD:
              </span>
              <button
                type="button"
                onClick={handleQuickLoginAdmin}
                className="text-[11px] font-semibold text-purple-200 bg-purple-600/40 hover:bg-purple-600 px-2.5 py-1 rounded-lg transition"
              >
                Gunakan Ini
              </button>
            </div>
            <div className="text-xs text-slate-300 space-y-0.5 font-mono">
              <p>Username: <strong className="text-white">rudimulyana72</strong></p>
              <p>Password: <strong className="text-white">yunamaura28</strong></p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Username / Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="rudimulyana72"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                />
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="yunamaura28"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-purple-600/20 transition transform active:scale-95 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Memverifikasi...' : 'Masuk ke Sistem LMS SD'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Select for Generated Users */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              Akun Lain yang Tersedia di Sistem:
            </span>
            {teachersCount === 0 ? (
              <p className="text-[11px] text-amber-400/90 italic">
                * Belum ada Guru yang terdaftar. Login sebagai Admin (rudimulyana72) untuk men-generate akun Guru pertama.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {availableUsers
                  .filter((u) => u.role !== 'ADMIN')
                  .map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setUsername(u.username);
                        setPassword(u.password || (u.role === 'GURU' ? 'guru123' : 'siswa123'));
                      }}
                      className="w-full p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-left transition"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center ${
                            u.role === 'GURU'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {u.role.charAt(0)}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-white leading-tight">{u.name}</p>
                          <p className="text-[10px] text-slate-400 leading-tight">
                            User: {u.username} | Pass: {u.password || (u.role === 'GURU' ? 'guru123' : 'siswa123')}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-indigo-400 font-semibold">Pilih</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
