import React, { useState, useEffect } from 'react';
import {
  Clock,
  Image as ImageIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  Sparkles,
  Link as LinkIcon,
  X,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { GradingResponse, QuizPackage, User } from '../types';
import { api } from '../services/api';
import { ImageGalleryModal } from './ImageGalleryModal';
import { GradingResultModal } from './GradingResultModal';
import confetti from 'canvas-confetti';

interface QuizRunnerProps {
  quizPackage: QuizPackage;
  currentUser: User;
  onExit: () => void;
  onGraded: (result: GradingResponse) => void;
}

export const QuizRunner: React.FC<QuizRunnerProps> = ({
  quizPackage,
  currentUser,
  onExit,
  onGraded,
}) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<GradingResponse | null>(null);
  const [resultModalOpen, setResultModalOpen] = useState(false);

  // Matching question state helper: selected itemA waiting for itemB click
  const [selectedItemA, setSelectedItemA] = useState<string | null>(null);

  // Timer Countdown
  const totalSeconds = (quizPackage.durationMinutes || 45) * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const questions = quizPackage.questions || [];
  const currentQ = questions[currentQuestionIdx];

  // Helper to check answered status
  const isQuestionAnswered = (qId: string) => {
    const ans = answers[qId];
    if (ans === undefined || ans === null || ans === '') return false;
    if (typeof ans === 'object') {
      return Object.keys(ans).length > 0;
    }
    return true;
  };

  const answeredCount = questions.filter((q) => isQuestionAnswered(q.id)).length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  // Answer handler
  const setAnswerForCurrent = (value: any) => {
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: value,
    }));
  };

  // Submit test
  const handleSubmit = async () => {
    const unanswered = questions.length - answeredCount;
    if (unanswered > 0) {
      const confirmSubmit = window.confirm(
        `Masih ada ${unanswered} butir soal yang belum dijawab. Apakah Anda yakin ingin mengirim lembar jawaban untuk dinilai oleh AI sekarang?`
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    try {
      const result = await api.submitAnswers({
        packageId: quizPackage.id,
        siswa_id: currentUser.id,
        siswa_nama: currentUser.name,
        kelas: currentUser.assignedClass || quizPackage.targetClass,
        answers,
      });

      setSubmitResult(result);
      setResultModalOpen(true);
      onGraded(result);

      // Trigger celebration confetti if passed
      if (result.total_skor >= 70) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim jawaban.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Top Bar with Timer & Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {quizPackage.subject}
            </span>
            <span className="text-xs text-slate-400">{quizPackage.targetClass}</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">{quizPackage.title}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Siswa: <span className="text-slate-200 font-semibold">{currentUser.name}</span> ({currentUser.nipOrNis || 'NISN'})
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Attached Media Button */}
          {quizPackage.images?.length > 0 && (
            <button
              onClick={() => setGalleryOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition shadow"
            >
              <ImageIcon className="w-4 h-4 text-indigo-400" />
              <span>Lampiran Gambar ({quizPackage.images.length})</span>
            </button>
          )}

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono shadow-inner">
            <Clock className={`w-4 h-4 ${timeLeft < 300 ? 'text-rose-400 animate-pulse' : 'text-indigo-400'}`} />
            <span className={`text-base font-bold ${timeLeft < 300 ? 'text-rose-400' : 'text-slate-200'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <button
            onClick={onExit}
            className="px-3 py-2 text-xs text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            Keluar
          </button>
        </div>
      </div>

      {/* Progress Strip */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-xs text-slate-400 font-medium">
            Progres: <strong className="text-white">{answeredCount}</strong> dari {questions.length} Soal Terjawab
          </span>
          <div className="flex-1 max-w-xs h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Question Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {questions.map((q, idx) => {
            const answered = isQuestionAnswered(q.id);
            const isCurrent = idx === currentQuestionIdx;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIdx(idx)}
                className={`w-7 h-7 text-xs font-bold rounded-lg border transition ${
                  isCurrent
                    ? 'border-indigo-400 bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : answered
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Question Card */}
      {currentQ && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Question Meta */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow">
                #{currentQ.number}
              </span>
              <div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700 uppercase">
                  {currentQ.type.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-400 ml-2">Bobot: {currentQ.points} Poin</span>
              </div>
            </div>

            {/* Answered Status Pill */}
            {isQuestionAnswered(currentQ.id) ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" /> Sudah Terjawab
              </span>
            ) : (
              <span className="text-xs text-slate-500">Belum Terjawab</span>
            )}
          </div>

          {/* Question Prompt */}
          <div className="text-base text-slate-100 font-medium leading-relaxed bg-slate-950/40 p-5 rounded-xl border border-slate-800/80">
            {currentQ.prompt}
          </div>

          {/* Automatically Displayed Supporting Images (No button click needed) */}
          {((currentQ.imageUrls && currentQ.imageUrls.length > 0) || (quizPackage.images && quizPackage.images.length > 0)) && (
            <div className="space-y-3 bg-slate-950/90 p-4 sm:p-5 rounded-2xl border border-indigo-500/30 shadow-inner">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-2 uppercase tracking-wide">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  Gambar Lampiran Soal Guru (Tampil Otomatis)
                </span>
                <span className="text-[11px] text-slate-400">
                  {((currentQ.imageUrls && currentQ.imageUrls.length > 0) ? currentQ.imageUrls : quizPackage.images).length} Gambar Tersedia
                </span>
              </div>

              {/* Automatic Inline Gallery Grid */}
              <div
                className={`grid gap-4 ${
                  ((currentQ.imageUrls && currentQ.imageUrls.length > 0) ? currentQ.imageUrls : quizPackage.images).length === 1
                    ? 'grid-cols-1'
                    : ((currentQ.imageUrls && currentQ.imageUrls.length > 0) ? currentQ.imageUrls : quizPackage.images).length === 2
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                }`}
              >
                {((currentQ.imageUrls && currentQ.imageUrls.length > 0) ? currentQ.imageUrls : quizPackage.images).map((imgUrl, i) => {
                  const caption =
                    (quizPackage.imageCaptions && quizPackage.imageCaptions[i]) ||
                    `Gambar ${i + 1}`;
                  return (
                    <div
                      key={i}
                      className="group relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-md flex flex-col transition hover:border-indigo-500/50"
                    >
                      <div className="relative min-h-[180px] max-h-72 w-full bg-slate-950 flex items-center justify-center p-2 overflow-hidden">
                        <img
                          src={imgUrl}
                          alt={caption}
                          className="max-h-64 w-auto object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-black/80 text-amber-300 border border-amber-500/40 shadow">
                          Gambar {i + 1}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-900/90 border-t border-slate-800">
                        <p className="text-xs text-slate-200 font-medium text-center leading-snug">
                          {caption}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Type-Specific Interactive Input Renderers */}

          {/* 1. Pilihan Ganda */}
          {currentQ.type === 'pilihan_ganda' && (
            <div className="space-y-3 pt-2">
              <p className="text-xs font-semibold text-slate-400">Pilih salah satu jawaban yang paling tepat:</p>
              <div className="space-y-2.5">
                {currentQ.options?.map((opt) => {
                  const isSelected = answers[currentQ.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAnswerForCurrent(opt.id)}
                      className={`w-full text-left p-4 rounded-xl border transition flex items-center gap-4 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-600/10 text-white shadow-md shadow-indigo-500/10'
                          : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-lg text-sm font-bold flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-400 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        {opt.id}
                      </span>
                      <span className="text-sm font-medium leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Isian Singkat */}
          {currentQ.type === 'isian_singkat' && (
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-300">
                Ketikkan jawaban singkat Anda di bawah ini:
              </label>
              <input
                type="text"
                value={answers[currentQ.id] || ''}
                onChange={(e) => setAnswerForCurrent(e.target.value)}
                placeholder="Tuliskan kata kunci / istilah jawaban..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-base focus:outline-none focus:border-indigo-500"
              />
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                AI Auto-Grading toleran terhadap perbedaan huruf kapital, spasi berlebih, atau sinonim kata kunci.
              </p>
            </div>
          )}

          {/* 3. Essay */}
          {currentQ.type === 'essay' && (
            <div className="space-y-3 pt-2">
              {currentQ.rubric && (
                <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl text-xs text-purple-300 space-y-1">
                  <span className="font-semibold flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Panduan Rubrik Penilaian Guru:
                  </span>
                  <p className="leading-relaxed text-slate-300">{currentQ.rubric}</p>
                </div>
              )}

              <label className="block text-xs font-semibold text-slate-300">
                Tuliskan uraian / penjelasan lengkap Anda:
              </label>
              <textarea
                rows={6}
                value={answers[currentQ.id] || ''}
                onChange={(e) => setAnswerForCurrent(e.target.value)}
                placeholder="Uraikan konsep, penjelasan, atau argumen Anda secara terstruktur..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Panjang Karakter: {(answers[currentQ.id] || '').length} karakter</span>
                <span>AI akan menganalisis pemahaman konsep & kelengkapan poin rubrik.</span>
              </div>
            </div>
          )}

          {/* 4. Salah/Benar */}
          {currentQ.type === 'salah_benar' && (
            <div className="space-y-4 pt-2">
              <p className="text-xs font-semibold text-slate-400">
                Tentukan apakah pernyataan pada soal berstatus Benar atau Salah:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                <button
                  type="button"
                  onClick={() => setAnswerForCurrent(true)}
                  className={`p-5 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-2 ${
                    answers[currentQ.id] === true
                      ? 'border-emerald-500 bg-emerald-600/10 text-emerald-400 shadow-lg shadow-emerald-500/10'
                      : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                  <span className="font-bold text-base">BENAR</span>
                  <span className="text-[11px] text-slate-400">Pernyataan sesuai fakta materi</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAnswerForCurrent(false)}
                  className={`p-5 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-2 ${
                    answers[currentQ.id] === false
                      ? 'border-rose-500 bg-rose-600/10 text-rose-400 shadow-lg shadow-rose-500/10'
                      : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 text-slate-300'
                  }`}
                >
                  <AlertCircle className="w-7 h-7 text-rose-400" />
                  <span className="font-bold text-base">SALAH</span>
                  <span className="text-[11px] text-slate-400">Pernyataan tidak tepat</span>
                </button>
              </div>
            </div>
          )}

          {/* 5. Menjodohkan (Interactive Click-to-Pair Interface) */}
          {currentQ.type === 'menjodohkan' && (
            <div className="space-y-4 pt-2">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <p className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <LinkIcon className="w-4 h-4 text-indigo-400" /> Cara Menjodohkan:
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  1. Klik salah satu item di Kolom A (kiri).
                  <br />
                  2. Klik pasangan yang tepat di Kolom B (kanan) untuk menghubungkannya.
                  <br />
                  3. Klik tanda silang (x) pada daftar pasangan jika ingin membatalkan/mengubah pasangan.
                </p>
              </div>

              {/* Columns A and B */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column A */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Kolom A (Item Soal)
                  </span>
                  {currentQ.pairs?.map((p) => {
                    const currentPairsMap = answers[currentQ.id] || {};
                    const isPaired = Boolean(currentPairsMap[p.itemA]);
                    const isSelected = selectedItemA === p.itemA;

                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedItemA(isSelected ? null : p.itemA)}
                        className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between text-xs font-semibold ${
                          isSelected
                            ? 'border-indigo-400 bg-indigo-600/20 text-white shadow-md'
                            : isPaired
                            ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300'
                            : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span>{p.itemA}</span>
                        {isPaired ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Terpasang ✓
                          </span>
                        ) : isSelected ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 animate-pulse">
                            Pilih Kolom B...
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                {/* Column B */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Kolom B (Pilihan Pasangan Tepat)
                  </span>
                  {currentQ.pairs?.map((p) => {
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          if (!selectedItemA) {
                            alert('Pilih terlebih dahulu salah satu item di Kolom A (kiri)!');
                            return;
                          }
                          const currentPairsMap = { ...(answers[currentQ.id] || {}) };
                          currentPairsMap[selectedItemA] = p.itemB;
                          setAnswerForCurrent(currentPairsMap);
                          setSelectedItemA(null);
                        }}
                        className="w-full text-left p-3.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-indigo-600/10 hover:border-indigo-500/40 text-slate-300 hover:text-white transition text-xs font-medium"
                      >
                        {p.itemB}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Linked Pairs Summary */}
              <div className="pt-3 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Hasil Pasangan yang Dihubungkan:
                </span>
                {Object.keys(answers[currentQ.id] || {}).length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Belum ada pasangan yang dihubungkan.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(answers[currentQ.id] || {}).map(([a, b]) => (
                      <div
                        key={a}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 shadow-sm"
                      >
                        <span className="font-semibold text-indigo-300">{a}</span>
                        <span className="text-slate-500">⇄</span>
                        <span className="font-semibold text-emerald-300">{b as string}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...(answers[currentQ.id] || {}) };
                            delete updated[a];
                            setAnswerForCurrent(updated);
                          }}
                          className="text-slate-400 hover:text-rose-400 ml-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Navigation Buttons */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-6">
            <button
              onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentQuestionIdx === 0}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none rounded-xl transition"
            >
              <ChevronLeft className="w-4 h-4" /> Soal Sebelumnya
            </button>

            {currentQuestionIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition"
              >
                Soal Berikutnya <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg shadow-emerald-500/20 transition transform active:scale-95"
              >
                <Send className="w-4 h-4" /> {isSubmitting ? 'AI Sedang Menilai...' : 'Kirim Lembar Jawaban'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Floating Submit Action if all answered */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-xl shadow-emerald-500/25 transition transform active:scale-95"
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? 'AI Backend Sedang Menilai...' : `Selesai & Nilai Otomatis (${answeredCount}/${questions.length})`}
        </button>
      </div>

      {/* Media Lightbox */}
      <ImageGalleryModal
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={quizPackage.images || []}
        captions={quizPackage.imageCaptions || []}
        title={`Lampiran Media Soal: ${quizPackage.title}`}
      />

      {/* Grading Result Modal */}
      <GradingResultModal
        isOpen={resultModalOpen}
        onClose={() => {
          setResultModalOpen(false);
          onExit();
        }}
        result={submitResult}
        packageTitle={quizPackage.title}
        studentName={currentUser.name}
      />
    </div>
  );
};
