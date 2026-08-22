import React from 'react';
import { ShieldCheck, FileText, Scale } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';

export const CitizenCharterSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full max-w-full">
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <ShieldCheck className="w-7 h-7 text-[#2563EB]" />
        <h4 className="font-bold text-slate-900 text-lg">21-{t('Day Statutory Norm')}</h4>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {t(
            'As per DARPG comprehensive directives, all complaints carry a mandatory 21-day disposal target with interim reports required if delayed.'
          )}
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <FileText className="w-7 h-7 text-[#6F0047]" />
        <h4 className="font-bold text-slate-900 text-lg">{t('Action Taken Report (ATR)')}</h4>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {t(
            'No grievance can be closed without an official Action Taken Report and verifiable administrative sanction order or inspection memo.'
          )}
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <Scale className="w-7 h-7 text-[#2563EB]" />
        <h4 className="font-bold text-slate-900 text-lg">{t('Right to First Appeal')}</h4>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {t(
            'Citizens dissatisfied with the disposal reason can file a statutory First Appeal within 30 calendar days to the designated Appellate Officer.'
          )}
        </p>
      </div>
    </section>
  );
};
