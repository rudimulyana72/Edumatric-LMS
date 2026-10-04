import React, { useState } from 'react';
import {
  X,
  Award,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  Code,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { GradingResponse } from '../types';

interface GradingResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: GradingResponse | null;
  packageTitle?: string;
  studentName?: string;
}

export const GradingResultModal: React.FC<GradingResultModalProps> = ({
  isOpen,
  onClose,
  result,
  packageTitle,
  studentName,
}) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'json'>('cards');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !result) return null;

  // Clean JSON string matching Requirement 5 exactly
  const cleanJsonResult = {
    status: result.status,
    siswa_id: result.siswa_id,
    kelas: result.kelas,
    total_skor: result.total_skor,
    ringkasan_penilaian: result.ringkasan_penilaian.map((item) => ({
      nomor_soal: item.nomor_soal,
      tipe_soal: item.tipe_soal,
      skor: item.skor,
      status: item.status,
      catatan_ai: item.catatan_ai,
    })),
    catatan_keseluruhan: result.catatan_keseluruhan,
  };

  const jsonString = JSON.stringify(cleanJsonResult, null, 2);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Benar':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Benar
          </span>
        );
      case 'Sebagian Benar':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5" /> Sebagian Benar
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> Salah
          </span>
        );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-900/60 via-slate-900 to-purple-900/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded-xl">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wide">
                  Auto-Grading AI Terverifikasi
                </span>
                <span className="text-xs text-slate-400">
                  {result.kelas}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">
                Hasil Penilaian Otomatis
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {packageTitle || 'Paket Soal Pembelajaran'} • Siswa: <span className="font-semibold text-white">{studentName || result.siswa_id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score Summary Strip */}
        <div className="px-6 py-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-xl border text-center font-bold text-2xl ${getScoreColor(result.total_skor)}`}>
              {result.total_skor}
              <span className="text-xs text-slate-400 font-normal block">Skor Akhir (0-100)</span>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Predikat & Kriteria</p>
              <p className="text-sm font-semibold text-white">
                {result.total_skor >= 85
                  ? '🌟 Sangat Baik (A)'
                  : result.total_skor >= 75
                  ? '👍 Tuntas / Baik (B)'
                  : result.total_skor >= 60
                  ? '⚠️ Cukup / Remedial Ringan (C)'
                  : '❌ Perlu Remedial Materi (D)'}
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'cards'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Ringkasan Soal
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                activeTab === 'json'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" /> Format JSON Resmi
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Overall AI Feedback Banner */}
          <div className="p-4 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900 border border-indigo-500/20 rounded-xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Catatan Keseluruhan (AI Auto-Grading)
              </h4>
              <p className="text-sm text-slate-200 mt-1 leading-relaxed">
                "{result.catatan_keseluruhan}"
              </p>
            </div>
          </div>

          {activeTab === 'cards' ? (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Detail Penilaian per Butir Soal ({result.ringkasan_penilaian.length} Butir)
              </h4>

              {result.ringkasan_penilaian.map((item) => (
                <div
                  key={item.nomor_soal}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold text-xs flex items-center justify-center border border-slate-700">
                        #{item.nomor_soal}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {item.tipe_soal.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-300">
                        Skor: <strong className="text-white text-sm">{item.skor}</strong> / 100
                      </span>
                      {getStatusBadge(item.status)}
                    </div>
                  </div>

                  <div className="pl-9">
                    <div className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800/80">
                      <span className="font-semibold text-indigo-400 block mb-1">
                        Catatan Evaluasi AI:
                      </span>
                      {item.catatan_ai}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">
                  Schema Response: Requirement 5 (JSON Spesifikasi Sistem)
                </span>
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Tersalin!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Salin JSON
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl border border-slate-800 overflow-x-auto leading-relaxed">
                {jsonString}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow transition"
          >
            Tutup Lembar Penilaian
          </button>
        </div>
      </div>
    </div>
  );
};
