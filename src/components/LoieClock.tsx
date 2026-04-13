import { useEffect, useState } from "react";

const DAYS_PT = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function LoieClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const h = now.getHours();
  const ampm = h < 12 ? "AM" : "PM";

  return (
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
        {/* Left column: day abbreviation (top) + R circle (bottom) */}
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

          {/* R circle emblem */}
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              border: "1.5px solid rgba(41,36,31,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-cormorant, 'Cormorant Garamond', serif)",
              fontSize: "15px",
              flexShrink: 0,
            }}
          >
            R
          </div>
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
  );
}
