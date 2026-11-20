import { ImageResponse } from "next/og";
import { SITE_NAME } from "./site";

// Link-preview images (WhatsApp, X, Facebook, iMessage, Slack…), drawn in the brand palette.
// Colours are written out because ImageResponse can't read the CSS variables in globals.css.
const INK = "#0f1220";
const NAVY = "#1b2036";
const DUSK = "#394166";
const CREAM = "#f5f3ed";
const MIST = "#b8bccb";
const SUNRISE = "#f28c4b";

export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const OG_IMAGE_CONTENT_TYPE = "image/png";

// The logo's cross (lucide "cross"), as in shared/ui/brand/Logo.
// TODO(design): swap for the real GodsWheel mark with the other brand assets.
const CROSS_PATH =
  "M4 9a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4a1 1 0 0 1 1 1v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a1 1 0 0 1 1-1h4a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-4a1 1 0 0 1-1-1V4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4a1 1 0 0 1-1 1z";

interface OgCardProps {
  // Small orange line above the title (e.g. "Faith · Hebrews 11:1").
  eyebrow?: string;
  title: string;
  // Under the title (e.g. the preacher, or the tagline).
  subtitle?: string;
  // Bottom-right detail (e.g. "42 min · English").
  meta?: string;
}

export function ogImage({ eyebrow, title, subtitle, meta }: OgCardProps) {
  // Long sermon titles step down so they stay within three lines.
  const titleSize = title.length > 60 ? 60 : title.length > 34 ? 72 : 88;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: INK,
          backgroundImage: `radial-gradient(70% 80% at 85% 0%, rgba(242, 140, 75, 0.28), transparent 70%), linear-gradient(160deg, ${NAVY} 0%, ${INK} 65%)`,
          color: CREAM,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 18,
              border: `2px solid ${DUSK}`,
              backgroundColor: NAVY,
            }}
          >
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke={CREAM} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d={CROSS_PATH} />
            </svg>
          </div>
          <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: -0.5 }}>{SITE_NAME}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {eyebrow && (
            <div style={{ fontSize: 28, color: SUNRISE, letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>
              {eyebrow}
            </div>
          )}
          <div style={{ fontSize: titleSize, lineHeight: 1.08, letterSpacing: -1.5, fontWeight: 600, maxWidth: 1000 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 34, color: MIST, marginTop: 24 }}>{subtitle}</div>}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 26, color: MIST }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 6, borderRadius: 3, backgroundColor: SUNRISE }} />
            Listen free, no sign-up needed
          </div>
          {meta && <div>{meta}</div>}
        </div>
      </div>
    ),
    OG_IMAGE_SIZE
  );
}
