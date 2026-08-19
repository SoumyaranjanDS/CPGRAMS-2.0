import { useState, useEffect } from 'react';
import {
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  Shield,
  Sparkles,
  MapPin,
  Building2,
  ArrowUpRight,
  Check,
  FileText,
  UploadCloud,
} from 'lucide-react';
import axios from 'axios';
import { Layout } from './components/layout/Layout.js';
import { Button } from './components/common/Button.js';
import { Input } from './components/common/Input.js';
import { Modal } from './components/common/Modal.js';
import { Badge } from './components/common/Badge.js';
import { Department } from './types/index.js';

export function App() {
  const [currentView, setCurrentView] = useState('home');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [deptSearch, setDeptSearch] = useState('');

  // Intake / Triage state
  const [issueText, setIssueText] = useState('');
  const [pinCode, setPinCode] = useState('751001');
  const [isTriaging, setIsTriaging] = useState(false);
  const [triageResult, setTriageResult] = useState<any>({
    category: 'Pension & Social Security Benefit',
    department: 'Employees Provident Fund Organisation (EPFO)',
    ministry: 'Ministry of Labour & Employment',
    slaDays: 15,
    confidenceScore: '99.4%',
    requiredDocs: ['Aadhaar Card / UAN Number', 'Bank Passbook / PPO Statement'],
  });

  // PIN Code Resolver state
  const [resolvedLocation, setResolvedLocation] = useState<any>({
    pincode: '751001',
    locality: 'Bhubaneswar GPO',
    district: 'Khordha',
    state: 'Odisha',
    subDivision: 'Bhubaneswar Urban',
    localBody: 'Bhubaneswar Municipal Corporation (BMC)',
    assignedOfficer: 'District Grievance Officer, Khordha',
  });
  const [pinLoading, setPinLoading] = useState(false);

  // Track Grievance state
  const [trackIdInput, setTrackIdInput] = useState('CPG-2026-88410');
  const trackedGrievance = {
    id: 'CPG-2026-88410',
    title: 'Discrepancy in EPFO Pension Annuity Calculation and Claim Settlement',
    department: 'Employees Provident Fund Organisation (EPFO)',
    ministry: 'Ministry of Labour & Employment',
    status: 'UNDER_REVIEW',
    submittedDate: '12 Feb 2026',
    slaTargetDate: '27 Feb 2026',
    officer: 'Shri R. K. Nayak, Joint Commissioner',
    currentStep: 3,
    steps: [
      { id: 1, title: 'Grievance Ingested', date: '12 Feb 2026', completed: true, remark: 'Digital ingestion via secure citizen portal.' },
      { id: 2, title: 'AI Classification & Routing', date: '12 Feb 2026', completed: true, remark: 'Automated intent matching to EPFO Nodal Jurisdiction.' },
      { id: 3, title: 'Assigned to Nodal Officer', date: '14 Feb 2026', completed: true, remark: 'Under active review by Regional PPO Cell.' },
      { id: 4, title: 'Field Investigation & ATR', date: 'Target: 22 Feb 2026', completed: false, remark: 'Action Taken Report preparation in progress.' },
      { id: 5, title: 'Final Redressal & Citizen Sign-off', date: 'Target: 27 Feb 2026', completed: false, remark: 'Mandatory citizen feedback & closure review.' },
    ],
  };

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLodgeModalOpen, setIsLodgeModalOpen] = useState(false);
  const [mockUser, setMockUser] = useState<any>(null);
  const [otpPhone, setOtpPhone] = useState('+91 98765 43210');
  const [otpCode, setOtpCode] = useState('123456');

  // Fetch departments data
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const deptRes = await axios.get('/api/v1/taxonomy/departments');
        setDepartments(deptRes.data.data || []);
      } catch {
        setDepartments([
          {
            departmentId: 'DEP-DARPG-01',
            code: 'DARPG',
            name: 'Administrative Reforms & Public Grievances',
            ministry: 'Ministry of Personnel, Public Grievances and Pensions',
            jurisdiction: 'CENTRAL',
            state: 'Central',
            slaDays: 21,
            nodalOfficerName: 'Shri V. Srinivas, IAS',
            nodalOfficerEmail: 'sec-darpg@nic.in',
            supportEmail: 'darpg-support@gov.in',
          },
          {
            departmentId: 'DEP-EPFO-02',
            code: 'EPFO',
            name: 'Employees Provident Fund Organisation',
            ministry: 'Ministry of Labour & Employment',
            jurisdiction: 'CENTRAL',
            state: 'Central',
            slaDays: 15,
            nodalOfficerName: 'Ms. Neelam Shami Rao, CPFC',
            nodalOfficerEmail: 'epfo.grievance@epfindia.gov.in',
            supportEmail: 'epfo-support@gov.in',
          },
          {
            departmentId: 'DEP-DOT-03',
            code: 'DOT',
            name: 'Department of Telecommunications',
            ministry: 'Ministry of Communications',
            jurisdiction: 'CENTRAL',
            state: 'Central',
            slaDays: 21,
            nodalOfficerName: 'Shri Neeraj Mittal, Secretary',
            nodalOfficerEmail: 'dot.nodal@gov.in',
            supportEmail: 'dot-support@gov.in',
          },
          {
            departmentId: 'DEP-CBDT-04',
            code: 'CBDT',
            name: 'Central Board of Direct Taxes (Income Tax)',
            ministry: 'Ministry of Finance',
            jurisdiction: 'CENTRAL',
            state: 'Central',
            slaDays: 21,
            nodalOfficerName: 'Shri Ravi Agrawal, IRS',
            nodalOfficerEmail: 'cbdt.redress@incometax.gov.in',
            supportEmail: 'cbdt-support@gov.in',
          },
          {
            departmentId: 'DEP-RAIL-05',
            code: 'MOR',
            name: 'Railway Board & Passenger Services',
            ministry: 'Ministry of Railways',
            jurisdiction: 'CENTRAL',
            state: 'Central',
            slaDays: 7,
            nodalOfficerName: 'Shri Satish Kumar, Chairman',
            nodalOfficerEmail: 'rail.nodal@gov.in',
            supportEmail: 'rail-support@gov.in',
          },
          {
            departmentId: 'DEP-UD-06',
            code: 'HUA',
            name: 'Housing & Urban Affairs',
            ministry: 'Ministry of Housing and Urban Affairs',
            jurisdiction: 'CENTRAL',
            state: 'Central',
            slaDays: 21,
            nodalOfficerName: 'Shri Anurag Jain, Secretary',
            nodalOfficerEmail: 'sec-mohua@nic.in',
            supportEmail: 'mohua-support@gov.in',
          },
        ]);
      }
    };

    fetchDepts();
  }, []);

  const handlePinLookup = async (pin: string) => {
    if (!pin || pin.length !== 6) return;
    setPinLoading(true);
    try {
      const res = await axios.get(`/api/v1/taxonomy/pin/${pin}`);
      setResolvedLocation(res.data.data);
    } catch {
      setResolvedLocation({
        pincode: pin,
        locality: 'Bhubaneswar Central GPO',
        district: 'Khordha',
        state: 'Odisha',
        subDivision: 'Bhubaneswar Urban',
        localBody: 'Bhubaneswar Municipal Corporation (BMC)',
        assignedOfficer: 'District Grievance Officer, Khordha',
      });
    } finally {
      setPinLoading(false);
    }
  };

  const handleSimulateTriage = (text: string) => {
    if (!text.trim()) return;
    setIsTriaging(true);
    setTimeout(() => {
      setIsTriaging(false);
      if (text.toLowerCase().includes('water') || text.toLowerCase().includes('pipe') || text.toLowerCase().includes('road')) {
        setTriageResult({
          category: 'Urban Infrastructure & Public Utilities',
          department: 'Housing & Urban Affairs (Municipal Cell)',
          ministry: 'Ministry of Housing and Urban Affairs',
          slaDays: 7,
          confidenceScore: '98.8%',
          requiredDocs: ['Geo-tagged photograph of location', 'Locality landmark description'],
        });
      } else if (text.toLowerCase().includes('tax') || text.toLowerCase().includes('refund')) {
        setTriageResult({
          category: 'Direct Taxes / Income Tax Refund Delay',
          department: 'Central Board of Direct Taxes (CBDT)',
          ministry: 'Ministry of Finance',
          slaDays: 21,
          confidenceScore: '99.1%',
          requiredDocs: ['PAN Card Number', 'Acknowledgement Number (ITR-V)'],
        });
      } else {
        setTriageResult({
          category: 'Pension & Social Security Benefit',
          department: 'Employees Provident Fund Organisation (EPFO)',
          ministry: 'Ministry of Labour & Employment',
          slaDays: 15,
          confidenceScore: '99.4%',
          requiredDocs: ['Aadhaar Card / UAN Number', 'Bank Passbook / PPO Statement'],
        });
      }
    }, 400);
  };

  const handleSimulateLogin = () => {
    setMockUser({
      name: 'Soumya Ranjan',
      phone: otpPhone,
      role: 'Verified Citizen',
      userId: 'USR-882910',
    });
    setIsAuthModalOpen(false);
  };

  const filteredDepts = departments.filter((d) =>
    d.name.toLowerCase().includes(deptSearch.toLowerCase()) ||
    d.ministry.toLowerCase().includes(deptSearch.toLowerCase()) ||
    d.code.toLowerCase().includes(deptSearch.toLowerCase())
  );

  return (
    <Layout
      currentView={currentView}
      onNavigate={setCurrentView}
      user={mockUser}
      onLoginClick={() => setIsAuthModalOpen(true)}
      onLodgeClick={() => setIsLodgeModalOpen(true)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-20 font-sans">
        
        {/* ========================================================================= */}
        {/* HERO SECTION — Clean Typographic Authority & Direct Action               */}
        {/* ========================================================================= */}
        <section className="pt-4 pb-10 border-b border-[#E4E4E7]">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#F4F4F5] text-[#52525B] text-xs font-medium border border-[#E4E4E7]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
              <span>CPGRAMS 2.0 National Public Digital Infrastructure</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0A0A0B] leading-[1.08]">
              Public Grievance Redressal, <br />
              Reimagined for Citizens.
            </h1>

            <p className="text-[#52525B] text-base sm:text-lg leading-relaxed font-normal">
              Direct, transparent dispute resolution across Indian Central and State Ministries with
              statutory 21-day time-bound accountability and verifiable Action Taken Reports (ATRs).
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsLodgeModalOpen(true)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Lodge Public Grievance
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  const el = document.getElementById('track-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Track Reference Status
              </Button>
            </div>
          </div>

          {/* Statutory Benchmark Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 mt-12 border-t border-[#E4E4E7]">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#0A0A0B] tracking-tight">21 Days</div>
              <div className="text-xs font-medium text-[#71717A] mt-1">Standard Redressal SLA</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#0A0A0B] tracking-tight">100%</div>
              <div className="text-xs font-medium text-[#71717A] mt-1">Mandatory Officer ATR Upload</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#0A0A0B] tracking-tight">30 Days</div>
              <div className="text-xs font-medium text-[#71717A] mt-1">Statutory First Appeal Window</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#0A0A0B] tracking-tight">10,000+</div>
              <div className="text-xs font-medium text-[#71717A] mt-1">Central &amp; State Authorities</div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 1: NATURAL LANGUAGE GRIEVANCE INTAKE & LIVE AI ROUTING            */}
        {/* ========================================================================= */}
        <section id="lodge" className="space-y-8 pt-4">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#2563EB] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Intelligent Ingestion Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0A0A0B] tracking-tight">
              Describe Your Problem in Natural Language
            </h2>
            <p className="text-sm text-[#71717A]">
              Citizens no longer need to know government departmental taxonomies. Type your issue in plain words; our semantic triage engine automatically determines jurisdiction and SLA.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Input Textarea & PIN Code */}
            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-[#52525B]">
                  <label htmlFor="grievance-text" className="font-semibold text-[#0A0A0B]">
                    Grievance Statement
                  </label>
                  <span className="text-[11px] text-[#059669] flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Auto-Save Active (IndexedDB)
                  </span>
                </div>
                <textarea
                  id="grievance-text"
                  rows={5}
                  value={issueText}
                  onChange={(e) => {
                    setIssueText(e.target.value);
                    handleSimulateTriage(e.target.value);
                  }}
                  placeholder="State your problem in simple words. For example: 'My pension claim submitted under PPO 98214 has not been disbursed for 3 months' or 'Water pipeline burst on Ring Road causing severe flooding'..."
                  className="block w-full rounded-lg border border-[#E4E4E7] bg-white p-3.5 text-sm text-[#0A0A0B] placeholder:text-[#A1A1AA] focus:border-[#0A0A0B] focus:ring-1 focus:ring-[#0A0A0B] focus:outline-none transition-colors"
                />
              </div>

              {/* Sample Prompts */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#71717A]">
                <span className="font-medium text-[#0A0A0B]">Try example:</span>
                {[
                  'EPFO pension annuity delayed 3 months',
                  'Water pipeline burst near government school',
                  'Income tax refund not credited',
                ].map((sample) => (
                  <button
                    key={sample}
                    onClick={() => {
                      setIssueText(sample);
                      handleSimulateTriage(sample);
                    }}
                    className="px-2.5 py-1 rounded bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[#0A0A0B] transition-colors cursor-pointer text-xs font-medium"
                  >
                    {sample}
                  </button>
                ))}
              </div>

              {/* PIN Code Resolution Input */}
              <div className="pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <Input
                      label="Postal PIN Code (Auto-Jurisdiction)"
                      value={pinCode}
                      maxLength={6}
                      onChange={(e) => {
                        setPinCode(e.target.value);
                        if (e.target.value.length === 6) {
                          handlePinLookup(e.target.value);
                        }
                      }}
                      placeholder="e.g. 751001, 110001, 400001"
                      leftIcon={<MapPin className="w-4 h-4" />}
                    />
                  </div>
                  <div className="sm:self-end">
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => handlePinLookup(pinCode)}
                      isLoading={pinLoading}
                    >
                      Resolve Authority
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="accent"
                  size="md"
                  onClick={() => setIsLodgeModalOpen(true)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Proceed to File Grievance
                </Button>
              </div>
            </div>

            {/* Right: Live Triage Prediction Breakdown */}
            <div className="lg:col-span-5 bg-white border border-[#E4E4E7] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4E4E7]">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isTriaging ? 'bg-[#2563EB] animate-ping' : 'bg-[#059669]'}`}></div>
                  <span className="text-xs font-semibold text-[#0A0A0B] uppercase tracking-wide">
                    {isTriaging ? 'Classifying Intent...' : 'Live AI Triage Analysis'}
                  </span>
                </div>
                <Badge variant={isTriaging ? 'warning' : 'success'}>
                  {isTriaging ? 'Analyzing...' : `${triageResult.confidenceScore} Accuracy`}
                </Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[#71717A] block font-medium">Classified Ministry &amp; Department:</span>
                  <div className="text-sm font-bold text-[#0A0A0B] mt-0.5">{triageResult.department}</div>
                  <div className="text-[#71717A] mt-0.5">{triageResult.ministry}</div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#F4F4F5]">
                  <div>
                    <span className="text-[#71717A] block font-medium">Statutory SLA Target:</span>
                    <strong className="text-sm text-[#0A0A0B] font-bold">{triageResult.slaDays} Calendar Days</strong>
                  </div>
                  <div>
                    <span className="text-[#71717A] block font-medium">Subject Category:</span>
                    <strong className="text-sm text-[#0A0A0B] font-medium">{triageResult.category}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F4F4F5]">
                  <span className="text-[#71717A] block font-medium">Recommended Evidence Checklist:</span>
                  <ul className="mt-1 space-y-1 text-[#0A0A0B]">
                    {triageResult.requiredDocs.map((doc: string) => (
                      <li key={doc} className="flex items-center gap-1.5 text-xs">
                        <Check className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {resolvedLocation && (
                  <div className="pt-2 border-t border-[#F4F4F5] text-[11px] text-[#52525B]">
                    <span className="font-semibold text-[#0A0A0B]">Cascaded Postal Jurisdiction: </span>
                    <span>{resolvedLocation.locality}, {resolvedLocation.district}, {resolvedLocation.state}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: LIVE GRIEVANCE TRACKER & STATUTORY AUDIT TIMELINE              */}
        {/* ========================================================================= */}
        <section id="track-section" className="space-y-8 pt-4 border-t border-[#E4E4E7]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0A0A0B] uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Transparent Public Audit Trail</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0A0A0B] tracking-tight">
                Track Grievance Status &amp; Action Taken Reports
              </h2>
              <p className="text-sm text-[#71717A]">
                Every grievance is bound by an immutable lifecycle audit log, timestamped officer remarks, and verifiable proof of resolution.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Search Reference Number Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="flex-1">
                <Input
                  value={trackIdInput}
                  onChange={(e) => setTrackIdInput(e.target.value)}
                  placeholder="Enter Grievance Reference Number (e.g. CPG-2026-88410)"
                  leftIcon={<Search className="w-4 h-4" />}
                />
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  // Simulated reload
                }}
              >
                Track Reference
              </Button>
            </div>

            {/* Grievance Record Summary */}
            <div className="bg-white border border-[#E4E4E7] rounded-lg p-5 sm:p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E4E7]">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-sm text-[#0A0A0B]">{trackedGrievance.id}</span>
                    <Badge variant="warning" pulse>
                      In Active Investigation
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-[#0A0A0B] mt-1">{trackedGrievance.title}</h3>
                  <p className="text-xs text-[#71717A] mt-0.5">{trackedGrievance.department} &bull; {trackedGrievance.ministry}</p>
                </div>

                <div className="text-left sm:text-right text-xs">
                  <span className="text-[#71717A] block font-medium">Statutory SLA Target:</span>
                  <strong className="text-[#0A0A0B] text-sm font-bold">{trackedGrievance.slaTargetDate}</strong>
                  <div className="text-[#71717A] text-[11px] mt-0.5">Assigned Officer: {trackedGrievance.officer}</div>
                </div>
              </div>

              {/* Step-by-Step Structured Milestone Timeline */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-[#0A0A0B] uppercase tracking-wider">
                  Redressal Progression Timeline
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {trackedGrievance.steps.map((step: any, index: number) => {
                    const isCurrent = index === trackedGrievance.currentStep - 1;
                    return (
                      <div
                        key={step.id}
                        className={`p-3.5 rounded-lg border text-xs transition-colors ${
                          isCurrent
                            ? 'bg-[#0A0A0B] text-white border-[#0A0A0B]'
                            : step.completed
                            ? 'bg-[#F4F4F5] border-[#E4E4E7] text-[#0A0A0B]'
                            : 'bg-white border-[#E4E4E7] text-[#71717A]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-[11px]">Milestone 0{step.id}</span>
                          {step.completed && !isCurrent && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                          )}
                          {isCurrent && (
                            <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping"></span>
                          )}
                        </div>
                        <div className={`font-bold text-xs ${isCurrent ? 'text-white' : 'text-[#0A0A0B]'}`}>
                          {step.title}
                        </div>
                        <div className={`text-[10px] mt-1 ${isCurrent ? 'text-[#A1A1AA]' : 'text-[#71717A]'}`}>
                          {step.date}
                        </div>
                        <p className={`text-[11px] mt-1.5 line-clamp-2 ${isCurrent ? 'text-[#D4D4D8]' : 'text-[#52525B]'}`}>
                          {step.remark}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Bar for Complainant */}
              <div className="pt-4 border-t border-[#E4E4E7] flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[#52525B]">
                  <FileText className="w-4 h-4 text-[#71717A]" />
                  <span>Mandatory Action Taken Report (ATR) document will be accessible here upon officer sign-off.</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm">
                    Download Receipt (PDF)
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      alert('Statutory First Appeal can be lodged if resolution is unsatisfied within 30 days of closure.');
                    }}
                  >
                    File Statutory Appeal
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: DEPARTMENT DIRECTORY & STATUTORY SLA BENCHMARKS                */}
        {/* ========================================================================= */}
        <section id="directory" className="space-y-6 pt-4 border-t border-[#E4E4E7]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0A0A0B] uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 text-[#0A0A0B]" />
                <span>Central &amp; State Authority Directory</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0A0A0B] tracking-tight">
                Statutory Redressal Standards by Department
              </h2>
              <p className="text-sm text-[#71717A]">
                Comprehensive transparency into designated Nodal Grievance Officers and statutory resolution timelines.
              </p>
            </div>

            <div className="w-full sm:w-72">
              <Input
                placeholder="Search department or ministry..."
                value={deptSearch}
                onChange={(e) => setDeptSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Clean Structured Table Layout */}
          <div className="border border-[#E4E4E7] rounded-lg overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4F4F5] text-[#52525B] font-semibold border-b border-[#E4E4E7]">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Department &amp; Ministry</th>
                    <th className="px-4 py-3">Jurisdiction</th>
                    <th className="px-4 py-3">Statutory SLA</th>
                    <th className="px-4 py-3">Nodal Officer</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E4E7]">
                  {filteredDepts.map((dept) => (
                    <tr key={dept.departmentId} className="table-row-hover">
                      <td className="px-4 py-3.5 font-mono font-bold text-[#0A0A0B]">{dept.code}</td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-[#0A0A0B]">{dept.name}</div>
                        <div className="text-[#71717A] text-[11px]">{dept.ministry}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-[#F4F4F5] text-[#52525B]">
                          {dept.jurisdiction}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-[#2563EB]">{dept.slaDays} Days</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-[#0A0A0B]">{dept.nodalOfficerName}</div>
                        <div className="text-[#71717A] text-[11px] font-mono">{dept.nodalOfficerEmail}</div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsLodgeModalOpen(true)}
                          rightIcon={<ArrowUpRight className="w-3 h-3" />}
                        >
                          Lodge
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: STATUTORY FIRST APPEAL & CITIZEN RIGHTS                        */}
        {/* ========================================================================= */}
        <section id="appeals" className="pt-4 border-t border-[#E4E4E7] space-y-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#2563EB] uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Statutory Escalation Framework</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0A0A0B] tracking-tight">
              Statutory 30-Day First Appeal Mechanism
            </h2>
            <p className="text-sm text-[#71717A]">
              Under DARPG 2024 Grievance Norms, if an officer issues an incomplete, unsatisfactory, or evasive reply, citizens possess the statutory right to trigger an automatic First Appeal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 border border-[#E4E4E7] rounded-lg bg-white space-y-2">
              <div className="font-bold text-sm text-[#0A0A0B]">1. Escalation to Appellate Officer</div>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Appeals bypass the original investigating officer and route directly to a designated Joint Secretary rank Appellate Authority.
              </p>
            </div>

            <div className="p-5 border border-[#E4E4E7] rounded-lg bg-white space-y-2">
              <div className="font-bold text-sm text-[#0A0A0B]">2. Mandatory Officer Declaration</div>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Officers cannot close grievances without uploading a signed Action Taken Report and answering 3 anti-fraud statutory declarations.
              </p>
            </div>

            <div className="p-5 border border-[#E4E4E7] rounded-lg bg-white space-y-2">
              <div className="font-bold text-sm text-[#0A0A0B]">3. Direct Citizen Feedback</div>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Every closure prompts an independent SMS/portal rating. Low satisfaction ratings trigger supervisory audit reviews automatically.
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* ========================================================================= */}
      {/* CITIZEN AUTHENTICATION MODAL                                              */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Citizen Verification & Sign In"
        description="Frictionless mobile OTP verification that links and secures your grievance drafts."
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsAuthModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSimulateLogin}>
              Verify &amp; Continue
            </Button>
          </>
        }
      >
        <div className="space-y-3.5">
          <Input
            label="Mobile Number / Aadhaar-Linked Phone"
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
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* LODGE GRIEVANCE MODAL                                                     */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isLodgeModalOpen}
        onClose={() => setIsLodgeModalOpen(false)}
        title="Lodge New Public Grievance"
        description="Your grievance will be timestamped, encrypted, and monitored under statutory 21-day disposal SLA."
        maxWidth="lg"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsLodgeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => {
                alert('Grievance lodged successfully under CPGRAMS 2.0. Generated Reference ID: CPG-2026-99120');
                setIsLodgeModalOpen(false);
              }}
            >
              Submit Grievance
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <Input
            label="Grievance Title / Subject"
            placeholder="Brief summary of the issue"
            defaultValue={issueText || 'Delayed Pension Settlement / Superannuation Claim'}
          />

          <div>
            <label className="block text-xs font-medium text-[#52525B] mb-1.5">
              Detailed Grievance Narrative
            </label>
            <textarea
              rows={4}
              className="block w-full rounded-lg border border-[#E4E4E7] bg-white p-3 text-xs text-[#0A0A0B] focus:outline-none focus:ring-1 focus:ring-[#0A0A0B] focus:border-[#0A0A0B]"
              placeholder="State the facts chronologically, referencing previous applications, dates, and official correspondence..."
              defaultValue="I had submitted my final pension superannuation claim on 15 Nov 2025. Over 90 days have elapsed without disbursement. Requesting immediate intervention."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input label="Indian Postal PIN Code" defaultValue={pinCode || '751001'} />
            <Input label="Contact Mobile Number" defaultValue="+91 98765 43210" />
          </div>

          <div className="p-3 border border-dashed border-[#D4D4D8] rounded-lg bg-[#FAFAFA] text-center space-y-1">
            <UploadCloud className="w-5 h-5 mx-auto text-[#71717A]" />
            <div className="font-medium text-[#0A0A0B]">Upload Supporting Documents (Optional)</div>
            <p className="text-[11px] text-[#71717A]">PDF, JPG, PNG up to 10MB (Aadhaar, PPO, Receipts)</p>
          </div>
        </div>
      </Modal>

    </Layout>
  );
}

export default App;
