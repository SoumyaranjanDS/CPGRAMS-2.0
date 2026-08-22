import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Layout } from './components/layout/Layout.js';
import { HomePage } from './pages/HomePage.js';
import { SuccessPage } from './pages/SuccessPage.js';
import { RegistrationPage } from './pages/RegistrationPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { CitizenDashboardPage } from './pages/CitizenDashboardPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { DirectIssueIntakeForm } from './components/dashboard/DirectIssueIntakeForm.js';
import { VoiceDictationModal } from './components/home/VoiceDictationModal.js';
import { QuickTrackModal } from './components/home/QuickTrackModal.js';
import { PublicOnlyRoute } from './components/common/ProtectedRoute.js';
import { useAuth } from './context/AuthContext.js';
import { Department } from './types/index.js';

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptLoading, setDeptLoading] = useState(true);

  // Global Modals state
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  // Active Grievance filing state
  const [initialNarrative, setInitialNarrative] = useState('');
  const [lodgedGrievanceId, setLodgedGrievanceId] = useState<string | null>(null);

  // Fetch Departments from Backend API
  const fetchDepartments = async () => {
    setDeptLoading(true);
    try {
      const deptRes = await axios.get('/api/v1/taxonomy/departments');
      setDepartments(deptRes.data.data || []);
    } catch {
      setDepartments([]);
    } finally {
      setDeptLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Compute current view name based on pathname for navbar highlight
  const getCurrentView = () => {
    if (location.pathname.startsWith('/dashboard')) return 'dashboard';
    if (location.pathname.startsWith('/lodge') || location.pathname.startsWith('/intake')) return 'lodge';
    if (location.pathname.startsWith('/success')) return 'success';
    if (location.pathname.startsWith('/registration') || location.pathname.startsWith('/register')) return 'registration';
    if (location.pathname.startsWith('/login') || location.pathname.startsWith('/signin')) return 'login';
    return 'home';
  };

  const handleStartComplaint = (initialText?: string) => {
    if (initialText) {
      setInitialNarrative(initialText);
    }
    navigate('/dashboard?tab=lodge');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVoiceTranscriptReady = (transcript: string) => {
    setInitialNarrative(transcript);
    navigate('/dashboard?tab=lodge');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleComplaintSuccess = (id: string) => {
    setLodgedGrievanceId(id);
    navigate(`/success/${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout
      currentView={getCurrentView()}
      onNavigate={(view: string) => {
        if (view === 'track') {
          setIsTrackModalOpen(true);
        } else if (view === 'home') {
          navigate('/');
        } else if (view === 'dashboard') {
          if (isAuthenticated) {
            navigate('/dashboard');
          } else {
            navigate('/login?redirect=' + encodeURIComponent('/dashboard'));
          }
        } else if (view === 'directory') {
          navigate('/');
          setTimeout(() => {
            document.getElementById('directory')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        } else {
          navigate(view);
        }
      }}
      onLodgeClick={() => handleStartComplaint()}
    >
      <Routes>
        {/* ================= ROUTE 1: HOME PAGE ================= */}
        <Route
          path="/"
          element={
            <HomePage
              departments={departments}
              deptLoading={deptLoading}
              onStartComplaint={handleStartComplaint}
              onTrackComplaint={() => setIsTrackModalOpen(true)}
              onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            />
          }
        />

        {/* ================= ROUTE 2: OFFICIAL CITIZEN REGISTRATION PAGE (PUBLIC ONLY) ================= */}
        <Route path="/registration" element={<PublicOnlyRoute><RegistrationPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegistrationPage /></PublicOnlyRoute>} />
        <Route path="/signup" element={<PublicOnlyRoute><RegistrationPage /></PublicOnlyRoute>} />

        {/* ================= ROUTE 3: SIGN IN PAGE (PUBLIC ONLY) ================= */}
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/signin" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />

        {/* ================= ROUTE 4: CITIZEN DASHBOARD ================= */}
        <Route path="/dashboard" element={<CitizenDashboardPage />} />
        <Route path="/dashboard/:tab" element={<CitizenDashboardPage />} />

        {/* ================= ROUTE 5: INTAKE / LODGE COMPLAINT ================= */}
        <Route
          path="/lodge"
          element={
            <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-5">
              <DirectIssueIntakeForm
                initialNarrative={initialNarrative}
                onSuccess={handleComplaintSuccess}
                onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              />
            </div>
          }
        />
        <Route
          path="/intake"
          element={
            <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-5">
              <DirectIssueIntakeForm
                initialNarrative={initialNarrative}
                onSuccess={handleComplaintSuccess}
                onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              />
            </div>
          }
        />

        {/* ================= ROUTE 6: SUCCESS CONFIRMATION RECEIPT ================= */}
        <Route
          path="/success/:id"
          element={
            <SuccessPage
              onTrack={() => setIsTrackModalOpen(true)}
              onReturnHome={() => navigate('/')}
            />
          }
        />
        <Route
          path="/success"
          element={
            <SuccessPage
              grievanceId={lodgedGrievanceId || undefined}
              onTrack={() => setIsTrackModalOpen(true)}
              onReturnHome={() => navigate('/')}
            />
          }
        />

        {/* Fallback 404 Route */}
        <Route
          path="*"
          element={<NotFoundPage onTrackComplaint={() => setIsTrackModalOpen(true)} />}
        />
      </Routes>

      {/* ================= GLOBAL MODALS ================= */}

      {/* Voice Dictation Modal */}
      <VoiceDictationModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTranscriptReady={handleVoiceTranscriptReady}
      />

      {/* Quick Track Modal */}
      <QuickTrackModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        initialId={lodgedGrievanceId || 'GRV-2026-004821'}
      />
    </Layout>
  );
}

export default App;
