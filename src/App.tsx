import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AdminDashboard } from './components/AdminDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { QuizEditor } from './components/QuizEditor';
import { QuizRunner } from './components/QuizRunner';
import { GradingResultModal } from './components/GradingResultModal';
import { LoginModal } from './components/LoginModal';
import {
  GradingResponse,
  QuizPackage,
  RealtimeEvent,
  SubmissionRecord,
  User,
} from './types';
import { api } from './services/api';
import { INITIAL_USERS, INITIAL_CLASSES } from './mockData';
import { Radio } from 'lucide-react';

export default function App() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default to Admin: Rudi Mulyana (rudimulyana72)
  const [packages, setPackages] = useState<QuizPackage[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [classes, setClasses] = useState<string[]>(INITIAL_CLASSES);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnectedRealtime, setIsConnectedRealtime] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // App routing / active screens
  const [activeScreen, setActiveScreen] = useState<'dashboard' | 'editor' | 'runner'>('dashboard');
  const [editingPackage, setEditingPackage] = useState<QuizPackage | null>(null);
  const [runningPackage, setRunningPackage] = useState<QuizPackage | null>(null);

  // Global grading modal
  const [inspectGrading, setInspectGrading] = useState<GradingResponse | null>(null);
  const [inspectTitle, setInspectTitle] = useState('');
  const [inspectStudent, setInspectStudent] = useState('');

  // Live broadcast push alert
  const [realtimeAlert, setRealtimeAlert] = useState<string | null>(null);

  // Load initial data from server
  const loadInitialData = async () => {
    try {
      const data = await api.getInitialState();
      setUsers(data.users);
      setPackages(data.packages);
      setSubmissions(data.submissions);
      setClasses(data.classes);
      setIsConnectedRealtime(true);
    } catch (err) {
      console.warn('Backend server error or offline fallback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Subscribe to SSE & cross-tab events
    const unsubscribe = api.subscribeToEvents((event: RealtimeEvent) => {
      console.log('Real-Time Event Received:', event);
      setIsConnectedRealtime(true);

      if (event.type === 'PACKAGE_PUBLISHED') {
        const pkg: QuizPackage = event.payload?.package;
        if (pkg) {
          setPackages((prev) => {
            const exists = prev.some((p) => p.id === pkg.id);
            if (exists) {
              return prev.map((p) => (p.id === pkg.id ? pkg : p));
            }
            return [pkg, ...prev];
          });
        }
        setRealtimeAlert(
          event.payload?.message ||
            `Paket Soal Baru Diterbitkan untuk ${event.targetClass || 'Kelas Anda'}!`
        );
      } else if (event.type === 'SUBMISSION_GRADED') {
        const sub: SubmissionRecord = event.payload?.submission;
        if (sub) {
          setSubmissions((prev) => [sub, ...prev.filter((s) => s.id !== sub.id)]);
        }
      } else if (event.type === 'USER_CREATED') {
        const newUser: User = event.payload?.user;
        if (newUser) {
          setUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id)]);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Handlers
  const handleStartQuiz = (pkg: QuizPackage) => {
    setRunningPackage(pkg);
    setActiveScreen('runner');
  };

  const handleCreateNewPackage = () => {
    setEditingPackage(null);
    setActiveScreen('editor');
  };

  const handleEditPackage = (pkg: QuizPackage) => {
    setEditingPackage(pkg);
    setActiveScreen('editor');
  };

  const handleSavedPackage = (saved: QuizPackage) => {
    setPackages((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
    loadInitialData();
    setActiveScreen('dashboard');
  };

  const handleViewGrading = (sub: SubmissionRecord) => {
    setInspectGrading(sub.gradingResult);
    setInspectTitle(sub.packageTitle);
    setInspectStudent(sub.siswa_nama);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl border-4 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-slate-300">
          Memuat Sistem LMS Real-Time & Backend AI...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        currentUser={currentUser}
        users={users}
        onSwitchUser={(user) => {
          setCurrentUser(user);
          setActiveScreen('dashboard');
        }}
        isConnectedRealtime={isConnectedRealtime}
        activeRole={currentUser.role}
        notificationCount={realtimeAlert ? 1 : 0}
        onOpenLogin={() => setLoginModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Editor Screen */}
        {activeScreen === 'editor' && (
          <QuizEditor
            initialPackage={editingPackage}
            teacherId={currentUser.id}
            teacherName={currentUser.name}
            classes={classes}
            onSave={handleSavedPackage}
            onCancel={() => setActiveScreen('dashboard')}
          />
        )}

        {/* Runner Screen */}
        {activeScreen === 'runner' && runningPackage && (
          <QuizRunner
            quizPackage={runningPackage}
            currentUser={currentUser}
            onExit={() => setActiveScreen('dashboard')}
            onGraded={(res) => {
              loadInitialData();
            }}
          />
        )}

        {/* Dashboards Screen */}
        {activeScreen === 'dashboard' && (
          <>
            {currentUser.role === 'ADMIN' && (
              <AdminDashboard
                currentUser={currentUser}
                users={users}
                packages={packages}
                submissions={submissions}
                classes={classes}
                onRefresh={loadInitialData}
                onViewGrading={handleViewGrading}
              />
            )}

            {currentUser.role === 'GURU' && (
              <TeacherDashboard
                currentUser={currentUser}
                packages={packages}
                submissions={submissions}
                classes={classes}
                onCreateNewPackage={handleCreateNewPackage}
                onEditPackage={handleEditPackage}
                onRefresh={loadInitialData}
                onViewGrading={handleViewGrading}
              />
            )}

            {currentUser.role === 'SISWA' && (
              <StudentDashboard
                currentUser={currentUser}
                packages={packages}
                submissions={submissions}
                classes={classes}
                onStartQuiz={handleStartQuiz}
                onViewGrading={handleViewGrading}
                newPublishedAlert={realtimeAlert}
                onDismissAlert={() => setRealtimeAlert(null)}
              />
            )}
          </>
        )}
      </main>

      {/* Global Auto-Grading Inspector Modal */}
      <GradingResultModal
        isOpen={Boolean(inspectGrading)}
        onClose={() => setInspectGrading(null)}
        result={inspectGrading}
        packageTitle={inspectTitle}
        studentName={inspectStudent}
      />

      {/* Login / Switch Account Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={(u) => {
          setCurrentUser(u);
          setActiveScreen('dashboard');
        }}
        availableUsers={users}
      />
    </div>
  );
}
