import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Scale,
  PlusCircle,
  ExternalLink,
  Activity,
  UserCheck,
  Lock,
  Trash2,
  LogOut,
  Search,
  Clock,
  CheckCircle2,
  FileText,
  Eye,
  Sparkles,
  Menu,
  ChevronDown,
} from 'lucide-react';
import axios from 'axios';
import { Button } from '../components/common/Button.js';
import { Badge } from '../components/common/Badge.js';
import { Modal } from '../components/common/Modal.js';
import { FloatingInput } from '../components/common/FloatingInput.js';
import { PensionRedirectModal } from '../components/dashboard/PensionRedirectModal.js';
import { DirectIssueIntakeForm } from '../components/dashboard/DirectIssueIntakeForm.js';
import { VoiceDictationModal } from '../components/home/VoiceDictationModal.js';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { Complaint } from '../types/index.js';

type DashboardTab =
  | 'grievances'
  | 'appeals'
  | 'lodge'
  | 'activity'
  | 'profile'
  | 'password';

export const CitizenDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  // Active Tab derived directly from URL searchParams (100% reactive, zero desync glitch)
  const activeTab = (searchParams.get('tab') as DashboardTab) || 'grievances';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [voiceNarrative, setVoiceNarrative] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Modals
  const [isPensionModalOpen, setIsPensionModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // View Issue Detail Modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Complaints Data State - ZERO mock data
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 10;

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync tab with URL
  const handleTabSwitch = (tab: DashboardTab) => {
    setSearchParams({ tab });
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch Citizen Complaints from Backend - No mock data
  const fetchCitizenComplaints = async () => {
    try {
      const res = await axios.get('/api/v1/complaints');
      setComplaints(res.data.data || []);
    } catch {
      setComplaints([]);
    }
  };

  useEffect(() => {
    fetchCitizenComplaints();
  }, []);

  // Filter complaints
  const filteredComplaints = complaints.filter(
    (c) =>
      c.grievanceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.narrative.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.assignedDepartment?.departmentName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stat Counters for Issues
  const totalGrievances = complaints.length;
  const pendingGrievances = complaints.filter(
    (c) =>
      c.status === 'PENDING' ||
      c.status === 'SUBMITTED' ||
      c.status === 'RECEIVED' ||
      c.status === 'ASSIGNED' ||
      c.status === 'UNDER_REVIEW' ||
      c.status === 'IN_PROGRESS' ||
      c.status === 'ACTION_IN_PROGRESS'
  ).length;

  const closedGrievances = complaints.filter(
    (c) =>
      c.status === 'RESOLVED' ||
      c.status === 'DISPOSED_RESOLVED' ||
      c.status === 'REJECTED' ||
      c.status === 'CLOSED'
  ).length;

  // Stat Counters for Appeals
  const totalAppeals = 0;
  const pendingAppeals = 0;
  const closedAppeals = 0;

  // View Complaint Details
  const handleViewComplaint = (c: Complaint) => {
    setSelectedComplaint(c);
    setIsDetailModalOpen(true);
  };

  // Handle Successful Submission
  const handleGrievanceSubmitted = (id: string) => {
    navigate(`/success/${id}`);
  };

  const navMenuItems = [
    {
      id: 'grievances' as DashboardTab,
      label: t('My Complaints'),
      icon: <LayoutDashboard className="w-4 h-4 text-[#2563EB]" />,
      badge: totalGrievances,
      color: 'blue',
    },
    {
      id: 'appeals' as DashboardTab,
      label: t('Appeals'),
      icon: <Scale className="w-4 h-4 text-[#6F0047]" />,
      badge: totalAppeals,
      color: 'purple',
    },
    {
      id: 'lodge' as DashboardTab,
      label: t('Report an Issue'),
      icon: <PlusCircle className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: 'activity' as DashboardTab,
      label: t('Account Activity'),
      icon: <Activity className="w-4 h-4 text-slate-500" />,
    },
    {
      id: 'profile' as DashboardTab,
      label: t('Edit Profile'),
      icon: <UserCheck className="w-4 h-4 text-slate-500" />,
    },
    {
      id: 'password' as DashboardTab,
      label: t('Change Password'),
      icon: <Lock className="w-4 h-4 text-slate-500" />,
    },
  ];

  return (
    <div className="w-full px-3 sm:px-6 lg:px-8 py-5 font-sans text-left min-h-[calc(100vh-4rem)] max-w-full">
      
      {/* ================= TOP GREETING HEADER (CLEAN & FULL WIDTH) ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-200 w-full">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0A2540] tracking-tight">
            {t('Welcome')}, <span className="text-[#2563EB]">{user?.name || 'Citizen'}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleTabSwitch('lodge')}
            className="font-bold text-xs sm:text-sm px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-xs"
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            {t('Report an Issue')}
          </Button>

          {/* Mobile Menu Toggle Button */}
          <div className="relative lg:hidden" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 text-xs font-bold cursor-pointer transition-all active:scale-95 shadow-2xs"
            >
              <Menu className="w-4 h-4" />
              <span>{t('Menu')}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${mobileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Smooth Floating Menu Popover (Anchored directly under the Menu button) */}
            <div
              className={`absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white/98 backdrop-blur-2xl rounded-2xl border border-slate-200/90 shadow-2xl p-3 space-y-2.5 z-50 transition-all duration-300 ease-out transform origin-top-right ring-1 ring-black/5 ${
                mobileMenuOpen
                  ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              }`}
            >
              {/* Profile Bar */}
              <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-[#0A2540] text-white flex items-center justify-center text-xs font-black shadow-2xs">
                  {user?.name?.charAt(0) || 'C'}
                </div>
                <div className="truncate">
                  <h3 className="text-xs font-extrabold text-[#0A2540] leading-tight truncate">{user?.name || 'Citizen'}</h3>
                  <span className="text-[10px] text-slate-500 font-medium truncate block">{user?.phone || user?.email || 'Active Session'}</span>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1">
                {navMenuItems.map((item) => {
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleTabSwitch(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        active
                          ? 'bg-[#0A2540] text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-[#2563EB]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsPensionModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-[#6F0047] hover:bg-[#6F0047]/10 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{t('Pension Grievance Portal')}</span>
                </button>
              </div>

              {/* Sign Out Action */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('Sign out')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN DASHBOARD GRID (FULL WIDTH WITH SIDEBAR OCCUPYING SIDE) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        
        {/* ========================================================================= */}
        {/* LEFT SIDEBAR NAVIGATION (DESKTOP FULL WIDTH SIDEBAR)                      */}
        {/* ========================================================================= */}
        <aside className="hidden lg:block lg:col-span-3 xl:col-span-2.5 space-y-3 sticky top-24">
          
          {/* Nav List */}
          <div className="bg-slate-50/90 rounded-2xl border border-slate-200/90 p-2 space-y-1 shadow-2xs">
            
            {/* My Complaints */}
            <button
              type="button"
              onClick={() => handleTabSwitch('grievances')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'grievances'
                  ? 'bg-[#0A2540] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 text-[#2563EB]" />
                <span>{t('My Complaints')}</span>
              </div>
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'grievances' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {totalGrievances}
              </span>
            </button>

            {/* Appeals */}
            <button
              type="button"
              onClick={() => handleTabSwitch('appeals')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'appeals'
                  ? 'bg-[#0A2540] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Scale className="w-4 h-4 text-[#6F0047]" />
                <span>{t('Appeals')}</span>
              </div>
              <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                activeTab === 'appeals' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {totalAppeals}
              </span>
            </button>

            {/* Report an Issue */}
            <button
              type="button"
              onClick={() => handleTabSwitch('lodge')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'lodge'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-slate-700 hover:bg-blue-50 hover:text-[#2563EB]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <PlusCircle className="w-4 h-4" />
                <span>{t('Report an Issue')}</span>
              </div>
            </button>

            {/* Pension Grievance Portal */}
            <button
              type="button"
              onClick={() => setIsPensionModalOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#6F0047] hover:bg-[#6F0047]/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <ExternalLink className="w-4 h-4" />
                <span>{t('Pension Portal')}</span>
              </div>
            </button>

            {/* Divider */}
            <div className="border-t border-slate-200/80 my-1 pt-1" />

            {/* Account Activity */}
            <button
              type="button"
              onClick={() => handleTabSwitch('activity')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'activity'
                  ? 'bg-slate-200 text-slate-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4 text-slate-500" />
              <span>{t('Account Activity')}</span>
            </button>

            {/* Edit Profile */}
            <button
              type="button"
              onClick={() => handleTabSwitch('profile')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-slate-200 text-slate-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4 text-slate-500" />
              <span>{t('Edit Profile')}</span>
            </button>

            {/* Change Password */}
            <button
              type="button"
              onClick={() => handleTabSwitch('password')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === 'password'
                  ? 'bg-slate-200 text-slate-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Lock className="w-4 h-4 text-slate-500" />
              <span>{t('Change Password')}</span>
            </button>

            {/* Delete Account */}
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t('Delete Account')}</span>
            </button>

            {/* Sign Out */}
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-red-700 hover:bg-red-100 transition-colors cursor-pointer pt-2"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('Sign out')}</span>
            </button>

          </div>

          {/* AI Samadhan Didi Assistance Pill */}
          <div
            onClick={() => setIsVoiceModalOpen(true)}
            className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200/80 space-y-1.5 text-left cursor-pointer hover:border-blue-400 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2563EB]" />
              <strong className="text-xs font-bold text-slate-900">
                {t('Samadhan Didi AI Voice')}
              </strong>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed font-normal">
              {t('Click to speak your problem in your mother tongue using Voice AI.')}
            </p>
          </div>

        </aside>

        {/* ========================================================================= */}
        {/* RIGHT MAIN WORKBENCH VIEW                                                 */}
        {/* ========================================================================= */}
        <main className="lg:col-span-9 xl:col-span-9.5 space-y-6 w-full">
          
          {/* Guest / Unauthenticated Prompt on Private Tabs */}
          {!user && activeTab !== 'lodge' ? (
            <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-sm max-w-lg mx-auto my-8 animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center mx-auto shadow-2xs">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-extrabold text-[#0A2540]">{t('Citizen Sign In Required')}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {t('Please sign in to your official account to view your filed complaints, track appeal decisions, and manage profile security.')}
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="primary"
                  onClick={() => navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`)}
                  className="w-full sm:w-auto font-bold text-sm px-6 py-2.5 bg-[#0A2540] hover:bg-[#1A365D] text-white"
                >
                  {t('Sign In to Account')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleTabSwitch('lodge')}
                  className="w-full sm:w-auto font-bold text-sm px-6 py-2.5 border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  {t('File a Complaint Now')}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* ================= TAB 1: GRIEVANCE DASHBOARD ================= */}
              {activeTab === 'grievances' && (
            <div className="space-y-6 animate-in fade-in duration-150 w-full">
              
              {/* 3 Metric Stat Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                
                {/* Total Registered */}
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-500 text-white flex items-center justify-between shadow-xs">
                  <div className="space-y-1">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold block font-mono">
                      {totalGrievances}
                    </span>
                    <span className="text-xs sm:text-sm font-bold block text-amber-100">
                      {t('Total Complaints Filed')}
                    </span>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>

                {/* Pending */}
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-600 text-white flex items-center justify-between shadow-xs">
                  <div className="space-y-1">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold block font-mono">
                      {pendingGrievances}
                    </span>
                    <span className="text-xs sm:text-sm font-bold block text-emerald-100">
                      {t('Issues in Progress / Pending')}
                    </span>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>

                {/* Closed */}
                <div className="p-4 sm:p-5 rounded-2xl bg-rose-600 text-white flex items-center justify-between shadow-xs">
                  <div className="space-y-1">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold block font-mono">
                      {closedGrievances}
                    </span>
                    <span className="text-xs sm:text-sm font-bold block text-rose-100">
                      {t('Resolved & Closed Issues')}
                    </span>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>

              </div>

              {/* List of Grievances Section */}
              <div className="space-y-4 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-base sm:text-lg lg:text-xl font-extrabold text-[#0A2540]">
                    {t('Submitted Complaints & Issues')}
                  </h3>

                  {/* Filter & Search Bar */}
                  <div className="flex items-center gap-3">
                    <div className="relative flex items-center w-full sm:w-auto">
                      <Search className="w-4 h-4 absolute left-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder={t('Search issue...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:border-[#2563EB] focus:outline-none w-full sm:w-64"
                      />
                    </div>
                  </div>
                </div>

                {/* Grievances Data Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs w-full">
                  <table className="w-full text-left text-xs sm:text-sm divide-y divide-slate-200">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                      <tr>
                        <th className="py-3.5 px-3 sm:px-4 w-12 text-center">Sn.</th>
                        <th className="py-3.5 px-3 sm:px-4">{t('Issue Number')}</th>
                        <th className="py-3.5 px-3 sm:px-4">{t('Date')}</th>
                        <th className="py-3.5 px-3 sm:px-4">{t('Problem Description')}</th>
                        <th className="py-3.5 px-3 sm:px-4">{t('Department')}</th>
                        <th className="py-3.5 px-3 sm:px-4">{t('Status')}</th>
                        <th className="py-3.5 px-3 sm:px-4 text-center">{t('Action')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredComplaints.length > 0 ? (
                        filteredComplaints.slice(0, pageSize).map((item, idx) => (
                          <tr key={item.id || item.grievanceId || idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-3 sm:px-4 text-center font-mono font-bold text-slate-500">
                              {idx + 1}
                            </td>
                            <td className="py-3.5 px-3 sm:px-4 font-mono font-bold text-[#2563EB] whitespace-nowrap">
                              {item.grievanceId}
                            </td>
                            <td className="py-3.5 px-3 sm:px-4 whitespace-nowrap text-slate-600">
                              {new Date(item.createdAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-3.5 px-3 sm:px-4 max-w-xs truncate text-slate-800">
                              {item.narrative}
                            </td>
                            <td className="py-3.5 px-3 sm:px-4 text-slate-700 text-xs font-semibold">
                              {item.assignedDepartment?.departmentName || 'Central Ministry'}
                            </td>
                            <td className="py-3.5 px-3 sm:px-4 whitespace-nowrap">
                              <Badge
                                variant={
                                  item.status === 'PENDING' || item.status === 'SUBMITTED'
                                    ? 'warning'
                                    : item.status === 'IN_PROGRESS' || item.status === 'ACTION_IN_PROGRESS'
                                    ? 'blue'
                                    : item.status === 'RESOLVED' || item.status === 'DISPOSED_RESOLVED'
                                    ? 'success'
                                    : 'error'
                                }
                                size="sm"
                              >
                                {item.status.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="py-3.5 px-3 sm:px-4 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleViewComplaint(item)}
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{t('View')}</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            <div className="space-y-2">
                              <FileText className="w-8 h-8 mx-auto text-slate-300" />
                              <p className="text-sm font-semibold text-slate-600">{t('No issues reported yet')}</p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleTabSwitch('lodge')}
                                className="text-xs font-bold mt-2"
                              >
                                + {t('Report Your First Issue')}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 2: APPEAL DASHBOARD ================= */}
          {activeTab === 'appeals' && (
            <div className="space-y-6 animate-in fade-in duration-150 w-full">
              
              {/* 3 Metric Stat Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                
                {/* Total Appeals Lodged */}
                <div className="p-4 sm:p-5 rounded-2xl bg-cyan-600 text-white flex items-center justify-between shadow-xs">
                  <div className="space-y-1">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold block font-mono">
                      {totalAppeals}
                    </span>
                    <span className="text-xs sm:text-sm font-bold block text-cyan-100">
                      {t('Total Appeals Lodged')}
                    </span>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>

                {/* Number of Appeals Pending */}
                <div className="p-4 sm:p-5 rounded-2xl bg-orange-500 text-white flex items-center justify-between shadow-xs">
                  <div className="space-y-1">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold block font-mono">
                      {pendingAppeals}
                    </span>
                    <span className="text-xs sm:text-sm font-bold block text-orange-100">
                      {t('Number of Appeals Pending')}
                    </span>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>

                {/* Number of Appeals Closed */}
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-600 text-white flex items-center justify-between shadow-xs">
                  <div className="space-y-1">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold block font-mono">
                      {closedAppeals}
                    </span>
                    <span className="text-xs sm:text-sm font-bold block text-emerald-100">
                      {t('Number of Appeals Closed')}
                    </span>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>

              </div>

              {/* List of Appeals Table */}
              <div className="space-y-4 w-full">
                <h3 className="text-base sm:text-lg lg:text-xl font-extrabold text-[#0A2540]">
                  {t('List of Appeals')}
                </h3>

                <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs w-full">
                  <table className="w-full text-left text-xs sm:text-sm divide-y divide-slate-200">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                      <tr>
                        <th className="py-3.5 px-3 sm:px-4 w-12 text-center">Sn.</th>
                        <th className="py-3.5 px-3 sm:px-4">{t('Appeal Number')}</th>
                        <th className="py-3.5 px-3 sm:px-4">{t('Appeal Received Date')}</th>
                        <th className="py-3.5 px-3 sm:px-4">{t('Grievance Registration Number')}</th>
                        <th className="py-3.5 px-4">{t('Appeal Status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          <Scale className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                          <p className="text-sm font-semibold text-slate-600">{t('No appeals found')}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {t('Appeals can be filed within 30 days if your issue resolution is unsatisfactory.')}
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ================= TAB 3: REPORT AN ISSUE (STREAMLINED DIRECT FORM) ================= */}
          {activeTab === 'lodge' && (
            <div className="animate-in fade-in duration-150 w-full">
              <DirectIssueIntakeForm
                initialNarrative={voiceNarrative}
                onSuccess={handleGrievanceSubmitted}
                onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              />
            </div>
          )}

          {/* ================= TAB 4: ACCOUNT ACTIVITY ================= */}
          {activeTab === 'activity' && (
            <div className="space-y-6 animate-in fade-in duration-150 text-left w-full">
              <h3 className="text-xl font-extrabold text-[#0A2540]">
                {t('Account Activity & Security Sessions')}
              </h3>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs sm:text-sm">
                  <div className="space-y-1">
                    <strong className="text-slate-900 font-bold block">{t('Current Active Web Session')}</strong>
                    <span className="text-slate-500 block font-mono text-xs">IP: 127.0.0.1 (Localhost / Secure)</span>
                  </div>
                  <Badge variant="success" size="sm">Active</Badge>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs sm:text-sm">
                  <div className="space-y-1">
                    <strong className="text-slate-900 font-bold block">{t('Previous Login')}</strong>
                    <span className="text-slate-500 block font-mono text-xs">
                      {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Just now'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{t('Verified')}</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: EDIT PROFILE ================= */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in duration-150 text-left max-w-2xl">
              <h3 className="text-xl font-extrabold text-[#0A2540]">
                {t('Registered Citizen Profile')}
              </h3>

              <div className="space-y-4">
                <FloatingInput
                  label={t('Name')}
                  value={user?.name || ''}
                  disabled
                />
                <FloatingInput
                  label={t('Mobile Number')}
                  value={user?.phone || ''}
                  disabled
                />
                <FloatingInput
                  label={t('E-mail Address')}
                  value={user?.email || ''}
                  disabled
                />
                <FloatingInput
                  label={t('Address (Premise / City)')}
                  value={user?.address?.premise || user?.address?.locality || ''}
                  disabled
                />
                <div className="grid grid-cols-2 gap-4">
                  <FloatingInput
                    label={t('State')}
                    value={user?.address?.state || ''}
                    disabled
                  />
                  <FloatingInput
                    label={t('Pincode')}
                    value={user?.address?.pinCode || ''}
                    disabled
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 6: CHANGE PASSWORD ================= */}
          {activeTab === 'password' && (
            <div className="space-y-6 animate-in fade-in duration-150 text-left max-w-md">
              <h3 className="text-xl font-extrabold text-[#0A2540]">
                {t('Change Account Password')}
              </h3>

              {passwordMsg && (
                <div
                  className={`p-3.5 rounded-xl text-xs sm:text-sm font-semibold ${
                    passwordMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {passwordMsg.text}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newPassword.length < 8) {
                    setPasswordMsg({ type: 'error', text: t('New password must be at least 8 characters.') });
                    return;
                  }
                  if (newPassword !== confirmNewPassword) {
                    setPasswordMsg({ type: 'error', text: t('Passwords do not match.') });
                    return;
                  }
                  setPasswordMsg({ type: 'success', text: t('Password updated successfully.') });
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                }}
                className="space-y-4"
              >
                <FloatingInput
                  label={t('Current Password')}
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                <FloatingInput
                  label={t('New Password (min 8 chars)')}
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <FloatingInput
                  label={t('Confirm New Password')}
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center bg-[#2563EB] hover:bg-[#1D4ED8] font-bold text-sm py-3"
                >
                  {t('Update Password')}
                </Button>
              </form>
            </div>
          )}

            </>
          )}
        </main>
      </div>

      {/* ================= MODAL: PENSION REDIRECTION ================= */}
      <PensionRedirectModal
        isOpen={isPensionModalOpen}
        onClose={() => setIsPensionModalOpen(false)}
      />

      {/* ================= MODAL: VOICE DICTATION ================= */}
      <VoiceDictationModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTranscriptReady={(transcript) => {
          setVoiceNarrative(transcript);
          setIsVoiceModalOpen(false);
          handleTabSwitch('lodge');
        }}
      />

      {/* ================= MODAL: DELETE ACCOUNT ================= */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={
          <div className="flex items-center gap-2 text-red-600 font-bold">
            <Trash2 className="w-5 h-5" />
            <span>{t('Delete Citizen Account')}</span>
          </div>
        }
        maxWidth="sm"
      >
        <div className="space-y-4 text-left font-sans text-sm text-slate-700 py-1">
          <p>
            {t(
              'Are you sure you want to permanently delete your citizen account? All historical issue and appeal tracking records will be archived.'
            )}
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} className="text-xs">
              {t('Cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setIsDeleteModalOpen(false);
                logout();
                navigate('/');
              }}
              className="font-bold text-xs"
            >
              {t('Yes, Delete Account')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ================= MODAL: GRIEVANCE DETAIL VIEW ================= */}
      {selectedComplaint && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={
            <div className="flex items-center gap-2.5 text-[#0A2540] text-left">
              <FileText className="w-5 h-5 text-[#2563EB]" />
              <div>
                <strong className="text-base font-bold font-mono block">
                  {selectedComplaint.grievanceId}
                </strong>
                <span className="text-xs text-slate-500 font-normal">
                  {selectedComplaint.assignedDepartment?.departmentName}
                </span>
              </div>
            </div>
          }
          maxWidth="lg"
        >
          <div className="space-y-5 text-left font-sans py-1">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-sm">
              <span className="text-xs uppercase font-bold text-slate-500 block">
                {t('Problem Description')}
              </span>
              <p className="text-slate-800 leading-relaxed font-normal">
                {selectedComplaint.narrative}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-400 block">{t('Received Date')}</span>
                <strong className="text-slate-900 font-bold">
                  {new Date(selectedComplaint.createdAt).toLocaleDateString()}
                </strong>
              </div>
              <div className="p-3 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-400 block">{t('Status')}</span>
                <Badge variant="warning" size="sm">{selectedComplaint.status}</Badge>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setIsDetailModalOpen(false)} className="text-xs">
                {t('Close')}
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
