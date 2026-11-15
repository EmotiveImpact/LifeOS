import React from 'react';
import { DynamicIsland } from './DynamicIsland';

interface IPhoneFrameProps {
  expandedIsland: boolean;
  scanText: string;
  flashTrigger: number;
  darkSurface?: boolean;
  onIslandTap?: () => void;
  children: React.ReactNode;
}

export const IPhoneFrame: React.FC<IPhoneFrameProps> = ({
  expandedIsland,
  scanText,
  flashTrigger,
  darkSurface = false,
  onIslandTap,
  children,
}) => {
  return (
    <div className="relative mx-auto flex w-full items-center justify-center select-none sm:w-auto">
      {/* Native full-bleed phone viewport on actual mobile screens (< sm) */}
      <div
        className={`relative h-[100dvh] w-full overflow-hidden sm:hidden ${
          darkSurface ? 'bg-[#0C0C0F]' : 'bg-white'
        }`}
      >
        <div className="h-full w-full overflow-hidden">{children}</div>
      </div>

      {/* Studio Natural Titanium iPhone container on sm+ screens */}
      <div className="relative hidden items-center justify-center sm:flex">
        {/* Sculpted Natural Titanium Side Buttons (pure metallic shading, zero border strokes) */}
        <div className="pointer-events-none absolute -left-[3px] top-[128px] h-[26px] w-[3px] rounded-l-full bg-gradient-to-b from-[#6B675E] to-[#3A3833]" />
        <div className="pointer-events-none absolute -left-[3px] top-[174px] h-[48px] w-[3px] rounded-l-full bg-gradient-to-b from-[#6B675E] to-[#3A3833]" />
        <div className="pointer-events-none absolute -left-[3px] top-[234px] h-[48px] w-[3px] rounded-l-full bg-gradient-to-b from-[#6B675E] to-[#3A3833]" />
        <div className="pointer-events-none absolute -right-[3px] top-[192px] h-[68px] w-[3px] rounded-r-full bg-gradient-to-b from-[#6B675E] to-[#3A3833]" />

        {/* Natural Titanium Outer Chassis */}
        <div className="relative rounded-[54px] bg-gradient-to-b from-[#57534C] via-[#2C2A27] to-[#43403A] p-[9px] shadow-[0_40px_85px_-16px_rgba(18,16,12,0.44),0_12px_28px_-6px_rgba(18,16,12,0.22),inset_0_1px_1px_rgba(255,255,255,0.28)]">
          {/* Obsidian Inner Glass Gasket */}
          <div className="rounded-[45px] bg-[#0B0B0D] p-[3px] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
            {/* Active Edge-to-Edge Retina Display */}
            <div className="relative h-[760px] w-[368px] overflow-hidden rounded-[42px] bg-white">
              <DynamicIsland
                expanded={expandedIsland}
                scanText={scanText}
                flashTrigger={flashTrigger}
                onTap={onIslandTap}
              />

              {/* Screen State Canvas */}
              <div className="h-full w-full">{children}</div>

              {/* Subtle iOS Home Indicator */}
              <div className="pointer-events-none absolute inset-x-0 bottom-1.5 z-40 flex justify-center">
                <span
                  className={`h-[4px] w-[112px] rounded-full transition-colors duration-300 ${
                    darkSurface ? 'bg-white/30' : 'bg-black/18'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
