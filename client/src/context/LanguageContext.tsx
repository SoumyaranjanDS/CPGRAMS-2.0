import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  region: string;
}

export const INDIAN_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', region: 'National / Official' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', region: 'National / Northern' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia', region: 'Odisha' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali', region: 'West Bengal, Tripura, Assam' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu', region: 'Andhra Pradesh, Telangana' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari', region: 'Maharashtra, Goa' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil', region: 'Tamil Nadu, Puducherry' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati', region: 'Gujarat' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada', region: 'Karnataka' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam', region: 'Kerala, Lakshadweep' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', region: 'Punjab, Chandigarh' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', script: 'Bengali-Assamese', region: 'Assam' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', script: 'Perso-Arabic', region: 'National' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', script: 'Devanagari', region: 'Bihar, Jharkhand' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', script: 'Devanagari', region: 'Classical' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', script: 'Devanagari', region: 'Sikkim, West Bengal' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', script: 'Devanagari', region: 'Goa, Maharashtra, Karnataka' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'كٲشُر', script: 'Perso-Arabic', region: 'Jammu & Kashmir' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', script: 'Perso-Arabic', region: 'National' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', script: 'Devanagari', region: 'Jammu & Kashmir' },
  { code: 'mni', name: 'Manipuri (Meitei)', nativeName: 'মৈতৈলোন্', script: 'Bengali / Meitei', region: 'Manipur' },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', script: 'Devanagari', region: 'Assam, Bodoland' },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', script: 'Ol Chiki', region: 'Jharkhand, Odisha, West Bengal' },
];

export interface LanguageContextType {
  currentLanguage: LanguageOption;
  languageCode: string;
  setLanguage: (code: string) => void;
  t: (text: string) => string;
  isTranslating: boolean;
  translateTexts: (texts: string[]) => Promise<void>;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_LANG_KEY = 'cpgrams_selected_language';
const STORAGE_DICT_KEY = 'cpgrams_translation_cache_v1';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [languageCode, setLanguageCode] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_LANG_KEY) || 'en';
    } catch {
      return 'en';
    }
  });

  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_DICT_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [isTranslating, setIsTranslating] = useState(false);
  const pendingQueueRef = useRef<Set<string>>(new Set());
  const debounceTimerRef = useRef<any>(null);

  const currentLanguage =
    INDIAN_LANGUAGES.find((l) => l.code === languageCode) || INDIAN_LANGUAGES[0];

  // Persist Dictionary to LocalStorage
  const saveTranslationsToStorage = (updatedDict: Record<string, Record<string, string>>) => {
    try {
      localStorage.setItem(STORAGE_DICT_KEY, JSON.stringify(updatedDict));
    } catch (e) {
      console.warn('Failed to save translation cache to storage:', e);
    }
  };

  // Switch Language
  const setLanguage = (code: string) => {
    const matched = INDIAN_LANGUAGES.find((l) => l.code === code);
    if (!matched) return;

    setLanguageCode(code);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, code);
    } catch {}
  };

  // Batch translate an array of texts via backend Google Translate proxy
  const translateTexts = useCallback(
    async (texts: string[]) => {
      if (languageCode === 'en' || !texts || texts.length === 0) return;

      const langDict = translations[languageCode] || {};
      const uncached = texts.filter(
        (txt) => typeof txt === 'string' && txt.trim().length > 0 && !langDict[txt.trim()]
      );

      if (uncached.length === 0) return;

      setIsTranslating(true);
      try {
        const res = await axios.post('/api/v1/translate', {
          texts: uncached,
          targetLang: languageCode,
          sourceLang: 'en',
        });

        const newTranslations = res.data.data || {};

        setTranslations((prev) => {
          const currentLangMap = prev[languageCode] || {};
          const mergedLangMap = { ...currentLangMap, ...newTranslations };
          const next = { ...prev, [languageCode]: mergedLangMap };
          saveTranslationsToStorage(next);
          return next;
        });
      } catch (err) {
        console.warn('[LanguageProvider] Translation fetch error:', err);
      } finally {
        setIsTranslating(false);
      }
    },
    [languageCode, translations]
  );

  // Process queued dynamic strings via debounced batch request
  const processQueue = useCallback(() => {
    if (pendingQueueRef.current.size === 0 || languageCode === 'en') return;

    const textsToFetch = Array.from(pendingQueueRef.current);
    pendingQueueRef.current.clear();
    translateTexts(textsToFetch);
  }, [languageCode, translateTexts]);

  // Synchronous Translate Hook `t(text)`
  const t = useCallback(
    (text: string): string => {
      if (!text || typeof text !== 'string') return '';
      if (languageCode === 'en') return text;

      // Preserve Brand names, acronyms, or numbers
      if (text === 'CPGRAMS' || text === 'CPGRAMS 2.0' || /^\d+$/.test(text)) {
        return text;
      }

      const trimmed = text.trim();
      const langDict = translations[languageCode] || {};

      if (langDict[trimmed]) {
        return langDict[trimmed];
      }

      // If not yet translated, queue for background fetch
      if (!pendingQueueRef.current.has(trimmed)) {
        pendingQueueRef.current.add(trimmed);
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(processQueue, 250);
      }

      return text; // Graceful fallback to original while fetching
    },
    [languageCode, translations, processQueue]
  );

  // When language changes, proactively translate common platform UI labels
  useEffect(() => {
    if (languageCode === 'en') return;

    const commonPlatformTerms = [
      'Centralised Public Grievance Redress And Monitoring System',
      'Department of Administrative Reforms and Public Grievances',
      'Sign In',
      'Sign Out',
      'Register',
      'Registration',
      'Registration/Sign up Form',
      'File a Complaint',
      'File a Public Complaint',
      'Track Status',
      'Track Grievance',
      'Home',
      'Appeals',
      'Dashboard',
      'Official Portal of Government of India',
      'Enter Details',
      'Fields marked with * are mandatory',
      'Name',
      'Address (Premise Number or Name)',
      'Sub-locality',
      'Locality',
      'Country',
      'State',
      'District',
      'Pincode',
      'Mobile number',
      'E-mail address',
      'Password',
      'Confirm Password',
      'Security Code',
      'Submit Registration',
      'Already have an account?',
      'Sign In here',
      'New to CPGRAMS?',
      'Register as a Citizen',
      'Select Language',
      'Search Indian language...',
      'Resolution Rate',
      'Average Redressal Time',
      'Active Ministries',
      'Citizens Empowered',
      'Frequently Asked Questions',
      'Contact Helpdesk',
      'Toll Free',
    ];

    translateTexts(commonPlatformTerms);
  }, [languageCode, translateTexts]);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        languageCode,
        setLanguage,
        t,
        isTranslating,
        translateTexts,
        languages: INDIAN_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
