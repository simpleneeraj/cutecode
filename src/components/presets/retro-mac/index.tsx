import { Icon } from "@iconify/react";
import { BaseFrameProps } from "@/typings/presets";

const RetroMacFrame = ({
  padding,
  darkMode,
  transparent,
  fileName,
  themeBackground,
  backgroundImage,
  onFileNameChange,
  children,
}: BaseFrameProps) => {
  const cardBg = darkMode ? "#2A1E12" : "#D4AE80";
  const cardBorder = darkMode ? "#1A110A" : "#B8956A";
  const titleBarBorder = darkMode ? "rgba(255,255,255,0.07)" : "rgba(90,55,20,0.25)";
  const appleColor = darkMode ? "#C4905A" : "#2C1A0C";
  const titleColor = darkMode ? "#C4A070" : "#4A3018";
  const heartColor = darkMode ? "#C07840" : "#A86030";

  return (
    <div
      className="relative transition-[padding] duration-200"
      style={{
        padding,
        backgroundImage: transparent ? (backgroundImage ? `url("${backgroundImage}")` : themeBackground) : undefined,
        backgroundSize: backgroundImage ? "cover" : undefined,
        backgroundPosition: backgroundImage ? "center" : undefined,
      }}
    >
      {/* Transparent checker pattern */}
      {!transparent && (
        <div
          data-ignore-in-export
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #1d1d1d 25%, transparent 0),
              linear-gradient(-45deg, #1d1d1d 25%, transparent 0),
              linear-gradient(45deg, transparent 75%, #1d1d1d 0),
              linear-gradient(-45deg, transparent 75%, #1d1d1d 0)
            `,
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
          }}
        />
      )}

      {/* The single parchment card */}
      <div
        className="relative flex min-h-[100px] flex-col overflow-hidden rounded-[10px]"
        style={{
          backgroundColor: cardBg,
          boxShadow: transparent
            ? `0 0 0 1.5px ${cardBorder}, 0 20px 60px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.35)`
            : `0 0 0 1.5px ${cardBorder}`,
        }}
      >
        {/* Subtle paper grain overlay */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-[10px]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Title bar — Apple left, title center */}
        <div
          className="relative z-20 flex h-[38px] items-center px-4"
          style={{ borderBottom: `1px solid ${titleBarBorder}` }}
        >
          {/* Apple logo — top left */}
          <div className="flex items-center">
            <Icon icon="mingcute:apple-fill" style={{ fill: appleColor }} className="size-5" />
          </div>

          {/* Filename — center */}
          <div className="relative flex flex-1 items-center justify-center">
            <input
              type="text"
              value={fileName}
              onChange={(e) => onFileNameChange(e.target.value)}
              spellCheck={false}
              tabIndex={-1}
              className="border-none bg-transparent text-center text-[12.5px] font-[600] tracking-[0.15px] outline-none"
              style={{
                color: titleColor,
                fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
              }}
            />
            {fileName.length === 0 && (
              <span
                data-ignore-in-export
                className="pointer-events-none absolute text-[12.5px] font-[600] tracking-[0.15px] opacity-60"
                style={{
                  color: titleColor,
                  fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                Dream.swift
              </span>
            )}
          </div>

          {/* Right spacer */}
          <div className="w-[60px]" />
        </div>

        {/* Code area */}
        <div className="relative z-20 flex-1 pb-8">
          {children}

          {/* Pixel heart — bottom right like image 2 */}
          <div className="absolute bottom-4 right-4" style={{ color: heartColor }}>
            <Icon icon="pixelarticons:heart" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetroMacFrame;
