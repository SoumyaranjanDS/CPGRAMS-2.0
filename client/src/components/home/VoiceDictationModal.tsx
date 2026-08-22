import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  ArrowRight,
  RotateCcw,
  Globe,
  Sparkles,
  Loader2,
  AlertTriangle,
  Copy,
  Check,
} from 'lucide-react';
import axios from 'axios';
import { Modal } from '../common/Modal.js';
import { Button } from '../common/Button.js';
import { useLanguage } from '../../context/LanguageContext.js';

export interface VoiceDictationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptReady: (transcript: string) => void;
}

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  bcp47: string;
}

const SUPPORTED_VOICE_LANGS: LanguageOption[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', bcp47: 'hi-IN' },
  { code: 'en', name: 'English', nativeName: 'English', bcp47: 'en-IN' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', bcp47: 'or-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', bcp47: 'pa-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', bcp47: 'bn-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', bcp47: 'te-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', bcp47: 'ta-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', bcp47: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', bcp47: 'ml-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', bcp47: 'mr-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', bcp47: 'gu-IN' },
];

function detectScriptFromText(text: string): string {
  if (!text || text.trim().length === 0) return '';
  if (/[\u0900-\u097F]/.test(text)) return 'हिन्दी / देवनागरी';
  if (/[\u0B00-\u0B7F]/.test(text)) return 'ଓଡ଼ିଆ (Odia)';
  if (/[\u0A00-\u0A7F]/.test(text)) return 'ਪੰਜਾਬੀ (Punjabi)';
  if (/[\u0980-\u09FF]/.test(text)) return 'বাংলা (Bengali)';
  if (/[\u0C00-\u0C7F]/.test(text)) return 'తెలుగు (Telugu)';
  if (/[\u0B80-\u0BFF]/.test(text)) return 'தமிழ் (Tamil)';
  if (/[\u0C80-\u0CFF]/.test(text)) return 'ಕನ್ನಡ (Kannada)';
  if (/[\u0D00-\u0D7F]/.test(text)) return 'മലയാളം (Malayalam)';
  if (/[\u0A80-\u0AFF]/.test(text)) return 'ગુજરાતી (Gujarati)';
  if (/[a-zA-Z]/.test(text)) return 'English';
  return 'Auto-Detected';
}

