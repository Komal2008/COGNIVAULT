import React from 'react';

interface CognivaultLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  showTagline?: boolean;
  className?: string;
}

export const CognivaultLogo: React.FC<CognivaultLogoProps> = ({
  size = 'md',
  showWordmark = true,
  showTagline = false,
  className = '',
}) => {
  const dimensions = {
    sm: { icon: 24, text: 'text-sm', tag: 'text-[9px]' },
    md: { icon: 32, text: 'text-base', tag: 'text-[10px]' },
    lg: { icon: 42, text: 'text-xl', tag: 'text-xs' },
    xl: { icon: 56, text: 'text-2xl', tag: 'text-xs' },
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* A quiet geometric mark: private vault, seed and reflective orbit. */}
      <div
        className="relative shrink-0 flex items-center justify-center transition-transform hover:scale-105 duration-300"
        style={{ width: dimensions.icon, height: dimensions.icon }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Subtle Outer Vault Halo */}
          <rect
            x="4"
            y="4"
            width="40"
            height="40"
            rx="12"
            fill="#0F3D34"
            stroke="#C8A96A"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />

          {/* Interlocking Mind / Reflection Arch */}
          <path
            d="M14 24C14 18.4772 18.4772 14 24 14C29.5228 14 34 18.4772 34 24C34 29.5228 29.5228 34 24 34"
            stroke="#E6F0E9"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Vault Aperture Geometry / Secure Symmetrical Core */}
          <circle
            cx="24"
            cy="24"
            r="6"
            fill="#134E43"
            stroke="#C8A96A"
            strokeWidth="2"
          />

          {/* Central AI Spark / Radiant Intellect Point */}
          <circle
            cx="24"
            cy="24"
            r="2.2"
            fill="#C8A96A"
          />

          {/* Reflective Radiance Dots */}
          <circle cx="24" cy="10" r="1.5" fill="#C8A96A" />
          <circle cx="24" cy="38" r="1.5" fill="#C8A96A" />
          <circle cx="10" cy="24" r="1.5" fill="#6F8178" />
          <circle cx="38" cy="24" r="1.5" fill="#6F8178" />
        </svg>
      </div>

      {showWordmark && (
        <div className="flex flex-col select-none">
          <span
            className={`font-serif tracking-[0.18em] font-semibold text-[#0F3D34] leading-tight ${dimensions.text}`}
          >
            COGNIVAULT
          </span>
          {showTagline && (
            <span
              className={`font-sans uppercase tracking-[0.2em] font-medium text-[#6F8178] ${dimensions.tag}`}
            >
              INTELLIGENT REFLECTION VAULT
            </span>
          )}
        </div>
      )}
    </div>
  );
};
