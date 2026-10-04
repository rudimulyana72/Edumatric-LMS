import React, { useState } from 'react';
import {
  Sparkles,
  Users,
  ShieldCheck,
  GraduationCap,
  ChevronDown,
  Radio,
  Lock,
  LogIn,
} from 'lucide-react';
import { Role, User } from '../types';

interface NavbarProps {
  currentUser: User;
  users: User[];
  onSwitchUser: (user: User) => void;
  isConnectedRealtime: boolean;
  activeRole: Role;
  notificationCount: number;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  users,
  onSwitchUser,
  isConnectedRealtime,
  activeRole,
  notificationCount,
  onOpenLogin,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> ADMIN SD
          </span>
        );
      case 'GURU':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5" /> GURU SD
          </span>
        );
      case 'SISWA':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> SISWA SD
          </span>
        );
    }
  };

  const guruCount = users.filter((u) => u.role === 'GURU').length;
  const siswaCount = users.filter((u) => u.role === 'SISWA').length;

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base tracking-tight">
                  EduRealtime <span className="text-amber-400">SD</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Kelas 1-6 SD
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5">
                LMS Real-Time & Auto-Grading AI untuk Sekolah Dasar
              </p>
            </div>
          </div>

          {/* Center Info: Real-time Connection Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <Radio
              className={`w-3.5 h-3.5 ${
                isConnectedRealtime ? 'text-emerald-400 animate-pulse' : 'text-slate-500'
              }`}
            />
            <span className="text-slate-300 font-medium">
              {isConnectedRealtime ? 'Live Sync Terhubung (SSE)' : 'Menghubungkan ke Stream...'}
            </span>
          </div>

          {/* User Account & Login Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl transition"
              title="Login dengan Username dan Password"
            >
              <LogIn className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">Login / Ganti</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white leading-none">
                      {currentUser.name}
                    </span>
                    {getRoleBadge(currentUser.role)}
                  </div>
                  <span className="text-[10px] text-slate-400 leading-none">
                    {currentUser.username} • {currentUser.assignedClass || currentUser.subject || currentUser.email}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Quick Switcher Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                  <div className="p-3 border-b border-slate-800">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Akun Aktif & Pilihan Akun
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Admin: <strong className="text-white">rudimulyana72</strong>
                    </p>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-1 py-1">
                    {users.map((u) => {
                      const isSelected = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSwitchUser(u);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2.5 rounded-xl transition flex items-center justify-between ${
                            isSelected
                              ? 'bg-purple-600/20 border border-purple-500/40 text-white'
                              : 'hover:bg-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                                u.role === 'ADMIN'
                                  ? 'bg-purple-600 text-white'
                                  : u.role === 'GURU'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-blue-600 text-white'
                              }`}
                            >
                              {u.role.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-white leading-tight">
                                {u.name}
                              </p>
                              <p className="text-[10px] text-slate-400 leading-tight">
                                {u.username} • {u.subject || u.assignedClass || u.email}
                              </p>
                            </div>
                          </div>
                          {getRoleBadge(u.role)}
                        </button>
                      );
                    })}

                    {guruCount === 0 && (
                      <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-300">
                        * Belum ada Guru yang dibuat. Silakan login sebagai Admin Rudi untuk men-generate Guru SD.
                      </div>
                    )}
                  </div>

                  <div className="p-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenLogin();
                      }}
                      className="w-full py-2 text-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-slate-950 rounded-xl border border-slate-800 transition"
                    >
                      Buka Form Login Lengkap
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
