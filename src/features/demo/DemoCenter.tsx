import React, { useState, useRef, useEffect } from 'react';
import { useModal } from '../../context/ModalContext';
import { Sparkles, AlertCircle, BookOpen, Award, Bell, ArrowRight, ArrowLeft, ArrowDownToLine, X, RefreshCw } from 'lucide-react';
import { FileUpload } from '../../components/modules/FileUpload';
import { Certificate } from '../../components/ui/Certificate';
import { toPng } from 'html-to-image';
import { useXP } from '../../context/XPContext';

interface DemoCenterProps {
  onNavigate: (page: string) => void;
}

export const DemoCenter: React.FC<DemoCenterProps> = ({ onNavigate }) => {
  const { openModal } = useModal();
  const { addToast } = useXP();
  const [showUpload, setShowUpload] = useState(false);

  // Offline Workspace Sync State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStep, setSyncStep] = useState('');
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, []);

  const handleStartSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncProgress(0);
    setSyncStep('Initializing sync engine...');
    syncIntervalRef.current = setInterval(() => {
      setSyncProgress(prev => {
        const next = Math.min(prev + 1.25, 100);
        if (next >= 100) {
          if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
          setIsSyncing(false);
          addToast('success', '✓ Workspace synced successfully');
          return 100;
        }
        if (next < 25) setSyncStep('Updating local module schemas...');
        else if (next < 55) setSyncStep('Caching lesson assets...');
        else if (next < 85) setSyncStep('Optimizing offline search index...');
        else setSyncStep('Finalizing local manifest...');
        return next;
      });
    }, 50);
  };

  const handleCancelSync = () => {
    if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    setIsSyncing(false);
    setSyncProgress(0);
    setSyncStep('');
    addToast('info', 'Sync cancelled');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => onNavigate('dashboard')}
          className="mt-1 p-2 rounded-xl border border-line bg-bg hover:border-cyan text-muted hover:text-cyan transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-6 h-6 text-cyan" />
            <h1 className="text-2xl font-black text-text">Developer Demo Center</h1>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-cyan/10 text-cyan border border-cyan/20 px-2 py-0.5 rounded-full">Admin</span>
          </div>
          <p className="text-sm text-muted">
            Access developer tools, UI showcases, and interactive sandboxes for testing system components.
          </p>
        </div>
      </div>

      {/* Notification Test Lab Link */}
      <button
        onClick={() => onNavigate('notification-test')}
        className="w-full flex items-center justify-between gap-3 px-6 py-5 bg-panel border border-line hover:border-cyan/40 rounded-2xl transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan/10 rounded-xl">
            <Bell className="w-6 h-6 text-cyan" />
          </div>
          <div className="text-left">
            <span className="text-lg font-bold text-text group-hover:text-cyan transition-colors">Notification Test Lab</span>
            <span className="block text-sm text-muted mt-1">Fire, inspect and customize all notification types in real-time, including toast gestures.</span>
          </div>
        </div>
        <ArrowRight className="w-6 h-6 text-muted group-hover:text-cyan group-hover:translate-x-1 transition-all shrink-0" />
      </button>

      {/* Template View Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate('demo-dashboard-empty')}
          className="w-full flex items-center justify-between gap-3 px-6 py-5 bg-panel border border-line hover:border-cyan/40 rounded-2xl transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow/10 rounded-xl">
              <Sparkles className="w-6 h-6 text-yellow" />
            </div>
            <div className="text-left">
              <span className="text-lg font-bold text-text group-hover:text-cyan transition-colors">Dashboard (New User)</span>
              <span className="block text-sm text-muted mt-1">Empty state template for new users.</span>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-muted group-hover:text-cyan group-hover:translate-x-1 transition-all shrink-0" />
        </button>

        <button
          onClick={() => onNavigate('dashboard:pre-cohort')}
          className="w-full flex items-center justify-between gap-3 px-6 py-5 bg-panel border border-line hover:border-cyan/40 rounded-2xl transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan/10 rounded-xl">
              <Sparkles className="w-6 h-6 text-cyan" />
            </div>
            <div className="text-left">
              <span className="text-lg font-bold text-text group-hover:text-cyan transition-colors">Dashboard (Pre-Cohort)</span>
              <span className="block text-sm text-muted mt-1">Waiting for cohort to start.</span>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-muted group-hover:text-cyan group-hover:translate-x-1 transition-all shrink-0" />
        </button>

        <button
          onClick={() => onNavigate('dashboard:long-break')}
          className="w-full flex items-center justify-between gap-3 px-6 py-5 bg-panel border border-line hover:border-cyan/40 rounded-2xl transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange/10 rounded-xl">
              <Sparkles className="w-6 h-6 text-orange" />
            </div>
            <div className="text-left">
              <span className="text-lg font-bold text-text group-hover:text-cyan transition-colors">Dashboard (Long Break)</span>
              <span className="block text-sm text-muted mt-1">Returning after {'>'}30 days.</span>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-muted group-hover:text-cyan group-hover:translate-x-1 transition-all shrink-0" />
        </button>

        <button
          onClick={() => onNavigate('dashboard:all-completed')}
          className="w-full flex items-center justify-between gap-3 px-6 py-5 bg-panel border border-line hover:border-cyan/40 rounded-2xl transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow/10 rounded-xl">
              <Award className="w-6 h-6 text-yellow" />
            </div>
            <div className="text-left">
              <span className="text-lg font-bold text-text group-hover:text-cyan transition-colors">Dashboard (All Completed)</span>
              <span className="block text-sm text-muted mt-1">Celebrating completion of all courses.</span>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-muted group-hover:text-cyan group-hover:translate-x-1 transition-all shrink-0" />
        </button>

        <button
          onClick={() => onNavigate('demo-livesessions-empty')}
          className="w-full flex items-center justify-between gap-3 px-6 py-5 bg-panel border border-line hover:border-cyan/40 rounded-2xl transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple/10 rounded-xl">
              <BookOpen className="w-6 h-6 text-purple" />
            </div>
            <div className="text-left">
              <span className="text-lg font-bold text-text group-hover:text-cyan transition-colors">Live Sessions (Empty)</span>
              <span className="block text-sm text-muted mt-1">Empty state template for live sessions.</span>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-muted group-hover:text-cyan group-hover:translate-x-1 transition-all shrink-0" />
        </button>
      </div>

      {/* Modal System Showcase */}
      <div className="bg-panel border border-line rounded-2xl p-8 space-y-6">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-cyan" />
          <h2 className="text-xl font-bold font-display">Modal System Showcase</h2>
        </div>
        <p className="text-muted text-sm">
          Experience the high-fidelity modal overlay system with focus trapping, responsive design, and premium animations.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => openModal('confirmation', {
              title: 'Reset Progress?',
              description: 'This action is irreversible. All your module progress and quiz scores will be permanently deleted.',
              props: {
                onConfirm: () => console.log('Reset confirmed'),
                confirmText: 'Yes, Reset All',
                variant: 'danger'
              }
            })}
            className="flex flex-col items-center justify-center p-6 bg-red/10 border border-red/20 rounded-xl hover:bg-red/20 transition-all group cursor-pointer"
          >
            <AlertCircle className="w-8 h-8 text-red mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-red">Confirmation</span>
          </button>

          <button
            onClick={() => openModal('form', {
              title: 'Add Learning Note',
              props: {
                onSubmit: (data: unknown) => console.log('Form submitted', data),
                children: (
                  <div className="space-y-4 text-left">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted">Topic</label>
                      <input 
                        className="w-full bg-bg border border-line rounded-xl px-4 py-2.5 text-text focus:border-cyan !outline-none transition-all" 
                        placeholder="e.g. Asynchronous Python"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-muted">Note</label>
                      <textarea 
                        className="w-full bg-bg border border-line rounded-xl px-4 py-2.5 text-text focus:border-cyan !outline-none transition-all min-h-[120px]" 
                        placeholder="What did you learn today?"
                      />
                    </div>
                  </div>
                )
              }
            })}
            className="flex flex-col items-center justify-center p-6 bg-cyan/10 border border-cyan/20 rounded-xl hover:bg-cyan/20 transition-all group cursor-pointer"
          >
            <BookOpen className="w-8 h-8 text-cyan mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-cyan">Form Entry</span>
          </button>

          <button
            onClick={() => openModal('celebration', {
              title: 'New Rank: Alchemist!',
              description: 'You have mastered the fundamental transformations of code.',
              props: {
                achievementName: 'Master of Reactivity',
                points: 500
              }
            })}
            className="flex flex-col items-center justify-center p-6 bg-yellow/10 border border-yellow/20 rounded-xl hover:bg-yellow/20 transition-all group cursor-pointer"
          >
            <Award className="w-8 h-8 text-yellow mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-yellow">Celebration</span>
          </button>

          <button
            onClick={() => openModal('quiz', {
              props: {
                questions: [
                  { 
                    id: 1, 
                    text: 'Which hook should be used for side effects in React?', 
                    options: ['useState', 'useEffect', 'useContext', 'useReducer'] 
                  },
                  { 
                    id: 2, 
                    text: 'What is the purpose of React.memo()?', 
                    options: ['State management', 'Routing', 'Performance optimization', 'Styling'] 
                  }
                ],
                onComplete: (answers: unknown) => console.log('Quiz complete', answers)
              }
            })}
            className="flex flex-col items-center justify-center p-6 bg-purple/10 border border-purple/20 rounded-xl hover:bg-purple/20 transition-all group cursor-pointer"
          >
            <Sparkles className="w-8 h-8 text-purple mb-3 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-purple">Multi-step Quiz</span>
          </button>
        </div>
      </div>

      {/* Offline Workspace Sync Test Lab */}
      <div className="bg-panel border border-line rounded-2xl p-8 space-y-6 mt-8">
        <div className="flex items-center space-x-2">
          <RefreshCw className={`w-6 h-6 text-cyan ${isSyncing ? 'animate-spin' : ''}`} />
          <h2 className="text-xl font-bold font-display">Offline Workspace Sync</h2>
        </div>
        <p className="text-muted text-sm">
          Test the offline synchronization UI and state transitions.
        </p>

        <div className="bg-bg/40 border border-line/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-muted">Data Pre-fetch</h3>
            <span className="bg-cyan/15 text-cyan text-[10px] px-2 py-0.5 rounded font-bold uppercase">Local Cache</span>
          </div>

          {!isSyncing && syncProgress === 0 ? (
            <div className="space-y-3">
              <p className="text-muted text-xs leading-relaxed">
                Download and cache all bootcamp video lessons, resources, and quiz databases for offline learning access.
              </p>
              <button
                onClick={handleStartSync}
                className="w-full bg-cyan hover:bg-cyan2 text-bg text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer text-center"
              >
                Start Offline Sync
              </button>
            </div>
          ) : (
            <div className="space-y-3 animate-[fadeIn_0.3s_ease-out]">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted truncate max-w-[70%] font-semibold block">{syncStep}</span>
                <span className="font-bold text-text shrink-0">{Math.floor(syncProgress)}%</span>
              </div>

              {/* Horizontal Progress Bar */}
              <div className="w-full h-2.5 bg-bg rounded-full overflow-hidden border border-line">
                <div
                  className="h-full bg-cyan transition-all duration-100 ease-out"
                  style={{ width: `${syncProgress}%` }}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCancelSync}
                  className="w-full bg-red/10 hover:bg-red/20 text-red border border-red/20 hover:border-red/35 text-xs font-semibold py-2 rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel Sync</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Widget Test Lab */}
      <div className="bg-panel border border-line rounded-2xl p-8 space-y-6 mt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ArrowDownToLine className="w-6 h-6 text-cyan" />
            <h2 className="text-xl font-bold font-display">Upload Widget Test Lab</h2>
          </div>
          <button 
            onClick={() => setShowUpload(!showUpload)}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              showUpload ? 'bg-panel border border-cyan/50 text-cyan' : 'bg-cyan hover:bg-cyan2 text-bg shadow-lg shadow-cyan/20'
            }`}
          >
            {showUpload ? (
              <>
                <X className="w-4 h-4" />
                <span>Close Uploader</span>
              </>
            ) : (
              <>
                <ArrowDownToLine className="w-4 h-4 rotate-180" />
                <span>Test Resource Uploader</span>
              </>
            )}
          </button>
        </div>
        <p className="text-muted text-sm">
          Test the file upload component and drag-and-drop interaction independent of the resources page.
        </p>

        {showUpload && (
          <div className="bg-bg/40 border border-line/50 rounded-2xl p-6 animate-in slide-in-from-top-4 duration-300">
             <div className="mb-6 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-text">Sub-Space Transfer Protocol</h3>
                  <p className="text-xs text-muted">Upload course materials or assignment attachments for encrypted storage.</p>
                </div>
                <div className="flex items-center space-x-4">
                   <div className="text-right">
                      <p className="text-[10px] font-bold text-muted uppercase">Cloud Status</p>
                      <p className="text-[10px] font-bold text-green">Online</p>
                   </div>
                </div>
             </div>
             <FileUpload mode="attachment" />
          </div>
        )}
      </div>

      {/* E-Commerce UI Showcase */}
      <div className="bg-panel border border-line rounded-2xl p-8 space-y-6 mt-8">
        <div className="flex items-center space-x-2">
          <Award className="w-6 h-6 text-cyan" />
          <h2 className="text-xl font-bold font-display">E-Commerce Widgets</h2>
        </div>
        <p className="text-muted text-sm">
          Standalone e-commerce UI components for course detail and checkout pages.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Money-Back Guarantee Component */}
          <div className="p-5 border border-line rounded-xl bg-bg/50 flex flex-col justify-center items-center text-center space-y-3">
            <div className="w-12 h-12 bg-green/10 rounded-full flex items-center justify-center mb-1">
              <Sparkles className="w-6 h-6 text-green" />
            </div>
            <h3 className="font-black text-text text-sm uppercase tracking-widest">30-Day Guarantee</h3>
            <p className="text-xs text-muted max-w-xs leading-relaxed">
              We stand behind our quality. If you're not satisfied with the course material within the first 30 days, get a full, no-questions-asked refund.
            </p>
          </div>

          {/* Group Purchase Option */}
          <div className="p-5 border border-line rounded-xl bg-bg/50 flex flex-col justify-center items-center text-center space-y-3">
            <div className="w-12 h-12 bg-cyan/10 rounded-full flex items-center justify-center mb-1">
              <Award className="w-6 h-6 text-cyan" />
            </div>
            <h3 className="font-black text-text text-sm uppercase tracking-widest">Team Purchase</h3>
            <p className="text-xs text-muted max-w-xs leading-relaxed">
              Want to enroll your entire development team? We offer scalable corporate billing and group discounts.
            </p>
            <button className="text-cyan text-xs font-black uppercase tracking-widest hover:underline mt-2">
              Contact Enterprise Sales
            </button>
          </div>

        </div>
      </div>

      {/* Course Completion Certificate Preview */}
      <div className="bg-panel border border-line rounded-2xl p-8 space-y-6 mt-8">
        <div className="flex items-center space-x-2">
          <Award className="w-6 h-6 text-yellow" />
          <h2 className="text-xl font-bold font-display">Course Completion Certificate (Static Image Render)</h2>
        </div>
        <p className="text-muted text-sm">
          This preview uses the installed <code>html-to-image</code> package to capture the React component structure and render it as a static PNG image.
        </p>

        <CertificateImageWrapper
          recipientName="Adam Davidson"
          courseName="Advanced React Web Architecture"
          completionDate="July 2, 2026"
          platformName="Manthio e-Learning"
          instructorName="Dr. Sarah Jenkins"
          certificateId="CERT-8902-REACT"
        />
      </div>

    </div>
  );
};

// Helper component that converts React Certificate to static PNG Image using html-to-image
const CertificateImageWrapper: React.FC<{
  recipientName: string;
  courseName: string;
  completionDate: string;
  platformName: string;
  instructorName: string;
  certificateId: string;
}> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [base64Logo, setBase64Logo] = useState<string>('');
  const [status, setStatus] = useState<'loading' | 'converting' | 'success' | 'error'>('loading');

  // Pre-convert the platform logo to Base64 in standard fetch requests
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const logoPath = "/src/assets/logo_7_prio_1_variation.png";
        const response = await fetch(logoPath);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setBase64Logo(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (err) {
        console.error("Failed to load/convert logo to base64:", err);
      }
    };
    fetchLogo();
  }, []);

  useEffect(() => {
    if (!base64Logo) return;

    const convert = async () => {
      try {
        // Wait for fonts and styles to settle in browser DOM
        await document.fonts.ready;
        await new Promise((r) => requestAnimationFrame(r));
        
        const node = containerRef.current;
        if (!node) return;

        setStatus('converting');
        
        // Render element to PNG using html-to-image - Capturing 990x700 (1120x700 cropped by 65px left and right)
        const dataUrl = await toPng(node, {
          width: 990,
          height: 700,
          style: {
            width: '990px',
            height: '700px',
            transform: 'scale(1)',
            transformOrigin: 'top left',
          },
          pixelRatio: 2,
          cacheBust: true,
          backgroundColor: '#ffffff',
          fontEmbedCSS: '', // Bypass parser crash on undefined font declarations
        });

        setPngUrl(dataUrl);
        setStatus('success');
      } catch (err) {
        console.error('html-to-image failed:', err);
        setStatus('error');
      }
    };

    convert();
  }, [base64Logo, props.recipientName, props.courseName, props.completionDate]);

  return (
    <div className="relative w-full flex flex-col items-center justify-center">
      {status === 'loading' && (
        <div className="text-sm text-muted animate-pulse py-12">Loading certificate assets...</div>
      )}
      {status === 'converting' && (
        <div className="text-sm text-muted animate-pulse py-12">Generating static PNG...</div>
      )}
      {status === 'error' && (
        <div className="text-sm text-red-500 py-12">Failed to render static image. Showing live interactive view instead.</div>
      )}

      {/* Off-screen renderer - Rendered in a 0x0 container to hide it visually while maintaining normal layout flow */}
      <div style={{ width: 0, height: 0, overflow: 'hidden', position: 'relative' }}>
        <div 
          ref={containerRef} 
          style={{ 
            width: '990px', 
            height: '700px', 
            position: 'absolute',
            left: 0,
            top: 0,
            overflow: 'hidden',
            backgroundColor: '#ffffff'
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '-67px',
              top: 0,
              width: '1120px',
              height: '700px'
            }}
          >
            <Certificate 
              {...props} 
              logoUrl={base64Logo}
              isCaptureTemplate={true}
              className="w-full h-full rounded-none shadow-none border-none" 
            />
          </div>
        </div>
      </div>

      {/* Rendered image or fallback */}
      <div className="bg-bg/40 border border-line/50 rounded-2xl p-6 w-full flex justify-center items-center overflow-x-auto">
        {status === 'success' && pngUrl ? (
          <img
            src={pngUrl}
            alt="Course Completion Certificate"
            className="w-full min-w-[700px] max-w-[900px] shadow-2xl rounded-2xl border border-line/10 select-none pointer-events-none"
          />
        ) : (
          status !== 'loading' && status !== 'converting' && (
            <Certificate
              {...props}
              logoUrl={base64Logo || undefined}
              className="w-full min-w-[700px] max-w-[900px]"
            />
          )
        )}
      </div>
    </div>
  );
};
