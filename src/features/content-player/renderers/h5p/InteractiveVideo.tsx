import React, { useRef, useState, useEffect } from 'react';
import type { H5PInteractiveVideoData } from '../../../../types';
import { Play, Pause, CheckCircle2, XCircle, Volume2, VolumeX, RotateCcw, RotateCw, Maximize } from 'lucide-react';

interface InteractiveVideoProps {
  data: H5PInteractiveVideoData;
  onComplete: () => void;
}

export const InteractiveVideo: React.FC<InteractiveVideoProps> = ({ data, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showInteraction, setShowInteraction] = useState<number | null>(null);
  const [answeredInteractions, setAnsweredInteractions] = useState<Set<number>>(new Set());
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [showControls, setShowControls] = useState(true);
  const hideControlsTimeout = useRef<number | null>(null);
  
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleInteract = () => {
    setShowControls(true);
    if (hideControlsTimeout.current !== null) window.clearTimeout(hideControlsTimeout.current);
    if (isPlaying) {
      hideControlsTimeout.current = window.setTimeout(() => setShowControls(false), 3000);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Check for interactions at current time
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const currentT = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    
    setCurrentTime(currentT);

    if (duration > 0) {
      setProgress((currentT / duration) * 100);
    }

    // Find if there's an interaction for this second
    const interactionIndex = data.interactions.findIndex(
      (int) => Math.abs(int.time - currentT) < 0.5
    );

    if (
      interactionIndex !== -1 && 
      !answeredInteractions.has(interactionIndex) &&
      showInteraction !== interactionIndex
    ) {
      const interaction = data.interactions[interactionIndex];
      if (interaction.pauseVideo) {
        videoRef.current.pause();
        setIsPlaying(false);
        setShowControls(true);
      }
      setShowInteraction(interactionIndex);
    }

    // Check completion
    if (currentT >= duration - 1 && answeredInteractions.size === data.interactions.length) {
      onComplete();
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
      videoRef.current.currentTime = Math.min(Math.max(0, videoRef.current.currentTime + amount), videoDuration);
      handleInteract();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newTime = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
      setProgress(parseFloat(e.target.value));
      handleInteract();
    }
  };

  const handleAnswerSubmit = (interactionIndex: number) => {
    if (selectedOption === null) return;
    
    const interaction = data.interactions[interactionIndex];
    const correct = selectedOption === interaction.correctAnswerIndex;
    setIsCorrect(correct);

    if (correct) {
      setTimeout(() => {
        setAnsweredInteractions(prev => new Set(prev).add(interactionIndex));
        setShowInteraction(null);
        setSelectedOption(null);
        setIsCorrect(null);
        if (videoRef.current) {
          videoRef.current.play();
          setIsPlaying(true);
          handleInteract();
        }
      }, 1500);
    } else {
      const prevInteractionTime = interactionIndex > 0 
        ? data.interactions[interactionIndex - 1].time 
        : 0;

      setTimeout(() => {
        setShowInteraction(null);
        setSelectedOption(null);
        setIsCorrect(null);
        if (videoRef.current) {
          videoRef.current.currentTime = prevInteractionTime;
          videoRef.current.play();
          setIsPlaying(true);
          handleInteract();
        }
      }, 1500);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video flex flex-col bg-black rounded-xl overflow-hidden shadow-2xl group"
      onMouseMove={handleInteract}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <div className="relative flex-1 flex items-center justify-center h-full w-full">
        <video
          ref={videoRef}
          src={data.videoUrl}
          playsInline
          className="w-full h-full object-contain"
          onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onClick={togglePlay}
        />

        {/* Play overlay button */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${showControls && !isPlaying && showInteraction === null ? 'opacity-100' : 'opacity-0'}`}>
           <div className="bg-black/50 backdrop-blur-sm p-2 sm:p-4 md:p-6 rounded-full pointer-events-auto cursor-pointer hover:bg-cyan/90 transition-colors shadow-xl" onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
             <Play className="w-6 h-6 sm:w-12 sm:h-12 md:w-16 md:h-16 text-white" fill="currentColor" />
           </div>
        </div>

        {/* Interaction Overlay */}
        {showInteraction !== null && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-30 animate-fade-in">
            <div className="bg-bg border border-line rounded-xl p-4 sm:p-6 max-w-md w-full shadow-2xl pointer-events-auto max-h-full overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">{data.interactions[showInteraction].question}</h3>
              
              <div className="space-y-3">
                {data.interactions[showInteraction].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedOption(index)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                      selectedOption === index 
                        ? isCorrect === true
                          ? 'bg-green/10 border-green text-green'
                          : isCorrect === false
                            ? 'bg-red/10 border-red text-red'
                            : 'bg-cyan/10 border-cyan text-cyan'
                        : 'bg-panel border-line hover:border-cyan hover:text-cyan text-text'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {selectedOption === index && isCorrect === true && <CheckCircle2 className="w-5 h-5" />}
                      {selectedOption === index && isCorrect === false && <XCircle className="w-5 h-5" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => handleAnswerSubmit(showInteraction)}
                  disabled={selectedOption === null || isCorrect !== null}
                  className="bg-cyan hover:bg-cyan2 text-bg font-bold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Check Answer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video Controls Overlay */}
        <div 
          onClick={(e) => e.stopPropagation()}
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2 pt-8 sm:p-4 sm:pt-16 md:p-6 md:pt-24 flex flex-col justify-end transition-opacity duration-300 z-20 ${showControls && showInteraction === null ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
          {/* Progress Bar with Interaction Markers */}
          <div className="relative w-full h-1 md:h-1.5 bg-white/30 rounded-full mb-2 sm:mb-4 group/progress hover:h-1.5 md:hover:h-2 transition-all flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            
            <div className="absolute left-0 h-full bg-cyan rounded-full transition-all duration-75 z-0" style={{ width: `${progress}%` }} />
            <div 
              className="absolute w-3 h-3 md:w-4 md:h-4 bg-white rounded-full shadow opacity-0 group-hover/progress:opacity-100 transition-all duration-75 z-10 -ml-1.5 md:-ml-2" 
              style={{ left: `${progress}%` }}
            />

            {/* Interaction Markers */}
            {videoDuration > 0 && data.interactions.map((interaction, idx) => {
              const pos = (interaction.time / videoDuration) * 100;
              if (isNaN(pos)) return null;
              return (
                <div
                  key={idx}
                  className={`absolute w-1.5 h-1.5 md:w-2 md:h-2 rounded-full z-10 pointer-events-none transform -translate-x-1/2 ${
                    answeredInteractions.has(idx) ? 'bg-green shadow-[0_0_8px_rgba(43,222,126,0.8)]' : 'bg-cyan shadow-[0_0_8px_rgba(0,245,228,0.8)]'
                  }`}
                  style={{ left: `${pos}%` }}
                />
              );
            })}
          </div>
          
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] md:text-sm text-white font-semibold">
            {/* Left Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-5">
              <button onClick={togglePlay} className="hover:text-cyan transition-colors">
                {isPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-6 md:h-6" fill="currentColor" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-6 md:h-6" fill="currentColor" />}
              </button>
              
              <button onClick={(e) => {e.stopPropagation(); skip(-10)}} className="hover:text-cyan transition-colors hidden sm:block relative w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" title="Skip backward 10s">
                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 absolute inset-0" />
                <span className="absolute inset-0 flex items-center justify-center text-[6px] sm:text-[7px] font-bold font-mono mt-[1px]">10</span>
              </button>
              <button onClick={(e) => {e.stopPropagation(); skip(10)}} className="hover:text-cyan transition-colors hidden sm:block relative w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" title="Skip forward 10s">
                <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 absolute inset-0" />
                <span className="absolute inset-0 flex items-center justify-center text-[6px] sm:text-[7px] font-bold font-mono mt-[1px]">10</span>
              </button>
              
              <div className="flex items-center space-x-1 sm:space-x-2 group/vol">
                <button onClick={() => setIsMuted(!isMuted)} className="hover:text-cyan transition-colors">
                  {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />}
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
              
              <span className="font-mono tracking-wider">{formatTime(currentTime)} / {formatTime(videoDuration)}</span>
            </div>
            
            {/* Right Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-5 text-white/90 relative h-6">
              <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="hover:text-cyan transition-colors flex items-center justify-center h-full" title="Fullscreen">
                <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
