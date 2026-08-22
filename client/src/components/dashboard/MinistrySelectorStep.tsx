import React, { useState, useRef, useEffect } from 'react';
import {
  Landmark,
  HardHat,
  Receipt,
  Mail,
  Radio,
  ShieldAlert,
  Building2,
  GraduationCap,
  HeartPulse,
  ShieldPlus,
  Search,
  ChevronDown,
  ArrowLeft,
  Building,
  Check,
} from 'lucide-react';
import { CPGRAMSOrganisation, CPGRAMS_ORGANISATIONS } from '../../data/cpgramsOrganisations.js';
import { useLanguage } from '../../context/LanguageContext.js';

export interface MinistrySelectorStepProps {
  onSelect: (org: CPGRAMSOrganisation) => void;
  onBack: () => void;
}

// Icon mapper for Top 10 Featured Ministries with vivid, distinct styling
const renderMinistryIcon = (iconName?: string) => {
  switch (iconName) {
    case 'Landmark':
      return <Landmark className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />;
    case 'HardHat':
      return <HardHat className="w-7 h-7 sm:w-8 sm:h-8 text-orange-600" />;
    case 'Receipt':
      return <Receipt className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" />;
    case 'Mail':
      return <Mail className="w-7 h-7 sm:w-8 sm:h-8 text-red-600" />;
    case 'Radio':
      return <Radio className="w-7 h-7 sm:w-8 sm:h-8 text-sky-600" />;
    case 'ShieldAlert':
      return <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8 text-[#0A2540]" />;
    case 'Building2':
      return <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-amber-600" />;
    case 'GraduationCap':
      return <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />;
    case 'HeartPulse':
      return <HeartPulse className="w-7 h-7 sm:w-8 sm:h-8 text-rose-600" />;
    case 'ShieldPlus':
      return <ShieldPlus className="w-7 h-7 sm:w-8 sm:h-8 text-teal-600" />;
    default:
      return <Building className="w-7 h-7 sm:w-8 sm:h-8 text-[#2563EB]" />;
  }
};

export const MinistrySelectorStep: React.FC<MinistrySelectorStepProps> = ({
  onSelect,
  onBack,
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const topFeatured = CPGRAMS_ORGANISATIONS.filter((o) => o.isTopFeatured);

  // Filter 92 organisations for search
  const filteredOrganisations = CPGRAMS_ORGANISATIONS.filter((org) =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOrganisationPick = (org: CPGRAMSOrganisation) => {
    setSelectedDeptId(org.id);
    onSelect(org);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full py-2 text-left font-sans animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0A2540] tracking-tight">
            {t('Please select a Ministry/Department/State Government')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            {t('Select from major featured ministries below or search from all 92 Central Organisations.')}
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('Back to Terms')}</span>
        </button>
      </div>

      {/* ================= TOP 10 FEATURED MINISTRIES GRID ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        {topFeatured.map((org) => {
          const isSelected = selectedDeptId === org.id;
          return (
            <button
              key={org.id}
              type="button"
              onClick={() => handleOrganisationPick(org)}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 flex flex-col items-center justify-between text-center group cursor-pointer min-h-[140px] sm:min-h-[155px] ${
                isSelected
                  ? 'border-[#2563EB] bg-blue-50/70 shadow-md ring-2 ring-[#2563EB]/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              {/* Icon Container with Relevant Color Theme */}
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-2.5 sm:mb-3 shadow-2xs group-hover:scale-105 transition-transform ${
                  org.iconBgColor || 'bg-slate-50 border-slate-200'
                } border shrink-0`}
              >
                {renderMinistryIcon(org.iconName)}
              </div>

              {/* Ministry Title */}
              <span className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug group-hover:text-[#2563EB] transition-colors line-clamp-3">
                {t(org.name)}
              </span>
            </button>
          );
        })}
      </div>

      {/* ================= BOTTOM FULL-WIDTH 92-DEPARTMENT DROPDOWN ================= */}
      <div className="space-y-2 pt-2 border-t border-slate-200 relative z-50" ref={dropdownRef}>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
          {t('All CPGRAMS Central Organisations (92 Ministries & Departments)')}
        </label>

        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full p-3.5 sm:p-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-left font-bold text-xs sm:text-base text-slate-800 flex items-center justify-between transition-colors cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Building className="w-4 h-4 sm:w-5 sm:h-5 text-[#2563EB] shrink-0" />
              <span className="truncate">
                {selectedDeptId
                  ? CPGRAMS_ORGANISATIONS.find((o) => o.id === selectedDeptId)?.name
                  : t('More... Ministries/Departments/State Governments')}
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-500 shrink-0 transition-transform ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Searchable Dropdown Popover opening on Top Side (showing 4 items, rest scrollable) */}
          {dropdownOpen && (
            <div className="absolute left-0 right-0 bottom-full mb-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[9999] p-2 animate-in fade-in zoom-in-95 text-left ring-1 ring-black/5">
              {/* Search input */}
              <div className="p-2 border-b border-slate-100">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 absolute left-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder={t('Type to search 92 ministries or departments...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#2563EB] focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              {/* 92-Organisations Scrollable List: max-h-[176px] shows exactly 4 departments, rest scrollable */}
              <div className="max-h-[176px] overflow-y-auto divide-y divide-slate-100 py-1 scrollbar-thin">
                {filteredOrganisations.map((org) => {
                  const isSelected = selectedDeptId === org.id;
                  return (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        handleOrganisationPick(org);
                      }}
                      className={`w-full px-3 sm:px-4 py-2.5 text-left text-xs sm:text-sm hover:bg-blue-50 transition-colors flex items-center justify-between group cursor-pointer ${
                        isSelected ? 'bg-blue-50 font-bold text-[#2563EB]' : 'text-slate-800 hover:text-[#2563EB]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-6 text-[11px] font-mono text-slate-400 font-bold shrink-0">
                          #{org.id}
                        </span>
                        <span className="truncate">{t(org.name)}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-700">
                          {org.code}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[#2563EB]" />}
                      </div>
                    </button>
                  );
                })}

                {filteredOrganisations.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400">
                    {t('No matching ministry or department found.')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
