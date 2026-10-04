import {
  GradingResponse,
  QuizPackage,
  RealtimeEvent,
  SubmissionRecord,
  User,
} from '../types';

const BROADCAST_CHANNEL_NAME = 'edurealtime_lms_sync';
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch {
  // Ignore if not supported in environment
}

export const api = {
  async getInitialState(): Promise<{
    users: User[];
    packages: QuizPackage[];
    submissions: SubmissionRecord[];
    classes: string[];
  }> {
    const res = await fetch('/api/initial-state');
    if (!res.ok) throw new Error('Gagal memuat data awal server.');
    return res.json();
  },

  async login(username: string, password: string): Promise<User> {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login gagal.');
    }
    const data = await res.json();
    return data.user;
  },

  async createUser(userData: {
    name: string;
    role: 'ADMIN' | 'GURU' | 'SISWA';
    email: string;
    nipOrNis?: string;
    subject?: string;
    assignedClass?: string;
    createdBy?: string;
    password?: string;
  }): Promise<User> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal membuat akun pengguna.');
    }
    const created = await res.json();
    broadcastChannel?.postMessage({
      type: 'USER_CREATED',
      timestamp: new Date().toISOString(),
      payload: { user: created },
    });
    return created;
  },

  async deleteUser(userId: string): Promise<void> {
    const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal menghapus akun pengguna.');
    }
  },

  async validateQuizPackage(pkg: Partial<QuizPackage>) {
    const res = await fetch('/api/quiz-packages/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pkg),
    });
    if (!res.ok) throw new Error('Gagal menjalankan validasi AI backend.');
    return res.json();
  },

  async saveAndPublishPackage(pkg: Partial<QuizPackage>): Promise<QuizPackage> {
    const res = await fetch('/api/quiz-packages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pkg),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Gagal menyimpan dan mempublikasikan paket soal.');
    }
    const saved = await res.json();

    // Broadcast through cross-tab channel for instant local synchronization
    if (saved.status === 'published') {
      broadcastChannel?.postMessage({
        type: 'PACKAGE_PUBLISHED',
        timestamp: new Date().toISOString(),
        targetClass: saved.targetClass,
        payload: {
          package: saved,
          message: `Paket Soal Baru Diterbitkan: "${saved.title}" untuk ${saved.targetClass}`,
        },
      });
    }

    return saved;
  },

  async deleteQuizPackage(pkgId: string): Promise<void> {
    const res = await fetch(`/api/quiz-packages/${pkgId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Gagal menghapus paket soal.');
  },

  async submitAnswers(payload: {
    packageId: string;
    siswa_id: string;
    siswa_nama: string;
    kelas: string;
    answers: Record<string, any>;
  }): Promise<GradingResponse> {
    const res = await fetch('/api/grade-submission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Gagal melakukan penilaian otomatis.');
    }
    const result: GradingResponse = await res.json();

    broadcastChannel?.postMessage({
      type: 'SUBMISSION_GRADED',
      timestamp: new Date().toISOString(),
      targetClass: payload.kelas,
      payload: {
        siswa_nama: payload.siswa_nama,
        kelas: payload.kelas,
        total_skor: result.total_skor,
      },
    });

    return result;
  },

  // Subscribe to real-time events via SSE + BroadcastChannel
  subscribeToEvents(
    onEvent: (event: RealtimeEvent) => void,
    userRole?: string,
    userClass?: string
  ): () => void {
    let eventSource: EventSource | null = null;

    try {
      const query = new URLSearchParams();
      if (userRole) query.append('role', userRole);
      if (userClass) query.append('userClass', userClass);

      eventSource = new EventSource(`/api/events?${query.toString()}`);

      eventSource.onmessage = (e) => {
        try {
          const data: RealtimeEvent = JSON.parse(e.data);
          onEvent(data);
        } catch {
          // Ignore parse errors (e.g., heartbeat)
        }
      };

      eventSource.onerror = () => {
        // SSE auto-reconnects, silent fallback
      };
    } catch {
      // EventSource not available or failed
    }

    // Cross-tab broadcast listener
    const handleBroadcast = (e: MessageEvent) => {
      if (e.data && e.data.type) {
        onEvent(e.data);
      }
    };
    broadcastChannel?.addEventListener('message', handleBroadcast);

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      broadcastChannel?.removeEventListener('message', handleBroadcast);
    };
  },
};
