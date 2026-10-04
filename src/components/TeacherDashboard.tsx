import React, { useState } from 'react';
import {
  BookOpen,
  UserPlus,
  Send,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  Activity,
  Layers,
  Sparkles,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { QuizPackage, SubmissionRecord, User } from '../types';
import { api } from '../services/api';
import { SD_QUIZ_TEMPLATE } from '../mockData';

interface TeacherDashboardProps {
  currentUser: User;
  packages: QuizPackage[];
  submissions: SubmissionRecord[];
  classes: string[];
  onCreateNewPackage: () => void;
  onEditPackage: (pkg: QuizPackage) => void;
  onRefresh: () => void;
  onViewGrading: (submission: SubmissionRecord) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  currentUser,
  packages,
  submissions,
  classes,
  onCreateNewPackage,
  onEditPackage,
  onRefresh,
  onViewGrading,
}) => {
  const [activeTab, setActiveTab] = useState<'packages' | 'submissions' | 'generate_siswa'>('packages');

  // Form for Generating Siswa account
  const [siswaName, setSiswaName] = useState('');
  const [siswaNis, setSiswaNis] = useState('');
  const [siswaEmail, setSiswaEmail] = useState('');
  const [siswaClass, setSiswaClass] = useState(currentUser.assignedClass || classes[4] || 'Kelas 5 SD');
  const [siswaPassword, setSiswaPassword] = useState('siswa123');
  const [isSubmittingSiswa, setIsSubmittingSiswa] = useState(false);
  const [siswaSuccessMsg, setSiswaSuccessMsg] = useState('');

  // Packages filtered for this teacher or general
  const myPackages = packages.filter(
    (p) =>
      p.teacherId === currentUser.id ||
      p.teacherName === currentUser.name ||
      !p.teacherId ||
      packages.length <= 5
  );

  // Submissions filtered for teacher's packages or class
  const relevantSubmissions = submissions.filter(
    (s) =>
      myPackages.some((p) => p.id === s.packageId) ||
      (currentUser.assignedClass && s.kelas === currentUser.assignedClass)
  );

  const handleGenerateSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siswaName.trim() || !siswaEmail.trim()) {
      alert('Nama dan Email Siswa wajib diisi!');
      return;
    }

    setIsSubmittingSiswa(true);
    try {
      const newSiswa = await api.createUser({
        name: siswaName.trim(),
        role: 'SISWA',
        email: siswaEmail.trim(),
        nipOrNis: siswaNis.trim() || undefined,
        assignedClass: siswaClass,
        password: siswaPassword.trim() || 'siswa123',
        createdBy: currentUser.id,
      });

      setSiswaSuccessMsg(
        `Akun Siswa "${newSiswa.name}" berhasil dibuat untuk ${siswaClass}! Username: ${newSiswa.username} | Password: ${newSiswa.password || 'siswa123'}`
      );
      setSiswaName('');
      setSiswaNis('');
      setSiswaEmail('');
      setSiswaPassword('siswa123');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal membuat akun siswa.');
    } finally {
      setIsSubmittingSiswa(false);
    }
  };

  const handleQuickCreateSiswa = async (name: string, nisn: string, email: string) => {
    setIsSubmittingSiswa(true);
    try {
      const newSiswa = await api.createUser({
        name,
        role: 'SISWA',
        email,
        nipOrNis: nisn,
        assignedClass: currentUser.assignedClass || 'Kelas 5 SD',
        password: 'siswa123',
        createdBy: currentUser.id,
      });
      setSiswaSuccessMsg(
        `Akun Siswa "${newSiswa.name}" berhasil dibuat! Username: ${newSiswa.username} | Password: siswa123`
      );
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal membuat akun siswa.');
    } finally {
      setIsSubmittingSiswa(false);
    }
  };

  // 1-Click Load SD Quiz Template
  const handleLoadSdTemplate = async () => {
    try {
      const pkgToSave: Partial<QuizPackage> = {
        ...SD_QUIZ_TEMPLATE,
        teacherId: currentUser.id,
        teacherName: currentUser.name,
        targetClass: currentUser.assignedClass || 'Kelas 5 SD',
      };
      await api.saveAndPublishPackage(pkgToSave);
      alert('Paket Soal IPAS SD berhasil dimuat dan diterbitkan secara real-time ke siswa!');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal memuat template soal SD.');
    }
  };

  const handleDeletePackage = async (pkgId: string, title: string) => {
    if (!window.confirm(`Yakin ingin menghapus paket soal "${title}"?`)) return;
    try {
      await api.deleteQuizPackage(pkgId);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus paket soal.');
    }
  };

  const handleQuickPublish = async (pkg: QuizPackage) => {
    try {
      await api.saveAndPublishPackage({
        ...pkg,
        status: 'published',
      });
      alert(`Paket Soal "${pkg.title}" berhasil diterbitkan dan disinkronkan secara REAL-TIME ke seluruh siswa di ${pkg.targetClass}!`);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gagal menerbitkan paket soal.');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900/60 via-slate-900 to-teal-900/60 border border-emerald-500/20 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Hak Akses: GURU SD
            </span>
            <span className="text-xs text-slate-400">
              {currentUser.subject || 'Guru Kelas SD'} • {currentUser.assignedClass || 'Kelas 5 SD'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Studio Pengajaran & Distribusi Soal SD
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Buat soal dengan 5 tipe soal ramah anak SD, unggah maksimal 5 gambar, validasi AI backend, dan sinkronkan serentak ke siswa.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('generate_siswa')}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" /> + Generate Akun Siswa
          </button>
          <button
            onClick={onCreateNewPackage}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-600/20 transition transform active:scale-95"
          >
            <Plus className="w-4 h-4" /> + Buat Paket Soal Baru
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Paket Soal Anda</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{myPackages.length}</p>
          <span className="text-[11px] text-slate-500">
            {myPackages.filter((p) => p.status === 'published').length} Terbit (Sinkron Real-Time)
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Jawaban Siswa Masuk</span>
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <p className="text-2xl font-bold text-white">{relevantSubmissions.length}</p>
          <span className="text-[11px] text-slate-500">Auto-grading AI langsung</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Rata-Rata Nilai Siswa SD</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {relevantSubmissions.length > 0
              ? Math.round(
                  relevantSubmissions.reduce(
                    (sum, s) => sum + s.gradingResult.total_skor,
                    0
                  ) / relevantSubmissions.length
                )
              : 85}
            <span className="text-xs text-slate-400 font-normal"> / 100</span>
          </p>
          <span className="text-[11px] text-slate-500">Evaluasi berbasis rubrik SD</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('packages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'packages'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" /> Paket Soal Saya ({myPackages.length})
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'submissions'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" /> Pengerjaan Siswa Real-Time ({relevantSubmissions.length})
        </button>
        <button
          onClick={() => setActiveTab('generate_siswa')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'generate_siswa'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <UserPlus className="w-4 h-4" /> Generate Akun Siswa SD
        </button>
      </div>

      {/* Tab: Generate Siswa */}
      {activeTab === 'generate_siswa' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-2xl space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Generate Akun Siswa SD Baru</h2>
              <p className="text-xs text-slate-400">
                Sesuai hak akses tingkat 2 (GURU), Anda berhak men-generate akun Siswa untuk kelas binaan Anda.
              </p>
            </div>
          </div>

          {/* Quick preset button */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
            <span className="text-xs text-slate-300">Mau buat siswa contoh secara cepat?</span>
            <button
              type="button"
              onClick={() =>
                handleQuickCreateSiswa(
                  'Budi Santoso (Siswa SD)',
                  '0081234567',
                  'budi.santoso@siswa.sd.belajar.id'
                )
              }
              className="px-3 py-1.5 text-xs font-bold bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded-lg border border-emerald-500/30 transition"
            >
              + Generate Cepat: Budi Santoso (Kelas 5 SD)
            </button>
          </div>

          {siswaSuccessMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{siswaSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleGenerateSiswa} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Lengkap Siswa SD *
              </label>
              <input
                type="text"
                value={siswaName}
                onChange={(e) => setSiswaName(e.target.value)}
                placeholder="Contoh: Muhammad Rizky Pratama"
                required
                className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  NISN / No. Induk Siswa
                </label>
                <input
                  type="text"
                  value={siswaNis}
                  onChange={(e) => setSiswaNis(e.target.value)}
                  placeholder="0087654321"
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Siswa *
                </label>
                <input
                  type="email"
                  value={siswaEmail}
                  onChange={(e) => setSiswaEmail(e.target.value)}
                  placeholder="rizky.pratama@siswa.sd.belajar.id"
                  required
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kelas Siswa SD
                </label>
                <select
                  value={siswaClass}
                  onChange={(e) => setSiswaClass(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  {classes.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password Login Siswa
                </label>
                <input
                  type="text"
                  value={siswaPassword}
                  onChange={(e) => setSiswaPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingSiswa}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow transition"
              >
                <UserPlus className="w-4 h-4" />
                {isSubmittingSiswa ? 'Menyimpan Akun Siswa...' : 'Generate Akun Siswa SD'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: My Packages */}
      {activeTab === 'packages' && (
        <div className="space-y-4">
          {myPackages.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-4">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-white">Belum Ada Paket Soal yang Dibuat</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Anda dapat membuat paket soal baru dengan 5 tipe soal SD atau gunakan template IPAS SD yang sudah disiapkan.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleLoadSdTemplate}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl shadow-lg shadow-teal-500/20 transition transform active:scale-95"
                >
                  <Sparkles className="w-4 h-4" /> Gunakan Template Soal IPAS Kelas 5 SD
                </button>
                <button
                  onClick={onCreateNewPackage}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition"
                >
                  <Plus className="w-4 h-4" /> Buat dari Awal
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4 hover:border-slate-700 transition"
                >
                  <div className="space-y-1.5 flex-1 min-w-[280px]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {pkg.targetClass}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          pkg.status === 'published'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {pkg.status === 'published' ? 'TERBIT (REAL-TIME)' : 'DRAFT'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {pkg.durationMinutes} Menit • KKM: {pkg.passingScore}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">{pkg.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{pkg.instructions}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span>{pkg.questions?.length || 0} Butir Soal SD</span>
                      <span>•</span>
                      <span>{pkg.images?.length || 0}/5 Gambar Lampiran</span>
                      {pkg.aiValidation && (
                        <>
                          <span>•</span>
                          <span className="text-indigo-400 font-semibold flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> AI Quality: {pkg.aiValidation.scoreQuality}/100
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {pkg.status === 'draft' && (
                      <button
                        onClick={() => handleQuickPublish(pkg)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow transition"
                        title="Terbitkan ke seluruh siswa sekarang"
                      >
                        <Send className="w-3.5 h-3.5" /> Terbitkan Real-Time
                      </button>
                    )}
                    <button
                      onClick={() => onEditPackage(pkg)}
                      className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                      title="Edit paket soal"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg.id, pkg.title)}
                      className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                      title="Hapus paket soal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Submissions */}
      {activeTab === 'submissions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">
              Pengerjaan & Hasil Auto-Grading Siswa SD ({relevantSubmissions.length})
            </h2>
            <span className="text-xs text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Sinkronisasi Nilai Real-Time Aktif
            </span>
          </div>

          {relevantSubmissions.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">
              Belum ada siswa SD yang mengumpulkan jawaban pada paket soal ini.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4">Kelas SD</th>
                    <th className="py-3 px-4">Paket Soal</th>
                    <th className="py-3 px-4">Waktu Masuk</th>
                    <th className="py-3 px-4 text-center">Skor AI</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {relevantSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-semibold text-white">{sub.siswa_nama}</td>
                      <td className="py-3 px-4 text-slate-300">{sub.kelas}</td>
                      <td className="py-3 px-4 text-slate-300">{sub.packageTitle}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(sub.submittedAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            sub.gradingResult.total_skor >= 75
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {sub.gradingResult.total_skor} / 100
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onViewGrading(sub)}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50 transition border border-emerald-500/30"
                        >
                          Lihat Rubrik & Feedback
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
