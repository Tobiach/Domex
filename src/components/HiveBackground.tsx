import React from 'react';

const HONEY   = '#D4900A';
const CYBER   = '#00D4FF';
const DARK    = '#120D04';

function RoboticBee({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Wings — cyan translucent */}
      <ellipse cx="7" cy="12" rx="7" ry="4" fill={CYBER} opacity="0.22" style={{ transformOrigin: '14px 14px', animation: 'bee-wing 0.18s ease-in-out infinite' }} />
      <ellipse cx="7" cy="18" rx="6" ry="3" fill={CYBER} opacity="0.15" style={{ transformOrigin: '14px 14px', animation: 'bee-wing 0.18s ease-in-out infinite 0.04s' }} />
      <ellipse cx="23" cy="12" rx="7" ry="4" fill={CYBER} opacity="0.22" style={{ transformOrigin: '14px 14px', animation: 'bee-wing 0.18s ease-in-out infinite' }} />
      <ellipse cx="23" cy="18" rx="6" ry="3" fill={CYBER} opacity="0.15" style={{ transformOrigin: '14px 14px', animation: 'bee-wing 0.18s ease-in-out infinite 0.04s' }} />

      {/* Body — hexagonal */}
      <polygon points="15,4 22,8 22,20 15,24 8,20 8,8" fill={HONEY} opacity="0.85" />

      {/* Stripes */}
      <line x1="8" y1="13" x2="22" y2="13" stroke={DARK} strokeWidth="1.5" opacity="0.5" />
      <line x1="8.5" y1="17" x2="21.5" y2="17" stroke={DARK} strokeWidth="1" opacity="0.35" />

      {/* Circuit lines */}
      <line x1="11" y1="15" x2="19" y2="15" stroke={CYBER} strokeWidth="0.5" opacity="0.4" />

      {/* Eyes */}
      <circle cx="12" cy="10" r="1.5" fill={CYBER} />
      <circle cx="18" cy="10" r="1.5" fill={CYBER} />
      <circle cx="12" cy="10" r="0.6" fill="white" opacity="0.6" />
      <circle cx="18" cy="10" r="0.6" fill="white" opacity="0.6" />

      {/* Antenna */}
      <line x1="12.5" y1="4.5" x2="10" y2="1" stroke={HONEY} strokeWidth="0.8" />
      <line x1="17.5" y1="4.5" x2="20" y2="1" stroke={HONEY} strokeWidth="0.8" />
      <circle cx="10" cy="1" r="1.2" fill={CYBER} />
      <circle cx="20" cy="1" r="1.2" fill={CYBER} />

      {/* Stinger */}
      <polygon points="15,24 13,28 17,28" fill={HONEY} opacity="0.6" />
    </svg>
  );
}

const BEES = [
  { top: '12%',  left: '8%',   size: 22, opacity: 0.18, anim: 'bee-float-1', dur: '18s', delay: '0s'   },
  { top: '28%',  left: '85%',  size: 18, opacity: 0.14, anim: 'bee-float-2', dur: '24s', delay: '6s'   },
  { top: '60%',  left: '5%',   size: 26, opacity: 0.16, anim: 'bee-float-3', dur: '20s', delay: '3s'   },
  { top: '72%',  left: '88%',  size: 20, opacity: 0.13, anim: 'bee-float-4', dur: '22s', delay: '10s'  },
];

export default function HiveBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {BEES.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: b.top,
            left: b.left,
            opacity: b.opacity,
            animation: `${b.anim} ${b.dur} ease-in-out infinite ${b.delay}`,
            filter: `drop-shadow(0 0 4px rgba(212,144,10,0.4))`,
          }}
        >
          <RoboticBee size={b.size} />
        </div>
      ))}
    </div>
  );
}
