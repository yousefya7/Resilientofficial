interface MarqueeProps {
  text?: string;
  className?: string;
}

export function Marquee({
  text = "RESILIENT SUPPLY \u2014 LIMITED DROP \u2014 QUALITY OBSESSED",
  className = "",
}: MarqueeProps) {
  const repeated = `${text} \u00A0\u00A0\u00A0 ${text} \u00A0\u00A0\u00A0 ${text} \u00A0\u00A0\u00A0 ${text} \u00A0\u00A0\u00A0 `;

  return (
    <div
      className={`overflow-hidden whitespace-nowrap border-y-2 border-border/30 py-4 ${className}`}
      aria-hidden="true"
      data-testid="marquee-banner"
    >
      <div
        className="inline-block font-display text-sm md:text-base italic uppercase tracking-luxury text-accent-blue/60"
        style={{
          animation: "marquee-scroll 20s linear infinite",
        }}
      >
        {repeated}
      </div>
    </div>
  );
}
