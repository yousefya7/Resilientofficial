import { useState, useEffect, useRef, useCallback } from "react";
import { Music2, Play, Pause, Volume2, VolumeX, X, ChevronUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { PublicSettings } from "@/hooks/use-public-settings";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /\/embed\/([a-zA-Z0-9_-]{11})/,
    /\/v\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

let ytApiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) { resolve(); return; }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (prev) prev(); resolve(); };
    if (!document.getElementById("yt-iframe-api")) {
      const s = document.createElement("script");
      s.id = "yt-iframe-api";
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    }
  });
  return ytApiPromise;
}

export default function MusicPlayer() {
  const [location] = useLocation();

  const { data: settings } = useQuery<PublicSettings>({
    queryKey: ["/api/settings/public"],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  const music = settings?.music;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const [needsClick, setNeedsClick] = useState(false);
  const [volume, setVolume] = useState(60);

  const playerRef = useRef<any>(null);
  const videoIdRef = useRef<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const playAttemptedRef = useRef(false);

  const isAdmin = location.startsWith("/admin");

  const destroyPlayer = useCallback(() => {
    try { playerRef.current?.destroy(); } catch {}
    playerRef.current = null;
    videoIdRef.current = null;
    playAttemptedRef.current = false;
    setPlayerReady(false);
    setIsPlaying(false);
    setNeedsClick(false);
    if (wrapperRef.current) { wrapperRef.current.remove(); wrapperRef.current = null; }
  }, []);

  useEffect(() => {
    if (isAdmin) return;
    if (!music?.enabled || !music?.youtubeUrl) { destroyPlayer(); return; }

    const videoId = extractYouTubeId(music.youtubeUrl);
    if (!videoId) return;
    if (videoId === videoIdRef.current && playerRef.current) return;

    destroyPlayer();
    videoIdRef.current = videoId;
    const vol = music.volume ?? 60;
    setVolume(vol);

    loadYouTubeApi().then(() => {
      const wrapper = document.createElement("div");
      wrapper.style.cssText =
        "position:fixed;left:-9999px;top:-9999px;width:320px;height:180px;opacity:0;pointer-events:none;z-index:-1;";
      const inner = document.createElement("div");
      inner.id = `yt-player-${Date.now()}`;
      wrapper.appendChild(inner);
      document.body.appendChild(wrapper);
      wrapperRef.current = wrapper;

      playerRef.current = new window.YT.Player(inner.id, {
        videoId,
        width: "320",
        height: "180",
        playerVars: {
          autoplay: 1,
          loop: music.loop ? 1 : 0,
          playlist: music.loop ? videoId : undefined,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          mute: 0,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (e: any) => {
            e.target.setVolume(vol);
            setPlayerReady(true);
            playAttemptedRef.current = true;
            try {
              e.target.playVideo();
            } catch {}
            setTimeout(() => {
              try {
                const state = e.target.getPlayerState();
                if (state !== 1) {
                  setNeedsClick(true);
                }
              } catch {}
            }, 1200);
          },
          onStateChange: (e: any) => {
            const YT = window.YT;
            if (!YT) return;
            if (e.data === YT.PlayerState.PLAYING) {
              setIsPlaying(true);
              setNeedsClick(false);
            } else if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) {
              setIsPlaying(false);
            }
          },
          onError: (e: any) => {
            console.warn("[MusicPlayer] YT error code:", e.data);
          },
        },
      });
    });

    return () => { destroyPlayer(); };
  }, [music?.enabled, music?.youtubeUrl, music?.loop, isAdmin, destroyPlayer]);

  useEffect(() => {
    if (!needsClick || !playerRef.current || !playerReady) return;
    const handler = () => {
      try { playerRef.current?.playVideo(); } catch {}
      setNeedsClick(false);
    };
    document.addEventListener("click", handler, { once: true });
    return () => document.removeEventListener("click", handler);
  }, [needsClick, playerReady]);

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    if (playerRef.current && playerReady) {
      try { playerRef.current.setVolume(val); } catch {}
    }
    if (val > 0 && isMuted) {
      try { playerRef.current?.unMute(); } catch {}
      setIsMuted(false);
    }
  };

  const togglePlay = () => {
    if (!playerRef.current || !playerReady) return;
    try {
      if (isPlaying) playerRef.current.pauseVideo();
      else playerRef.current.playVideo();
    } catch {}
  };

  const toggleMute = () => {
    if (!playerRef.current || !playerReady) return;
    try {
      if (isMuted) { playerRef.current.unMute(); setIsMuted(false); }
      else { playerRef.current.mute(); setIsMuted(true); }
    } catch {}
  };

  if (isAdmin) return null;
  if (!music?.enabled || !music?.youtubeUrl || isDismissed) return null;
  if (!extractYouTubeId(music.youtubeUrl)) return null;

  if (needsClick && isMinimized) {
    return (
      <div
        className="fixed bottom-6 right-6 z-[9990] cursor-pointer"
        onClick={() => {
          setIsMinimized(false);
          try { playerRef.current?.playVideo(); } catch {}
          setNeedsClick(false);
        }}
        data-testid="music-click-prompt"
      >
        <div className="w-10 h-10 border-2 border-accent-blue bg-[hsl(0_0%_4%)] flex items-center justify-center animate-pulse">
          <Music2 className="w-4 h-4 text-accent-blue" />
        </div>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div
        className="fixed bottom-6 right-6 z-[9990] flex items-center gap-2 cursor-pointer group"
        onClick={() => setIsMinimized(false)}
        data-testid="music-player-minimized"
      >
        <div className="w-10 h-10 border-2 border-border/60 bg-[hsl(0_0%_4%)] flex items-center justify-center hover:border-accent-blue transition-colors">
          <Music2 className={`w-4 h-4 ${isPlaying ? "text-accent-blue animate-pulse" : "text-muted-foreground"}`} />
        </div>
      </div>
    );
  }

  return (
    <>
      {needsClick && (
        <div
          className="fixed bottom-28 right-6 z-[9991] bg-[hsl(0_0%_6%)] border-2 border-accent-blue/60 px-3 py-2 max-w-[200px]"
          data-testid="music-autoplay-hint"
        >
          <p className="text-[10px] font-mono text-accent-blue uppercase tracking-widest">
            Click anywhere to start music
          </p>
        </div>
      )}

      <div
        className="fixed bottom-6 right-6 z-[9990] w-[220px] border-2 border-border/60 bg-[hsl(0_0%_4%)] shadow-2xl"
        data-testid="music-player"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b-2 border-border/40 bg-[hsl(0_0%_6%)]">
          <div className="flex items-center gap-2">
            <Music2 className={`w-3 h-3 ${isPlaying ? "text-accent-blue" : "text-muted-foreground"}`} />
            <span className="text-[10px] font-mono tracking-luxury uppercase text-muted-foreground">
              {!playerReady ? "Loading…" : needsClick ? "Tap to play" : isPlaying ? "Now Playing" : "Paused"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-music-minimize"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                try { if (playerRef.current && playerReady) playerRef.current.pauseVideo(); } catch {}
                setIsDismissed(true);
              }}
              className="w-5 h-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-music-close"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="px-3 py-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-[hsl(0_0%_10%)] border border-border/40 flex items-center justify-center flex-shrink-0">
              <Music2 className="w-4 h-4 text-muted-foreground/60" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest">Resilient Radio</p>
              <div className="flex items-center gap-0.5 mt-1 h-4">
                {isPlaying ? (
                  [12, 8, 14, 6, 10].map((h, i) => (
                    <div
                      key={i}
                      className="w-0.5 bg-accent-blue rounded-sm"
                      style={{
                        height: `${h}px`,
                        animation: `musicBar 0.${6 + i * 2}s ease-in-out infinite alternate`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))
                ) : (
                  [10, 6, 10, 6, 10].map((h, i) => (
                    <div key={i} className="w-0.5 bg-border/40 rounded-sm" style={{ height: `${h}px` }} />
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <button
              onClick={toggleMute}
              disabled={!playerReady}
              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors border border-border/40 hover:border-border/70 disabled:opacity-30"
              data-testid="button-music-mute"
            >
              {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
            </button>

            <button
              onClick={togglePlay}
              disabled={!playerReady}
              className="w-10 h-10 flex items-center justify-center border-2 border-accent-blue bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              data-testid="button-music-play-pause"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <div className="w-7 h-7 flex items-center justify-center">
              {!playerReady && (
                <div className="w-3 h-3 border border-muted-foreground/40 border-t-muted-foreground animate-spin" />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              disabled={!playerReady}
              className="flex-1 h-1 accent-accent-blue cursor-pointer disabled:opacity-30"
              data-testid="range-music-volume"
            />
          </div>
        </div>
      </div>
    </>
  );
}
