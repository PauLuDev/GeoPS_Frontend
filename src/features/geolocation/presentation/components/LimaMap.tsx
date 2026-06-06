interface Pin {
  id: string;
  x: number;
  y: number;
  discount?: string;
}

interface LimaMapProps {
  pins?: Pin[];
  activePin?: string | null;
  onPinClick?: (p: Pin) => void;
  userPos?: { x: number; y: number };
  theme?: string;
  showRadar?: boolean;
  mapStyle?: string;
}

export const LimaMap: React.FC<LimaMapProps> = ({
  pins = [], activePin = null, onPinClick = () => {},
  userPos = { x: 520, y: 360 }, showRadar = true,
}) => {
  const w = 1000, h = 700;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice"
         style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <linearGradient id="g-ocean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--map-water)"/>
          <stop offset="100%" stopColor="color-mix(in oklab, var(--map-water) 60%, var(--bg))"/>
        </linearGradient>
        <linearGradient id="g-land" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--map-bg)"/>
          <stop offset="100%" stopColor="color-mix(in oklab, var(--map-bg) 70%, var(--bg-sunken))"/>
        </linearGradient>
        <radialGradient id="g-userGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.35"/>
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0"/>
        </radialGradient>
        <pattern id="g-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.6" fill="color-mix(in oklab, var(--ink) 14%, transparent)"/>
        </pattern>
      </defs>

      <rect width={w} height={h} fill="url(#g-land)"/>
      <rect width={w} height={h} fill="url(#g-dots)" opacity="0.5"/>

      <path d={`M 0 0 L 230 0 Q 240 80 220 140 Q 200 220 240 300 Q 270 380 230 460 Q 210 540 250 620 Q 270 680 240 ${h} L 0 ${h} Z`}
            fill="url(#g-ocean)"/>
      <path d={`M 230 0 Q 240 80 220 140 Q 200 220 240 300 Q 270 380 230 460 Q 210 540 250 620 Q 270 680 240 ${h}`}
            fill="none" stroke="color-mix(in oklab, var(--ink) 18%, transparent)" strokeWidth="1.5" strokeDasharray="3 4"/>

      <g>
        <ellipse cx="430" cy="420" rx="55" ry="35" fill="var(--map-park)"/>
        <path d="M 250 280 Q 290 270 320 290 Q 310 320 270 330 Q 240 320 250 280 Z" fill="var(--map-park)"/>
        <circle cx="700" cy="180" r="22" fill="var(--map-park)"/>
        <circle cx="800" cy="500" r="28" fill="var(--map-park)"/>
        <rect x="580" y="560" width="80" height="40" rx="6" fill="var(--map-park)"/>
      </g>

      <g opacity="0.4">
        <rect x="350" y="60" width="220" height="140" fill="color-mix(in oklab, var(--map-park) 25%, transparent)" rx="2"/>
        <rect x="600" y="280" width="180" height="180" fill="color-mix(in oklab, var(--accent-2) 8%, transparent)" rx="2"/>
        <rect x="380" y="500" width="200" height="160" fill="color-mix(in oklab, var(--brand) 8%, transparent)" rx="2"/>
      </g>

      <g stroke="color-mix(in oklab, var(--ink) 12%, var(--map-streets))" fill="none" strokeLinecap="round">
        <path d="M 270 100 L 720 600" strokeWidth="14" opacity="0.5"/>
        <path d="M 270 100 L 720 600" strokeWidth="6" stroke="var(--map-streets)"/>
        <path d="M 240 320 L 1000 320" strokeWidth="12" opacity="0.5"/>
        <path d="M 240 320 L 1000 320" strokeWidth="5" stroke="var(--map-streets)"/>
        <path d="M 250 460 L 600 460" strokeWidth="10" opacity="0.5"/>
        <path d="M 250 460 L 600 460" strokeWidth="4" stroke="var(--map-streets)"/>
        <path d="M 240 540 L 900 240" strokeWidth="10" opacity="0.5"/>
        <path d="M 240 540 L 900 240" strokeWidth="4" stroke="var(--map-streets)"/>
      </g>

      <g stroke="var(--map-streets)" strokeWidth="2" fill="none" opacity="0.85">
        {[330, 380, 450, 520, 580, 640, 720, 800, 870, 940].map((x, i) => (
          <path key={`v${i}`} d={`M ${x + (i%2 ? -10 : 10)} 40 Q ${x} 200 ${x + (i%2 ? 8 : -8)} 360 Q ${x} 520 ${x - (i%2 ? 6 : -6)} 680`}/>
        ))}
        {[80, 130, 180, 240, 280, 380, 420, 500, 560, 620, 660].map((y, i) => (
          <path key={`hh${i}`} d={`M 240 ${y + (i%2 ? -3 : 3)} Q 500 ${y} 760 ${y + (i%2 ? 5 : -5)} Q 880 ${y} 1000 ${y}`}/>
        ))}
      </g>

      <g fill="color-mix(in oklab, var(--ink) 35%, transparent)" fontFamily="var(--font-mono)" fontSize="10">
        <text x="20" y="25">−12.1198° S</text>
        <text x="20" y={h - 15}>−77.0299° W</text>
        <text x={w - 110} y="25">LIMA / PE</text>
        <text x={w - 110} y={h - 15}>SCALE 1:18K</text>
      </g>

      <g transform={`translate(${w - 60} 70)`} fill="color-mix(in oklab, var(--ink) 50%, transparent)" stroke="color-mix(in oklab, var(--ink) 50%, transparent)" strokeWidth="1">
        <circle r="22" fill="none"/>
        <polygon points="0,-18 4,0 0,4 -4,0" fill="var(--brand)" stroke="none"/>
        <polygon points="0,18 4,0 0,-4 -4,0" fill="color-mix(in oklab, var(--ink) 30%, transparent)" stroke="none"/>
        <text x="0" y="-26" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" stroke="none" fill="var(--ink-3)">N</text>
      </g>

      <g transform={`translate(${userPos.x} ${userPos.y})`}>
        <circle r="120" fill="url(#g-userGlow)"/>
        {showRadar && (
          <>
            <circle r="20" fill="none" stroke="var(--brand)" strokeWidth="2" opacity="0.5">
              <animate attributeName="r" from="20" to="100" dur="2.4s" repeatCount="indefinite"/>
              <animate attributeName="opacity" from="0.5" to="0" dur="2.4s" repeatCount="indefinite"/>
            </circle>
            <circle r="20" fill="none" stroke="var(--brand)" strokeWidth="2" opacity="0.5">
              <animate attributeName="r" from="20" to="100" dur="2.4s" begin="1.2s" repeatCount="indefinite"/>
              <animate attributeName="opacity" from="0.5" to="0" dur="2.4s" begin="1.2s" repeatCount="indefinite"/>
            </circle>
          </>
        )}
        <circle r="9" fill="var(--brand)"/>
        <circle r="13" fill="none" stroke="var(--bg-elev)" strokeWidth="3"/>
      </g>

      {pins.map((p) => {
        const isActive = activePin === p.id;
        return (
          <g key={p.id} transform={`translate(${p.x} ${p.y})`}
             style={{ cursor: "pointer" }}
             onClick={(e) => { e.stopPropagation(); onPinClick(p); }}>
            {isActive && (
              <circle r="32" fill="var(--brand)" opacity="0.18">
                <animate attributeName="r" from="20" to="40" dur="1.6s" repeatCount="indefinite"/>
                <animate attributeName="opacity" from="0.35" to="0" dur="1.6s" repeatCount="indefinite"/>
              </circle>
            )}
            <g style={{ transformOrigin: "0 0", transform: isActive ? "scale(1.18)" : "scale(1)", transition: "transform 240ms cubic-bezier(.4,1.4,.5,1)" }}>
              <path d="M 0 -22 C -10 -22 -16 -14 -16 -6 C -16 4 -8 12 0 22 C 8 12 16 4 16 -6 C 16 -14 10 -22 0 -22 Z"
                    fill={isActive ? "var(--ink)" : "var(--bg-elev)"}
                    stroke="var(--ink)" strokeWidth="2"/>
              <circle cx="0" cy="-6" r="9" fill="var(--brand)" stroke="none"/>
              {p.discount && (
                <text x="0" y="-3" textAnchor="middle" fontSize="9" fontWeight="700"
                      fill="var(--brand-ink)" fontFamily="var(--font-mono)" stroke="none">
                  −{p.discount}
                </text>
              )}
            </g>
          </g>
        );
      })}
    </svg>
  );
};