import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";

interface AudioContextValue {
  playClick: () => void;
  playHover: () => void;
  muted: boolean;
  toggleMute: () => void;
}

const AudioCtx = createContext<AudioContextValue>({
  playClick: () => {},
  playHover: () => {},
  muted: false,
  toggleMute: () => {},
});

function makeAC(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {
    return null;
  }
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const [muted, setMuted] = useState(() => {
    try { return localStorage.getItem("resilient-muted") === "true"; } catch { return false; }
  });
  const acRef = useRef<AudioContext | null>(null);

  const getAC = useCallback((): AudioContext | null => {
    if (!acRef.current) acRef.current = makeAC();
    try { if (acRef.current?.state === "suspended") acRef.current.resume(); } catch {}
    return acRef.current;
  }, []);

  const playClick = useCallback(() => {
    if (muted) return;
    const ac = getAC();
    if (!ac) return;
    try {
      const len = Math.floor(ac.sampleRate * 0.045);
      const buf = ac.createBuffer(1, len, ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * 0.007));
      }
      const src = ac.createBufferSource();
      src.buffer = buf;
      const gain = ac.createGain();
      gain.gain.value = 0.16;
      src.connect(gain);
      gain.connect(ac.destination);
      src.start();
    } catch {}
  }, [muted, getAC]);

  const playHover = useCallback(() => {
    if (muted) return;
    const ac = getAC();
    if (!ac) return;
    try {
      const len = Math.floor(ac.sampleRate * 0.022);
      const buf = ac.createBuffer(1, len, ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * 0.008)) * 0.35;
      }
      const src = ac.createBufferSource();
      src.buffer = buf;
      const gain = ac.createGain();
      gain.gain.value = 0.06;
      src.connect(gain);
      gain.connect(ac.destination);
      src.start();
    } catch {}
  }, [muted, getAC]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      try { localStorage.setItem("resilient-muted", String(next)); } catch {}
      return next;
    });
  }, []);

  return (
    <AudioCtx.Provider value={{ playClick, playHover, muted, toggleMute }}>
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudio() {
  return useContext(AudioCtx);
}
