import React from 'react';
import {
  FileText,
  Search,
  Mic,
  ArrowRight,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { Button } from '../common/Button.js';
import { useLanguage } from '../../context/LanguageContext.js';

export interface HeroSectionProps {
  onStartComplaint: (initialText?: string) => void;
  onTrackComplaint: () => void;
  onOpenVoiceModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartComplaint,
  onTrackComplaint,
  onOpenVoiceModal,
}) => {
  const { t } = useLanguage();

  return (
    <section className="relative bg-white border-b border-slate-200 min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] flex flex-col justify-between overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-between lg:justify-end">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-end w-full flex-1 pt-4 lg:pt-0">
          
          {/* ================= LEFT COLUMN / MOBILE CENTERED INTAKE ================= */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6 text-center lg:text-left py-4 sm:py-6 lg:py-14 self-center w-full">
            
            {/* Headline */}
            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0A2540] leading-[1.2]">
                {t('National Public')} <span className="text-[#2563EB]">{t('Complaint')}</span> {t('Portal')}
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed font-normal max-w-xl mx-auto lg:mx-0">
                {t(
                  'An official single-window platform for citizens to report public problems, track resolution timelines, and get time-bound help from Government departments.'
                )}
              </p>
            </div>

            {/* Action Buttons: Mobile Optimized Stack & Row */}
            <div className="space-y-2.5 pt-1 sm:pt-2 max-w-md mx-auto lg:mx-0">
              {/* Primary Action Button (Full width on mobile) */}
              <Button
                variant="primary"
                size="lg"
                onClick={() => onStartComplaint()}
                leftIcon={<FileText className="w-5 h-5 text-white shrink-0" />}
                rightIcon={<ArrowRight className="w-4 h-4 text-white shrink-0" />}
                className="w-full font-bold text-sm sm:text-base bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-3.5 shadow-sm justify-center cursor-pointer"
              >
                + {t('File a Complaint')}
              </Button>

              {/* Secondary Actions (Side-by-Side on Mobile) */}
              <div className="grid grid-cols-2 gap-2.5">
                <Button
                  variant="outline"
                  size="md"
                  onClick={onTrackComplaint}
                  leftIcon={<Search className="w-4 h-4 text-[#0A2540] shrink-0" />}
                  className="font-bold text-xs sm:text-sm text-[#0A2540] border-slate-300 hover:bg-slate-50 py-3 justify-center"
                >
                  {t('Track Status')}
                </Button>

                <button
                  onClick={onOpenVoiceModal}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-3 rounded-lg bg-[#6F0047]/10 hover:bg-[#6F0047]/15 text-[#6F0047] font-bold text-xs sm:text-sm border border-[#6F0047]/20 transition-colors cursor-pointer"
                  title={t('Speak your complaint using microphone')}
                >
                  <Mic className="w-4 h-4 text-[#6F0047] shrink-0" />
                  <span>{t('Voice Entry')}</span>
                </button>
              </div>
            </div>

            {/* Statutory Trust Markers */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-3 sm:pt-4 border-t border-slate-100 lg:border-slate-200 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#2563EB] shrink-0" />
                <span><strong>21-{t('Day')}</strong> {t('SLA')}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-300 hidden sm:inline-block" />
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#6F0047] shrink-0" />
                <span><strong>{t('Action Taken')}</strong> {t('Report')}</span>
              </div>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: HERO IMAGE ================= */}
          <div className="lg:col-span-6 relative flex items-end justify-center lg:justify-end self-end w-full">
            <div className="relative w-full flex flex-col items-center lg:items-end justify-end lg:translate-x-6 xl:translate-x-10">
              <img
                src="/hero.png"
                alt="Citizens accessing National Public Complaint Portal"
                className="w-auto max-h-[380px] sm:max-h-[480px] lg:max-h-[calc(100vh-5.5rem)] xl:max-h-[calc(100vh-5rem)] object-contain object-bottom select-none drop-shadow-sm"
                loading="eager"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
