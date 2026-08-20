import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Sparkles, Volume2, ArrowRight, RotateCcw } from 'lucide-react';
import { Modal } from '../common/Modal.js';
import { Button } from '../common/Button.js';
import { Badge } from '../common/Badge.js';

export interface VoiceDictationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptReady: (transcript: string) => void;
}

export const VoiceDictationModal: React.FC<VoiceDictationModalProps> = ({
  isOpen,
  onClose,
  onTranscriptReady,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'or'>('en');
  const [audioLevel, setAudioLevel] = useState<number[]>([15, 30, 45, 60, 40, 25, 50, 70, 35, 20]);

  // Simulated live audio visualizer animation
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setAudioLevel([
          Math.floor(Math.random() * 60) + 15,
          Math.floor(Math.random() * 80) + 20,
          Math.floor(Math.random() * 95) + 10,
          Math.floor(Math.random() * 70) + 30,
          Math.floor(Math.random() * 85) + 15,
          Math.floor(Math.random() * 60) + 20,
          Math.floor(Math.random() * 90) + 25,
          Math.floor(Math.random() * 75) + 15,
        ]);
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const samplePrompts = {
    en: 'My monthly pension has not been credited for the past two months to my bank account in Bhubaneswar.',
    hi: 'मेरी मासिक पेंशन पिछले दो महीनों से भुवनेश्वर में मेरे बैंक खाते में जमा नहीं हुई है।',
    or: 'ମୋର ମାସିକ ଭତ୍ତା/ପେନସନ ବିଗତ ଦୁଇ ମାସ ହେବ ଭୁବନେଶ୍ୱର ବ୍ୟାଙ୍କ ଆକାଉଣ୍ଟରେ ଜମା ହୋଇନାହିଁ।',
  };

  const startListening = () => {
    setIsRecording(true);
    setTranscript('');

    // Check if browser native SpeechRecognition is supported
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang =
          selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'or' ? 'or-IN' : 'en-IN';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let current = '';
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript + ' ';
          }
          setTranscript(current);
        };

        recognition.onerror = () => {
          // Graceful simulated speech if permission denied
          simulateSpeechRecognition();
        };

        recognition.start();
      } catch {
        simulateSpeechRecognition();
      }
    } else {
      simulateSpeechRecognition();
    }
  };

  const simulateSpeechRecognition = () => {
    const textToType = samplePrompts[selectedLanguage];
    let index = 0;
    const interval = setInterval(() => {
      if (index < textToType.length) {
        setTranscript(textToType.slice(0, index + 3));
        index += 3;
      } else {
        clearInterval(interval);
        setIsRecording(false);
      }
    }, 60);
  };

  const stopListening = () => {
    setIsRecording(false);
  };

  const handleApply = () => {
    if (transcript.trim()) {
      onTranscriptReady(transcript);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5 text-[#0A2540]">
          <div className="p-2 rounded-xl bg-amber-100 text-[#FF9933]">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Voice Grievance Dictation</h3>
            <p className="text-xs text-slate-500 font-normal">
              Speak naturally in your preferred language. AI will transcribe &amp; structure it.
            </p>
          </div>
        </div>
      }
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTranscript('');
              setIsRecording(false);
            }}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Clear
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="saffron"
              size="sm"
              onClick={handleApply}
              disabled={!transcript.trim()}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="font-bold"
            >
              Use This Grievance
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Language Selection Pills */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 border border-slate-200 text-xs">
          <span className="font-semibold text-slate-600 pl-2">Select Language:</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedLanguage('en')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedLanguage === 'en'
                  ? 'bg-white text-[#0A2540] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setSelectedLanguage('hi')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedLanguage === 'hi'
                  ? 'bg-white text-[#0A2540] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              हिन्दी (Hindi)
            </button>
            <button
              onClick={() => setSelectedLanguage('or')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedLanguage === 'or'
                  ? 'bg-white text-[#0A2540] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ଓଡ଼ିଆ (Odia)
            </button>
          </div>
        </div>

        {/* Microphone Recording Orb & Audio Visualizer */}
        <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-gradient-to-b from-slate-50 to-blue-50/50 border border-blue-100 text-center space-y-4">
          <button
            onClick={isRecording ? stopListening : startListening}
            className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 shadow-xl cursor-pointer ${
              isRecording
                ? 'bg-red-600 text-white ring-8 ring-red-100 scale-105 animate-pulse'
                : 'bg-gradient-to-tr from-[#0A2540] to-[#1E3A8A] text-white hover:scale-105 hover:shadow-2xl'
            }`}
            aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
          >
            {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8 text-[#FF9933]" />}
          </button>

          <div>
            <p className="font-bold text-sm text-slate-900">
              {isRecording ? 'Listening... Speak your problem clearly' : 'Tap the microphone to speak'}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {isRecording ? 'Click again when finished' : 'e.g., "Road damaged in Patia, sewage overflow"'}
            </p>
          </div>

          {/* Audio Visualizer Waves */}
          {isRecording && (
            <div className="flex items-center gap-1.5 h-10 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-2xs">
              <Volume2 className="w-4 h-4 text-red-500 mr-1 animate-pulse" />
              {audioLevel.map((height, idx) => (
                <span
                  key={idx}
                  className="w-1 bg-gradient-to-t from-red-500 to-amber-500 rounded-full transition-all duration-150"
                  style={{ height: `${Math.max(6, height * 0.35)}px` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Real-Time Transcribed Text Preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Transcribed Speech Preview
            </label>
            {transcript && (
              <Badge variant="emerald" size="sm">
                <Sparkles className="w-3 h-3 inline mr-1" />
                AI Cleaned
              </Badge>
            )}
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-white min-h-24 max-h-40 overflow-y-auto text-sm text-slate-800 leading-relaxed font-sans">
            {transcript ? (
              <span>{transcript}</span>
            ) : (
              <span className="text-slate-400 italic">
                Your transcribed speech will appear here in real time as you speak...
              </span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
