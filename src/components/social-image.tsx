import { ImageResponse } from "next/og";

export const socialImageSize = {
  width: 1200,
  height: 630,
};

export function createSocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#f7f4ed",
          color: "#17392f",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px",
          position: "relative",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "#dfe9df",
            borderRadius: "999px",
            display: "flex",
            height: "440px",
            opacity: 0.7,
            position: "absolute",
            right: "-80px",
            top: "-110px",
            width: "440px",
          }}
        />
        <div
          style={{
            color: "#255447",
            display: "flex",
            fontSize: "25px",
            fontWeight: 700,
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}
        >
          San Luis Obispo, California
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Georgia",
              fontSize: "104px",
              fontWeight: 700,
              letterSpacing: "-7px",
              lineHeight: 0.88,
              maxWidth: "940px",
            }}
          >
            Modern websites for local businesses.
          </div>
          <div
            style={{
              borderTop: "2px solid rgba(23,57,47,0.16)",
              display: "flex",
              fontSize: "27px",
              fontWeight: 700,
              justifyContent: "space-between",
              marginTop: "44px",
              paddingTop: "22px",
            }}
          >
            <span>SLO Web Design</span>
            <span style={{ color: "#66736e" }}>slowebdesign.com</span>
          </div>
        </div>
      </div>
    ),
    socialImageSize,
  );
}