export const VoiceDictationModal: React.FC<VoiceDictationModalProps> = ({
  isOpen,
  onClose,
  onTranscriptReady,
}) => {
  const { currentLanguage, t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [micPermissionGranted, setMicPermissionGranted] = useState(false);
  const [copied, setCopied] = useState(false);

  const [activeSpeechLang, setActiveSpeechLang] = useState<string>(
    currentLanguage?.code && SUPPORTED_VOICE_LANGS.some((l) => l.code === currentLanguage.code)
      ? currentLanguage.code
      : 'hi'
  );
  const [audioLevel, setAudioLevel] = useState<number[]>([15, 30, 45, 60, 40, 25, 50, 70, 35, 20]);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const isRecordingRef = useRef(false);
  // Tracks text committed from previous recognition sessions (avoids repeat/duplicate)
  const committedTranscriptRef = useRef<string>('');

  // Sync isRecordingRef
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // When modal opens: check mic permission state and proactively request if not yet granted.
  // This triggers the browser's NATIVE OS-level permission dialog (same as location).
  useEffect(() => {
    if (!isOpen) {
      stopListening();
      return;
    }

    // Reset state on open
    setMicPermissionDenied(false);

    const checkAndRequestMic = async () => {
      // 1. Use Permissions API to query current state without prompting
      if (navigator.permissions) {
        try {
          const status = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          if (status.state === 'granted') {
            setMicPermissionGranted(true);
            return; // Already have access
          }
          if (status.state === 'denied') {
            // Permanently denied — can't re-prompt, show settings guidance
            setMicPermissionDenied(true);
            return;
          }
        } catch {
          // Permissions API not available on this browser — fall through to getUserMedia
        }
      }

      // 2. State is 'prompt' (or API unavailable) — trigger the native browser permission dialog
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Permission granted — stop stream immediately, user can tap mic button when ready
        stream.getTracks().forEach((t) => t.stop());
        setMicPermissionGranted(true);
        setMicPermissionDenied(false);
      } catch {
        setMicPermissionDenied(true);
        setMicPermissionGranted(false);
      }
    };

    checkAndRequestMic();
  }, [isOpen]);

  // Sync language with portal
  useEffect(() => {
    if (currentLanguage?.code && currentLanguage.code !== 'en') {
      setActiveSpeechLang(currentLanguage.code);
    }
  }, [currentLanguage]);

  // Dynamic Audio Visualizer
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setAudioLevel([
          Math.floor(Math.random() * 50) + 15,
          Math.floor(Math.random() * 75) + 20,
          Math.floor(Math.random() * 90) + 10,
          Math.floor(Math.random() * 65) + 30,
          Math.floor(Math.random() * 80) + 15,
          Math.floor(Math.random() * 55) + 20,
          Math.floor(Math.random() * 85) + 25,
          Math.floor(Math.random() * 70) + 15,
        ]);
      }, 120);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const getBestSupportedMimeType = (): string => {
    if (typeof MediaRecorder === 'undefined') return '';
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/aac',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/wav',
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  };

  const toWhisperLang = (code: string): string => {
    const map: Record<string, string> = {
      hi: 'hi',
      en: 'en',
      or: 'or',
      pa: 'pa',
      bn: 'bn',
      te: 'te',
      ta: 'ta',
      kn: 'kn',
      ml: 'ml',
      mr: 'mr',
      gu: 'gu',
    };
    return map[code] ?? code.split('-')[0];
  };

  // Fallback to Server AI Whisper transcription
  const sendAudioToAIBackend = async (audioBlob: Blob, lang: string) => {
    // If Web Speech already got a complete transcript, skip AI backend call to save time
    if (transcript.trim().length > 20) return;

    setIsTranscribing(true);
    try {
      const whisperLang = toWhisperLang(lang);
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const result = (reader.result as string).split(',')[1];
          result ? resolve(result) : reject(new Error('Empty base64'));
        };
        reader.onerror = reject;
      });

      const res = await axios.post('/api/v1/ai/transcribe-audio', {
        audioBase64: base64Data,
        mimeType: audioBlob.type || 'audio/webm',
        language: whisperLang,
      });

      if (res.data?.success && res.data.transcript && res.data.transcript.trim()) {
        const aiText = res.data.transcript.trim();
        setTranscript((prev) => (prev ? `${prev} ${aiText}` : aiText));
      }
    } catch (err) {
      console.warn('Backend AI audio transcription fallback note:', err);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Start speech recognition & microphone capture
  const startListening = () => {
    setMicPermissionDenied(false);
    setIsRecording(true);
    isRecordingRef.current = true;
    audioChunksRef.current = [];
    committedTranscriptRef.current = ''; // Reset committed text for new recording session

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const selectedOption = SUPPORTED_VOICE_LANGS.find((l) => l.code === activeSpeechLang);
    const bcp47Lang = selectedOption ? selectedOption.bcp47 : 'hi-IN';

    // Creates & starts one SpeechRecognition session.
    // Each session tracks only its OWN results to avoid repeat/duplicate text.
    const createAndStart = () => {
      if (!SpeechRecognition || !isRecordingRef.current) return;
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = bcp47Lang;
        // continuous=false works across iOS Safari + Android Chrome
        // We manually restart on onend for the "continuous" effect
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        // Track the final text produced by THIS session only
        let sessionFinalText = '';

        recognition.onresult = (event: any) => {
          // Build text from only this session's results
          let interim = '';
          let final = '';
          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              final += result[0].transcript;
            } else {
              interim += result[0].transcript;
            }
          }
          sessionFinalText = final; // track what's finalized in this session
          // Show: already committed from past sessions + final from this session + interim
          const display = [committedTranscriptRef.current, final, interim]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
          if (display) setTranscript(display);
        };

        recognition.onerror = (e: any) => {
          if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
            setMicPermissionDenied(true);
            setIsRecording(false);
            isRecordingRef.current = false;
          }
          // Ignore 'no-speech', 'audio-capture', 'network' — just restart
        };

        recognition.onend = () => {
          // Commit this session's final text before starting next session
          if (sessionFinalText.trim()) {
            committedTranscriptRef.current = [
              committedTranscriptRef.current,
              sessionFinalText.trim(),
            ]
              .filter(Boolean)
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim();
          }
          // Auto-restart for continuous dictation (handles iOS pause & Android timeout)
          if (isRecordingRef.current) {
            setTimeout(() => createAndStart(), 80);
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('SpeechRecognition start error:', err);
      }
    };

    // On Android Chrome, we MUST get mic permission before starting SpeechRecognition
    // On iOS Safari, getUserMedia isn't needed for SpeechRecognition but doesn't hurt
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 } })
        .then((stream) => {
          streamRef.current = stream;

          // Now start speech recognition (permission granted)
          createAndStart();

          // Also record raw audio as fallback for AI transcription
          const mimeType = getBestSupportedMimeType();
          let recorder: MediaRecorder;
          try {
            recorder = mimeType
              ? new MediaRecorder(stream, { mimeType })
              : new MediaRecorder(stream);
          } catch {
            recorder = new MediaRecorder(stream);
          }
          mediaRecorderRef.current = recorder;

          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
          };

          recorder.onstop = () => {
            streamRef.current?.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
            const audioBlob = new Blob(audioChunksRef.current, {
              type: mimeType || 'audio/webm',
            });
            if (audioBlob.size > 0) {
              sendAudioToAIBackend(audioBlob, activeSpeechLang);
            }
          };

          recorder.start(250);
        })
        .catch((err) => {
          console.warn('Microphone access denied:', err);
          setMicPermissionDenied(true);
          setIsRecording(false);
          isRecordingRef.current = false;
        });
    } else {
      // No getUserMedia API — try SpeechRecognition directly (desktop fallback)
      createAndStart();
    }
  };

  const stopListening = () => {
    setIsRecording(false);
    isRecordingRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
  };

  const handleApply = () => {
    if (transcript.trim()) {
      onTranscriptReady(transcript.trim());
      onClose();
    }
  };

  const handleCopy = () => {
    if (transcript.trim()) {
      navigator.clipboard.writeText(transcript.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const detectedScript = detectScriptFromText(transcript);
  const activeLangObj =
    SUPPORTED_VOICE_LANGS.find((l) => l.code === activeSpeechLang) || SUPPORTED_VOICE_LANGS[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2 text-[#0A2540] text-left">
          <div className="p-1.5 sm:p-2 rounded-xl bg-amber-100 text-[#FF9933] shrink-0">
            <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-extrabold truncate">{t('Voice Speech Recognition')}</h3>
            <p className="text-[11px] text-slate-500 font-normal truncate">
              {t('Speak your issue in your regional language with live AI transcription.')}
            </p>
          </div>
        </div>
      }
      maxWidth="lg"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-2">
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTranscript('');
                setIsRecording(false);
                isRecordingRef.current = false;
                setIsTranscribing(false);
              }}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              {t('Clear')}
            </Button>
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs sm:hidden">
              {t('Cancel')}
            </Button>
          </div>

          <div className="flex items-center justify-end w-full sm:w-auto gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="hidden sm:inline-flex text-xs">
              {t('Cancel')}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApply}
              disabled={!transcript.trim() || isTranscribing}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto font-bold text-xs sm:text-sm bg-[#2563EB] hover:bg-[#1D4ED8] text-white py-2 px-4 shadow-xs"
            >
              {t('Use This Text')}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-3.5 text-left font-sans">
        
        {/* Permission Denied — shows when mic is permanently blocked in browser settings */}
        {micPermissionDenied && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs space-y-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="block font-extrabold text-sm text-red-900">{t('Microphone Blocked by Browser')}</strong>
                <p className="text-red-800 leading-relaxed">
                  {t('Your browser has blocked microphone access. To fix: tap the 🔒 lock icon in your browser address bar → Site Settings → Microphone → Allow. Then reload the page.')}
                </p>
              </div>
            </div>
            {/* Try again button — will re-trigger native permission dialog if not permanently denied */}
            <button
              type="button"
              onClick={() => {
                setMicPermissionDenied(false);
                // getUserMedia() triggers the OS-level browser permission dialog
                navigator.mediaDevices
                  ?.getUserMedia({ audio: true })
                  .then((stream) => {
                    stream.getTracks().forEach((t) => t.stop());
                    setMicPermissionGranted(true);
                  })
                  .catch(() => {
                    setMicPermissionDenied(true);
                  });
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 active:scale-95 text-white font-bold text-xs transition-all cursor-pointer shadow-sm"
            >
              <Mic className="w-4 h-4" />
              {t('Try Again — Request Microphone Access')}
            </button>
          </div>
        )}

        {/* Permission granted badge */}
        {micPermissionGranted && !isRecording && !isTranscribing && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t('Microphone access granted — tap the mic button to start speaking')}
          </div>
        )}

        {/* Horizontal Scrollable Language Selector */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold px-1">
            <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="text-[11px] sm:text-xs">{t('Speaking Language')}:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
            {SUPPORTED_VOICE_LANGS.map((lang) => {
              const isSelected = activeSpeechLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setActiveSpeechLang(lang.code);
                    if (isRecording) {
                      stopListening();
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#0A2540] text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{lang.nativeName}</span>
                  <span className="ml-1 text-[10px] opacity-75 font-normal">({lang.name})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact Responsive Microphone Recording Area */}
        <div className="flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-50 via-white to-blue-50/40 border border-blue-100 text-center space-y-2.5">
          <button
            type="button"
            onClick={isRecording ? stopListening : startListening}
            className={`relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full transition-all duration-300 shadow-xl cursor-pointer active:scale-95 ${
              isRecording
                ? 'bg-red-600 text-white ring-8 ring-red-100 scale-105 animate-pulse'
                : 'bg-gradient-to-tr from-[#0A2540] to-[#1D4ED8] text-white hover:scale-105 hover:shadow-2xl'
            }`}
            aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
          >
            {isRecording ? (
              <MicOff className="w-7 h-7 sm:w-8 sm:h-8" />
            ) : (
              <Mic className="w-7 h-7 sm:w-8 sm:h-8 text-[#FF9933]" />
            )}
          </button>

          <div className="space-y-0.5">
            <p className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">
              {isRecording
                ? `🎙️ ${t('Listening in')} ${activeLangObj.nativeName}...`
                : isTranscribing
                ? `✨ ${t('AI Transcribing Speech...')}`
                : `${t('Tap mic and speak in')} ${activeLangObj.nativeName}`}
            </p>
            <p className="text-[11px] text-slate-500">
              {isRecording
                ? t('Tap red button when finished speaking')
                : t('Speak clearly into your device microphone')}
            </p>
          </div>

          {/* Live Audio Visualizer Waves */}
          {isRecording && (
            <div className="flex items-center gap-1 h-7 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-2xs">
              <Volume2 className="w-3.5 h-3.5 text-red-500 mr-0.5 animate-pulse" />
              {audioLevel.map((height, idx) => (
                <span
                  key={idx}
                  className="w-1 bg-gradient-to-t from-red-500 to-amber-500 rounded-full transition-all duration-150"
                  style={{ height: `${Math.max(4, height * 0.28)}px` }}
                />
              ))}
            </div>
          )}

          {/* AI Transcribing Spinner */}
          {isTranscribing && (
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>{t('Processing audio with AI...')}</span>
            </div>
          )}
        </div>

        {/* Real-Time Editable Transcript Box */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold uppercase tracking-wider text-slate-700 text-[11px]">
              {t('Transcribed Speech (Editable)')}
            </label>

            <div className="flex items-center gap-2">
              {detectedScript && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                  {detectedScript}
                </span>
              )}
              {transcript && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Copy transcript"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder={
              isRecording
                ? t('Listening... Speak now and text will appear in real time...')
                : t('Your spoken text appears here. You can also edit it directly...')
            }
            rows={3}
            className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:outline-none resize-none font-sans leading-relaxed text-slate-900 placeholder:text-slate-400 shadow-2xs"
          />
        </div>

      </div>
    </Modal>
  );
};
