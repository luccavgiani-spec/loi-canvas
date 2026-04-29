import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const DAYS_PT = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function AnalogClock({ now }: { now: Date }) {
  const h = now.getHours() % 12;
  const m = now.getMinutes();
  const s = now.getSeconds();

  // Angles in radians, 12 o'clock = 0
  const hourAngle = ((h + m / 60 + s / 3600) / 12) * 2 * Math.PI;
  const minuteAngle = ((m + s / 60) / 60) * 2 * Math.PI;

  const cx = 17;
  const cy = 17;
  const hourLen = 7;
  const minuteLen = 11;

  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 34 34"
      style={{ flexShrink: 0, display: "block" }}
    >
      {/* Face border */}
      <circle
        cx={cx}
        cy={cy}
        r="15.5"
        fill="none"
        stroke="rgba(41,36,31,0.5)"
        strokeWidth="1.5"
      />
      {/* Hour hand */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + hourLen * Math.sin(hourAngle)}
        y2={cy - hourLen * Math.cos(hourAngle)}
        stroke="#29241f"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Minute hand */}
      <line
        x1={cx}
        y1={cy}
        x2={cx + minuteLen * Math.sin(minuteAngle)}
        y2={cy - minuteLen * Math.cos(minuteAngle)}
        stroke="#29241f"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Center dot */}
      <circle cx={cx} cy={cy} r="1.5" fill="#29241f" />
    </svg>
  );
}

interface HeroClockProps {
  /** Override default positioning (Tailwind classes). Default reproduz a posição da hero da home. */
  className?: string;
}

export function HeroClock({ className }: HeroClockProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = now.getHours();
  const ampm = h < 12 ? "AM" : "PM";

  return (
    <div className={cn("absolute top-[calc(5rem+16px)] left-8 z-20", className)}>
      <div
        style={{
          background: "rgba(244,237,210,0.92)",
          borderRadius: "14px",
          padding: "18px 20px 16px",
          width: "160px",
          boxSizing: "border-box",
          color: "#29241f",
        }}
      >
        {/* Year */}
        <div
          style={{
            fontFamily: "var(--font-sackers, 'Sackers Gothic Std', sans-serif)",
            fontSize: "13px",
            letterSpacing: "0.22em",
            textAlign: "center",
            paddingBottom: "10px",
            borderBottom: "1px solid rgba(41,36,31,0.25)",
            lineHeight: 1,
          }}
        >
          {now.getFullYear()}
        </div>

        {/* Body — two columns */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "stretch",
            paddingTop: "10px",
            gap: "6px",
          }}
        >
          {/* Left column: day abbreviation (top) + analog clock (bottom) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            {/* Day abbreviation + AM/PM */}
            <div
              style={{
                fontFamily: "var(--font-sackers, 'Sackers Gothic Std', sans-serif)",
                fontSize: "11px",
                letterSpacing: "0.2em",
                lineHeight: 1,
              }}
            >
              {DAYS_PT[now.getDay()]}
              <span
                style={{
                  fontSize: "8px",
                  opacity: 0.65,
                  verticalAlign: "super",
                  marginLeft: "2px",
                }}
              >
                {ampm}
              </span>
            </div>

            {/* Analog clock */}
            <AnalogClock now={now} />
          </div>

          {/* Right column: large day number (top) + month name (bottom) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            {/* Day number */}
            <div
              style={{
                fontFamily: "var(--font-cormorant, 'Cormorant Garamond', serif)",
                fontSize: "58px",
                fontWeight: 300,
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {now.getDate()}
            </div>

            {/* Month */}
            <div
              style={{
                fontFamily: "var(--font-sackers, 'Sackers Gothic Std', sans-serif)",
                fontSize: "11px",
                letterSpacing: "0.22em",
                lineHeight: 1,
                paddingBottom: "2px",
              }}
            >
              {MONTHS_PT[now.getMonth()].toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
