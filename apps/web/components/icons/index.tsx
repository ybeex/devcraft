"use client";

import type { ReactNode, ReactElement } from "react";

interface IconProps {
  size?: number;
  className?: string;
}

function Badge({
  size = 44, gradientId, from, to, className, children,
}: {
  size?: number; gradientId: string; from: string; to: string; className?: string; children: ReactNode;
}): ReactElement {
  return (
    <div className={`icon-badge ${className ?? ""}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
        <defs>
          <linearGradient id={gradientId} x1="4" y1="4" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
          <filter id={`${gradientId}-shadow`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1.4" stdDeviation="1.1" floodColor="#000" floodOpacity="0.35" />
          </filter>
        </defs>
        <rect x="2" y="2" width="40" height="40" rx="12" fill={`url(#${gradientId})`} />
        <ellipse cx="15" cy="12" rx="13" ry="8" fill="white" opacity="0.16" />
        <g filter={`url(#${gradientId}-shadow)`}>{children}</g>
      </svg>
    </div>
  );
}

export function MathIcon({ size, className }: IconProps): ReactElement {
  return (
    <Badge size={size} gradientId="grad-math" from="#dbb568" to="#a2762a" className={className}>
      <text x="22" y="29" fontSize="20" fontFamily="Georgia, serif" fontWeight="700" fill="#fff" textAnchor="middle">Σ</text>
    </Badge>
  );
}

export function ScissorsIcon({ size, className }: IconProps): ReactElement {
  return (
    <Badge size={size} gradientId="grad-scissors" from="#dbb568" to="#a2762a" className={className}>
      <g className="icon-scissors" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <circle cx="15" cy="14" r="2.6" />
        <circle cx="15" cy="30" r="2.6" />
        <path d="M17 15.5 L31 27" />
        <path d="M17 28.5 L31 17" />
      </g>
    </Badge>
  );
}

export function KeyboardIcon({ size, className }: IconProps): ReactElement {
  return (
    <Badge size={size} gradientId="grad-keyboard" from="#dbb568" to="#a2762a" className={className}>
      <g fill="none" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round">
        <rect x="9" y="14" width="26" height="17" rx="2.5" />
        <g fill="#fff" stroke="none">
          <rect x="12.5" y="18" width="3" height="2.6" rx="0.6" />
          <rect x="17.5" y="18" width="3" height="2.6" rx="0.6" />
          <rect x="22.5" y="18" width="3" height="2.6" rx="0.6" />
          <rect x="27.5" y="18" width="3" height="2.6" rx="0.6" />
          <rect x="12.5" y="23" width="19" height="2.6" rx="0.6" opacity="0.85" />
        </g>
      </g>
    </Badge>
  );
}

export function GitHubIcon({ size, className }: IconProps): ReactElement {
  return (
    <Badge size={size} gradientId="grad-github" from="#3a3a3a" to="#161616" className={className}>
      <path fill="#fff" d="M22 10c-6.6 0-12 5.4-12 12 0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.4-1.3-5.4-5.8 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.5-2.8 5.5-5.4 5.8.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6C30.6 31.8 34 27.3 34 22c0-6.6-5.4-12-12-12Z" />
    </Badge>
  );
}

export function LinkedInIcon({ size, className }: IconProps): ReactElement {
  return (
    <Badge size={size} gradientId="grad-linkedin" from="#2d7cd6" to="#0f4c96" className={className}>
      <g fill="#fff">
        <rect x="11" y="18" width="4.2" height="14" rx="0.6" />
        <circle cx="13.1" cy="12.5" r="2.4" />
        <path d="M19.5 18h4v2c.8-1.4 2.3-2.3 4.3-2.3 4 0 5.2 2.5 5.2 6.2V32h-4.2v-7.1c0-1.9-.7-3.1-2.3-3.1-1.6 0-2.6 1.1-2.6 3.1V32h-4.4V18Z" />
      </g>
    </Badge>
  );
}

export function TwitterIcon({ size, className }: IconProps): ReactElement {
  return (
    <Badge size={size} gradientId="grad-twitter" from="#3a3a3a" to="#161616" className={className}>
      <path fill="#fff" d="M24.5 20.3 32.6 11h-2.2l-7 8.1L17.8 11H11l8.5 12.4L11 33h2.2l7.4-8.6 5.9 8.6h6.8l-8.8-12.7Zm-2.6 3-.9-1.2-6.8-9.7h3.3l5.5 7.9.9 1.2 7.1 10.2h-3.3l-5.8-8.4Z" />
    </Badge>
  );
}

export function SunIcon({ size = 22, className }: IconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`icon-theme-glyph ${className ?? ""}`}>
      <defs>
        <radialGradient id="grad-sun" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffe8b8" />
          <stop offset="100%" stopColor="#d4ac55" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="5" fill="url(#grad-sun)" />
      <g stroke="#d4ac55" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
      </g>
    </svg>
  );
}

export function MoonIcon({ size = 22, className }: IconProps): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`icon-theme-glyph ${className ?? ""}`}>
      <defs>
        <linearGradient id="grad-moon" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f0d9c0" />
          <stop offset="100%" stopColor="#d4ac55" />
        </linearGradient>
      </defs>
      <path fill="url(#grad-moon)" d="M20.5 14.8A8.5 8.5 0 1 1 9.2 3.5a7 7 0 0 0 11.3 11.3Z" />
      <circle cx="9.5" cy="9" r="0.9" fill="#fff" opacity="0.5" />
      <circle cx="13.5" cy="15" r="0.6" fill="#fff" opacity="0.4" />
    </svg>
  );
}
