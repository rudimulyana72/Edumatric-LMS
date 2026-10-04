import React, { useState } from 'react';
import {
  BookOpen,
  Clock,
  Image as ImageIcon,
  CheckCircle2,
  Play,
  Award,
  Sparkles,
  ArrowRight,
  Radio,
  Eye,
} from 'lucide-react';
import { QuizPackage, SubmissionRecord, User } from '../types';
import { INITIAL_CLASSES } from '../mockData';

interface StudentDashboardProps {
  currentUser: User;
  packages: QuizPackage[];
  submissions: SubmissionRecord[];
  classes: string[];
  onStartQuiz: (pkg: QuizPackage) => void;
  onViewGrading: (submission: SubmissionRecord) => void;
  newPublishedAlert?: string | null;
  onDismissAlert?: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  packages,
  submissions,
  classes,
  onStartQuiz,
  onViewGrading,
  newPublishedAlert,
  onDismissAlert,
}) => {
  const availableClasses = classes && classes.length > 0 ? classes : INITIAL_CLASSES;
  // Selected class
  const [selectedClass, setSelectedClass] = useState<string>(
    currentUser.assignedClass || availableClasses[4] || availableClasses[0] || 'Kelas 5 SD'
  );

  // All published packages in system
  const allPublishedInSystem = packages.filter((p) => p.status === 'published');

  // Filter published packages for student's class or all
  const publishedPackages = packages.filter(
    (p) =>
      p.status === 'published' &&
      (selectedClass === 'Semua Kelas' || p.targetClass === selectedClass || p.targetClass === 'Semua Kelas')
  );

  // Filter submissions by this student
  const mySubmissions = submissions.filter((s) => s.siswa_id === currentUser.id);

  // Check if a package has already been taken
  const getSubmissionForPackage = (pkgId: string) => {
    return mySubmissions.find((s) => s.packageId === pkgId);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Real-time Push Alert Banner */}
      {newPublishedAlert && (
        <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 rounded-2xl shadow-xl flex items-center justify-between gap-4 animate-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl text-white">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">
                Pemberitahuan Real-Time Langsung
              </span>
              <p className="text-sm font-bold text-white">{newPublishedAlert}</p>
            </div>
          </div>
          {onDismissAlert && (
            <button
              onClick={onDismissAlert}
              className="text-xs px-3 py-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-white font-semibold transition"
            >
              Tutup
            </button>
          )}
        </div>
      )}

      {/* Student Profile Banner */}
      <div className="bg-gradient-to-r from-blue-900/60 via-slate-900 to-indigo-900/60 border border-blue-500/20 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Hak Akses: SISWA
            </span>
            <span className="text-xs text-slate-400">NISN: {currentUser.nipOrNis || '0078921101'}</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Selamat Datang, {currentUser.name}
          </h1>
          <p className="text-xs text-slate-300 mt-0.5">
            Akses paket soal yang diterbitkan oleh guru pengampu secara serentak dan nikmati penilaian otomatis AI instan.
          </p>
        </div>

        {/* Class Selector */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 pl-2">Filter Kelas:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 border border-slate-700 text-indigo-400 focus:outline-none focus:border-indigo-500"
          >
            <option value="Semua Kelas">Semua Kelas SD (Tampilkan Semua Soal)</option>
            {availableClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Real-time Status Badge */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            Sinkronisasi Real-Time Aktif (Soal guru langsung muncul tanpa refresh)
          </span>
        </div>
        <span className="text-xs text-slate-500">
          Menampilkan <strong className="text-slate-300">{publishedPackages.length}</strong> paket soal terbit ({selectedClass})
        </span>
      </div>

      {/* Available Published Quizzes */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" /> Paket Soal & Ujian Siap Dikerjakan
        </h2>

        {publishedPackages.length === 0 ? (
          allPublishedInSystem.length > 0 ? (
            <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-8 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="text-sm font-semibold text-white">
                Belum ada soal khusus untuk {selectedClass}.
              </p>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Terdapat <strong className="text-indigo-400">{allPublishedInSystem.length} paket soal</strong> yang telah diterbitkan di kelas lain (misalnya di <strong>{allPublishedInSystem[0].targetClass}</strong>).
              </p>
              <button
                onClick={() => setSelectedClass('Semua Kelas')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition"
              >
                <Eye className="w-4 h-4" /> Buka & Tampilkan Soal dari Semua Kelas SD ({allPublishedInSystem.length})
              </button>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">
                Belum ada paket soal yang diterbitkan untuk {selectedClass}.
              </p>
              <p className="text-xs text-slate-500">
                Saat guru menekan "Terbitkan Soal", paket soal akan langsung muncul di sini secara otomatis.
              </p>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publishedPackages.map((pkg) => {
              const prevSub = getSubmissionForPackage(pkg.id);
              return (
                <div
                  key={pkg.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4 transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {pkg.subject}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{pkg.durationMinutes} Menit</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug">{pkg.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {pkg.instructions}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>Guru: <strong className="text-slate-300">{pkg.teacherName}</strong></span>
                      <span>•</span>
                      <span>{pkg.questions?.length || 0} Butir Soal (5 Tipe)</span>
                      {pkg.images?.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            <ImageIcon className="w-3.5 h-3.5" /> {pkg.images.length} Gambar Terlampir (Tampil Otomatis)
                          </span>
                        </>
                      )}
                    </div>

                    {/* Automatic Preview Thumbnails of Attached Images */}
                    {pkg.images && pkg.images.length > 0 && (
                      <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-1">
                        {pkg.images.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative w-16 h-12 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 shrink-0 shadow-sm"
                          >
                            <img
                              src={img}
                              alt={`lampiran-${idx}`}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-0.5 right-0.5 px-1 rounded text-[9px] bg-black/80 text-amber-300 font-mono">
                              #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Action */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    {prevSub ? (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-semibold text-slate-300">
                            Sudah Dikerjakan: <strong className="text-emerald-400">{prevSub.gradingResult.total_skor}</strong>/100
                          </span>
                        </div>
                        <button
                          onClick={() => onViewGrading(prevSub)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-lg border border-slate-700 transition"
                        >
                          <Award className="w-3.5 h-3.5" /> Lembar Nilai AI
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs text-slate-500">Status: Belum Dikerjakan</span>
                        <button
                          onClick={() => onStartQuiz(pkg)}
                          className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 transition transform active:scale-95"
                        >
                          <Play className="w-3.5 h-3.5" /> Mulai Kerjakan
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed History Section */}
      {mySubmissions.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" /> Riwayat Nilai & Ulasan AI Auto-Grading ({mySubmissions.length})
          </h2>

          <div className="space-y-3">
            {mySubmissions.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-4 hover:border-slate-700 transition"
              >
                <div>
                  <h4 className="text-sm font-semibold text-white">{sub.packageTitle}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Dikumpulkan: {new Date(sub.submittedAt).toLocaleString('id-ID')} • Kelas: {sub.kelas}
                  </p>
                  <p className="text-xs text-indigo-300/90 mt-1 italic line-clamp-1">
                    "{sub.gradingResult.catatan_keseluruhan}"
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div
                    className={`px-3 py-1 rounded-xl text-center font-bold text-base border ${
                      sub.gradingResult.total_skor >= 75
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {sub.gradingResult.total_skor}
                    <span className="text-[10px] text-slate-400 block font-normal">Skor</span>
                  </div>

                  <button
                    onClick={() => onViewGrading(sub)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 rounded-lg border border-indigo-500/30 transition"
                  >
                    Buka Rincian <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
