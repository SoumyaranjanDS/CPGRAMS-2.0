import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Layout } from './components/layout/Layout.js';
import { HomePage } from './pages/HomePage.js';
import { SuccessPage } from './pages/SuccessPage.js';
import { IntakeWorkflow } from './components/intake/IntakeWorkflow.js';
import { VoiceDictationModal } from './components/home/VoiceDictationModal.js';
import { QuickTrackModal } from './components/home/QuickTrackModal.js';
import { AuthModal } from './components/auth/AuthModal.js';
import { useAuth } from './context/AuthContext.js';
import { Department } from './types/index.js';

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthModalOpen, closeAuthModal } = useAuth();

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
    if (location.pathname.startsWith('/lodge') || location.pathname.startsWith('/intake')) return 'lodge';
    if (location.pathname.startsWith('/success')) return 'success';
    return 'home';
  };

  const handleStartComplaint = (initialText?: string) => {
    if (initialText) {
      setInitialNarrative(initialText);
    }
    navigate('/lodge');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVoiceTranscriptReady = (transcript: string) => {
    setInitialNarrative(transcript);
    navigate('/lodge');
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

        {/* ================= ROUTE 2: INTAKE / LODGE COMPLAINT ================= */}
        <Route
          path="/lodge"
          element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <IntakeWorkflow
                initialNarrative={initialNarrative}
                onSuccess={handleComplaintSuccess}
                onCancel={() => navigate('/')}
                onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              />
            </div>
          }
        />
        <Route
          path="/intake"
          element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <IntakeWorkflow
                initialNarrative={initialNarrative}
                onSuccess={handleComplaintSuccess}
                onCancel={() => navigate('/')}
                onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              />
            </div>
          }
        />

        {/* ================= ROUTE 3: SUCCESS CONFIRMATION RECEIPT ================= */}
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

        {/* Fallback to Home */}
        <Route
          path="*"
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
      </Routes>

      {/* ================= GLOBAL MODALS ================= */}

      {/* Auth Modal with OTP & Role Presets */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />

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
