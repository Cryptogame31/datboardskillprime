import React, { useRef, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getDriveEmbedUrl, isGoogleDriveUrl, isVimeoUrl, isYoutubeUrl } from '../utils/driveMapper';
import AccessBlocked from './user/AccessBlocked';
import { 
  Play, Pause, Volume2, VolumeX, Maximize2, 
  ArrowLeft, RotateCcw, RotateCw
} from 'lucide-react';

export default function VideoPlayer() {
  const { activeVideo, activeCourse, closeVideo, currentUser } = useApp();
  const [showBlocked, setShowBlocked] = useState(false);
  
  // Custom Controls State
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeoutRef = useRef(null);

  // Check subscription status
  const isSubscriberBlocked = currentUser?.status === 'inactive';

  useEffect(() => {
    if (activeVideo && isSubscriberBlocked) {
      setShowBlocked(true);
    } else {
      setShowBlocked(false);
    }
  }, [activeVideo, currentUser, isSubscriberBlocked]);

  // Handle Controls Visibility on Mouse Move
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying]);

  if (!activeVideo) return null;

  // Show access blocked screen if subscription is expired
  if (showBlocked) {
    return <AccessBlocked onClose={closeVideo} />;
  }

  // Play/Pause handler
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.log('Playback error:', err));
    }
  };

  // Skip time forward/backward
  const skipTime = (amount) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(
      Math.max(0, videoRef.current.currentTime + amount),
      duration
    );
  };

  // Progress update handler
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  // Seek timeline scrubber
  const handleSeek = (e) => {
    if (!videoRef.current) return;
    const seekTime = parseFloat(e.target.value);
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // Volume handler
  const handleVolumeChange = (e) => {
    if (!videoRef.current) return;
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    videoRef.current.volume = vol;
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const newMute = !isMuted;
    setIsMuted(newMute);
    videoRef.current.muted = newMute;
  };

  // Speed changer
  const handleSpeedChange = (speed) => {
    if (!videoRef.current) return;
    setPlaybackSpeed(speed);
    videoRef.current.playbackRate = speed;
  };

  // Fullscreen trigger
  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.log('Fullscreen error:', err));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false));
    }
  };

  // Formatter for elapsed time
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Is the file a PDF document?
  const isPdf = activeVideo.url?.toLowerCase().split('?')[0].endsWith('.pdf') || 
                activeVideo.driveUrl?.toLowerCase().split('?')[0].endsWith('.pdf');

  // Is the video hosted on Google Drive, Vimeo, or YouTube?
  const isIframeVideo = isGoogleDriveUrl(activeVideo.url) || 
                        isGoogleDriveUrl(activeVideo.driveUrl) ||
                        isVimeoUrl(activeVideo.url) ||
                        isVimeoUrl(activeVideo.driveUrl) ||
                        isYoutubeUrl(activeVideo.url) ||
                        isYoutubeUrl(activeVideo.driveUrl);
  const iframeEmbedUrl = isIframeVideo ? getDriveEmbedUrl(activeVideo.driveUrl || activeVideo.url) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
      {/* Top Header bar */}
      <div className="absolute top-0 inset-x-0 p-4 md:p-6 bg-gradient-to-b from-black/85 to-transparent flex items-center justify-between z-30 transition-opacity duration-300">
        <button
          onClick={closeVideo}
          className="flex items-center gap-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer backdrop-blur-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Catálogo
        </button>
        
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold tracking-widest text-brand-red mb-0.5 block">
            {isPdf ? 'Documento de:' : 'Reproduciendo de:'} {activeCourse?.title}
          </span>
          <h2 className="text-sm md:text-base font-black text-white">{activeVideo.title}</h2>
        </div>
      </div>

      {/* Main Video Window / Document Viewer */}
      {isPdf ? (
        /* PDF Viewer inside Aspect Box */
        <div className="w-full h-full max-h-[85vh] md:max-h-[90vh] aspect-video relative flex items-center justify-center p-4">
          <iframe
            src={activeVideo.url || activeVideo.driveUrl}
            className="w-full h-full border-0 rounded-2xl shadow-2xl bg-white"
            title={activeVideo.title}
          ></iframe>
          {/* Helpful overlay note for users */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-brand-surface/90 border border-white/10 py-1.5 px-4 rounded-full text-[10px] text-gray-400 text-center glass-panel">
            Visor de Documento PDF - Controles de navegación provistos por tu navegador.
          </div>
        </div>
      ) : isIframeVideo && iframeEmbedUrl ? (
        /* Google Drive or Vimeo Embedded Player inside Aspect Box */
        <div className="w-full h-full max-h-[85vh] md:max-h-[90vh] aspect-video relative flex items-center justify-center p-4">
          <iframe
            src={iframeEmbedUrl}
            className="w-full h-full border-0 rounded-2xl shadow-2xl"
            allow="autoplay; fullscreen"
            allowFullScreen
            title={activeVideo.title}
          ></iframe>
          {/* Helpful overlay note for users */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-brand-surface/90 border border-white/10 py-1.5 px-4 rounded-full text-[10px] text-gray-400 text-center glass-panel">
            {iframeEmbedUrl.includes('vimeo') 
              ? 'Reproductor Vimeo CDN - Transmisión de alta velocidad optimizada.' 
              : iframeEmbedUrl.includes('youtube')
              ? 'Reproductor YouTube (Oculto) - Transmisión rápida optimizada.'
              : 'Google Drive Iframe Embebido - Controles provistos por Google. Usa el botón "Volver" arriba para salir.'}
          </div>
        </div>
      ) : (
        /* HTML5 Custom Video Player */
        <div 
          ref={playerContainerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => isPlaying && setShowControls(false)}
          className="relative w-full h-full max-h-[90vh] aspect-video flex items-center justify-center group overflow-hidden bg-black"
        >
          <video
            ref={videoRef}
            src={activeVideo.url}
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            onCanPlay={() => setIsBuffering(false)}
            preload="auto"
            className="w-full h-full object-contain cursor-pointer"
            playsInline
          />

          {/* Buffering Indicator Spinner */}
          {isBuffering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45 z-30">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-cyan"></div>
            </div>
          )}

          {/* Large Center Play/Pause Overlay */}
          {!isPlaying && !isBuffering && (
            <button
              onClick={togglePlay}
              className="absolute p-6 rounded-full bg-brand-red text-white hover:scale-110 transition-all shadow-2xl cursor-pointer z-20"
            >
              <Play className="w-10 h-10 fill-white ml-1" />
            </button>
          )}

          {/* Player controls layout */}
          <div 
            className={`absolute bottom-0 inset-x-0 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-4 z-20 transition-all duration-300 ${
              showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            {/* Scrubber Timeline */}
            <div className="flex items-center gap-3 w-full">
              <span className="text-[10px] font-bold text-gray-300 font-mono">
                {formatTime(currentTime)}
              </span>
              
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-brand-red focus:outline-none"
              />
              
              <span className="text-[10px] font-bold text-gray-300 font-mono">
                {formatTime(duration)}
              </span>
            </div>

            {/* Bottom Controls Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Play / Pause */}
                <button 
                  onClick={togglePlay}
                  className="text-white hover:text-brand-red transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                </button>

                {/* Rewind / Fast Forward */}
                <button 
                  onClick={() => skipTime(-10)} 
                  className="text-white/80 hover:text-white transition-colors cursor-pointer"
                  title="Retroceder 10s"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => skipTime(10)} 
                  className="text-white/80 hover:text-white transition-colors cursor-pointer"
                  title="Adelantar 10s"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                {/* Volume Section */}
                <div className="flex items-center gap-2 group/volume ml-2">
                  <button 
                    onClick={toggleMute}
                    className="text-white hover:text-brand-red transition-colors cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-brand-red focus:outline-none hidden group-hover/volume:block transition-all"
                  />
                </div>
              </div>

              {/* Right Settings (Speed & Fullscreen) */}
              <div className="flex items-center gap-4">
                {/* Playback speed selector */}
                <div className="flex items-center gap-1.5 bg-white/10 px-2 py-1 rounded-lg">
                  <span className="text-[9px] font-bold text-gray-400 mr-1 uppercase">Velocidad</span>
                  {[0.5, 1, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`text-[10px] font-black px-1.5 py-0.5 rounded transition-all cursor-pointer ${
                        playbackSpeed === speed 
                          ? 'bg-brand-red text-white' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                {/* Maximize */}
                <button 
                  onClick={toggleFullscreen}
                  className="text-white hover:text-brand-red transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
