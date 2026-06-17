"use client";
import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 48, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1565C0" />
          <stop offset="100%" stopColor="#2196F3" />
        </linearGradient>
      </defs>
      {/* Gear */}
      <path
        d="M50 20 L54 15 L58 20 L64 18 L65 24 L71 25 L70 31 L75 35 L72 40 L76 45 L72 50 L75 55 L70 59 L71 65 L65 66 L64 72 L58 70 L54 75 L50 70 L46 75 L42 70 L36 72 L35 66 L29 65 L30 59 L25 55 L28 50 L24 45 L28 40 L25 35 L30 31 L29 25 L35 24 L36 18 L42 20 L46 15 Z"
        fill="url(#logoGrad)"
        opacity="0.15"
      />
      {/* Drilling Tower */}
      <polygon points="50,10 44,45 56,45" fill="url(#logoGrad)" />
      <rect x="44" y="45" width="12" height="4" rx="1" fill="url(#logoGrad)" />
      <line x1="47" y1="49" x2="47" y2="65" stroke="url(#logoGrad)" strokeWidth="2" />
      <line x1="53" y1="49" x2="53" y2="65" stroke="url(#logoGrad)" strokeWidth="2" />
      {/* Water drop */}
      <path
        d="M50 68 C50 68 42 78 42 83 C42 87.4 45.6 91 50 91 C54.4 91 58 87.4 58 83 C58 78 50 68 50 68Z"
        fill="url(#logoGrad)"
      />
      {/* Gear teeth */}
      <circle cx="50" cy="32" r="8" fill="url(#logoGrad)" opacity="0.6" />
      <circle cx="50" cy="32" r="4" fill="white" opacity="0.8" />
    </svg>
  );
}
