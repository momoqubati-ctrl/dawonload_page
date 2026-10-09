import React from 'react';

interface ShabakatiLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
}

export const ShabakatiLogo: React.FC<ShabakatiLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  // Determine dimensions based on size
  const dimensions = {
    sm: { width: 44, height: 44, textClass: 'text-sm' },
    md: { width: 80, height: 80, textClass: 'text-lg' },
    lg: { width: 140, height: 140, textClass: 'text-2xl' },
    xl: { width: 220, height: 220, textClass: 'text-3xl' },
    hero: { width: 340, height: 340, textClass: 'text-4xl' },
  }[size];

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {/* SVG Icon Artwork faithful to the uploaded image */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_10px_35px_rgba(0,180,216,0.35)] transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Main Background Gradient */}
          <radialGradient id="bgGlow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#1249A8" />
            <stop offset="55%" stopColor="#08256E" />
            <stop offset="100%" stopColor="#030C2E" />
          </radialGradient>

          {/* Sweeping Light Neon Cyan Gradient */}
          <linearGradient id="neonCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          {/* Ring Glow */}
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A5F3FC" />
            <stop offset="40%" stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>

          {/* Card Gradients */}
          {/* 1. Office Red */}
          <linearGradient id="cardRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>
          {/* 2. Windows Blue */}
          <linearGradient id="cardBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          {/* 3. Security Green */}
          <linearGradient id="cardGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
          {/* 4. Game Purple */}
          <linearGradient id="cardPurple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#6B21A8" />
          </linearGradient>
          {/* 5. Steam Dark */}
          <linearGradient id="cardDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          {/* Hexagon White Gloss Gradient */}
          <linearGradient id="hexGloss" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#BAE6FD" />
          </linearGradient>

          {/* Hexagon Center Dark Blue Fill */}
          <radialGradient id="hexCenter" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00E5FF" />
            <stop offset="40%" stopColor="#0369A1" />
            <stop offset="100%" stopColor="#082F6D" />
          </radialGradient>

          {/* Filter for Glow */}
          <filter id="neonBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. App Icon Rounded Container */}
        <rect width="512" height="512" rx="112" fill="url(#bgGlow)" />
        <rect
          width="508"
          height="508"
          x="2"
          y="2"
          rx="110"
          stroke="url(#neonCyan)"
          strokeWidth="3"
          strokeOpacity="0.4"
        />

        {/* Curved Flowing Background Ambient Light Streaks */}
        <path
          d="M-40 180 Q 200 40 540 220"
          stroke="#00E5FF"
          strokeWidth="18"
          strokeOpacity="0.15"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M-20 420 Q 300 280 530 460"
          stroke="#38BDF8"
          strokeWidth="14"
          strokeOpacity="0.18"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M60 480 Q 256 360 450 490"
          stroke="#00E5FF"
          strokeWidth="8"
          strokeOpacity="0.25"
          fill="none"
          strokeLinecap="round"
        />

        {/* ============================================================ */}
        {/* 2. Top Fan of 5 Service Cards                                */}
        {/* ============================================================ */}
        <g id="cards-fan">
          {/* Card 1: Left Red (Office) - Tilted -24 deg */}
          <g transform="translate(112, 175) rotate(-24)">
            <rect
              x="-42"
              y="-56"
              width="84"
              height="112"
              rx="22"
              fill="url(#cardRed)"
              stroke="#FCA5A5"
              strokeWidth="3.5"
            />
            {/* White Stylized Office 'O' Icon */}
            <rect
              x="-22"
              y="-28"
              width="44"
              height="56"
              rx="10"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="9"
            />
          </g>

          {/* Card 2: Mid-Left Blue (Windows) - Tilted -12 deg */}
          <g transform="translate(178, 142) rotate(-12)">
            <rect
              x="-42"
              y="-56"
              width="84"
              height="112"
              rx="22"
              fill="url(#cardBlue)"
              stroke="#BAE6FD"
              strokeWidth="3.5"
            />
            {/* 4 Windows square tiles */}
            <g transform="translate(-18, -18)">
              <rect x="0" y="0" width="16" height="16" rx="3.5" fill="#FFFFFF" />
              <rect x="20" y="0" width="16" height="16" rx="3.5" fill="#FFFFFF" />
              <rect x="0" y="20" width="16" height="16" rx="3.5" fill="#FFFFFF" />
              <rect x="20" y="20" width="16" height="16" rx="3.5" fill="#FFFFFF" />
            </g>
          </g>

          {/* Card 3: Center Green (Security Shield) - Upright */}
          <g transform="translate(256, 126)">
            <rect
              x="-42"
              y="-56"
              width="84"
              height="112"
              rx="22"
              fill="url(#cardGreen)"
              stroke="#A7F3D0"
              strokeWidth="3.5"
            />
            {/* Shield Icon with Checkmark */}
            <path
              d="M-20 -18 C-10 -20 10 -20 20 -18 C20 4 10 20 0 25 C-10 20 -20 4 -20 -18 Z"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <path
              d="M-8 2 L-2 8 L9 -4"
              stroke="#FFFFFF"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>

          {/* Card 4: Mid-Right Purple (Gaming Controller) - Tilted +12 deg */}
          <g transform="translate(334, 142) rotate(12)">
            <rect
              x="-42"
              y="-56"
              width="84"
              height="112"
              rx="22"
              fill="url(#cardPurple)"
              stroke="#E9D5FF"
              strokeWidth="3.5"
            />
            {/* Gamepad Icon */}
            <g transform="translate(0, 0)">
              <rect
                x="-24"
                y="-14"
                width="48"
                height="28"
                rx="14"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="5"
              />
              {/* D-Pad */}
              <line x1="-14" y1="-4" x2="-8" y2="-4" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
              <line x1="-11" y1="-7" x2="-11" y2="-1" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
              {/* Buttons */}
              <circle cx="8" cy="-5" r="2.5" fill="#FFFFFF" />
              <circle cx="14" cy="-2" r="2.5" fill="#FFFFFF" />
            </g>
          </g>

          {/* Card 5: Right Dark (Steam) - Tilted +24 deg */}
          <g transform="translate(400, 175) rotate(24)">
            <rect
              x="-42"
              y="-56"
              width="84"
              height="112"
              rx="22"
              fill="url(#cardDark)"
              stroke="#CBD5E1"
              strokeWidth="3.5"
            />
            {/* Steam Valve / Piston Gear Icon */}
            <circle cx="6" cy="-8" r="12" fill="none" stroke="#FFFFFF" strokeWidth="5" />
            <circle cx="6" cy="-8" r="5" fill="#FFFFFF" />
            <line x1="-12" y1="12" x2="0" y2="-2" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
            <circle cx="-14" cy="14" r="8" fill="none" stroke="#FFFFFF" strokeWidth="4" />
          </g>
        </g>

        {/* ============================================================ */}
        {/* 3. Central Hexagonal Emblem & Wi-Fi Icon                     */}
        {/* ============================================================ */}
        <g id="central-hex" transform="translate(256, 280)">
          {/* Hexagon White Glossy Outer Frame */}
          <polygon
            points="0,-82 72,-40 72,42 0,84 -72,42 -72,-40"
            fill="url(#hexGloss)"
            stroke="#FFFFFF"
            strokeWidth="7"
            strokeLinejoin="round"
          />

          {/* Inner Dark Blue & Cyan Hexagon Base */}
          <polygon
            points="0,-68 58,-34 58,34 0,68 -58,34 -58,-34"
            fill="url(#hexCenter)"
            stroke="#00E5FF"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Wi-Fi Signal Symbol (Turquoise & White) */}
          <g transform="translate(0, 6)">
            {/* Outer Arc */}
            <path
              d="M-36 -22 C-18 -38 18 -38 36 -22"
              stroke="#00E5FF"
              strokeWidth="8.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Middle Arc */}
            <path
              d="M-24 -9 C-12 -20 12 -20 24 -9"
              stroke="#00E5FF"
              strokeWidth="8.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Inner Arc */}
            <path
              d="M-12 4 C-6 -2 6 -2 12 4"
              stroke="#00E5FF"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />
            {/* Central Broadcast Node Dot */}
            <circle cx="0" cy="18" r="8.5" fill="#00E5FF" />
            <circle cx="0" cy="18" r="3.5" fill="#FFFFFF" />
          </g>
        </g>

        {/* ============================================================ */}
        {/* 4. Glowing Cyan Orbital Ring wrapping the Hexagon            */}
        {/* ============================================================ */}
        <g id="orbital-ring" transform="translate(256, 275) rotate(-14)" filter="url(#neonBlur)">
          <ellipse
            cx="0"
            cy="0"
            rx="155"
            ry="45"
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="15"
            strokeLinecap="round"
          />
        </g>
        {/* Crisp foreground layer of the ring */}
        <g transform="translate(256, 275) rotate(-14)">
          <ellipse
            cx="0"
            cy="0"
            rx="155"
            ry="45"
            fill="none"
            stroke="#A5F3FC"
            strokeWidth="5"
            strokeOpacity="0.95"
            strokeLinecap="round"
          />
        </g>

        {/* ============================================================ */}
        {/* 5. Arabic Brand Typography (Rendered on 512px canvas)       */}
        {/* ============================================================ */}
        <g id="brand-text" transform="translate(256, 410)">
          {/* Main Title: بوابة شبكتي */}
          <text
            x="0"
            y="0"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="54"
            fontWeight="900"
            fontFamily="'Cairo', system-ui, sans-serif"
            className="drop-shadow-[0_4px_16px_rgba(0,229,255,0.7)]"
          >
            بوابة شبكتي
          </text>

          {/* Subtitle Accent Bar: — للخدمات الرقمية — */}
          <g transform="translate(0, 34)">
            {/* Left Cyan Line */}
            <line x1="-165" y1="-8" x2="-95" y2="-8" stroke="#00E5FF" strokeWidth="4.5" strokeLinecap="round" />
            {/* Subtitle Text */}
            <text
              x="0"
              y="0"
              textAnchor="middle"
              fill="#E2E8F0"
              fontSize="24"
              fontWeight="700"
              letterSpacing="0.5"
              fontFamily="'Cairo', system-ui, sans-serif"
            >
              للخدمات الرقمية
            </text>
            {/* Right Cyan Line */}
            <line x1="95" y1="-8" x2="165" y2="-8" stroke="#00E5FF" strokeWidth="4.5" strokeLinecap="round" />
          </g>
        </g>
      </svg>

      {/* Optional HTML Label when used as a standard brand component */}
      {showText && (
        <div className="mt-2 text-center">
          <h1
            className={`font-black tracking-tight text-white ${dimensions.textClass}`}
            style={{ textWrap: 'balance' }}
          >
            تطبيق شبكتي للخدمات الرقمية
          </h1>
          <p className="text-xs text-cyan-300 font-medium tracking-wide">
            بوابة اشتراكات الذكاء الاصطناعي والكورسات والأفلام والتصاميم
          </p>
        </div>
      )}
    </div>
  );
};
