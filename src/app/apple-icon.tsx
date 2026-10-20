import { ImageResponse } from "next/og";

// Home-screen icon for iPhones (they ignore SVG icons): the patrol flag on sky blue
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#0EA5E9" }}>
        <div style={{ position: "absolute", left: 34, top: 22, width: 15, height: 140, background: "white", borderRadius: 8 }} />
        <div style={{ position: "absolute", left: 49, top: 28, width: 108, height: 84, display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, background: "#DA291C" }} />
          <div style={{ flex: 1, background: "#FFD100" }} />
        </div>
      </div>
    ),
    size
  );
}
