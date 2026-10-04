export type Role = 'ADMIN' | 'GURU' | 'SISWA';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: Role;
  email: string;
  nipOrNis?: string;
  subject?: string;
  assignedClass?: string;
  enrolledClasses?: string[];
  avatar?: string;
  createdBy?: string;
  createdAt: string;
}

export type QuestionType =
  | 'pilihan_ganda'
  | 'isian_singkat'
  | 'essay'
  | 'salah_benar'
  | 'menjodohkan';

export interface MultipleChoiceOption {
  id: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
}

export interface MatchingPair {
  id: string;
  itemA: string;
  itemB: string;
}

export interface Question {
  id: string;
  number: number;
  type: QuestionType;
  prompt: string;
  points: number;
  imageUrls?: string[]; // max 5 supporting images
  imageCaptions?: string[];

  // For pilihan_ganda
  options?: MultipleChoiceOption[];
  correctKey?: 'A' | 'B' | 'C' | 'D' | 'E';

  // For isian_singkat
  correctAnswer?: string;
  keywords?: string[];

  // For essay
  rubric?: string; // Rubrik penilaian / instruksi jawaban ideal
  idealAnswer?: string;

  // For salah_benar
  statement?: string;
  correctBoolean?: boolean; // true = Benar, false = Salah

  // For menjodohkan
  pairs?: MatchingPair[];
}

export interface AIValidationResult {
  isValid: boolean;
  scoreQuality: number; // 0 - 100
  readinessStatus: 'SIAP_DISTRIBUSIKAN' | 'PERLU_PERBAIKAN';
  summary: string;
  recommendations: string[];
  imageAnalysis: string[];
  validatedAt: string;
}

export interface QuizPackage {
  id: string;
  title: string;
  subject: string;
  targetClass: string; // e.g. "Kelas 10 MIPA 1" or "Semua Kelas"
  teacherId: string;
  teacherName: string;
  instructions: string;
  durationMinutes: number;
  passingScore: number;
  images: string[]; // Maksimal 5 gambar per paket soal/materi
  imageCaptions?: string[];
  questions: Question[];
  status: 'draft' | 'published';
  aiValidation?: AIValidationResult;
  createdAt: string;
  publishedAt?: string;
}

export interface QuestionGradingDetail {
  nomor_soal: number;
  tipe_soal: QuestionType;
  skor: number; // 0 to 100 (or points earned)
  status: 'Benar' | 'Salah' | 'Sebagian Benar';
  catatan_ai: string;
  studentAnswerText?: string;
  correctReferenceText?: string;
}

export interface GradingResponse {
  status: 'success' | 'error';
  siswa_id: string;
  kelas: string;
  total_skor: number;
  ringkasan_penilaian: QuestionGradingDetail[];
  catatan_keseluruhan: string;
  message?: string;
}

export interface SubmissionRecord {
  id: string;
  packageId: string;
  packageTitle: string;
  subject: string;
  siswa_id: string;
  siswa_nama: string;
  kelas: string;
  answers: Record<string, any>;
  gradingResult: GradingResponse;
  submittedAt: string;
}

export interface RealtimeEvent {
  type: 'PACKAGE_PUBLISHED' | 'SUBMISSION_GRADED' | 'USER_CREATED' | 'SYSTEM_ANNOUNCEMENT';
  timestamp: string;
  targetClass?: string;
  payload: any;
}
