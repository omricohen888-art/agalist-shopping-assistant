import React from "react";
import { COLORS } from "../styles";

// Agalist Logo - CSS/SVG recreation
export const AgalistLogo: React.FC<{
  scale?: number;
  showText?: boolean;
}> = ({ scale = 1, showText = true }) => {
  const size = 64 * scale;
  const checkSize = 48 * scale;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12 * scale,
        direction: "rtl",
      }}
    >
      {/* Cart Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 12L14 12L20 44H48"
          stroke={COLORS.black}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18 20H52L46 44H20Z"
          fill={COLORS.gray200}
          stroke={COLORS.black}
          strokeWidth="3"
        />
        <circle cx="24" cy="52" r="4" fill={COLORS.black} />
        <circle cx="44" cy="52" r="4" fill={COLORS.black} />
      </svg>

      {/* Text */}
      {showText && (
        <span
          style={{
            fontSize: 42 * scale,
            fontWeight: 900,
            color: COLORS.black,
            fontFamily: "'Segoe UI', sans-serif",
            letterSpacing: -1,
          }}
        >
          עגליסט
        </span>
      )}

      {/* Checkmark Badge */}
      <div
        style={{
          width: checkSize,
          height: checkSize,
          backgroundColor: COLORS.black,
          borderRadius: 10 * scale,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width={checkSize * 0.6}
          height={checkSize * 0.6}
          viewBox="0 0 24 24"
          fill="none"
        >
          <polyline
            points="4,12 10,18 20,6"
            stroke={COLORS.brandGold}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

// iPhone 17 Mockup Frame
export const PhoneMockup: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => {
  return (
    <div
      style={{
        width: 340,
        height: 700,
        borderRadius: 48,
        background: COLORS.black,
        padding: 8,
        boxShadow: "0 40px 80px rgba(0,0,0,0.4), 0 0 0 2px #333",
        position: "relative",
        ...style,
      }}
    >
      {/* Dynamic Island */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: "50%",
          transform: "translateX(-50%)",
          width: 100,
          height: 28,
          backgroundColor: COLORS.black,
          borderRadius: 20,
          zIndex: 10,
        }}
      />
      {/* Screen */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 40,
          backgroundColor: COLORS.white,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {children}
      </div>
    </div>
  );
};

// Shopping list item component
export const ListItem: React.FC<{
  text: string;
  checked?: boolean;
  animateCheck?: boolean;
}> = ({ text, checked = false, animateCheck = false }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderBottom: `1px solid ${COLORS.gray200}`,
        direction: "rtl",
        opacity: checked ? 0.5 : 1,
        transition: animateCheck ? "opacity 0.3s" : undefined,
      }}
    >
      {/* Checkbox */}
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          border: `2px solid ${checked ? COLORS.green500 : COLORS.gray400}`,
          backgroundColor: checked ? COLORS.green500 : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {checked && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <polyline
              points="4,12 10,18 20,6"
              stroke={COLORS.white}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
      {/* Text */}
      <span
        style={{
          fontSize: 16,
          color: checked ? COLORS.gray400 : COLORS.black,
          textDecoration: checked ? "line-through" : "none",
          fontFamily: "'Segoe UI', sans-serif",
          fontWeight: 500,
        }}
      >
        {text}
      </span>
    </div>
  );
};

