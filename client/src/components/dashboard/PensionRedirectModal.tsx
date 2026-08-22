import React from 'react';
import { ExternalLink, ShieldAlert } from 'lucide-react';
import { Modal } from '../common/Modal.js';
import { Button } from '../common/Button.js';
import { useLanguage } from '../../context/LanguageContext.js';

export interface PensionRedirectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PensionRedirectModal: React.FC<PensionRedirectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();

  const handleProceed = () => {
    window.open('https://pgportal.gov.in/pension/', '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3 text-left font-sans">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#0A2540]">
              {t('External Website Redirection')}
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              {t('CPENGRAMS Pension Grievance Portal')}
            </p>
          </div>
        </div>
      }
      maxWidth="md"
    >
      <div className="space-y-5 text-left font-sans py-1">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed space-y-2.5">
          <p>
            {t(
              'You are being redirected to an external portal: the official Centralised Pension Grievance Redress And Monitoring System (CPENGRAMS), managed by the Department of Pension & Pensioners’ Welfare (DoPPW).'
            )}
          </p>
          <div className="p-2.5 rounded-lg bg-white border border-slate-200 font-mono text-xs text-[#2563EB] flex items-center gap-2 break-all">
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            <span>https://pgportal.gov.in/pension/</span>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          {t('Do you wish to proceed to the Pension Grievance Portal now?')}
        </p>

        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose} className="text-xs sm:text-sm font-semibold">
            {t('Cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleProceed}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] font-bold text-xs sm:text-sm px-5 py-2.5 shadow-xs"
            rightIcon={<ExternalLink className="w-4 h-4" />}
          >
            {t('Yes, Proceed to Portal')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
