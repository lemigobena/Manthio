import React, { useState, useEffect, useRef } from 'react';
import { Download, Eye, Star } from 'lucide-react';
import { Certificate } from '../../components/ui/Certificate';
import { toPng } from 'html-to-image';
import { useAuth } from '../../context/AuthContext';
import { COURSES, TRACKS } from '../../services/mockData';

interface CompletedCoursePageProps {
  courseId: string;
  onNavigate: (page: string) => void;
}

export const CompletedCoursePage: React.FC<CompletedCoursePageProps> = ({ courseId, onNavigate }) => {
  const { user } = useAuth();
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'converting' | 'success' | 'error'>('loading');
  const [base64Logo, setBase64Logo] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  const courseOnly = COURSES.find(c => c.id === courseId);
  const course = courseOnly || TRACKS.find(t => t.id === courseId);
  const courseName = course?.title || "Advanced System Architecture";
  const courseDescription = course?.description || "You've successfully mastered the core concepts of this course.";
  const courseRating = courseOnly?.rating || 4.8;
  const courseReviews = courseOnly?.reviews?.length ?? 120;
  const completionDate = "Oct 15, 2024";
  const recipientName = user?.name || "Hiro Dinn";

  useEffect(() => {
    // Load local PNG asset as a base64 string because html-to-image has cross-origin/path issues 
    // when reading local file paths during the DOM serialization phase
    const fetchLogo = async () => {
      try {
        const response = await fetch('/src/assets/logo_7_prio_1_variation.png');
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
  }, [base64Logo, recipientName, courseName, completionDate]);

  const handleDownload = () => {
    if (!pngUrl) return;
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = `Certificate_${courseName.replace(/ /g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col items-center justify-center py-6 px-4 animate-fade-in relative z-10">
      
      {/* Top Header Section */}
      <div className="w-full max-w-3xl text-center mb-8 lg:mb-10">
        <h1 className="text-3xl lg:text-4xl font-black text-text tracking-tight mb-3 leading-tight">Course Completed!</h1>
        <p className="text-muted text-sm lg:text-base leading-relaxed">
          Congratulations! You've successfully finished this course. 
          Your personalized certificate is ready.
        </p>
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-8 lg:gap-16 items-center justify-center max-w-6xl mx-auto">
        {/* Off-screen renderer */}
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
                recipientName={recipientName}
                courseName={courseName}
                completionDate={completionDate}
                platformName="Manthio e-Learning"
                logoUrl={base64Logo}
                isCaptureTemplate={true}
                className="w-full h-full rounded-none shadow-none border-none" 
              />
            </div>
          </div>
        </div>

        {/* Left Side: Certificate Display */}
        <div className="w-full lg:w-3/5 flex-shrink-0">
          {status === 'loading' && (
            <div className="aspect-[1.41/1] w-full bg-surface border border-line/20 rounded-xl flex items-center justify-center">
              <div className="text-sm text-muted animate-pulse">Loading certificate assets...</div>
            </div>
          )}
          {status === 'converting' && (
            <div className="aspect-[1.41/1] w-full bg-surface border border-line/20 rounded-xl flex items-center justify-center">
              <div className="text-sm text-muted animate-pulse">Generating your certificate...</div>
            </div>
          )}
          {status === 'error' && (
            <div className="aspect-[1.41/1] w-full bg-surface border border-line/20 rounded-xl flex items-center justify-center">
              <div className="text-sm text-red-500">Failed to generate certificate.</div>
            </div>
          )}
          {status === 'success' && pngUrl && (
            <div className="w-full flex justify-center animate-fade-in shadow-2xl rounded-xl overflow-hidden border border-line/10">
              <img 
                src={pngUrl} 
                alt="Course Certificate" 
                className="w-full h-auto max-h-[50vh] lg:max-h-none object-contain pointer-events-none select-none"
              />
            </div>
          )}
        </div>

        {/* Right Side: Text and Actions */}
        <div className="w-full lg:w-2/5 flex flex-col space-y-6">
          <div>
            <div className="mb-4">
              <h3 className="font-bold text-base lg:text-lg text-text mb-2 line-clamp-2">{courseName}</h3>
              <p className="text-muted text-xs lg:text-sm line-clamp-3 mb-3">{courseDescription}</p>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-3.5 h-3.5 ${star <= Math.round(courseRating) ? 'text-yellow fill-yellow' : 'text-line'}`} />
                ))}
                <span className="text-[11px] lg:text-xs font-bold text-text ml-2">{courseRating}</span>
                <span className="text-[11px] lg:text-xs text-muted ml-1">({courseReviews} reviews)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <button 
              onClick={handleDownload}
              disabled={status !== 'success'}
              className={`flex items-center justify-center space-x-2 w-full px-5 py-3 rounded-xl font-bold transition-all ${
                status === 'success' 
                  ? 'bg-cyan hover:bg-cyan2 text-bg cursor-pointer hover:-translate-y-0.5 shadow-lg shadow-cyan/20' 
                  : 'bg-surface text-muted cursor-not-allowed border border-line'
              }`}
            >
              <Download className="w-5 h-5" />
              <span>Download Certificate</span>
            </button>
            <button 
              onClick={() => onNavigate('catalog')}
              className="flex items-center justify-center space-x-2 w-full px-5 py-3 rounded-xl font-bold bg-transparent border-2 border-cyan text-cyan hover:bg-cyan/10 transition-all cursor-pointer"
            >
              <span>Start a New</span>
            </button>
            <button 
              onClick={() => onNavigate('learning-path')}
              className="flex items-center justify-center space-x-2 w-full px-5 py-3 rounded-xl font-bold bg-surface border border-line text-text hover:bg-bg hover:border-cyan transition-all cursor-pointer"
            >
              <Eye className="w-5 h-5" />
              <span>Review course material</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
