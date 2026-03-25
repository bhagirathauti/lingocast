import React from "react";
import {
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

interface BrandingProps {
  showWatermark?: boolean;
  showLowerThird?: boolean;
  lowerThirdText?: string;
}

export const Branding: React.FC<BrandingProps> = ({
  showWatermark = true,
  showLowerThird = false,
  lowerThirdText,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const watermarkOpacity = interpolate(frame, [0, 15], [0, 0.6], {
    extrapolateRight: "clamp",
  });

  const lowerThirdProgress = spring({
    frame: frame - 10,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  return (
    <>
      {/* ET Watermark - top right */}
      {showWatermark && (
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 50,
            opacity: watermarkOpacity,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              borderRadius: 12,
              padding: "10px 18px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <span
              style={{
                color: "#ffffff",
                fontSize: 24,
                fontWeight: 700,
                fontFamily: "system-ui, sans-serif",
                letterSpacing: 2,
              }}
            >
              ET
            </span>
          </div>
        </div>
      )}

      {/* Lower third */}
      {showLowerThird && lowerThirdText && (
        <div
          style={{
            position: "absolute",
            bottom: 180,
            left: 0,
            right: 0,
            transform: `translateX(${interpolate(lowerThirdProgress, [0, 1], [-100, 0])}%)`,
            opacity: lowerThirdProgress,
          }}
        >
          <div
            style={{
              marginLeft: 50,
              marginRight: 50,
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(20px)",
              borderRadius: 16,
              padding: "16px 28px",
              borderLeft: "4px solid #60a5fa",
            }}
          >
            <span
              style={{
                color: "#ffffff",
                fontSize: 26,
                fontFamily: "system-ui, sans-serif",
                lineHeight: 1.4,
              }}
            >
              {lowerThirdText}
            </span>
          </div>
        </div>
      )}
    </>
  );
};
