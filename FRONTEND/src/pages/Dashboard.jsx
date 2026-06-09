import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  FileText, 
  ClipboardCheck, 
  Award, 
  AlertTriangle, 
  UploadCloud, 
  BookOpen, 
  BarChart3, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import analyticsService from '../services/analyticsService';
import documentService from '../services/documentService';
import testService from '../services/testService';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [recentTests, setRecentTests] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Load analytics metrics
        const analyticsData = await analyticsService.getAnalytics();
        setStats(analyticsData.stats);

        // Load recent documents
        const docsData = await documentService.getDocuments();
        setRecentDocs((docsData.documents || []).slice(0, 3));

        // Load recent tests
        const testsData = await testService.getTests();
        setRecentTests((testsData.tests || []).slice(0, 3));
      } catch (err) {
        console.error("Dashboard data load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Fallback defaults if no statistics loaded
  const docCount = recentDocs.length;
  const attemptsCount = stats?.testsAttempted || 0;
  const avgScore = stats?.averageScore ? `${stats.averageScore}%` : 'N/A';
  const weakTopic = stats?.weakTopics?.[0] || 'None';

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Premium Hero Panel */}
      <div className="relative overflow-hidden rounded-3xl border border-brand-border/40 bg-gradient-to-br from-brand-cardBg via-brand-darkBg to-brand-darkBg p-6 md:p-8 shadow-2xl">
        {/* Background Decorative Glows */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-brand-primary/10 blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-48 h-48 rounded-full bg-brand-secondary/5 blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/4 bottom-1/4 w-32 h-32 rounded-full bg-brand-accent/5 blur-2xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center space-x-2 text-[10px] font-bold tracking-wider px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary uppercase">
              <Sparkles className="w-3 h-3 text-brand-secondary animate-pulse" />
              <span>AI Learning Workspace</span>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-brand-textPrimary tracking-tight font-sans">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent">{user?.name || 'Student'}</span>!
              </h1>
              <p className="text-xs md:text-sm text-brand-textSecondary leading-relaxed">
                Unlock the full power of generative AI. Upload your notes or textbooks, instantly generate comprehensive custom exams, and study with precise automated grading feedback.
              </p>
            </div>
          </div>

          {/* Quick Performance Summary Arc */}
          <div className="w-44 h-44 shrink-0 flex items-center justify-center relative">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="72"
                className="stroke-brand-border/60 fill-none"
                strokeWidth="10"
              />
              <circle
                cx="88"
                cy="88"
                r="72"
                className="stroke-brand-primary fill-none transition-all duration-1000"
                strokeWidth="10"
                strokeDasharray="452.4"
                strokeDashoffset={stats?.averageScore ? 452.4 - (452.4 * parseFloat(stats.averageScore)) / 100 : 452.4}
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 6px rgba(99, 102, 241, 0.5))' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center space-y-0.5">
              <span className="text-2xl font-extrabold text-brand-textPrimary font-mono">
                {stats?.averageScore ? `${stats.averageScore}%` : '0%'}
              </span>
              <span className="text-[9px] font-bold text-brand-textSecondary uppercase tracking-wider">
                Avg Score
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Portal Launcher Grid (The "Middle" Options) */}
      <div className="space-y-4">
        <span className="text-[10px] font-bold tracking-wider text-brand-textSecondary uppercase block">
          Learning Portal Modules
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Module 1: Upload Documents */}
          <div 
            onClick={() => navigate('/upload-pdf')}
            className="group relative overflow-hidden rounded-2xl border border-brand-border/40 bg-brand-cardBg/60 hover:bg-brand-darkBg/80 hover:border-brand-primary/40 p-5 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between h-44 shadow-sm"
          >
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 bg-brand-primary opacity-5 rounded-full blur-xl transition-all duration-500 group-hover:scale-155"></div>
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-glow">
                <UploadCloud className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-brand-textSecondary group-hover:text-brand-textPrimary transform group-hover:translate-x-1 transition-all" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-brand-textPrimary group-hover:text-brand-primary transition-colors">Upload Study Notes</h4>
              <p className="text-xs text-brand-textSecondary leading-snug">Add notes or textbook PDFs to feed context into the generator.</p>
            </div>
          </div>

          {/* Module 2: AI Generator */}
          <div 
            onClick={() => navigate('/generate-test')}
            className="group relative overflow-hidden rounded-2xl border border-brand-border/40 bg-brand-cardBg/60 hover:bg-brand-darkBg/80 hover:border-brand-secondary/40 p-5 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between h-44 shadow-sm"
          >
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 bg-brand-secondary opacity-5 rounded-full blur-xl transition-all duration-500 group-hover:scale-155"></div>
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20 shadow-glow">
                <BookOpen className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-brand-textSecondary group-hover:text-brand-textPrimary transform group-hover:translate-x-1 transition-all" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-brand-textPrimary group-hover:text-brand-secondary transition-colors">Generate AI Test</h4>
              <p className="text-xs text-brand-textSecondary leading-snug">Build custom practice exams matching your curriculum.</p>
            </div>
          </div>

          {/* Module 3: Exam Center */}
          <div 
            onClick={() => navigate('/take-test/select')}
            className="group relative overflow-hidden rounded-2xl border border-brand-border/40 bg-brand-cardBg/60 hover:bg-brand-darkBg/80 hover:border-brand-success/40 p-5 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between h-44 shadow-sm"
          >
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 bg-brand-success opacity-5 rounded-full blur-xl transition-all duration-500 group-hover:scale-155"></div>
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-brand-success/10 text-brand-success border border-brand-success/20 shadow-glow">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-brand-textSecondary group-hover:text-brand-textPrimary transform group-hover:translate-x-1 transition-all" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-brand-textPrimary group-hover:text-brand-success transition-colors">Exam Attempt Center</h4>
              <p className="text-xs text-brand-textSecondary leading-snug">Take active tests under distraction-free, fullscreen conditions.</p>
            </div>
          </div>

          {/* Module 4: Performance Analytics */}
          <div 
            onClick={() => navigate('/analytics')}
            className="group relative overflow-hidden rounded-2xl border border-brand-border/40 bg-brand-cardBg/60 hover:bg-brand-darkBg/80 hover:border-brand-accent/40 p-5 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between h-44 shadow-sm"
          >
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 bg-brand-accent opacity-5 rounded-full blur-xl transition-all duration-500 group-hover:scale-155"></div>
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-brand-accent/10 text-brand-accent border border-brand-accent/20 shadow-glow">
                <BarChart3 className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-brand-textSecondary group-hover:text-brand-textPrimary transform group-hover:translate-x-1 transition-all" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-brand-textPrimary group-hover:text-brand-accent transition-colors">Analytics & Insights</h4>
              <p className="text-xs text-brand-textSecondary leading-snug">Examine detailed progress graphs, timelines, and weak concepts.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Uploaded Materials" 
          value={docCount} 
          icon={FileText} 
          description="PDF study resources" 
        />
        <StatsCard 
          title="Tests Attempted" 
          value={attemptsCount} 
          icon={ClipboardCheck} 
          trend={attemptsCount > 0 ? "+1" : null}
          description="Total attempts compiled" 
        />
        <StatsCard 
          title="Average Score" 
          value={avgScore} 
          icon={Award} 
          trend={attemptsCount > 1 ? "+4.2%" : null}
          description="Calculated overall efficiency" 
        />
        <StatsCard 
          title="Weak Area" 
          value={weakTopic.length > 18 ? `${weakTopic.substr(0,18)}...` : weakTopic} 
          icon={AlertTriangle} 
          trendType="down"
          description="Needs focus & review" 
          trend={weakTopic !== 'None' ? 'Review' : null}
        />
      </div>

      {/* Split lists: Recent Tests & Recent Uploads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tests list */}
        <div className="glass-panel rounded-2xl p-6 border border-brand-border/40 flex flex-col h-[320px]">
          <div className="flex justify-between items-center mb-4 border-b border-brand-border/10 pb-3">
            <h3 className="text-sm font-bold tracking-wider text-brand-textSecondary uppercase">Recent Tests</h3>
            <span 
              onClick={() => navigate('/results/history')} 
              className="text-xs text-brand-accent cursor-pointer hover:underline flex items-center"
            >
              See History
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {recentTests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-brand-textSecondary text-xs">
                <ClipboardCheck className="w-8 h-8 mb-2 opacity-30 text-brand-textSecondary" />
                <p>No tests generated yet.</p>
              </div>
            ) : (
              recentTests.map((t) => (
                <div 
                  key={t._id}
                  className="p-3.5 rounded-xl border border-brand-border/25 bg-brand-darkBg/40 hover:bg-brand-darkBg/80 hover:border-brand-primary/20 flex justify-between items-center text-xs group transition-all duration-300"
                >
                  <div className="flex items-center space-x-3 min-w-0 max-w-[70%]">
                    <div className="p-2 rounded-lg bg-brand-darkBg border border-brand-border/30 text-brand-textSecondary shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-bold text-brand-textPrimary truncate group-hover:text-brand-primary transition-colors" title={t.subject}>{t.subject}</p>
                      <p className="text-[10px] text-brand-textSecondary truncate">Doc: {t.documentName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2.5 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-brand-accent/10 text-brand-accent border border-brand-accent/20 text-[9px] font-bold uppercase tracking-wider">
                      {t.difficulty}
                    </span>
                    <button 
                      onClick={() => navigate(`/take-test/${t._id}`)}
                      className="py-1.5 px-3 rounded-lg bg-brand-primary hover:shadow-glow text-white text-[10px] font-bold hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                      Attempt
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Uploaded Materials */}
        <div className="glass-panel rounded-2xl p-6 border border-brand-border/40 flex flex-col h-[320px]">
          <div className="flex justify-between items-center mb-4 border-b border-brand-border/10 pb-3">
            <h3 className="text-sm font-bold tracking-wider text-brand-textSecondary uppercase">Recent Uploads</h3>
            <span 
              onClick={() => navigate('/upload-pdf')} 
              className="text-xs text-brand-accent cursor-pointer hover:underline"
            >
              Manage PDFs
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {recentDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-brand-textSecondary text-xs">
                <FileText className="w-8 h-8 mb-2 opacity-30 text-brand-textSecondary" />
                <p>No study documents uploaded.</p>
              </div>
            ) : (
              recentDocs.map((doc) => (
                <div 
                  key={doc._id}
                  className="p-3.5 rounded-xl border border-brand-border/25 bg-brand-darkBg/40 hover:bg-brand-darkBg/80 flex justify-between items-center text-xs group transition-all duration-300"
                >
                  <div className="flex items-center space-x-3 min-w-0 max-w-[75%]">
                    <div className="p-2 rounded-lg bg-brand-darkBg border border-brand-border/30 text-brand-primary shrink-0">
                      <FileText className="w-4 h-4 text-brand-accent" />
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-bold text-brand-textPrimary truncate" title={doc.originalName}>{doc.originalName}</p>
                      <p className="text-[10px] text-brand-textSecondary">
                        Subject: <span className="text-brand-accent/80 font-semibold">{doc.subject}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-brand-textSecondary text-[9px] font-mono mb-1">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                    <span className="px-2 py-0.5 rounded bg-brand-success/10 text-brand-success border border-brand-success/20 text-[9px] font-bold uppercase tracking-wider">
                      Parsed
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
