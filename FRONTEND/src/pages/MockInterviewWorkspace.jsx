import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import interviewService from '../services/interviewService';
import { motion, AnimatePresence } from 'framer-motion';
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
  HelpCircle,
  Clock,
  LogOut,
  Maximize2
} from 'lucide-react';

const ProfessionalAvatar = ({ state }) => {
  // state can be: 'idle' | 'listening' | 'speaking' | 'thinking'

  // Outer glow variations
  const glowVariants = {
    idle: {
      scale: 1,
      opacity: 0.35,
      filter: "drop-shadow(0 0 8px rgba(99, 102, 241, 0.3))",
      borderColor: "rgba(148, 163, 184, 0.2)"
    },
    listening: {
      scale: [1, 1.04, 1],
      opacity: 0.9,
      filter: [
        "drop-shadow(0 0 10px rgba(239, 68, 68, 0.4))",
        "drop-shadow(0 0 20px rgba(239, 68, 68, 0.8))",
        "drop-shadow(0 0 10px rgba(239, 68, 68, 0.4))"
      ],
      borderColor: "rgba(239, 68, 68, 0.75)",
      transition: { repeat: Infinity, duration: 1.5 }
    },
    speaking: {
      scale: [1, 1.06, 1],
      opacity: 0.95,
      filter: [
        "drop-shadow(0 0 12px rgba(34, 211, 238, 0.5))",
        "drop-shadow(0 0 28px rgba(34, 211, 238, 0.9))",
        "drop-shadow(0 0 12px rgba(34, 211, 238, 0.5))"
      ],
      borderColor: "rgba(34, 211, 238, 0.85)",
      transition: { repeat: Infinity, duration: 1.2 }
    },
    thinking: {
      scale: [1, 1.02, 1],
      opacity: 0.75,
      filter: [
        "drop-shadow(0 0 10px rgba(99, 102, 241, 0.4))",
        "drop-shadow(0 0 18px rgba(99, 102, 241, 0.7))",
        "drop-shadow(0 0 10px rgba(99, 102, 241, 0.4))"
      ],
      borderColor: "rgba(99, 102, 241, 0.65)",
      transition: { repeat: Infinity, duration: 2.0 }
    }
  };

  // Breathing loop animation for body
  const breathingTransition = {
    duration: 3.5,
    repeat: Infinity,
    ease: "easeInOut"
  };

  // Blinking loop animation for eyes
  const blinkingTransition = {
    duration: 4.5,
    repeat: Infinity,
    ease: "easeInOut",
    times: [0, 0.45, 0.48, 0.51, 1]
  };

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      {/* Background radial spotlight */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent opacity-90 rounded-full scale-125 z-0" />

      {/* Orbiting data rings for thinking state */}
      {state === 'thinking' && (
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="w-[180px] h-[180px] border border-dashed border-indigo-500/20 rounded-full absolute"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
            className="w-[200px] h-[200px] border border-dashed border-cyan-500/10 rounded-full absolute"
          />
        </div>
      )}

      {/* Main outer glow/border wrapping the SVG */}
      <motion.div
        variants={glowVariants}
        animate={state}
        className="w-36 h-36 rounded-full border-2 bg-slate-950 flex items-center justify-center overflow-hidden z-10 transition-colors duration-500"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
        >
          {/* Gradients */}
          <defs>
            <linearGradient id="skinColor" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffd8c2" />
              <stop offset="100%" stopColor="#f5b898" />
            </linearGradient>
            <linearGradient id="suitColor" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="hairColor" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#312e81" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* SVG Body Group with breathing animation */}
          <motion.g
            animate={{ y: [0, -1.8, 0] }}
            transition={breathingTransition}
          >
            {/* Shoulders / blazer */}
            <path
              d="M15,95 C15,78 30,66 50,66 C70,66 85,78 85,95 Z"
              fill="url(#suitColor)"
            />
            {/* Crisp white inner collar */}
            <path
              d="M40,66 L60,66 L50,80 Z"
              fill="#f8fafc"
            />
            {/* Tie / Accent */}
            <path
              d="M48,72 L52,72 L53,95 L47,95 Z"
              fill="#06b6d4"
            />
          </motion.g>

          {/* SVG Head Group with breathing animation */}
          <motion.g
            animate={{ y: [0, -1.2, 0] }}
            transition={breathingTransition}
          >
            {/* Neck */}
            <rect x="44" y="52" width="12" height="15" rx="2" fill="url(#skinColor)" />
            {/* Face */}
            <circle cx="50" cy="40" r="16" fill="url(#skinColor)" />

            {/* Stylized Professional Haircut */}
            <path
              d="M32,44 C28,29 38,18 50,18 C62,18 72,29 68,44 C65,34 59,24 50,24 C41,24 35,34 32,44 Z"
              fill="url(#hairColor)"
            />

            {/* Smart Glasses */}
            <rect x="36" y="36" width="11" height="6" rx="1.5" fill="none" stroke="#67e8f9" strokeWidth="0.85" opacity="0.9" />
            <rect x="53" y="36" width="11" height="6" rx="1.5" fill="none" stroke="#67e8f9" strokeWidth="0.85" opacity="0.9" />
            <line x1="47" y1="39" x2="53" y2="39" stroke="#67e8f9" strokeWidth="0.85" opacity="0.9" />

            {/* Blinking Eyes */}
            <motion.ellipse
              cx="41.5"
              cy="39"
              rx="1.5"
              ry="1.5"
              fill="#020617"
              animate={{ scaleY: [1, 1, 0, 1, 1, 1, 1] }}
              transition={blinkingTransition}
            />
            <motion.ellipse
              cx="58.5"
              cy="39"
              rx="1.5"
              ry="1.5"
              fill="#020617"
              animate={{ scaleY: [1, 1, 0, 1, 1, 1, 1] }}
              transition={blinkingTransition}
            />

            {/* Wiggling Mouth during speech */}
            <motion.path
              d="M46,47 Q50,48.5 54,47"
              stroke="#1e293b"
              strokeWidth="1.2"
              fill="none"
              animate={state === 'speaking' ? {
                d: [
                  "M46,47 Q50,48.5 54,47",
                  "M46,47 Q50,54 54,47",
                  "M46,47 Q50,48.5 54,47",
                  "M46,47 Q50,52 54,47",
                  "M46,47 Q50,48.5 54,47"
                ]
              } : {
                d: "M46,47 Q50,48.5 54,47"
              }}
              transition={{
                duration: 0.6,
                repeat: state === 'speaking' ? Infinity : 0,
                ease: "easeInOut"
              }}
            />
          </motion.g>
        </svg>
      </motion.div>
    </div>
  );
};

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

  // Track time spent per question
  const [elapsedTime, setElapsedTime] = useState(0);

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

  // Start question timer
  useEffect(() => {
    setElapsedTime(0);
    if (!currentQuestion) return;

    const timerInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [currentQuestion?.order]);

  // Format seconds to MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60).toString().padStart(2, '0');
    const seconds = (secs % 60).toString().padStart(2, '0');
    return `${mins}:${seconds}`;
  };

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
      canvas.height = 48;
      const ctx = canvas.getContext('2d');

      const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteTimeDomainData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 3;

        // Faint telemetry baseline
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();

        // Wave style
        ctx.strokeStyle = '#22d3ee'; // cyan-400
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(34, 211, 238, 0.6)';

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
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#07080d] text-white space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider animate-pulse">
          Loading simulated placement environment...
        </p>
      </div>
    );
  }

  // Calculate percentages
  const progressPercent = (currentQuestion.order / session.length) * 100;

  return (
    <div className="fixed inset-0 bg-[#07080d] overflow-hidden text-slate-100 flex flex-col font-sans select-none">

      {/* Immersive background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none z-0"></div>

      {/* Top Progress / Telemetry HUD */}
      <header className="relative z-10 backdrop-blur-md bg-black/40 border-b border-white/5 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Bot className="w-5 h-5 shrink-0" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase px-2 py-0.5 bg-cyan-950/40 border border-cyan-800/30 rounded-md">
                PLACEMENT IN-PROGRESS
              </span>
              <span className="text-xs font-semibold text-slate-400">• {session.domain}</span>
            </div>
            <h1 className="text-sm font-extrabold text-slate-100 tracking-wide mt-0.5">
              Simulated AI Recruiter Board
            </h1>
          </div>
        </div>

        {/* HUD Progress Bar */}
        <div className="flex-1 max-w-md mx-4 hidden md:flex flex-col space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold text-slate-400">
            <span>SESSION PROGRESS</span>
            <span className="font-mono text-cyan-400">Q{currentQuestion.order} of {session.length}</span>
          </div>
          <div className="h-2 bg-slate-900 border border-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Active Timer */}
          <div className="flex items-center space-x-2 bg-slate-900/60 border border-white/5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-300 shadow-inner">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="font-mono text-sm tracking-widest">{formatTime(elapsedTime)}</span>
          </div>

          {/* Bookmark Question */}
          <button
            onClick={handleToggleBookmark}
            className={`p-2.5 rounded-xl border border-white/5 bg-slate-900/60 transition-all cursor-pointer ${currentQuestion.bookmarked
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-glow shadow-amber-500/10'
              : 'hover:border-amber-500/30 text-slate-400 hover:text-amber-400'
              }`}
            title={currentQuestion.bookmarked ? "Bookmarked" : "Bookmark Question"}
          >
            {currentQuestion.bookmarked ? (
              <BookmarkCheck className="w-4.5 h-4.5" />
            ) : (
              <Bookmark className="w-4.5 h-4.5" />
            )}
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 relative z-10 px-6 py-6 overflow-hidden flex flex-col lg:grid lg:grid-cols-12 gap-6 max-w-7xl mx-auto w-full">

        {/* Left Column: AI Interviewer Section (lg:col-span-5) */}
        <section className="lg:col-span-5 flex flex-col h-full space-y-6 overflow-hidden min-h-0">

          {/* Main AI Avatar hologram panel */}
          <div className="flex-1 backdrop-blur-xl bg-slate-950/30 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/10 to-transparent pointer-events-none"></div>

            {/* Glowing active center rings */}
            <div className="absolute inset-x-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[64px] pointer-events-none"></div>

            <div className="relative w-48 h-48 flex items-center justify-center">
              <ProfessionalAvatar state={avatarState} />
            </div>

            {/* Speaking Waveform Visualization */}
            <div className="h-6 w-full flex items-center justify-center mt-6">
              {avatarState === 'speaking' && (
                <div className="flex items-center gap-1.5">
                  {[...Array(6)].map((_, i) => (
                    <motion.span
                      key={i}
                      animate={{
                        height: [8, 24, 8],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.8 + i * 0.1,
                        ease: "easeInOut"
                      }}
                      className="w-1 h-3 bg-cyan-400 rounded-full"
                    />
                  ))}
                </div>
              )}
              {avatarState === 'listening' && (
                <span className="text-[10px] font-mono tracking-widest text-red-500 animate-pulse font-bold">
                  MICROPHONE IS ACTIVE
                </span>
              )}
              {avatarState === 'thinking' && (
                <span className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase font-bold animate-pulse">
                  EVALUATING YOUR RESPONSE...
                </span>
              )}
              {avatarState === 'idle' && (
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                  WAITING FOR INPUT
                </span>
              )}
            </div>

            {/* Audio Wave Visualizer Canvas */}
            {isRecording && (
              <div className="w-full px-6 mt-4 animate-fadeIn">
                <canvas
                  ref={visualizerCanvasRef}
                  className="w-full bg-slate-950/80 border border-white/5 rounded-2xl h-12 shadow-inner"
                />
              </div>
            )}

            <div className="text-center mt-6 max-w-xs space-y-1.5 relative z-10">
              <h2 className="text-base font-extrabold text-slate-200">
                {avatarState === 'listening' ? 'AI Recruiter (Listening)' :
                  avatarState === 'speaking' ? 'AI Recruiter (Speaking)' :
                    avatarState === 'thinking' ? 'AI Recruiter (Thinking)' :
                      'AI Recruiter (Idle)'}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                {avatarState === 'listening' ? 'Speak clearly. When done, tap Stop Recording.' :
                  avatarState === 'speaking' ? 'Listening to instructions. Use controls to pause/repeat.' :
                    avatarState === 'thinking' ? 'Analyzing conceptual alignment and voice tone.' :
                      'Ready. Click Repeat to hear the query or speak to answer.'}
              </p>
            </div>
          </div>

          {/* Telemetry feedback board */}
          <div className="backdrop-blur-xl bg-slate-950/20 border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2.5">
              <span>Bio-Feedback Scan</span>
              <span className="text-cyan-400 font-mono">TELEMETRY IN-LINE</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div className="p-3 bg-slate-950/40 border border-white/5 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tone Detection</span>
                <span className="text-sm font-extrabold text-cyan-400 mt-1">{hudStats.tone}</span>
              </div>
              <div className="p-3 bg-slate-950/40 border border-white/5 rounded-2xl flex flex-col justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Speaking Tempo</span>
                <span className="text-sm font-extrabold text-indigo-400 mt-1 font-mono">{hudStats.wpm} WPM</span>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>SPEECH CLARITY INDEX</span>
                  <span className="font-mono text-cyan-400">{hudStats.clarity}%</span>
                </div>
                <div className="h-1.5 bg-slate-900 border border-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full transition-all duration-300" style={{ width: `${hudStats.clarity}%` }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>CONCEPTUAL ALIGNMENT</span>
                  <span className="font-mono text-indigo-400">{hudStats.alignment}%</span>
                </div>
                <div className="h-1.5 bg-slate-900 border border-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 rounded-full transition-all duration-300" style={{ width: `${hudStats.alignment}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Question & Transcript workspace (lg:col-span-7) */}
        <section className="lg:col-span-7 flex flex-col h-full space-y-6 overflow-hidden min-h-0">

          {/* Question Display Card */}
          <div className="backdrop-blur-xl bg-slate-950/30 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Active Interview Prompt
              </span>
              <span className="text-[10px] font-extrabold text-cyan-400 uppercase px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/25 rounded-md capitalize">
                {currentQuestion.difficulty} Level
              </span>
            </div>

            <div className="p-4 bg-slate-950/50 border border-white/5 rounded-2xl relative overflow-hidden min-h-[100px] flex items-center justify-center">
              {/* Frame-based smooth text slider */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentQuestion._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.45 }}
                  className="text-base md:text-lg font-bold text-white leading-relaxed text-center"
                >
                  "{currentQuestion.questionText}"
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Voice selection utilities */}
            {voices.length > 0 && (
              <div className="flex items-center space-x-2 bg-slate-950/40 border border-white/5 rounded-2xl px-3 py-1.5 text-xs text-slate-400 w-fit">
                <span className="text-[9px] font-bold uppercase tracking-wider block opacity-75">Interviewer Voice:</span>
                <select
                  value={selectedVoiceName}
                  onChange={(e) => setSelectedVoiceName(e.target.value)}
                  className="bg-transparent text-cyan-400 font-bold focus:outline-none cursor-pointer max-w-[180px] sm:max-w-[260px] truncate"
                >
                  {voices.map(v => (
                    <option key={v.name} value={v.name} className="bg-slate-950 text-white text-xs">
                      {v.name.replace('Microsoft', 'MS').replace('Google', 'Google').replace('English', 'En')}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Transcript / Input Board */}
          <div className="flex-1 backdrop-blur-xl bg-slate-950/30 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col space-y-4 overflow-hidden">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Student Transcript Panel
            </span>

            {errorMessage && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs flex items-center space-x-2.5 animate-bounce">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Fluid responsive text input editing container */}
            <div className="flex-1 relative flex flex-col min-h-0 bg-slate-950/60 border border-white/5 hover:border-white/10 focus-within:border-cyan-500/30 rounded-2xl overflow-hidden transition-all duration-300">
              <textarea
                value={transcript + (interimTranscript ? (transcript.endsWith(' ') || !transcript ? '' : ' ') + interimTranscript : '')}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  setInterimTranscript('');
                }}
                disabled={submitting}
                placeholder="The system will transcribe your spoken responses in real-time. Feel free to type as well to modify your answer..."
                className="flex-1 w-full bg-transparent p-5 text-sm leading-relaxed text-slate-100 focus:outline-none placeholder:text-slate-600 resize-none min-h-[140px]"
              />

              <div className="p-3 bg-slate-950/40 border-t border-white/5 flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span className="flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-cyan-500/70" />
                  <span className="text-slate-400">Response Panel</span>
                </span>
                {transcript.length > 0 && (
                  <span className="font-mono text-slate-400">{transcript.split(/\s+/).filter(Boolean).length} Words</span>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Floating Bottom Console controls */}
      <footer className="relative z-20 backdrop-blur-xl bg-slate-950/50 border-t border-white/10 px-8 py-4.5 flex flex-col md:flex-row items-center justify-between gap-4">

        {/* Left Side: Pause/Exit */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <button
            onClick={handlePauseAndExit}
            className="flex items-center space-x-2 py-2.5 px-5 rounded-2xl border border-white/10 bg-slate-950 hover:bg-slate-900 transition-all font-extrabold text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Pause & Exit</span>
          </button>
        </div>

        {/* Center Side: Micro and repeat commands */}
        <div className="flex items-center space-x-4">

          {/* Repeat Question Button */}
          <button
            onClick={handleRepeatQuestion}
            disabled={isSpeakingQuestion || submitting}
            className="flex items-center space-x-2 py-2.5 px-4.5 rounded-2xl border border-cyan-400/20 bg-cyan-950/10 hover:bg-cyan-950/30 text-cyan-400 transition-all leading-none font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Volume2 className="w-4 h-4 shrink-0" />
            <span>Repeat Question</span>
          </button>

          {/* Central Microphone control bar */}
          <div className="relative flex items-center justify-center">
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0.5 }}
                  animate={{ scale: 1.4, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: "easeOut" }}
                  className="absolute inset-x-0 inset-y-0 bg-red-500 rounded-full pointer-events-none"
                />
              )}
            </AnimatePresence>

            {isRecording ? (
              <button
                onClick={handleStopRecording}
                className="relative z-10 w-14 h-14 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-full transition-all shadow-lg cursor-pointer"
                title="Stop Speak Mode"
              >
                <MicOff className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={handleStartRecording}
                disabled={submitting}
                className="relative z-10 w-14 h-14 flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-full transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg cursor-pointer shadow-cyan-400/25"
                title="Tap to speak"
              >
                <Mic className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Skip Card button */}
          <button
            onClick={handleSkipQuestion}
            disabled={submitting}
            className="flex items-center space-x-2 py-2.5 px-4.5 rounded-2xl border border-white/10 hover:bg-slate-900 text-slate-400 hover:text-white transition-all font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <SkipForward className="w-4 h-4 shrink-0" />
            <span>Skip Request</span>
          </button>
        </div>

        {/* Right Side: Big submit trigger */}
        <div className="w-full md:w-auto">
          <button
            onClick={handleSubmit}
            disabled={submitting || !transcript.trim()}
            className="w-full md:w-auto flex items-center justify-center space-x-2 py-3 px-8 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:brightness-110 active:scale-98 text-slate-950 font-extrabold text-xs rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all cursor-pointer shadow-lg shadow-cyan-500/20"
          >
            {submitting ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="text-white">Evaluating Response...</span>
              </>
            ) : (
              <>
                <span className="text-white">Submit Answer</span>
                <Send className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </div>

      </footer>

    </div>
  );
};

export default MockInterviewWorkspace;
