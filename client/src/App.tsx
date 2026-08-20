import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import axios from 'axios';
import { Layout } from './components/layout/Layout.js';
import { Button } from './components/common/Button.js';
import { Alert } from './components/common/Alert.js';
import { Input } from './components/common/Input.js';
import { Modal } from './components/common/Modal.js';
import { HomePage } from './pages/HomePage.js';
import { SuccessPage } from './pages/SuccessPage.js';
import { IntakeWorkflow } from './components/intake/IntakeWorkflow.js';
import { VoiceDictationModal } from './components/home/VoiceDictationModal.js';
import { QuickTrackModal } from './components/home/QuickTrackModal.js';
import { Department } from './types/index.js';

export function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptLoading, setDeptLoading] = useState(true);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);

  // Active Grievance filing state
  const [initialNarrative, setInitialNarrative] = useState('');
  const [lodgedGrievanceId, setLodgedGrievanceId] = useState<string | null>(null);

  // Mock User
  const [mockUser, setMockUser] = useState<any>(null);
  const [otpPhone, setOtpPhone] = useState('+91 98765 43210');
  const [otpCode, setOtpCode] = useState('123456');

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

  const handleSimulateLogin = () => {
    setMockUser({
      name: 'Soumya Ranjan',
      phone: otpPhone,
      role: 'CITIZEN',
      userId: 'USR-882910',
    });
    setIsAuthModalOpen(false);
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
      user={mockUser}
      onLoginClick={() => setIsAuthModalOpen(true)}
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

      {/* Citizen Authentication Modal */}
      <Modal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-[#0A2540]">
            <Lock className="w-5 h-5 text-blue-700" />
            <span>Citizen Authentication &bull; OTP Verification</span>
          </div>
        }
        description="Statutory identity verification preserving your active session state."
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAuthModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSimulateLogin} className="font-bold">
              Verify OTP &amp; Sign In
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Mobile Number / Email Address"
            value={otpPhone}
            onChange={(e) => setOtpPhone(e.target.value)}
            helperText="A 6-digit verification code will be dispatched."
          />
          <Input
            label="6-Digit Verification Code (OTP)"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="123456"
            helperText="Demo test OTP is 123456"
          />
          <Alert variant="info">
            Authentication is required to link registered complaints to your citizen record for
            official DARPG correspondence.
          </Alert>
        </div>
      </Modal>
    </Layout>
  );
}

export default App;
