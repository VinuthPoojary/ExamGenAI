import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import testService from '../services/testService';
import resultService from '../services/resultService';
import LoadingSpinner from '../components/LoadingSpinner';
import Timer from '../components/Timer';
import WarningPopup from '../components/WarningPopup';
import MCQCard from '../components/MCQCard';
import ShortAnswerCard from '../components/ShortAnswerCard';
import LongAnswerCard from '../components/LongAnswerCard';
import ScenarioCard from '../components/ScenarioCard';
import { ChevronLeft, ChevronRight, Send, AlertTriangle, ShieldAlert, Award, FileText } from 'lucide-react';

const TakeTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Test Selection State (if accessed via /take-test/select)
  const [availableTests, setAvailableTests] = useState([]);
  const [selectionLoading, setSelectionLoading] = useState(true);

  // Active Exam States
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0); // 0-indexed across all questions

  // Modals / Warnings
  const [submitWarningOpen, setSubmitWarningOpen] = useState(false);
  const [exitWarningOpen, setExitWarningOpen] = useState(false);
  const [tabViolationOpen, setTabViolationOpen] = useState(false);
  const [fullscreenViolationOpen, setFullscreenViolationOpen] = useState(false);
  const [violationsCount, setViolationsCount] = useState(0);
  const [examStarted, setExamStarted] = useState(false);

  // Flat question list for easy navigation
  const [flatQuestions, setFlatQuestions] = useState([]);

  // 1. Fetch available tests on select route
  useEffect(() => {
    if (id === 'select') {
      const loadTests = async () => {
        try {
          const data = await testService.getTests();
          setAvailableTests(data.tests || []);
        } catch (e) {
          console.error(e);
        } finally {
          setSelectionLoading(false);
        }
      };
      loadTests();
    }
  }, [id]);

  // 2. Fetch specific test structure
  useEffect(() => {
    if (id && id !== 'select') {
      const fetchTest = async () => {
        try {
          setLoading(true);
          const data = await testService.getTest(id);
          setTest(data.test);

          // Flatten questions list to support linear index switching (MCQs -> Short -> Long -> Scenarios)
          const qList = [];
          const t = data.test;
          if (t.questions.mcq) t.questions.mcq.forEach(q => qList.push({ ...q, typeLabel: 'mcq' }));
          if (t.questions.short) t.questions.short.forEach(q => qList.push({ ...q, typeLabel: 'short' }));
          if (t.questions.long) t.questions.long.forEach(q => qList.push({ ...q, typeLabel: 'long' }));
          if (t.questions.scenario) {
            t.questions.scenario.forEach(sc => {
              // Add the scenario block itself. Sub questions are answered inside it.
              qList.push({ ...sc, typeLabel: 'scenario' });
            });
          }
          setFlatQuestions(qList);

          // Restore saved answers from localStorage if present
          const cached = localStorage.getItem(`active_exam_answers_${id}`);
          if (cached) {
            setAnswers(JSON.parse(cached));
          }
        } catch (err) {
          console.error(err);
          navigate('/dashboard');
        } finally {
          setLoading(false);
        }
      };
      fetchTest();
    }
  }, [id, navigate]);

  // 3. Tab switching/Focus-loss detection (Proctoring Simulation)
  useEffect(() => {
    if (!test || id === 'select' || !examStarted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolationsCount(prev => {
          const updated = prev + 1;
          setTabViolationOpen(true);
          return updated;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [test, id, examStarted]);

  // 3b. Fullscreen exit detection
  useEffect(() => {
    if (!test || id === 'select' || !examStarted) return;

    const handleFullscreenChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      if (!isFs) {
        setViolationsCount(prev => {
          const updated = prev + 1;
          setFullscreenViolationOpen(true);
          return updated;
        });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [test, id, examStarted]);

  // 4. Auto-save answers to localStorage
  const handleAnswerChange = (qId, val) => {
    setAnswers((prev) => {
      const updated = { ...prev, [qId]: val };
      localStorage.setItem(`active_exam_answers_${id}`, JSON.stringify(updated));
      return updated;
    });
  };

  // Submit test to grader
  const handleBeginExam = async () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
    } catch (err) {
      console.error("Failed to enter fullscreen:", err);
    }
    setExamStarted(true);
  };

  const handleReenterFullscreen = async () => {
    try {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
    } catch (err) {
      console.error("Failed to re-enter fullscreen:", err);
    }
    setFullscreenViolationOpen(false);
  };

  const handleSubmitExam = async () => {
    setSubmitWarningOpen(false);
    setLoading(true);

    try {
      if (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      ) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          await document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          await document.msExitFullscreen();
        }
      }
    } catch (err) {
      console.error("Error exiting fullscreen:", err);
    }

    try {
      const data = await resultService.submitTest(test._id, answers);
      if (data.success && data.result) {
        // Clear cached answers
        localStorage.removeItem(`active_exam_answers_${id}`);
        navigate(`/results/${data.result._id}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error grading exam. Try submitting again.');
      setLoading(false);
    }
  };

  const handleTimeUp = () => {
    // Automatically submit when timer hits zero
    handleSubmitExam();
  };

  const handleNext = () => {
    if (activeQuestionIndex < flatQuestions.length - 1) {
      setActiveQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(prev => prev - 1);
    }
  };

  // Render selection dashboard if no specific test ID
  if (id === 'select') {
    if (selectionLoading) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center bg-brand-darkBg">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-fadeIn text-brand-textPrimary">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-brand-textPrimary tracking-tight">Active Assessments</h1>
            <p className="text-xs text-brand-textSecondary mt-1">Select an exam to start your secure proctored attempt.</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="py-2 px-4 rounded-xl border border-brand-border/40 text-xs font-semibold text-brand-textSecondary hover:text-brand-textPrimary hover:bg-brand-darkBg/60 transition-all cursor-pointer shrink-0"
          >
            Return to Dashboard
          </button>
        </div>

        {availableTests.length === 0 ? (
          <div className="glass-panel border border-brand-border/40 rounded-2xl p-12 text-center space-y-4">
            <div className="p-3 rounded-full bg-brand-darkBg border border-brand-border/30 text-brand-textSecondary inline-block">
              <FileText className="w-10 h-10 opacity-30" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-brand-textPrimary">No active tests found</p>
              <p className="text-xs text-brand-textSecondary max-w-sm mx-auto">Generate an AI test from your materials in the generator panel before attempting.</p>
            </div>
            <button
              onClick={() => navigate('/generate-test')}
              className="py-2.5 px-5 bg-gradient-to-r from-brand-primary to-brand-secondary text-xs font-semibold text-white rounded-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              Go to Generator
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {availableTests.map((t) => (
              <div 
                key={t._id}
                className="glass-panel border border-brand-border/35 hover:border-brand-primary/40 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300"
              >
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-brand-textPrimary leading-snug">{t.subject}</h3>
                  <p className="text-xs text-brand-textSecondary">Source: {t.documentName} | {t.duration} Mins</p>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary border border-brand-primary/20 text-xs font-semibold">
                    {t.difficulty}
                  </span>
                  <button
                    onClick={() => navigate(`/take-test/${t._id}`)}
                    className="py-2 px-4 rounded-xl bg-brand-primary text-white text-xs font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    Start Attempt
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Loading indicator for active exam loading
  if (loading || !test) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-brand-darkBg">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Instructions screen before beginning exam (forces fullscreen user gesture)
  if (!examStarted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 text-brand-textPrimary font-sans">
        <div className="max-w-2xl w-full glass-panel border border-brand-border/40 rounded-2xl p-8 space-y-6 relative overflow-hidden animate-scaleUp">
          {/* Top border glow accent */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-primary to-brand-secondary"></div>
          
          <div className="text-center space-y-2">
            <div className="p-3 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 inline-block shadow-glow mb-2">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-extrabold text-brand-textPrimary tracking-tight">Proctored Assessment Setup</h1>
            <p className="text-xs text-brand-textSecondary">
              Please review the exam environment rules below before beginning the test.
            </p>
          </div>

          <div className="border-y border-brand-border/20 py-4 grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <span className="text-[10px] text-brand-textSecondary font-bold uppercase tracking-wider block">Subject</span>
              <span className="text-xs font-semibold text-brand-textPrimary truncate block max-w-full" title={test.subject}>{test.subject}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-brand-textSecondary font-bold uppercase tracking-wider block">Duration</span>
              <span className="text-xs font-semibold text-brand-textPrimary">{test.duration} Minutes</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-brand-textSecondary font-bold uppercase tracking-wider block">Questions</span>
              <span className="text-xs font-semibold text-brand-textPrimary">{flatQuestions.length} Questions</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-brand-textPrimary">Assessment Rules:</h3>
            <ul className="space-y-2 text-xs text-brand-textSecondary">
              <li className="flex items-start space-x-2">
                <span className="text-brand-primary font-bold mr-1">•</span>
                <span>
                  <strong>Fullscreen Mode Required:</strong> This test will run in fullscreen mode. Exiting fullscreen will trigger an infraction violation.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-brand-primary font-bold mr-1">•</span>
                <span>
                  <strong>No Window Switching:</strong> Navigating away from this window or switching tabs will trigger tab-switching violation alerts.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-brand-primary font-bold mr-1">•</span>
                <span>
                  <strong>Maximum Infractions:</strong> Exceeding 3 proctoring violations of any kind will flag your final assessment score.
                </span>
              </li>
            </ul>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/take-test/select')}
              className="flex-1 py-3 px-4 rounded-xl border border-brand-border/40 text-xs font-bold text-brand-textSecondary hover:text-brand-textPrimary hover:bg-brand-darkBg/60 transition-all active:scale-95 cursor-pointer"
            >
              Cancel & Return
            </button>
            <button
              onClick={handleBeginExam}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-bold hover:shadow-glow hover:brightness-110 transition-all active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Begin Exam & Enter Fullscreen</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeQuestion = flatQuestions[activeQuestionIndex];

  // Helper check if a question or scenario subquestions are answered
  const isQuestionAnswered = (index) => {
    const q = flatQuestions[index];
    if (!q) return false;
    if (q.typeLabel === 'scenario') {
      return q.subQuestions.every(sub => answers[sub.id] !== undefined && answers[sub.id] !== '');
    }
    return answers[q.id] !== undefined && answers[q.id] !== '';
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col lg:flex-row text-brand-textPrimary font-sans">
      {/* Dynamic Question Navigator Sidebar */}
      <aside className="w-full lg:w-72 bg-brand-cardBg border-b lg:border-b-0 lg:border-r border-brand-border/30 p-5 flex flex-col shrink-0 select-none">
        
        {/* Exam stats */}
        <div className="space-y-4 border-b border-brand-border/20 pb-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-brand-textPrimary leading-tight truncate" title={test.subject}>{test.subject}</h2>
            <p className="text-[11px] text-brand-textSecondary mt-0.5 truncate">Source: {test.documentName}</p>
          </div>
          
          {/* Active Timer */}
          <Timer duration={test.duration} onTimeUp={handleTimeUp} />
        </div>

        {/* Navigator Grid */}
        <div className="flex-1 overflow-y-auto mb-4">
          <span className="text-[10px] font-bold text-brand-textSecondary uppercase tracking-wider block mb-3">
            Question Map
          </span>
          <div className="grid grid-cols-5 gap-2.5">
            {flatQuestions.map((q, idx) => {
              const isCurrent = idx === activeQuestionIndex;
              const isAnswered = isQuestionAnswered(idx);

              let btnStyle = 'border-brand-border text-brand-textSecondary bg-brand-darkBg/30 hover:border-brand-primary/40 hover:text-brand-textPrimary';
              if (isCurrent) {
                btnStyle = 'border-brand-primary text-brand-textPrimary bg-brand-primary/10 shadow-glow font-bold scale-105';
              } else if (isAnswered) {
                btnStyle = 'border-brand-success/40 text-brand-success bg-brand-success/5 hover:border-brand-success/60';
              }

              return (
                <button
                  key={idx}
                  onClick={() => setActiveQuestionIndex(idx)}
                  className={`h-9 w-9 text-xs font-semibold rounded-lg border flex items-center justify-center transition-all ${btnStyle}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Violations and warnings */}
        <div className="space-y-3 pt-3 border-t border-brand-border/20">
          <div className="flex items-center justify-between text-xs">
            <span className="text-brand-textSecondary">Exit Warnings:</span>
            <span className={`font-bold font-mono px-2 py-0.5 rounded ${violationsCount > 0 ? 'bg-brand-error/10 text-brand-error animate-pulse' : 'bg-brand-darkBg text-brand-textSecondary'}`}>
              {violationsCount} / 3
            </span>
          </div>

          <button
            onClick={() => setSubmitWarningOpen(true)}
            className="w-full py-2.5 px-4 bg-brand-success hover:shadow-glow text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Finish Attempt</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <section className="flex-1 p-6 md:p-8 flex flex-col justify-between max-w-4xl w-full mx-auto space-y-6">
        
        {/* Render Active Question Card */}
        <div className="flex-1">
          {activeQuestion.typeLabel === 'mcq' && (
            <MCQCard
              question={activeQuestion}
              index={activeQuestionIndex + 1}
              selectedAnswer={answers[activeQuestion.id]}
              onChange={(val) => handleAnswerChange(activeQuestion.id, val)}
            />
          )}

          {activeQuestion.typeLabel === 'short' && (
            <ShortAnswerCard
              question={activeQuestion}
              index={activeQuestionIndex + 1}
              answer={answers[activeQuestion.id]}
              onChange={(val) => handleAnswerChange(activeQuestion.id, val)}
            />
          )}

          {activeQuestion.typeLabel === 'long' && (
            <LongAnswerCard
              question={activeQuestion}
              index={activeQuestionIndex + 1}
              answer={answers[activeQuestion.id]}
              onChange={(val) => handleAnswerChange(activeQuestion.id, val)}
            />
          )}

          {activeQuestion.typeLabel === 'scenario' && (
            <ScenarioCard
              scenario={activeQuestion}
              index={activeQuestionIndex + 1}
              answers={answers}
              onAnswerChange={(qId, val) => handleAnswerChange(qId, val)}
            />
          )}
        </div>

        {/* Navigation Controls footer */}
        <div className="flex items-center justify-between border-t border-brand-border/10 pt-5 mt-auto">
          <button
            onClick={handlePrev}
            disabled={activeQuestionIndex === 0}
            className="py-2.5 px-4 rounded-xl border border-brand-border/40 text-xs font-semibold text-brand-textSecondary hover:text-brand-textPrimary hover:bg-brand-darkBg/60 disabled:opacity-40 disabled:pointer-events-none flex items-center space-x-1 transition-all active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-brand-textSecondary font-mono font-bold">
            QUESTION {activeQuestionIndex + 1} OF {flatQuestions.length}
          </span>

          {activeQuestionIndex === flatQuestions.length - 1 ? (
            <button
              onClick={() => setSubmitWarningOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-brand-success text-white text-xs font-bold hover:shadow-glow flex items-center space-x-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <span>Submit Exam</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="py-2.5 px-4 rounded-xl border border-brand-border/40 text-xs font-semibold text-brand-textSecondary hover:text-brand-textPrimary hover:bg-brand-darkBg/60 flex items-center space-x-1 transition-all active:scale-95 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </section>

      {/* ─── Proctor & Warning Modals ─── */}
      
      {/* Tab loss focus Violation warning */}
      <WarningPopup
        isOpen={tabViolationOpen}
        title="Proctoring Alert: Tab Switched"
        message={`Warning: You navigated away from the exam interface. Moving outside of the window is a violation of exam rules. Multiple infractions will flag your score.\n\nInfraction count: ${violationsCount}/3`}
        confirmText="Acknowledge & Return"
        onConfirm={() => setTabViolationOpen(false)}
      />

      {/* Fullscreen exit Violation warning */}
      <WarningPopup
        isOpen={fullscreenViolationOpen}
        title="Proctoring Alert: Fullscreen Exited"
        message={`Warning: Fullscreen mode was exited. Fullscreen mode is required to maintain proctoring security. Exiting fullscreen is an infraction violation.\n\nInfraction count: ${violationsCount}/3`}
        confirmText="Re-enter Fullscreen"
        onConfirm={handleReenterFullscreen}
      />

      {/* Early submit warning */}
      <WarningPopup
        isOpen={submitWarningOpen}
        title="Submit Assessment"
        message="Are you sure you want to finish and submit your attempt? Answers will be saved and automatically evaluated by the AI grading pipeline."
        confirmText="Yes, Submit Exam"
        cancelText="Review Questions"
        onConfirm={handleSubmitExam}
        onCancel={() => setSubmitWarningOpen(false)}
      />
    </div>
  );
};

export default TakeTest;
