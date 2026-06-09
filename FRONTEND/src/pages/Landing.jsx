import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Sparkles, 
  ArrowRight, 
  UploadCloud, 
  Cpu, 
  LineChart, 
  ShieldAlert, 
  ClipboardCheck, 
  BookOpen, 
  ChevronRight, 
  CheckCircle,
  FileText,
  Clock,
  Sun,
  Moon,
  Database,
  ArrowRightCircle,
  Award,
  Zap
} from 'lucide-react';
import studyHeroGraphic from '../assets/study_hero_graphic.png';

const Landing = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Interactive Simulator States
  const [simState, setSimState] = useState('idle'); // 'idle' | 'uploading' | 'config' | 'taking' | 'result'
  const [simProgress, setSimProgress] = useState(0);
  const [simSelectedOption, setSimSelectedOption] = useState(null);
  const [simDifficulty, setSimDifficulty] = useState('Medium');
  const [simUploadingText, setSimUploadingText] = useState('');

  // Sync theme changes
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
    window.dispatchEvent(new Event('themechange'));
  }, [theme]);

  // Handle Page scroll
  const handleScrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  const handleGetStarted = () => {
    if (token) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  // Run Simulator Upload animation
  const runUploadSimulation = () => {
    setSimState('uploading');
    setSimProgress(0);
    setSimUploadingText('Parsing document nodes...');
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setSimProgress(currentProgress);
      
      if (currentProgress === 30) {
        setSimUploadingText('Extracting lecture slide contexts...');
      } else if (currentProgress === 65) {
        setSimUploadingText('Generating vector index embeddings...');
      } else if (currentProgress === 85) {
        setSimUploadingText('Syncing with AI test compiler...');
      }
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setSimState('config');
        }, 400);
      }
    }, 80);
  };

  const handleCompileSimulation = () => {
    setSimState('taking');
  };

  const handleSubmitSimulation = () => {
    setSimState('result');
  };

  const resetSimulation = () => {
    setSimState('idle');
    setSimProgress(0);
    setSimSelectedOption(null);
  };

  return (
    <div className="min-h-screen bg-brand-darkBg text-brand-textPrimary relative overflow-x-hidden selection:bg-brand-primary/30 selection:text-white transition-colors duration-300">
      {/* Background ambient glowing circles */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-brand-primary/8 blur-[150px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute top-[40vh] left-1/4 w-[400px] h-[400px] rounded-full bg-brand-secondary/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[600px] h-[600px] rounded-full bg-brand-accent/5 blur-[180px] pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-brand-border/30 h-16 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center space-x-3 cursor-pointer select-none" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center shadow-glow">
            <span className="text-lg font-bold text-white tracking-wider font-sans">Æ</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight text-brand-textPrimary font-sans">
            ExamGen <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent">AI</span>
          </span>
        </div>

        {/* Desktop Menu links */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold uppercase tracking-wider text-brand-textSecondary">
          <button 
            onClick={() => handleScrollTo('features')} 
            className="hover:text-brand-textPrimary transition-colors cursor-pointer"
          >
            Features
          </button>
          <button 
            onClick={() => handleScrollTo('how-it-works')} 
            className="hover:text-brand-textPrimary transition-colors cursor-pointer"
          >
            How it Works
          </button>
          <button 
            onClick={() => handleScrollTo('preview')} 
            className="hover:text-brand-textPrimary transition-colors cursor-pointer"
          >
            Sandbox Simulator
          </button>
        </nav>

        {/* Action Buttons & Theme switch */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg text-brand-textSecondary hover:text-brand-textPrimary hover:bg-brand-border/20 transition-all flex items-center justify-center cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-brand-warning" /> : <Moon className="w-5 h-5 text-brand-primary" />}
          </button>

          {token ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-brand-primary/30 hover:border-brand-primary/60 bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary tracking-wide transition-all shadow-glow hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="hidden sm:inline-block text-xs font-bold text-brand-textSecondary hover:text-brand-textPrimary px-3 py-2 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:brightness-110 active:scale-95 transition-all shadow-glow hover:-translate-y-0.5 cursor-pointer"
              >
                Register Free
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-20 md:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Hero Left Content */}
        <div className="lg:col-span-6 space-y-6 md:space-y-8 text-left z-10">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/25 text-[10px] font-bold uppercase tracking-wider text-brand-primary">
            <Sparkles className="w-3.5 h-3.5 text-brand-accent animate-pulse" />
            <span>AI-Powered Secure Assessment Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-brand-textPrimary font-sans">
            Transform Study Notes Into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent">
              Smart Practice Exams
            </span>
          </h1>

          <p className="text-sm sm:text-base text-brand-textSecondary leading-relaxed max-w-xl">
            Stop passively highlighting chapters. Upload lectures, books, or PDFs to instantly compile fully interactive adaptive exams (MCQs, Essays, Case Scenarios) with secure proctor warnings and detailed explanatory feedback.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleGetStarted}
              className="flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent text-white font-bold text-sm shadow-accent-glow hover:brightness-115 active:scale-98 transition-all hover:-translate-y-0.5 group cursor-pointer"
            >
              <span>Get Started For Free</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => handleScrollTo('preview')}
              className="flex items-center justify-center px-6 py-3.5 rounded-xl border border-brand-border/60 hover:border-brand-primary/40 bg-brand-darkBg/50 hover:bg-brand-border/20 text-sm font-bold text-brand-textSecondary hover:text-brand-textPrimary transition-all cursor-pointer"
            >
              Interactive Simulator
            </button>
          </div>

          {/* Quick trust metrics */}
          <div className="pt-6 border-t border-brand-border/20 grid grid-cols-3 gap-4">
            <div>
              <p className="text-xl sm:text-2xl font-black text-brand-textPrimary">Instant</p>
              <p className="text-[10px] text-brand-textSecondary font-bold uppercase tracking-wider mt-0.5">RAG Compilation</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-brand-textPrimary">Proctored</p>
              <p className="text-[10px] text-brand-textSecondary font-bold uppercase tracking-wider mt-0.5">Attempt Sandbox</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-black text-brand-textPrimary">Interactive</p>
              <p className="text-[10px] text-brand-textSecondary font-bold uppercase tracking-wider mt-0.5">AI Grader Insights</p>
            </div>
          </div>
        </div>

        {/* Hero Right Visual */}
        <div className="lg:col-span-6 relative w-full min-h-[440px] flex justify-center items-center py-6">
          {/* Decorative glowing background mesh */}
          <div className="absolute w-[350px] h-[350px] rounded-full bg-brand-primary/10 blur-[80px] pointer-events-none"></div>
          <div className="absolute w-[250px] h-[250px] rounded-full bg-brand-accent/5 blur-[60px] pointer-events-none translate-x-20 -translate-y-20"></div>

          {/* Overlapping Mockup Stack */}
          <div className="relative w-full max-w-[440px] aspect-[4/3] flex flex-col justify-center items-center">
            
            {/* Card 1: Vector Parser Widget (Top Left) */}
            <div className="absolute -top-4 -left-2 z-20 w-64 glass-panel border border-brand-border/60 rounded-2xl p-4 shadow-xl hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center space-x-3 mb-2.5">
                <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/25">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-brand-textPrimary truncate">Lecture_04_OOP.pdf</p>
                  <p className="text-[9px] text-brand-textSecondary">Parsed into AI Context</p>
                </div>
                <CheckCircle className="w-4 h-4 text-brand-success shrink-0" />
              </div>
              <div className="w-full bg-brand-darkBg/60 rounded-full h-1.5 overflow-hidden border border-brand-border/30">
                <div className="bg-brand-primary h-full rounded-full w-full"></div>
              </div>
            </div>

            {/* Card 2: Generated Question Preview (Center) */}
            <div className="relative z-10 w-full max-w-[380px] glass-panel border border-brand-border/70 rounded-2xl p-6 shadow-2xl hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center justify-between border-b border-brand-border/15 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-3.5 h-3.5 text-brand-primary" />
                  <span className="text-[10px] text-brand-textSecondary uppercase font-bold tracking-wider">AI Question Compiler</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-brand-primary/10 border border-brand-primary/25 text-brand-primary text-[9px] font-bold">MCQ</span>
              </div>
              
              <div className="space-y-4">
                <p className="text-[12px] font-bold text-brand-textPrimary leading-relaxed">
                  Which mechanism allows a subclass to provide a specific implementation of a method defined in its superclass?
                </p>
                
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl border border-brand-primary bg-brand-primary/10 text-brand-primary text-[10px] font-semibold flex items-center justify-between">
                    <span>A) Method Overriding</span>
                    <CheckCircle className="w-3.5 h-3.5 text-brand-primary" />
                  </div>
                  <div className="p-2.5 rounded-xl border border-brand-border bg-brand-darkBg/30 text-brand-textSecondary text-[10px] flex items-center">
                    <span>B) Method Overloading</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Proctor warning box (Bottom Right) */}
            <div className="absolute -bottom-4 -right-2 z-20 w-60 glass-panel border border-brand-border/60 rounded-2xl p-4 shadow-xl hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-brand-warning/10 text-brand-warning border border-brand-warning/20 shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-brand-warning uppercase tracking-wide leading-none">Security Sandbox Alert</p>
                  <p className="text-[10px] text-brand-textPrimary font-bold mt-1.5">Tab Switch Detected</p>
                  <p className="text-[9px] text-brand-textSecondary mt-0.5 leading-relaxed">Attempt flagged under proctor sandbox protocol.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-brand-border/20">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">Built for High Performance</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-textPrimary leading-tight">
            Engineered to Hack Your Study Curriculum
          </h2>
          <p className="text-sm text-brand-textSecondary leading-relaxed">
            Generate custom exams instantly using specialized tools modeled around pedagogical best practices.
          </p>
        </div>

        {/* Grid of features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-8 border border-brand-border/40 text-left relative overflow-hidden flex flex-col justify-between h-[280px]">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-brand-primary"></div>
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-brand-textPrimary">Adaptive RAG Generator</h3>
              <p className="text-xs sm:text-sm text-brand-textSecondary leading-relaxed">
                Connects PDF texts directly with AI. Specify difficulties and compile Multiple Choice Questions, short prompts, scenario analysis, and essays.
              </p>
            </div>
            <div className="flex items-center text-xs text-brand-primary font-bold tracking-wide uppercase group cursor-pointer" onClick={handleGetStarted}>
              <span>Generate exams now</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-8 border border-brand-border/40 text-left relative overflow-hidden flex flex-col justify-between h-[280px]">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-brand-secondary"></div>
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-brand-secondary/10 border border-brand-secondary/20 flex items-center justify-center text-brand-secondary">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-brand-textPrimary">Proctored Sandbox Player</h3>
              <p className="text-xs sm:text-sm text-brand-textSecondary leading-relaxed">
                Attempt assessments under simulated test environments. Includes fullscreen verification, focus trackers, and instant timers to build test endurance.
              </p>
            </div>
            <div className="flex items-center text-xs text-brand-secondary font-bold tracking-wide uppercase group cursor-pointer" onClick={handleGetStarted}>
              <span>Launch sandbox player</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-8 border border-brand-border/40 text-left relative overflow-hidden flex flex-col justify-between h-[280px]">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-brand-accent"></div>
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-brand-accent/10 border border-brand-accent/20 flex items-center justify-center text-brand-accent">
                <LineChart className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-brand-textPrimary">Diagnostics & Analytics</h3>
              <p className="text-xs sm:text-sm text-brand-textSecondary leading-relaxed">
                Gain deep insights. Review detailed grading evaluations, incorrect answer explanations, average score metrics, and topic suggestions.
              </p>
            </div>
            <div className="flex items-center text-xs text-brand-accent font-bold tracking-wide uppercase group cursor-pointer" onClick={handleGetStarted}>
              <span>Inspect insights</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="relative max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-brand-border/20">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-20">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">Pedagogical Framework</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-textPrimary leading-tight">
            How ExamGen AI Powers Your Studies
          </h2>
          <p className="text-sm text-brand-textSecondary leading-relaxed">
            Move from unstructured document folders to targeted knowledge retention in 3 simple steps.
          </p>
        </div>

        {/* Steps Flowchart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
          {/* Connector Line */}
          <div className="hidden lg:block absolute top-16 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent/40 z-0"></div>

          {/* Step 1 */}
          <div className="flex flex-col items-center text-center space-y-4 relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-brand-cardBg border border-brand-border flex items-center justify-center text-brand-primary font-bold text-xl shadow-glow relative group hover:border-brand-primary transition-all">
              <UploadCloud className="w-6 h-6" />
              <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-bold flex items-center justify-center">1</div>
            </div>
            <h3 className="text-lg font-bold text-brand-textPrimary">Upload PDFs</h3>
            <p className="text-xs sm:text-sm text-brand-textSecondary max-w-xs">
              Upload textbook chapters, revision slides, or class manuals. The RAG pipeline parses the content.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center space-y-4 relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-brand-cardBg border border-brand-border flex items-center justify-center text-brand-secondary font-bold text-xl shadow-glow relative group hover:border-brand-secondary transition-all">
              <Sparkles className="w-6 h-6" />
              <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-brand-secondary text-white text-xs font-bold flex items-center justify-center">2</div>
            </div>
            <h3 className="text-lg font-bold text-brand-textPrimary">Compile AI Questions</h3>
            <p className="text-xs sm:text-sm text-brand-textSecondary max-w-xs">
              Customize question types (MCQs, scenarios, essays) and difficulties to generate a balanced mock exam.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center space-y-4 relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-brand-cardBg border border-brand-border flex items-center justify-center text-brand-accent font-bold text-xl shadow-glow relative group hover:border-brand-accent transition-all">
              <CheckCircle className="w-6 h-6" />
              <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-brand-accent text-white text-xs font-bold flex items-center justify-center">3</div>
            </div>
            <h3 className="text-lg font-bold text-brand-textPrimary">Solve & Analyze</h3>
            <p className="text-xs sm:text-sm text-brand-textSecondary max-w-xs">
              Attempt questions in a proctored UI, receive immediate AI grader evaluations and score breakdowns.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Mock Preview / Sandbox Section */}
      <section id="preview" className="relative max-w-7xl mx-auto px-6 md:px-12 py-20 border-t border-brand-border/20 text-center">
        <div className="space-y-3 max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">Interactive Sandbox</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-textPrimary leading-tight">
            Run the AI Exam Simulator
          </h2>
          <p className="text-sm text-brand-textSecondary leading-relaxed">
            Test drive the dynamic PDF parsing, exam generation, and grading pipeline directly below.
          </p>
        </div>

        {/* Simulator Dashboard Container */}
        <div className="max-w-4xl mx-auto glass-panel rounded-3xl border border-brand-border/60 shadow-2xl relative overflow-hidden text-left animate-fadeIn">
          {/* Toolbar mimic */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-brand-darkBg/80 border-b border-brand-border/50">
            <div className="flex space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56]"></span>
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]"></span>
              <span className="w-3 h-3 rounded-full bg-[#27c93f]"></span>
            </div>
            <div className="px-4 py-1 rounded-lg bg-brand-cardBg border border-brand-border/50 text-[10px] text-brand-textSecondary font-mono uppercase tracking-wider">
              {simState === 'idle' ? 'ready_to_upload' : simState === 'uploading' ? 'parsing_pdf' : simState === 'config' ? 'configure_assessment' : simState === 'taking' ? 'secure_exam_player' : 'ai_grader_report'}.xml
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse"></span>
              <span className="text-[10px] text-brand-accent uppercase font-bold tracking-wider">Live Sandbox</span>
            </div>
          </div>

          <div className="p-6 md:p-10 min-h-[340px] flex flex-col justify-center transition-all duration-500">
            
            {/* STATE 1: Idle (Upload Drop Area) */}
            {simState === 'idle' && (
              <div 
                onClick={runUploadSimulation}
                className="group border-2 border-dashed border-brand-border hover:border-brand-primary/50 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 bg-brand-darkBg/30 hover:bg-brand-darkBg/60"
              >
                <div className="p-4 rounded-full bg-brand-cardBg border border-brand-border/40 text-brand-textSecondary mb-4 group-hover:text-brand-primary group-hover:shadow-glow transition-all">
                  <UploadCloud className="w-10 h-10 text-brand-primary" />
                </div>
                <h3 className="text-base font-bold text-brand-textPrimary">Simulate Uploading PDF</h3>
                <p className="text-xs text-brand-textSecondary max-w-sm mt-1 leading-relaxed">
                  Click here to simulate uploading a <strong>Computer_Networks_Slide.pdf</strong> file to vectors.
                </p>
                <span className="mt-5 px-5 py-2.5 rounded-xl bg-brand-primary hover:brightness-110 font-bold text-xs text-white shadow-glow transition-all uppercase tracking-wider">
                  Select Lecture PDF
                </span>
              </div>
            )}

            {/* STATE 2: Uploading (Progress bar) */}
            {simState === 'uploading' && (
              <div className="space-y-6 max-w-md mx-auto w-full text-center">
                <div className="p-3.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 inline-block text-brand-primary animate-bounce">
                  <Database className="w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-brand-textPrimary">Indexing PDF Data Source</h3>
                  <p className="text-xs text-brand-accent font-mono animate-pulse uppercase tracking-wider">{simUploadingText}</p>
                </div>

                <div className="space-y-2">
                  <div className="w-full bg-brand-border/40 rounded-full h-3 overflow-hidden border border-brand-border/30">
                    <div 
                      className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent h-full rounded-full transition-all duration-200"
                      style={{ width: `${simProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-brand-textSecondary font-bold">
                    <span>COMPUTER_NETWORKS_SLIDE.PDF</span>
                    <span>{simProgress}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* STATE 3: Config */}
            {simState === 'config' && (
              <div className="space-y-6 animate-scaleUp">
                <div className="flex items-start justify-between border-b border-brand-border/10 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-brand-textPrimary">AI Assessment Setup</h3>
                    <p className="text-xs text-brand-textSecondary mt-0.5">Specify parameters to formulate custom exam questions.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-brand-success/15 border border-brand-success/20 text-brand-success text-[10px] font-bold uppercase tracking-wider">Parsed</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-brand-textSecondary uppercase tracking-wider">Subject Domain</label>
                    <input 
                      type="text" 
                      value="Computer Networks & Protocols" 
                      disabled
                      className="w-full bg-brand-darkBg border border-brand-border/60 rounded-xl px-4 py-3 text-xs text-brand-textSecondary cursor-not-allowed font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-brand-textSecondary uppercase tracking-wider">Difficulty Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Easy', 'Medium', 'Hard'].map((diff) => (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => setSimDifficulty(diff)}
                          className={`py-2 px-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all ${
                            simDifficulty === diff
                              ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-glow'
                              : 'bg-brand-darkBg/50 border-brand-border/40 text-brand-textSecondary hover:border-brand-primary/40'
                          }`}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-border/10 flex justify-end space-x-3">
                  <button 
                    onClick={resetSimulation}
                    className="py-2.5 px-4 rounded-xl border border-brand-border/60 text-xs font-bold text-brand-textSecondary hover:text-brand-textPrimary hover:bg-brand-border/20"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCompileSimulation}
                    className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-bold hover:brightness-110 active:scale-95 shadow-glow"
                  >
                    Compile AI Exam ⚡
                  </button>
                </div>
              </div>
            )}

            {/* STATE 4: Taking */}
            {simState === 'taking' && (
              <div className="space-y-6 animate-scaleUp">
                <div className="flex items-center justify-between border-b border-brand-border/10 pb-4">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-brand-textPrimary">Sandbox Question Player</h3>
                    <p className="text-[10px] text-brand-textSecondary">Active Assessment: Computer Networks | Difficulty: {simDifficulty}</p>
                  </div>
                  <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                    <span>Proctoring Sandbox Active</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-brand-border/25 bg-brand-darkBg/40 flex justify-between items-center text-xs">
                    <span className="font-semibold text-brand-textPrimary">Q1. Which protocol provides reliable, ordered, and error-checked delivery of packets between applications?</span>
                    <span className="px-2 py-0.5 rounded bg-brand-primary/10 border border-brand-primary/25 text-brand-primary text-[9px] font-bold font-mono">MCQ (3 Marks)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { letter: 'A', text: 'UDP (User Datagram Protocol)' },
                      { letter: 'B', text: 'TCP (Transmission Control Protocol)', correct: true },
                      { letter: 'C', text: 'IP (Internet Protocol)' },
                      { letter: 'D', text: 'DNS (Domain Name System)' }
                    ].map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => setSimSelectedOption(i)}
                        className={`p-3.5 rounded-xl border text-xs text-left transition-all flex items-center space-x-3 w-full ${
                          simSelectedOption === i
                            ? 'bg-brand-primary/10 border-brand-primary text-brand-primary shadow-glow'
                            : 'bg-brand-cardBg border-brand-border/60 text-brand-textSecondary hover:border-brand-primary/30 hover:text-brand-textPrimary hover:bg-brand-border/20'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] font-mono shrink-0 ${
                          simSelectedOption === i ? 'bg-brand-primary text-white' : 'bg-brand-darkBg border border-brand-border/30 text-brand-textSecondary'
                        }`}>
                          {opt.letter}
                        </div>
                        <span className="font-medium">{opt.text}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-border/10 flex justify-end space-x-3">
                  <button 
                    onClick={resetSimulation}
                    className="py-2.5 px-4 rounded-xl border border-brand-border/60 text-xs font-bold text-brand-textSecondary hover:text-brand-textPrimary hover:bg-brand-border/20"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={handleSubmitSimulation}
                    disabled={simSelectedOption === null}
                    className={`py-2.5 px-5 rounded-xl font-bold text-xs text-white transition-all ${
                      simSelectedOption !== null
                        ? 'bg-brand-success hover:brightness-110 active:scale-95 shadow-glow cursor-pointer'
                        : 'bg-brand-darkBg/60 text-brand-textSecondary/40 cursor-not-allowed border border-brand-border/40'
                    }`}
                  >
                    Submit & Grade Exam
                  </button>
                </div>
              </div>
            )}

            {/* STATE 5: Result */}
            {simState === 'result' && (
              <div className="space-y-6 animate-scaleUp">
                <div className="flex items-center justify-between border-b border-brand-border/10 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-brand-textPrimary">Grading & Evaluation Report</h3>
                    <p className="text-xs text-brand-textSecondary mt-0.5">Automated AI Feedback Evaluation</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-brand-success/15 border border-brand-success/20 text-brand-success text-[10px] font-bold uppercase tracking-wider">Completed</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-stretch">
                  <div className="sm:col-span-4 p-5 rounded-2xl border border-brand-border/30 bg-brand-darkBg/40 flex flex-col items-center justify-center text-center space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-textSecondary">Test Score</span>
                    <span className={`text-3xl font-black font-mono ${simSelectedOption === 1 ? 'text-brand-success' : 'text-brand-error'}`}>
                      {simSelectedOption === 1 ? '100%' : '0%'}
                    </span>
                    <span className="text-[10px] text-brand-textSecondary font-bold">{simSelectedOption === 1 ? '3/3 Marks' : '0/3 Marks'}</span>
                  </div>

                  <div className="sm:col-span-8 p-5 rounded-2xl border border-brand-primary/25 bg-brand-primary/5 flex flex-col justify-center space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      AI Grader Insights
                    </span>
                    <p className="text-xs text-brand-textPrimary leading-relaxed">
                      {simSelectedOption === 1 
                        ? "Correct! You successfully identified TCP as the reliable connection-oriented transport protocol. It provides stream control and packet acknowledgment. Strong network fundamentals."
                        : "Incorrect. Packet delivery guarantees are handled by TCP (Transmission Control Protocol). You selected an incorrect protocol. DNS handles name translation, UDP is connectionless, and IP handles addressing. Focus area: Transport Layer."
                      }
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-border/10 flex justify-end space-x-3">
                  <button 
                    onClick={resetSimulation}
                    className="py-2.5 px-4 rounded-xl border border-brand-border/60 text-xs font-bold text-brand-textSecondary hover:text-brand-textPrimary hover:bg-brand-border/20"
                  >
                    Reset Simulator
                  </button>
                  <button 
                    onClick={handleGetStarted}
                    className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent text-white text-xs font-bold hover:brightness-110 active:scale-95 shadow-glow cursor-pointer flex items-center space-x-1.5"
                  >
                    <span>Launch Full Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="max-w-5xl mx-auto px-6 py-12 md:py-16 text-center">
        <div className="glass-panel rounded-3xl border border-brand-border/60 p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          {/* Accent light lines */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-brand-primary/10 blur-[50px]"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-brand-accent/15 blur-[50px]"></div>

          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-textPrimary leading-tight font-sans">
              Ready to Upgrade Your Study Game?
            </h2>
            <p className="text-sm text-brand-textSecondary leading-relaxed">
              Join students and teachers using AI to design, run, and diagnostic practice exams. Turn information overload into structured success.
            </p>
            <div className="pt-4">
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent text-white font-bold text-sm shadow-accent-glow hover:brightness-115 active:scale-98 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Get Started For Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 md:px-12 py-12 border-t border-brand-border/20 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center text-xs text-brand-textSecondary gap-6">
        <div className="flex items-center space-x-2 select-none">
          <div className="h-6 w-6 rounded bg-gradient-to-tr from-brand-primary to-brand-secondary flex items-center justify-center text-[10px] font-bold text-white">
            Æ
          </div>
          <span className="font-semibold text-brand-textPrimary">ExamGen AI Pro</span>
        </div>
        <p>© {new Date().getFullYear()} ExamGen AI. All rights reserved.</p>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-brand-textPrimary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-brand-textPrimary transition-colors">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