// App header bar
export const AppHeader: React.FC = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 16px 12px",
      borderBottom: `1px solid ${COLORS.gray200}`,
      direction: "rtl",
      gap: 8,
    }}
  >
    {/* Mini cart icon */}
    <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
      <path
        d="M8 12L14 12L20 44H48"
        stroke={COLORS.black}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M18 20H52L46 44H20Z" fill={COLORS.gray200} stroke={COLORS.black} strokeWidth="4" />
      <circle cx="24" cy="52" r="4" fill={COLORS.black} />
      <circle cx="44" cy="52" r="4" fill={COLORS.black} />
    </svg>
    <span
      style={{
        fontSize: 20,
        fontWeight: 800,
        color: COLORS.black,
      }}
    >
      עגליסט
    </span>
    {/* Mini check badge */}
    <div
      style={{
        width: 22,
        height: 22,
        backgroundColor: COLORS.black,
        borderRadius: 5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <polyline
          points="4,12 10,18 20,6"
          stroke={COLORS.brandGold}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  </div>
);

// Start Shopping Button
export const StartShoppingBtn: React.FC<{
  highlight?: boolean;
}> = ({ highlight = false }) => (
  <div
    style={{
      padding: "8px 16px",
    }}
  >
    <div
      style={{
        backgroundColor: highlight ? COLORS.brandYellow : COLORS.green500,
        color: COLORS.white,
        fontWeight: 700,
        fontSize: 16,
        textAlign: "center",
        padding: "12px 20px",
        borderRadius: 12,
        border: `2px solid ${COLORS.black}`,
        boxShadow: highlight
          ? "3px 3px 0px 0px rgba(0,0,0,1)"
          : "2px 2px 0px 0px rgba(0,0,0,0.3)",
        direction: "rtl",
        fontFamily: "'Segoe UI', sans-serif",
        transform: highlight ? "scale(1.02)" : "scale(1)",
      }}
    >
      יוצאים לקניות! 🛒
    </div>
  </div>
);

// Finish Shopping Button
export const FinishShoppingBtn: React.FC = () => (
  <div style={{ padding: "8px 16px" }}>
    <div
      style={{
        backgroundColor: COLORS.red400,
        color: COLORS.white,
        fontWeight: 700,
        fontSize: 15,
        textAlign: "center",
        padding: "12px 20px",
        borderRadius: 12,
        border: `2px solid ${COLORS.black}`,
        boxShadow: "2px 2px 0px 0px rgba(0,0,0,0.3)",
        direction: "rtl",
      }}
    >
      סיים קנייה ✓
    </div>
  </div>
);

// Store selection modal
export const StoreModal: React.FC<{
  selectedStore?: string;
  amount?: string;
}> = ({ selectedStore, amount }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 20,
    }}
  >
    <div
      style={{
        width: "85%",
        backgroundColor: COLORS.white,
        borderRadius: 20,
        padding: 24,
        direction: "rtl",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}
    >
      <h3
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 16,
          textAlign: "center",
          color: COLORS.black,
        }}
      >
        שמירת קנייה
      </h3>

      {/* Store options */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 13, color: COLORS.gray600, marginBottom: 6, display: "block" }}>
          בחר חנות:
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["רמי לוי", "שופרסל", "יוחננוף"].map((store) => (
            <div
              key={store}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                border: `2px solid ${selectedStore === store ? COLORS.brandYellow : COLORS.gray300}`,
                backgroundColor: selectedStore === store ? "#FFF8E1" : COLORS.white,
                fontSize: 14,
                fontWeight: selectedStore === store ? 700 : 400,
                color: COLORS.black,
              }}
            >
              {store}
            </div>
          ))}
        </div>
      </div>

      {/* Amount input */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 13, color: COLORS.gray600, marginBottom: 6, display: "block" }}>
          סכום קנייה:
        </label>
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: `2px solid ${COLORS.gray300}`,
            fontSize: 18,
            fontWeight: 600,
            color: COLORS.black,
            direction: "ltr",
            textAlign: "right",
          }}
        >
          {amount ? `₪${amount}` : ""}
        </div>
      </div>

      {/* Save button */}
      <div
        style={{
          backgroundColor: COLORS.green500,
          color: COLORS.white,
          fontWeight: 700,
          fontSize: 16,
          textAlign: "center",
          padding: "12px",
          borderRadius: 12,
          border: `2px solid ${COLORS.black}`,
        }}
      >
        שמור וסיים ✓
      </div>
    </div>
  </div>
);

// Marketing text component
export const MarketingText: React.FC<{
  text: string;
  opacity: number;
  translateY?: number;
}> = ({ text, opacity, translateY = 0 }) => (
  <div
    style={{
      fontSize: 36,
      fontWeight: 900,
      color: COLORS.black,
      textAlign: "center",
      direction: "rtl",
      fontFamily: "'Segoe UI', sans-serif",
      lineHeight: 1.4,
      opacity,
      transform: `translateY(${translateY}px)`,
      padding: "0 20px",
    }}
  >
    {text}
  </div>
);
