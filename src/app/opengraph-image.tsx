import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

// The picture shown when someone shares a Patrol Ready link (WhatsApp, iMessage,
// Slack, Facebook…). Built once at build time.
export const alt = "Patrol Ready: learn and test surf lifesaving signals, acronyms and radio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#1C1917";
const font = (weight: number) =>
  readFile(join(process.cwd(), `node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-${weight}-normal.woff`));

export default async function OpenGraphImage() {
  const [bold, black] = await Promise.all([font(700), font(800)]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: "#F3E2BC",
          padding: "0 80px",
          gap: 64,
          fontFamily: "Barlow Condensed",
          color: INK,
        }}
      >
        {/* Red-and-yellow patrol flag on a pole */}
        <div style={{ display: "flex", position: "relative", width: 300, height: 400 }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 22, height: 400, background: INK, borderRadius: 11 }} />
          <div
            style={{
              position: "absolute",
              left: 22,
              top: 14,
              width: 270,
              height: 220,
              display: "flex",
              flexDirection: "column",
              border: `8px solid ${INK}`,
              boxShadow: `14px 14px 0 ${INK}`,
            }}
          >
            <div style={{ flex: 1, background: "#DA291C" }} />
            <div style={{ flex: 1, background: "#FFD100" }} />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 136, fontWeight: 800, lineHeight: 0.9, textTransform: "uppercase", letterSpacing: -1 }}>
            Patrol Ready
          </div>
          <div style={{ fontSize: 50, fontWeight: 700, lineHeight: 1.1, marginTop: 28 }}>
            Learn and test surf lifesaving signals, acronyms and radio.
          </div>
          <div style={{ display: "flex", marginTop: 40 }}>
            <div
              style={{
                fontSize: 40,
                fontWeight: 800,
                textTransform: "uppercase",
                background: "#DA291C",
                color: "white",
                padding: "10px 26px",
                border: `5px solid ${INK}`,
                boxShadow: `8px 8px 0 ${INK}`,
              }}
            >
              Free · patrolready.au
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Barlow Condensed", data: bold, weight: 700, style: "normal" },
        { name: "Barlow Condensed", data: black, weight: 800, style: "normal" },
      ],
    }
  );
}
