import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, FileQuestion } from 'lucide-react';
import { Button } from '../components/common/Button.js';
import { useLanguage } from '../context/LanguageContext.js';

export interface NotFoundPageProps {
  onTrackComplaint?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onTrackComplaint }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 font-sans animate-in fade-in duration-200">
      <div className="max-w-md w-full text-center space-y-6">
        
        {/* Visual Icon Badge */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-100/70 rounded-full animate-ping opacity-30" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center text-[#2563EB] shadow-md">
            <FileQuestion className="w-10 h-10 stroke-[1.75]" />
          </div>
        </div>

        {/* 404 Heading & Description */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#2563EB] bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
            Error 404
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0A2540] tracking-tight">
            {t('Page Not Found')}
          </h1>
          <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed max-w-sm mx-auto">
            {t('The page you are looking for might have been moved, removed, or does not exist.')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto font-bold text-sm px-5 py-2.5 bg-[#0A2540] hover:bg-[#1A365D] text-white shadow-xs"
            leftIcon={<Home className="w-4 h-4" />}
          >
            {t('Return Home')}
          </Button>

          {onTrackComplaint && (
            <Button
              variant="outline"
              onClick={onTrackComplaint}
              className="w-full sm:w-auto font-bold text-sm px-5 py-2.5 border-slate-300 text-slate-700 hover:bg-slate-50"
              leftIcon={<Search className="w-4 h-4" />}
            >
              {t('Track Status')}
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto font-semibold text-xs text-slate-500 hover:text-slate-800"
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            {t('Go Back')}
          </Button>
        </div>

        {/* CPGRAMS Help Info Footer */}
        <div className="pt-6 border-t border-slate-200/80 text-xs text-slate-600">
          <span>{t('Need assistance?')}</span>{' '}
          <a
            href="mailto:cpgrams-darpg@nic.in"
            className="text-[#2563EB] hover:underline font-semibold"
          >
            cpgrams-darpg@nic.in
          </a>
        </div>

      </div>
    </div>
  );
};
