"use client";

import React from "react";

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function Logo({ size = 40, className = "", showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`} style={{ direction: "rtl" }}>
      {/* Logo SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Background Circle */}
        <circle cx="50" cy="50" r="48" fill="#5f9ea0" />
        
        {/* Inner decoration */}
        <circle cx="50" cy="50" r="42" fill="#fcfbf7" />
        
        {/* Handshake Icon - Two hands meeting */}
        {/* Left Hand */}
        <path
          d="M28 52 C28 48, 32 44, 36 46 L42 50 C44 52, 44 56, 42 58 L38 62 C36 64, 32 64, 30 62 L26 58 C24 56, 24 54, 28 52 Z"
          fill="#5f9ea0"
          stroke="#4a7d7f"
          strokeWidth="1.5"
        />
        
        {/* Right Hand */}
        <path
          d="M72 52 C72 48, 68 44, 64 46 L58 50 C56 52, 56 56, 58 58 L62 62 C64 64, 68 64, 70 62 L74 58 C76 56, 76 54, 72 52 Z"
          fill="#5f9ea0"
          stroke="#4a7d7f"
          strokeWidth="1.5"
        />
        
        {/* Heart in the middle */}
        <path
          d="M50 38 C50 34, 46 32, 44 34 C42 36, 42 40, 50 48 C58 40, 58 36, 56 34 C54 32, 50 34, 50 38 Z"
          fill="#d980a0"
        />
        
        {/* Envelope lines suggesting message */}
        <path
          d="M35 72 L50 62 L65 72"
          stroke="#5f9ea0"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M35 72 L65 72"
          stroke="#5f9ea0"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Small decorative dots */}
        <circle cx="20" cy="50" r="3" fill="#d4af37" />
        <circle cx="80" cy="50" r="3" fill="#d4af37" />
      </svg>

      {/* Text */}
      {showText && (
        <span className="font-bold text-lg" style={{ color: "var(--primary)" }}>
          المسامح كريم
        </span>
      )}
    </div>
  );
}
