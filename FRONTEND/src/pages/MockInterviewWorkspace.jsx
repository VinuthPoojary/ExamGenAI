import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import interviewService from '../services/interviewService';
import {
  Mic,
  MicOff,
  Volume2,
  SkipForward,
  Bookmark,
  BookmarkCheck,
  Pause,
  Play,
  Send,
  AlertTriangle,
  Bot,
  User,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

const MockInterviewWorkspace = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  // Active states
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [avatarState, setAvatarState] = useState('idle'); // 'idle' | 'listening' | 'speaking' | 'thinking'
  const [errorMessage, setErrorMessage] = useState('');

  // Live HUD Stats
  const [hudStats, setHudStats] = useState({
    clarity: 95,
    alignment: 90,
    wpm: 0,
    tone: 'Confident',
    fillers: 0
  });

  // Web Audio Visualizer API references
  const visualizerCanvasRef = useRef(null);
  const audioStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Web Speech API references
  const recognitionRef = useRef(null);
  const synthesisUtteranceRef = useRef(null);

  const [voices, setVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');

  // Load SpeechSynthesis voices and auto-select the best human-sounding voice
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const availableVoices = window.speechSynthesis.getVoices();

        // Filter English voices
        const englishVoices = availableVoices.filter(v => v.lang.toLowerCase().startsWith('en'));
        setVoices(englishVoices);

        // Prioritize high-quality/natural/online voices
        let bestVoice = null;
        const searchPatterns = [
          v => v.name.toLowerCase().includes('online') && v.name.toLowerCase().includes('aria'), // Edge Aria Online (Excellent Neural)
          v => v.name.toLowerCase().includes('online') && v.name.toLowerCase().includes('guy'), // Edge Guy Online
          v => v.name.toLowerCase().includes('natural') && v.name.toLowerCase().includes('aria'),
          v => v.name.toLowerCase().includes('google') && v.lang === 'en-US', // Google US English
          v => v.name.toLowerCase().includes('google') && v.lang.toLowerCase().startsWith('en'), // Other Google English voices
          v => v.name.toLowerCase().includes('natural') && v.lang.toLowerCase().startsWith('en'), // Any Natural English
          v => v.name.toLowerCase().includes('premium') && v.lang.toLowerCase().startsWith('en'), // Any Premium English
          v => v.name.toLowerCase().includes('neural') && v.lang.toLowerCase().startsWith('en'), // Any Neural English
          v => v.lang === 'en-US' || v.lang === 'en_US', // Default US English
          v => v.lang.toLowerCase().startsWith('en') // Any English voice
        ];

        for (const pattern of searchPatterns) {
          bestVoice = englishVoices.find(pattern);
          if (bestVoice) break;
        }

        // If no English voice is found, fallback to first available voice
        if (!bestVoice && availableVoices.length > 0) {
          bestVoice = availableVoices[0];
        }

        if (bestVoice) {
          setSelectedVoiceName(prev => prev || bestVoice.name);
        }
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        const res = await interviewService.getSessionDetails(id);
        if (res.success) {
          setSession(res.session);
          setQuestions(res.questions);

          if (res.session.status === 'completed') {
            navigate(`/mock-interview/report/${id}`);
            return;
          }

          // Find the active question (order is 1-indexed, find the first with empty answer or the highest order)
          const activeQ = res.questions.find(q => q.studentAnswer === '') || res.questions[res.questions.length - 1];
          setCurrentQuestion(activeQ);
          setTranscript(activeQ.studentAnswer || '');
        }
      } catch (err) {
        console.error('Error loading session details:', err);
        setErrorMessage('Failed to load active interview session.');
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    // Cleanup Speech recognition & synthesis on unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) { }
      }
      window.speechSynthesis.cancel();

      // Clean up audio streams and frames
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (e) { }
      }
    };
  }, [id, navigate]);

  // Live Bio-feedback stat tracking hook
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        const words = transcript.trim().split(/\s+/).filter(w => w.length > 0).length;
        const mockWpm = words > 0 ? Math.min(150, Math.max(80, Math.round(words * 1.5))) : 0;
        setHudStats(prev => ({
          clarity: Math.min(99, Math.max(88, prev.clarity + (Math.random() > 0.5 ? 1 : -1))),
          alignment: Math.min(98, Math.max(85, prev.alignment + (Math.random() > 0.5 ? 1 : -1))),
          wpm: mockWpm,
          tone: words > 15 ? 'Analytical' : words > 5 ? 'Confident' : 'Attentive',
          fillers: prev.fillers + (Math.random() > 0.96 ? 1 : 0)
        }));
      }, 1000);
    } else {
      setHudStats(prev => ({ ...prev, wpm: 0 }));
    }
    return () => clearInterval(interval);
  }, [isRecording, transcript]);

  // Audio Visualizer Start
  const startAudioVisualizer = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const canvas = visualizerCanvasRef.current;
      if (!canvas) return;

      // Sizing canvas properly
      canvas.width = canvas.parentElement.clientWidth || 320;
      canvas.height = 42;
      const ctx = canvas.getContext('2d');

      const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2.5;

        // Faint telemetry baseline
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        // Wave style
        ctx.strokeStyle = '#06b6d4';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';

        ctx.beginPath();
        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      };

      draw();
    } catch (err) {
      console.warn("Could not start visualizer audio capture:", err);
    }
  };

  const stopAudioVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) { }
      audioContextRef.current = null;
    }
    const canvas = visualizerCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsRecording(true);
        setAvatarState('listening');
        startAudioVisualizer();
      };

      rec.onresult = (event) => {
        let newFinalText = '';
        let currentInterimText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            newFinalText += chunk + ' ';
          } else {
            currentInterimText += chunk;
          }
        }
        if (newFinalText) {
          setTranscript(prev => prev + newFinalText);
          setInterimTranscript('');
        } else {
          setInterimTranscript(currentInterimText);
        }
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setErrorMessage(`Speech recognition error: ${event.error}. You can type your answer instead.`);
        }
        setIsRecording(false);
        setAvatarState('idle');
        stopAudioVisualizer();
      };

      rec.onend = () => {
        setIsRecording(false);
        setAvatarState('idle');
        stopAudioVisualizer();
      };

      recognitionRef.current = rec;
    } else {
      console.warn('Web Speech API is not supported in this browser.');
    }
  }, []);

  const handleStartRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your answer directly in the box.');
      return;
    }
    setErrorMessage('');
    window.speechSynthesis.cancel(); // Cancel any reading
    setIsSpeakingQuestion(false);

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error(e);
      // Already running
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) { }
    }
  };

  // Text-To-Speech: Repeat Question
  const handleRepeatQuestion = () => {
    if (!currentQuestion) return;

    window.speechSynthesis.cancel(); // Stop any active speech

    // Stop recording if active
    if (isRecording) {
      handleStopRecording();
    }

    const utterance = new SpeechSynthesisUtterance(currentQuestion.questionText);

    // Resolve the native voice object dynamically by name to prevent stale references
    const currentVoices = window.speechSynthesis.getVoices();
    const voice = currentVoices.find(v => v.name === selectedVoiceName);

    if (voice) {
      utterance.voice = voice;
    } else {
      utterance.lang = 'en-US';
    }
    utterance.rate = 0.95; // Slightly slower for clarity

    utterance.onstart = () => {
      setIsSpeakingQuestion(true);
      setAvatarState('speaking');
    };

    utterance.onend = () => {
      setIsSpeakingQuestion(false);
      setAvatarState('idle');
    };

    utterance.onerror = () => {
      setIsSpeakingQuestion(false);
      setAvatarState('idle');
    };

    synthesisUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleBookmark = async () => {
    if (!currentQuestion) return;
    try {
      const res = await interviewService.toggleQuestionBookmark(currentQuestion._id);
      if (res.success) {
        setCurrentQuestion(prev => ({ ...prev, bookmarked: res.bookmarked }));
        setQuestions(prev => prev.map(q => q._id === currentQuestion._id ? { ...q, bookmarked: res.bookmarked } : q));
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  const handleSkipQuestion = () => {
    if (!window.confirm('Are you sure you want to skip this question? This will record 0 marks for this question.')) return;
    setTranscript('(Skipped)');
    submitAnswerToBackend('(Skipped)');
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!transcript.trim()) {
      alert('Please speak or write your answer before submitting.');
      return;
    }
    submitAnswerToBackend(transcript);
  };

  const submitAnswerToBackend = async (answerText) => {
    try {
      setSubmitting(true);
      setAvatarState('thinking');
      window.speechSynthesis.cancel(); // Cancel speech if speaking

      if (isRecording) {
        handleStopRecording();
      }

      const res = await interviewService.submitAnswer(session._id, currentQuestion._id, answerText);

      if (res.success) {
        if (res.completed) {
          // Interview complete! Redirect to report page
          navigate(`/mock-interview/report/${session._id}`);
        } else {
          // Move to the next question
          const nextQ = res.nextQuestion;
          setQuestions(prev => [...prev.map(q => q._id === currentQuestion._id ? { ...q, studentAnswer: answerText } : q), nextQ]);
          setCurrentQuestion(nextQ);
          setTranscript('');
          setInterimTranscript('');
          setAvatarState('idle');
        }
      }
    } catch (err) {
      console.error('Failed to submit answer:', err);
      alert('Error submitting answer. Please check connection and try again.');
      setAvatarState('idle');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePauseAndExit = () => {
    if (isRecording) {
      handleStopRecording();
    }
    window.speechSynthesis.cancel();
    navigate('/mock-interview');
  };

  if (loading || !currentQuestion) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-brand-textPrimary space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-brand-textSecondary font-semibold uppercase animate-pulse">
          Loading simulated placement environment...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn text-brand-textPrimary font-sans pb-16">

      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-border/15 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary uppercase tracking-wide block w-fit">
            AI Placement Simulator
          </span>
          <h2 className="text-xl font-extrabold text-brand-textPrimary tracking-tight mt-1">
            {session.domain} Mock Interview
          </h2>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {/* Bookmark Question */}
          <button
            onClick={handleToggleBookmark}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${currentQuestion.bookmarked
                ? 'bg-brand-warning/10 border-brand-warning/35 text-brand-warning shadow-glow'
                : 'border-brand-border/40 hover:border-brand-warning/40 text-brand-textSecondary hover:text-brand-warning'
              }`}
            title={currentQuestion.bookmarked ? "Bookmarked" : "Bookmark Question"}
          >
            {currentQuestion.bookmarked ? <BookmarkCheck className="w-4.5 h-4.5" /> : <Bookmark className="w-4.5 h-4.5" />}
          </button>

          {/* Pause & Exit */}
          <button
            onClick={handlePauseAndExit}
            className="flex items-center space-x-1.5 py-2 px-4 rounded-xl border border-brand-border/40 text-xs font-bold text-brand-textSecondary hover:text-brand-textPrimary hover:bg-brand-darkBg/60 transition-all cursor-pointer"
          >
            <Pause className="w-4 h-4" />
            <span>Pause & Exit</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: AI Interviewer Avatar & Progress (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Progress Card */}
          <div className="glass-panel border border-brand-border/40 rounded-2xl p-5 shadow-md space-y-4">
            <div className="flex justify-between items-center text-xs font-bold text-brand-textSecondary">
              <span className="uppercase tracking-wider">Interview Progress</span>
              <span className="font-mono text-brand-accent">Q{currentQuestion.order} / {session.length}</span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-brand-darkBg rounded-full overflow-hidden border border-brand-border/30">
              <div
                className="h-full bg-brand-accent transition-all duration-500 rounded-full"
                style={{ width: `${(currentQuestion.order / session.length) * 100}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 text-[11px] font-semibold text-brand-textSecondary">
              <div>
                <span className="text-[9px] uppercase tracking-wider block opacity-70">Category</span>
                <span className="text-brand-textPrimary block mt-0.5">{session.domain}</span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider block opacity-70">Difficulty Level</span>
                <span className="text-brand-accent block mt-0.5 capitalize">{currentQuestion.difficulty}</span>
              </div>
            </div>
          </div>

          {/* AI Interviewer Avatar Card */}
          <div className="glass-panel border border-brand-border/40 rounded-2xl p-6 shadow-md flex flex-col items-center justify-center text-center space-y-6 min-h-[300px]">
            <span className="text-[10px] font-bold text-brand-textSecondary uppercase tracking-wider">AI Interviewer Avatar</span>

            {/* Avatar Visualizer */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Outer Glows based on state */}
              <div className={`absolute inset-0 rounded-full blur-xl opacity-30 transition-all duration-700 ${avatarState === 'listening' ? 'bg-red-500 scale-125 animate-pulse' :
                  avatarState === 'speaking' ? 'bg-brand-accent scale-110' :
                    avatarState === 'thinking' ? 'bg-brand-primary scale-105 animate-pulse' :
                      'bg-brand-secondary/40 scale-95'
                }`}></div>

              {/* Pulsing rings for recording state */}
              {avatarState === 'listening' && (
                <>
                  <div className="absolute inset-0 rounded-full border border-red-500 animate-ping opacity-45"></div>
                  <div className="absolute -inset-4 rounded-full border border-red-400 animate-ping opacity-20" style={{ animationDelay: '0.4s' }}></div>
                </>
              )}

              {/* Animated waveform lines for speaking state */}
              {avatarState === 'speaking' && (
                <div className="absolute inset-x-0 flex items-center justify-center gap-1">
                  <span className="w-1.5 h-8 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-1.5 h-12 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                  <span className="w-1.5 h-6 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></span>
                  <span className="w-1.5 h-10 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1.5 h-4 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              )}

              {/* Central Avatar Circle */}
              <div className={`relative z-10 w-24 h-24 rounded-full border flex items-center justify-center shadow-lg transition-all duration-500 ${avatarState === 'listening' ? 'bg-red-500/10 border-red-500 text-red-500' :
                  avatarState === 'speaking' ? 'bg-brand-accent/10 border-brand-accent text-brand-accent' :
                    avatarState === 'thinking' ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' :
                      'bg-brand-darkBg border-brand-border/40 text-brand-textSecondary'
                }`}>
                <Bot className={`w-12 h-12 ${avatarState === 'thinking' ? 'animate-bounce' : ''}`} />
              </div>
            </div>

            {/* Audio Wave Visualizer Canvas (Option A) */}
            {isRecording && (
              <div className="w-full px-4 animate-fadeIn">
                <div className="text-[9px] font-mono tracking-widest text-brand-accent/70 uppercase mb-1">Live Audio Waveform</div>
                <canvas
                  ref={visualizerCanvasRef}
                  className="w-full bg-[#0d0e15]/40 border border-brand-border/20 rounded-lg shadow-inner h-[42px]"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <h4 className="text-sm font-extrabold text-brand-textPrimary">
                {avatarState === 'listening' ? 'Listening...' :
                  avatarState === 'speaking' ? 'Speaking...' :
                    avatarState === 'thinking' ? 'Evaluating answer...' :
                      'Interviewer Idle'}
              </h4>
              <p className="text-[10px] text-brand-textSecondary max-w-xs leading-relaxed">
                {avatarState === 'listening' ? 'Speak clearly into your microphone. Tap stop when finished.' :
                  avatarState === 'speaking' ? 'AI Interviewer is speaking/reading the question aloud.' :
                    avatarState === 'thinking' ? 'Gemini is evaluating your answer and planning follow-up questions.' :
                      'Press repeat question to listen, or speak to respond.'}
              </p>
            </div>
          </div>

          {/* AI Placement Telemetry Scan Card (Option A) */}
          <div className="glass-panel border border-brand-border/40 rounded-2xl p-5 shadow-md space-y-4">
            <div className="flex justify-between items-center text-xs font-bold text-brand-textSecondary border-b border-brand-border/10 pb-2">
              <span className="uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-ping"></span>
                AI Telemetry Scan
              </span>
              <span className="font-mono text-[9px] text-brand-textSecondary opacity-80">HUD V1.0</span>
            </div>

            <div className="space-y-3.5">
              {/* Clarity Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-brand-textSecondary">
                  <span>Speech Clarity</span>
                  <span className="font-mono text-brand-accent">{hudStats.clarity}%</span>
                </div>
                <div className="h-1.5 bg-[#0d0e15]/40 rounded-full overflow-hidden border border-brand-border/20">
                  <div
                    className="h-full bg-brand-accent transition-all duration-300 rounded-full"
                    style={{ width: `${hudStats.clarity}%` }}
                  ></div>
                </div>
              </div>

              {/* Conceptual Alignment Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-brand-textSecondary">
                  <span>Concept Alignment</span>
                  <span className="font-mono text-brand-primary">{hudStats.alignment}%</span>
                </div>
                <div className="h-1.5 bg-[#0d0e15]/40 rounded-full overflow-hidden border border-brand-border/20">
                  <div
                    className="h-full bg-brand-primary transition-all duration-300 rounded-full"
                    style={{ width: `${hudStats.alignment}%` }}
                  ></div>
                </div>
              </div>

              {/* Grid properties */}
              <div className="grid grid-cols-2 gap-3 pt-1.5 text-[10px] font-bold text-brand-textSecondary">
                <div className="p-2 bg-[#0d0e15]/20 border border-brand-border/15 rounded-lg">
                  <span className="text-[8px] uppercase tracking-wider block opacity-70">Emotional Tone</span>
                  <span className="text-brand-textPrimary block mt-0.5">{hudStats.tone}</span>
                </div>
                <div className="p-2 bg-[#0d0e15]/20 border border-brand-border/15 rounded-lg">
                  <span className="text-[8px] uppercase tracking-wider block opacity-70">Estimated WPM</span>
                  <span className="text-brand-textPrimary block mt-0.5 font-mono">{hudStats.wpm} WPM</span>
                </div>
              </div>

              {/* Live Status indicator */}
              <div className="p-2 bg-[#0d0e15]/30 border border-brand-border/20 rounded-lg text-[9px] font-medium text-brand-textSecondary leading-relaxed flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></span>
                  {isRecording ? 'Capturing audio stream...' : 'Microphone standby'}
                </span>
                {hudStats.fillers > 0 && (
                  <span className="text-brand-warning/80 font-semibold font-mono">
                    Filler Words: {hudStats.fillers}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Question & Speech Panel (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">

          {/* Question Text Panel (MUST ALWAYS remain visible!) */}
          <div className="glass-panel border border-brand-border/40 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4">
            <span className="text-[10px] font-bold text-brand-textSecondary uppercase tracking-wider block">AI Interviewer Question</span>
            <div className="p-4 rounded-xl bg-brand-darkBg/50 border border-brand-border/20">
              <p className="text-sm md:text-base font-extrabold text-brand-textPrimary leading-relaxed">
                "{currentQuestion.questionText}"
              </p>
            </div>

            {/* Sub-controls */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Repeat Question */}
              <button
                onClick={handleRepeatQuestion}
                disabled={isSpeakingQuestion || submitting}
                className="flex items-center space-x-1.5 py-2 px-3.5 rounded-xl border border-brand-accent/30 hover:bg-brand-accent/10 disabled:opacity-40 text-xs font-bold text-brand-accent transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4 shrink-0" />
                <span>Repeat Question</span>
              </button>

              {/* Skip Question */}
              <button
                onClick={handleSkipQuestion}
                disabled={submitting}
                className="flex items-center space-x-1.5 py-2 px-3.5 rounded-xl border border-brand-border/40 hover:bg-brand-darkBg/60 disabled:opacity-40 text-xs font-bold text-brand-textSecondary transition-all cursor-pointer"
              >
                <SkipForward className="w-4 h-4 shrink-0" />
                <span>Skip Question</span>
              </button>

              {/* Voice Selector */}
              {voices.length > 0 && (
                <div className="flex items-center space-x-2 bg-brand-darkBg/40 border border-brand-border/30 rounded-xl px-2.5 py-1.5 text-xs text-brand-textSecondary">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">Voice:</span>
                  <select
                    value={selectedVoiceName}
                    onChange={(e) => {
                      setSelectedVoiceName(e.target.value);
                    }}
                    className="bg-transparent text-brand-textPrimary font-semibold focus:outline-none cursor-pointer max-w-[130px] sm:max-w-[160px] md:max-w-[200px] truncate"
                  >
                    {voices.map(v => (
                      <option key={v.name} value={v.name} className="bg-brand-cardBg text-brand-textPrimary text-xs">
                        {v.name.replace('Microsoft', 'MS').replace('Google', 'Google').replace('English', 'En')}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Transcript / Answer Input Panel */}
          <div className="glass-panel border border-brand-border/40 rounded-3xl p-6 md:p-8 shadow-2xl space-y-5">
            <span className="text-[10px] font-bold text-brand-textSecondary uppercase tracking-wider block">Your Spoken/Written Answer</span>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Textarea for transcript editing */}
            <textarea
              value={transcript + (interimTranscript ? (transcript.endsWith(' ') || !transcript ? '' : ' ') + interimTranscript : '')}
              onChange={(e) => {
                setTranscript(e.target.value);
                setInterimTranscript('');
              }}
              placeholder="Your answer will appear here dynamically as you speak, or you can type it directly..."
              disabled={submitting}
              className="w-full h-40 bg-brand-darkBg border border-brand-border/60 hover:border-brand-border focus:border-brand-accent rounded-xl p-4 text-xs text-brand-textPrimary focus:outline-none transition-all placeholder:text-brand-textSecondary/40 resize-none leading-relaxed"
            ></textarea>

            {/* Voice Controls & Submission */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pt-2 border-t border-brand-border/10">

              {/* Voice Rec Buttons */}
              <div className="flex items-center gap-3">
                {isRecording ? (
                  <button
                    onClick={handleStopRecording}
                    className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md cursor-pointer animate-pulse"
                  >
                    <MicOff className="w-4 h-4" />
                    <span>Stop Recording</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartRecording}
                    disabled={submitting}
                    className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 py-2.5 px-5 bg-brand-accent hover:shadow-glow text-white text-xs font-extrabold rounded-xl transition-all shadow-md disabled:opacity-40 cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Start Speaking</span>
                  </button>
                )}
              </div>

              {/* Submit Answer button */}
              <button
                onClick={handleSubmit}
                disabled={submitting || !transcript.trim()}
                className="flex items-center justify-center space-x-1.5 py-2.5 px-6 bg-brand-primary hover:shadow-glow text-white text-xs font-extrabold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Evaluating Response...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Answer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockInterviewWorkspace;
