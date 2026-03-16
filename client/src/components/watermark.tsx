interface WatermarkProps {
  text?: string;
  className?: string;
}

export function Watermark({ text = "RESILIENT", className = "" }: WatermarkProps) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute whitespace-nowrap font-display text-[12rem] md:text-[18rem] uppercase tracking-widest text-accent-blue"
        style={{
          opacity: 0.03,
          animation: "watermark-drift 30s ease-in-out infinite",
          top: "50%",
          left: "50%",
          marginTop: "-6rem",
          marginLeft: "-20rem",
        }}
      >
        {text}
      </div>
    </div>
  );
}
