import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, FileText, Subtitles, PictureInPicture, Maximize } from 'lucide-react';
import type { Lesson } from '../../../types';
import { QuizEngine } from '../../../components/modules/QuizEngine';

interface VideoRendererProps {
  lesson: Lesson;
}

export const VideoRenderer: React.FC<VideoRendererProps> = ({ lesson }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showCaptions, setShowCaptions] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const hideControlsTimeout = useRef<number | null>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile && videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      setIsPlaying(false);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      if (key === 'f') {
        toggleFullscreen();
      } else if (key === ' ') {
        e.preventDefault();
        if (videoRef.current) {
          if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
            setShowControls(true);
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
            setShowControls(true);
          }
        }
      } else if (key === 'arrowleft') {
        if (videoRef.current) videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
      } else if (key === 'arrowright') {
        if (videoRef.current) videoRef.current.currentTime = Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + 5);
      } else if (key === 'c') {
        setShowCaptions(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleInteract = () => {
    setShowControls(true);
    if (hideControlsTimeout.current !== null) window.clearTimeout(hideControlsTimeout.current);
    if (isPlaying) {
      hideControlsTimeout.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    if (e.target === videoRef.current) {
      setShowControls(prev => {
        const next = !prev;
        if (next && isPlaying) {
          if (hideControlsTimeout.current !== null) window.clearTimeout(hideControlsTimeout.current);
          hideControlsTimeout.current = window.setTimeout(() => setShowControls(false), 3000);
        }
        return next;
      });
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setShowControls(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
        handleInteract();
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        setShowControls(true); // Always show controls when paused
      }
    }
  };

  const togglePiP = async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (err) {
        console.error('PiP failed', err);
      }
    }
  };

  const togglePlaybackRate = () => {
    if (videoRef.current) {
      const rates = [1, 1.25, 1.5, 2, 0.5];
      const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
      const nextRate = rates[nextIndex];
      videoRef.current.playbackRate = nextRate;
      setPlaybackRate(nextRate);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = pos * videoRef.current.duration;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const controlsVisible = !isPlaying || showControls;

  return (
    <div className="w-full flex flex-col space-y-8 pb-8">
      {/* Title & Description */}
      <div className="border-b border-line pb-6">
        <h2 className="text-xl md:text-3xl font-bold text-text mb-3">{lesson.title}</h2>
        <p className="text-sm text-muted leading-relaxed max-w-3xl">
          In this video, we'll dive into the fundamental concepts of this topic. You'll learn how to approach the theoretical foundations and apply them practically in your own projects. Pay close attention to the architectural diagrams.
        </p>
        <div className="flex items-center space-x-3 mt-4">
          <span className="bg-panel border border-line px-2.5 py-1 rounded text-xs font-semibold text-text uppercase tracking-wider">Video</span>
          <span className="bg-panel border border-line px-2.5 py-1 rounded text-xs font-semibold text-text uppercase tracking-wider">{lesson.duration}</span>
          <span className="bg-panel border border-line px-2.5 py-1 rounded text-xs font-semibold text-text uppercase tracking-wider">Level {lesson.difficulty || 1}</span>
        </div>
      </div>

      {/* Video Player */}
      <div 
        ref={containerRef} 
        className="aspect-video bg-black relative overflow-hidden flex items-center justify-center w-full"
        onPointerEnter={(e) => e.pointerType === 'mouse' && handleInteract()}
        onPointerLeave={(e) => e.pointerType === 'mouse' && isPlaying && setShowControls(false)}
        onPointerMove={(e) => e.pointerType === 'mouse' && handleInteract()}
        onClick={handleVideoClick}
      >
        <video 
          ref={videoRef}
          src="https://mereb-website-2026.vercel.app/promo_video.webm" 
          className="absolute inset-0 w-full h-full object-cover"
          muted 
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleEnded}
        />
        
        {/* Play overlay button */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
           <div className="bg-black/50 p-4 rounded-full pointer-events-auto cursor-pointer" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
             {isPlaying ? <Pause className="w-12 h-12 text-white" /> : <Play className="w-12 h-12 text-white" />}
           </div>
        </div>
        
        {/* Video Controls Overlay */}
        <div 
          onClick={(e) => e.stopPropagation()}
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end h-32 transition-opacity duration-300 ${controlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
          <div 
            ref={progressRef}
            onClick={handleProgressClick}
            className="w-full h-1.5 bg-bg/40 rounded-full mb-3 cursor-pointer relative"
          >
            <div className="h-full bg-cyan rounded-full transition-all duration-75" style={{ width: `${progressPercent}%` }} />
            <div 
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full transition-all duration-75" 
              style={{ left: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-white font-semibold">
            <div className="flex items-center space-x-4">
              {isPlaying ? (
                <Pause className="w-4 h-4 cursor-pointer" onClick={togglePlay} />
              ) : (
                <Play className="w-4 h-4 cursor-pointer" onClick={togglePlay} />
              )}
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
              <span className="cursor-pointer hover:text-cyan transition-colors w-8" onClick={togglePlaybackRate}>{playbackRate}x</span>
            </div>
            <div className="flex items-center space-x-4 text-white/90">
              <span title="Toggle Captions" onClick={() => setShowCaptions(!showCaptions)} className={`cursor-pointer hover:text-cyan transition-colors ${showCaptions ? 'text-cyan' : ''}`}>
                <Subtitles className="w-4 h-4" />
              </span>
              <span title="Picture in Picture" onClick={togglePiP} className="cursor-pointer hover:text-cyan transition-colors">
                <PictureInPicture className="w-4 h-4" />
              </span>
              <span title="Fullscreen" onClick={toggleFullscreen} className="cursor-pointer hover:text-cyan transition-colors">
                <Maximize className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
        
        {/* Mock Captions Overlay */}
        {showCaptions && (
          <div className="absolute bottom-20 left-0 right-0 flex justify-center pointer-events-none">
            <div className="bg-black/70 px-4 py-2 rounded text-white text-sm font-medium">
              [Mock Captions are currently enabled]
            </div>
          </div>
        )}
      </div>

      {/* Transcript */}
      <div className="bg-panel border border-line rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-center space-x-2 border-b border-line pb-4">
          <FileText className="w-5 h-5 text-cyan" />
          <h3 className="font-bold text-sm uppercase tracking-wider text-text">Transcript</h3>
        </div>
        
        <div className="space-y-6 text-sm text-muted leading-relaxed">
          <div className="flex space-x-4 hover:bg-line/20 p-2 rounded-lg transition-colors cursor-pointer group" onClick={() => videoRef.current && (videoRef.current.currentTime = 0)}>
            <span className="text-cyan font-mono text-xs pt-1 shrink-0 group-hover:text-cyan/80">00:00</span>
            <p>Welcome back everyone. In today's session, we are going to explore the core architecture that drives modern applications. We've spent the last few lessons discussing the theory, but now it's time to see it in action.</p>
          </div>
          <div className="flex space-x-4 hover:bg-line/20 p-2 rounded-lg transition-colors cursor-pointer group" onClick={() => videoRef.current && (videoRef.current.currentTime = 3)}>
            <span className="text-cyan font-mono text-xs pt-1 shrink-0 group-hover:text-cyan/80">00:03</span>
            <p>If you look at the diagram on screen, you'll notice that the pipeline is split into three distinct phases. The ingestion phase, the processing phase, and finally the delivery phase. Each of these requires careful consideration.</p>
          </div>
          <div className="flex space-x-4 hover:bg-line/20 p-2 rounded-lg transition-colors cursor-pointer group" onClick={() => videoRef.current && (videoRef.current.currentTime = 6)}>
            <span className="text-cyan font-mono text-xs pt-1 shrink-0 group-hover:text-cyan/80">00:06</span>
            <p>Now, a common mistake here is tightly coupling the processing phase to the ingestion phase. When you do that, your system loses scalability. Remember the principle of single responsibility we covered earlier?</p>
          </div>
        </div>
      </div>

      {/* Inline Quiz / Knowledge Check */}
      <div className="bg-panel border border-line rounded-2xl p-6 md:p-8 flex flex-col items-center shadow-lg">
        <div className="text-center mb-6">
          <h4 className="font-bold text-lg text-text">Knowledge Check</h4>
          <p className="text-sm text-muted mt-1">Make sure you understood the core concepts from the video.</p>
        </div>
        <QuizEngine />
      </div>

    </div>
  );
};
