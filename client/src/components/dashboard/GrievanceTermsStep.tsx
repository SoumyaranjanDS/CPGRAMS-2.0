import React, { useState } from 'react';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '../common/Button.js';
import { useLanguage } from '../../context/LanguageContext.js';

export interface GrievanceTermsStepProps {
  onAgree: () => void;
  onOpenPensionModal: () => void;
}

export const GrievanceTermsStep: React.FC<GrievanceTermsStepProps> = ({
  onAgree,
  onOpenPensionModal,
}) => {
  const { t } = useLanguage();
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError(t('Please check the declaration box below to confirm your grievance is admissible.'));
      return;
    }
    setError(null);
    onAgree();
  };

  const exclusions = [
    t('RTI Matters'),
    t('Court related / Subjudice matters'),
    t('Religious matters'),
    t(
      'Grievances of Government employees concerning their service matters including disciplinary proceedings etc. unless the aggrieved employee has already exhausted the prescribed channels keeping in view the DoPT OM No. 11013/08/2013-Estt.(A-III) dated 31.08.2015'
    ),
  ];

  return (
    <div className="w-full max-w-4xl py-2 text-left font-sans animate-in fade-in duration-200">
      
      {/* Top Heading */}
      <div className="mb-5 space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#0A2540] tracking-tight">
          {t('Grievance terms and conditions')}
        </h2>
        <p className="text-sm sm:text-base font-bold text-red-600">
          {t('List of subjects/topics which can not be treated as grievance.')}
        </p>
      </div>

      {/* Exclusions List - Clean headings only, NO cards */}
      <ul className="space-y-3.5 mb-6 pl-1">
        {exclusions.map((heading, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6F0047] shrink-0 mt-1.5" />
            <span className="text-sm sm:text-[15px] font-semibold text-slate-800 leading-relaxed">
              {heading}
            </span>
          </li>
        ))}
      </ul>

      {/* Pension Notice Box - Simple & Clean */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-950 text-xs sm:text-sm leading-relaxed mb-6 space-y-1.5">
        <p>
          {t(
            'Please use Lodge Pension Grievance option or'
          )}{' '}
          <button
            type="button"
            onClick={onOpenPensionModal}
            className="font-bold underline text-[#6F0047] hover:text-[#0A2540] inline-flex items-center gap-1 cursor-pointer"
          >
            <span>{t('click here')}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
          {', '}
          {t(
            'if your grievance is regarding pension issues pertaining to any ministry/department of Government of India.'
          )}
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm font-semibold text-red-700 mb-5">
          {error}
        </div>
      )}

      {/* Statutory Agreement Checkbox & Action */}
      <form onSubmit={handleSubmit} className="space-y-5 pt-2 border-t border-slate-200">
        <label className="flex items-start gap-3 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked);
              if (e.target.checked) setError(null);
            }}
            className="w-5 h-5 rounded text-[#2563EB] focus:ring-[#2563EB] border-slate-300 mt-0.5 cursor-pointer shrink-0"
          />
          <span className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-black leading-snug">
            {t('I agree that my grievance does not fall in any of the above listed categories')}
          </span>
        </label>

        <div className="flex items-center justify-start sm:justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={!agreed}
            className={`font-bold text-sm sm:text-base px-8 py-2.5 bg-[#0A2540] hover:bg-[#2563EB] text-white shadow-xs transition-all ${
              !agreed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {t('Submit')}
          </Button>
        </div>
      </form>

    </div>
  );
};
