import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, FileText, Subtitles, PictureInPicture, Maximize, RotateCcw, RotateCw, Volume2, VolumeX, Bookmark, Settings, Check, Trash2, Loader2 } from 'lucide-react';
import type { Lesson } from '../../../types';
import { QuizEngine } from '../../../components/modules/QuizEngine';
import Hls from 'hls.js';

interface VideoRendererProps {
  lesson: Lesson;
}

interface BookmarkItem {
  time: number;
  text: string;
}

export const VideoRenderer: React.FC<VideoRendererProps> = ({ lesson }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeout = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [ccLanguage, setCcLanguage] = useState<'off' | 'en' | 'de'>('off');
  const [showControls, setShowControls] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  // Bookmarks
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    const savedBookmarks = localStorage.getItem(`video-bookmarks-${lesson.id}`);
    return savedBookmarks ? JSON.parse(savedBookmarks) : [];
  });
  
  // HLS Qualities
  const [qualityLevels, setQualityLevels] = useState<Array<{height: number}>>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = auto
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  const hlsRef = useRef<Hls | null>(null);

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
    // REQ-VIDEO-001: Restore saved position
    const savedPos = localStorage.getItem(`video-pos-${lesson.id}`);
    if (savedPos && videoRef.current) {
      videoRef.current.currentTime = parseFloat(savedPos);
    }

    // Initialize HLS for adaptive streaming (REQ-VIDEO-005)
    // We use Big Buck Bunny as a reliable public M3U8 test stream for this feature implementation.
    const src = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
    
    if (Hls.isSupported() && videoRef.current) {
      const hls = new Hls();
      hlsRef.current = hls;
      
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      
      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        setQualityLevels(data.levels);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, () => {
        if (hls.autoLevelEnabled) {
          // Keep Auto selected but note which one it actually is in UI if needed
        }
      });
    } else if (videoRef.current && videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS (Safari)
      videoRef.current.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [lesson.id]);

  const handleInteract = () => {
    setShowControls(true);
    if (hideControlsTimeout.current !== null) window.clearTimeout(hideControlsTimeout.current);
    if (isPlaying) {
      hideControlsTimeout.current = window.setTimeout(() => {
        setShowControls(false);
        setShowQualityMenu(false);
      }, 3000);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
          handleInteract();
        }).catch(err => console.error("Play failed", err));
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
        setShowControls(true);
      }
    }
  };

  const skip = (amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(Math.max(0, videoRef.current.currentTime + amount), duration);
      handleInteract();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      if (key === 'f') {
        toggleFullscreen();
      } else if (key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (key === 'arrowleft') {
        skip(-10);
      } else if (key === 'arrowright') {
        skip(10);
      } else if (key === 'c') {
        setCcLanguage(prev => prev === 'off' ? 'en' : 'off');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, duration]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

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

  // REQ-VIDEO-006: Mobile Gestures
  const touchStartRef = useRef<{x: number, y: number} | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    handleInteract();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const dx = touchEnd.x - touchStartRef.current.x;
    const dy = touchEnd.y - touchStartRef.current.y;
    
    // Horizontal swipe for skip
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      skip(dx > 0 ? 10 : -10);
    }
    
    // Vertical swipe for volume
    if (Math.abs(dy) > 50 && Math.abs(dy) > Math.abs(dx)) {
      const newVol = Math.max(0, Math.min(1, volume + (dy > 0 ? -0.1 : 0.1)));
      setVolume(newVol);
      setIsMuted(newVol === 0);
    }
    
    touchStartRef.current = null;
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setShowControls(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
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



  const handleQualityChange = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
      setShowQualityMenu(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      // REQ-VIDEO-001: Remember position
      localStorage.setItem(`video-pos-${lesson.id}`, time.toString());
      
      // REQ-VIDEO-002: Track 90% completion
      if (duration > 0 && lesson.status !== 'completed') {
        if (time / duration >= 0.9) {
          // Trigger completion logic (mocking with localStorage for this assignment)
          localStorage.setItem(`video-completed-${lesson.id}`, 'true');
        }
      }
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

  const addBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newBm = { time: currentTime, text: `Bookmark at ${formatTime(currentTime)}` };
    const updated = [...bookmarks, newBm].sort((a,b) => a.time - b.time);
    setBookmarks(updated);
    localStorage.setItem(`video-bookmarks-${lesson.id}`, JSON.stringify(updated));
  };

  const deleteBookmark = (e: React.MouseEvent, time: number) => {
    e.stopPropagation();
    const updated = bookmarks.filter(bm => bm.time !== time);
    setBookmarks(updated);
    localStorage.setItem(`video-bookmarks-${lesson.id}`, JSON.stringify(updated));
  };

  const jumpToTime = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
      setIsPlaying(true);
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

  // Mock Chapter Markers
  const chapters = duration > 0 ? [0.2, 0.45, 0.8] : [];

  return (
    <div className="w-full flex flex-col space-y-8 pb-8">
      {/* Title & Description */}
      <div className="border-b border-line pb-6">
        <h2 className="text-xl md:text-3xl font-bold text-text mb-3">{lesson.title}</h2>
        <p className="text-sm text-muted leading-relaxed max-w-3xl">
          In this video, we'll dive into the fundamental concepts of this topic. You'll learn how to approach the theoretical foundations and apply them practically in your own projects. Pay close attention to the architectural diagrams.
        </p>
        <div className="flex items-center space-x-2 mt-4 text-cyan">
          <button className="px-3 py-1 bg-bg border border-cyan rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-default select-none pointer-events-none">
            Video
          </button>
          <button className="px-3 py-1 bg-bg border border-cyan rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-default select-none pointer-events-none">
            {lesson.duration}
          </button>
          <button className="px-3 py-1 bg-bg border border-cyan rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-default select-none pointer-events-none">
            Level {lesson.difficulty || 1}
          </button>
        </div>
      </div>

      {/* Video Player */}
      <div 
        ref={containerRef} 
        className="aspect-video bg-black relative overflow-hidden flex items-center justify-center w-full rounded-2xl group"
        onPointerEnter={(e) => e.pointerType === 'mouse' && handleInteract()}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse' && isPlaying) {
            setShowControls(false);
            setShowQualityMenu(false);
          }
        }}
        onPointerMove={(e) => e.pointerType === 'mouse' && handleInteract()}
        onClick={handleVideoClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <video 
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => { setIsPlaying(true); setIsLoading(false); }}
          onCanPlay={() => setIsLoading(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleEnded}
        />
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 pointer-events-none">
            <Loader2 className="w-12 h-12 md:w-16 md:h-16 text-cyan animate-spin" />
          </div>
        )}
        
        {/* Play overlay button */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${controlsVisible && !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
           <div className="bg-black/50 p-4 md:p-6 rounded-full pointer-events-auto cursor-pointer hover:bg-cyan/90 transition-colors" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
             <Play className="w-12 h-12 md:w-16 md:h-16 text-white" fill="currentColor" />
           </div>
        </div>
        
        {/* Video Controls Overlay */}
        <div 
          onClick={(e) => e.stopPropagation()}
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 md:p-6 flex flex-col justify-end h-40 transition-opacity duration-300 ${controlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
          {/* Progress Bar with Chapters */}
          <div 
            ref={progressRef}
            onClick={handleProgressClick}
            className="w-full h-1.5 md:h-2 bg-white/30 rounded-full mb-4 cursor-pointer relative group/progress hover:h-2 md:hover:h-3 transition-all"
          >
            {chapters.map(pt => (
               <div key={pt} className="absolute top-0 bottom-0 w-1 bg-black/80 z-10 hover:w-1.5 transition-all" style={{left: `${pt * 100}%`}} />
            ))}
            
            <div className="h-full bg-cyan rounded-full transition-all duration-75 relative z-0" style={{ width: `${progressPercent}%` }} />
            <div 
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 md:w-4 md:h-4 bg-white rounded-full transition-all duration-75 z-20 shadow opacity-0 group-hover/progress:opacity-100" 
              style={{ left: `${progressPercent}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between text-[11px] md:text-sm text-white font-semibold">
            {/* Left Controls */}
            <div className="flex items-center space-x-3 md:space-x-5">
              <button onClick={togglePlay} className="hover:text-cyan transition-colors">
                {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" /> : <Play className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />}
              </button>
              
              <button onClick={(e) => {e.stopPropagation(); skip(-10)}} className="hover:text-cyan transition-colors hidden sm:block relative w-5 h-5" title="Skip backward 10s">
                <RotateCcw className="w-5 h-5 absolute inset-0" />
                <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold font-mono mt-[1px]">10</span>
              </button>
              <button onClick={(e) => {e.stopPropagation(); skip(10)}} className="hover:text-cyan transition-colors hidden sm:block relative w-5 h-5" title="Skip forward 10s">
                <RotateCw className="w-5 h-5 absolute inset-0" />
                <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold font-mono mt-[1px]">10</span>
              </button>
              
              <div className="flex items-center space-x-2 group/vol">
                <button onClick={() => setIsMuted(!isMuted)} className="hover:text-cyan transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input 
                  type="range" min="0" max="1" step="0.05" 
                  value={isMuted ? 0 : volume} 
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    setIsMuted(v === 0);
                  }}
                  onClick={e => e.stopPropagation()}
                  className="w-0 group-hover/vol:w-16 md:w-16 transition-all duration-300 accent-cyan cursor-pointer hidden sm:block"
                />
              </div>
              
              <span className="font-mono tracking-wider">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
            
            {/* Right Controls */}
            <div className="flex items-center space-x-3 md:space-x-5 text-white/90 relative h-6">
              <button onClick={addBookmark} className="hover:text-cyan transition-colors flex items-center justify-center h-full" title="Add Bookmark">
                <Bookmark className="w-5 h-5 md:w-5 md:h-5" />
              </button>
              
              {/* Settings Menu */}
              <div className="relative flex items-center justify-center h-full">
                <button 
                  onClick={(e) => {e.stopPropagation(); setShowQualityMenu(!showQualityMenu)}} 
                  className="hover:text-cyan transition-colors flex items-center justify-center" 
                  title="Settings"
                >
                  <Settings className="w-5 h-5 md:w-5 md:h-5" />
                </button>
                {showQualityMenu && (
                  <div className="absolute bottom-full right-0 mb-4 flex flex-col bg-panel border border-line rounded-lg p-2 text-xs md:text-sm whitespace-nowrap z-50 shadow-2xl min-w-[160px]">
                    <div className="text-muted font-bold px-3 py-1 border-b border-line mb-2 uppercase tracking-wider text-[10px]">Playback Speed</div>
                    <div className="flex flex-wrap gap-1 px-2 pb-2 mb-2 border-b border-line justify-center">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                        <button
                          key={rate}
                          onClick={(e) => { e.stopPropagation(); setPlaybackRate(rate); if(videoRef.current) videoRef.current.playbackRate = rate; }}
                          className={`px-1.5 py-1 rounded text-[10px] ${playbackRate === rate ? 'bg-cyan text-black font-bold' : 'hover:bg-line/20 text-text'}`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>

                    {qualityLevels.length > 0 && (
                      <>
                        <div className="text-muted font-bold px-3 py-1 border-b border-line mb-1 uppercase tracking-wider text-[10px]">Quality</div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleQualityChange(-1); }}
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded hover:bg-line/20 text-left ${currentQuality === -1 ? 'text-cyan font-bold' : 'text-text'}`}
                        >
                          {currentQuality === -1 && <Check className="w-3 h-3" />}
                          <span className={currentQuality === -1 ? '' : 'pl-5'}>Auto</span>
                        </button>
                        {qualityLevels.map((level, idx) => (
                          <button 
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); handleQualityChange(idx); }}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded hover:bg-line/20 text-left ${currentQuality === idx ? 'text-cyan font-bold' : 'text-text'}`}
                          >
                            {currentQuality === idx && <Check className="w-3 h-3" />}
                            <span className={currentQuality === idx ? '' : 'pl-5'}>{level.height}p</span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {/* CC Toggle */}
              <div className="relative group/cc flex items-center justify-center h-full">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setCcLanguage(prev => prev === 'off' ? 'en' : prev === 'en' ? 'de' : 'off');
                  }}
                  className={`hover:text-cyan transition-colors flex items-center justify-center ${ccLanguage !== 'off' ? 'text-cyan' : ''}`}
                  title="Closed Captions"
                >
                  <Subtitles className="w-5 h-5 md:w-5 md:h-5" />
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 hidden group-hover/cc:flex flex-col bg-panel border border-line rounded-lg p-2 text-xs md:text-sm whitespace-nowrap z-50 shadow-2xl">
                  <div className="text-muted font-bold px-3 py-1 border-b border-line mb-1 uppercase tracking-wider text-[10px]">Captions</div>
                  {(['off', 'en', 'de'] as const).map(lang => (
                    <button 
                      key={lang}
                      onClick={(e) => { e.stopPropagation(); setCcLanguage(lang); }}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded hover:bg-line/20 text-left ${ccLanguage === lang ? 'text-cyan font-bold' : 'text-text'}`}
                    >
                      {ccLanguage === lang && <Check className="w-3 h-3" />}
                      <span className={ccLanguage === lang ? '' : 'pl-5'}>
                        {lang === 'off' ? 'Off' : lang === 'en' ? 'English' : 'Deutsch'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={(e) => {e.stopPropagation(); togglePiP()}} className="hover:text-cyan transition-colors hidden sm:flex items-center justify-center h-full" title="Picture in Picture">
                <PictureInPicture className="w-5 h-5 md:w-5 md:h-5" />
              </button>
              <button onClick={(e) => {e.stopPropagation(); toggleFullscreen()}} className="hover:text-cyan transition-colors flex items-center justify-center h-full" title="Fullscreen">
                <Maximize className="w-5 h-5 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Mock Captions Overlay (REQ-VIDEO-003) */}
        {ccLanguage !== 'off' && isPlaying && (
          <div className="absolute bottom-24 left-0 right-0 flex justify-center pointer-events-none px-4 text-center">
            <div className="bg-black/70 px-4 py-2 rounded text-white text-sm md:text-base lg:text-lg font-medium drop-shadow-lg max-w-3xl leading-snug">
              {ccLanguage === 'en' ? 
                (currentTime < 10 ? "Welcome to the fundamentals of modern video playback." : "Here you can see the advanced controls in action.") : 
                (currentTime < 10 ? "Willkommen zu den Grundlagen der modernen Videowiedergabe." : "Hier sehen Sie die erweiterten Steuerelemente in Aktion.")}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transcript (REQ-VIDEO-004) */}
        <div className="bg-panel border border-line rounded-2xl p-6 space-y-4 lg:col-span-2">
          <div className="flex items-center space-x-2 border-b border-line pb-4">
            <FileText className="w-5 h-5 text-cyan" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-text">Transcript</h3>
          </div>
          
          <div className="space-y-4 text-sm text-muted leading-relaxed">
            {[
              { t: 0, text: "Welcome back everyone. In today's session, we are going to explore the core architecture that drives modern applications. We've spent the last few lessons discussing the theory, but now it's time to see it in action." },
              { t: 10, text: "If you look at the diagram on screen, you'll notice that the pipeline is split into three distinct phases. The ingestion phase, the processing phase, and finally the delivery phase. Each of these requires careful consideration." },
              { t: 25, text: "Now, a common mistake here is tightly coupling the processing phase to the ingestion phase. When you do that, your system loses scalability. Remember the principle of single responsibility we covered earlier?" }
            ].map(line => (
              <div 
                key={line.t}
                className={`flex space-x-4 p-3 rounded-lg transition-colors cursor-pointer group ${currentTime >= line.t && currentTime < line.t + 10 ? 'bg-cyan/10 border border-cyan/20' : 'hover:bg-line/20 border border-transparent'}`} 
                onClick={() => jumpToTime(line.t)}
              >
                <span className="text-cyan font-mono text-xs pt-1 shrink-0 group-hover:text-cyan/80">
                  {formatTime(line.t)}
                </span>
                <p className={currentTime >= line.t && currentTime < line.t + 10 ? 'text-text font-medium' : ''}>{line.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bookmarks (REQ-VIDEO-007) */}
        <div className="bg-panel border border-line rounded-2xl p-6 space-y-4">
          <div className="flex items-center space-x-2 border-b border-line pb-4">
            <Bookmark className="w-5 h-5 text-yellow" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-text">Bookmarks</h3>
          </div>
          
          {bookmarks.length === 0 ? (
            <div className="text-sm text-muted italic flex items-center justify-center h-24">
              No bookmarks yet. Click the bookmark icon in the player to save a timestamp.
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {bookmarks.map((bm, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-line hover:border-yellow/50 hover:bg-yellow/5 transition-colors cursor-pointer group" onClick={() => jumpToTime(bm.time)}>
                  <div className="flex flex-col space-y-1 overflow-hidden">
                    <span className="text-yellow font-mono text-xs font-bold">{formatTime(bm.time)}</span>
                    <p className="text-sm text-text truncate">{bm.text}</p>
                  </div>
                  <button 
                    onClick={(e) => deleteBookmark(e, bm.time)} 
                    className="p-1.5 text-muted hover:text-red-500 transition-colors"
                    title="Delete bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
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
