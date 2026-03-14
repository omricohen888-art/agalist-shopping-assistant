import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  Easing,
} from "remotion";
import {
  PhoneMockup,
  AppHeader,
  ListItem,
  StartShoppingBtn,
  FinishShoppingBtn,
  StoreModal,
  MarketingText,
  AgalistLogo,
} from "../components/UIComponents";
import { COLORS, TIMELINE } from "../styles";

const ITEMS = ["קוטג'", "עוף", "קולה", "עגבניות", "יוגורט"];

export const AgalistCommercial: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ===== SCENE CALCULATIONS =====

  // Scene 1: Phone enters from bottom (0-3s)
  const phoneEnterProgress = spring({
    frame: frame - TIMELINE.PHONE_ENTER_START,
    fps,
    config: { damping: 14, stiffness: 80, mass: 0.8 },
  });

  const phoneY = interpolate(phoneEnterProgress, [0, 1], [1200, 200]);
  const phoneScale = interpolate(phoneEnterProgress, [0, 1], [0.6, 0.85]);

  // Scene 2: Typing items (3s-8s)
  const typingFrame = frame - TIMELINE.TYPING_START;
  const framesPerItem = (TIMELINE.TYPING_END - TIMELINE.TYPING_START) / ITEMS.length;
  const visibleItems = Math.min(
    ITEMS.length,
    Math.floor(typingFrame / framesPerItem) + 1
  );

  // Current item typing progress (character by character)
  const currentItemIndex = Math.max(0, Math.min(
    ITEMS.length - 1,
    Math.floor(typingFrame / framesPerItem)
  ));
  const currentItemProgress =
    (typingFrame % framesPerItem) / framesPerItem;
  const currentItemText = ITEMS[currentItemIndex] || "";
  const typedChars = Math.floor(currentItemProgress * (currentItemText.length || 1));

  // Scene 3: Shopping mode - checking items (8s-13s)
  const shoppingFrame = frame - TIMELINE.SHOPPING_START;
  const framesPerCheck = (TIMELINE.SHOPPING_END - TIMELINE.SHOPPING_START) / ITEMS.length;
  const checkedCount = Math.min(
    ITEMS.length,
    Math.floor(shoppingFrame / framesPerCheck)
  );

  // Scene 4: Finish flow - modal (13s-16s)
  const finishFrame = frame - TIMELINE.FINISH_START;
  const showModal = frame >= TIMELINE.FINISH_START + 15;
  const modalProgress = spring({
    frame: Math.max(0, finishFrame - 15),
    fps,
    config: { damping: 12, stiffness: 100 },
  });

  // Store selection appears at 14s
  const selectedStore = finishFrame > 30 ? "רמי לוי" : undefined;
  // Amount appears at 14.5s
  const amount = finishFrame > 45 ? "75" : finishFrame > 40 ? "7" : undefined;

  // Scene 5: Logo reveal (16s-20s)
  const logoFrame = frame - TIMELINE.LOGO_START;
  const logoScale = spring({
    frame: Math.max(0, logoFrame),
    fps,
    config: { damping: 8, stiffness: 60, mass: 1.2 },
  });

  const phoneExitScale = interpolate(
    frame,
    [TIMELINE.FINISH_END - 30, TIMELINE.FINISH_END + 15],
    [0.85, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const logoOpacity = interpolate(
    frame,
    [TIMELINE.LOGO_START, TIMELINE.LOGO_START + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ===== MARKETING TEXT CALCULATIONS =====
  const marketingText1Opacity = interpolate(
    frame,
    [TIMELINE.TYPING_START, TIMELINE.TYPING_START + 15, TIMELINE.TYPING_END - 15, TIMELINE.TYPING_END],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const marketingText2Opacity = interpolate(
    frame,
    [TIMELINE.SHOPPING_START, TIMELINE.SHOPPING_START + 15, TIMELINE.SHOPPING_END - 15, TIMELINE.SHOPPING_END],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const marketingText3Opacity = interpolate(
    frame,
    [TIMELINE.FINISH_START, TIMELINE.FINISH_START + 15, TIMELINE.FINISH_END - 15, TIMELINE.FINISH_END],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const marketingText1Y = interpolate(marketingText1Opacity, [0, 1], [30, 0]);
  const marketingText2Y = interpolate(marketingText2Opacity, [0, 1], [30, 0]);
  const marketingText3Y = interpolate(marketingText3Opacity, [0, 1], [30, 0]);

  // ===== DETERMINE WHICH APP SCREEN TO SHOW =====
  const isShoppingMode = frame >= TIMELINE.SHOPPING_START;
  const isFinishMode = frame >= TIMELINE.FINISH_START;
  const isLogoMode = frame >= TIMELINE.LOGO_START;

  // Background subtle animated gradient
  const bgHue = interpolate(frame, [0, 600], [45, 50]);

  // Phone 3D rotation for depth
  const phoneRotateY = interpolate(
    frame,
    [TIMELINE.PHONE_ENTER_START, TIMELINE.PHONE_ENTER_END],
    [-15, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        backgroundColor: COLORS.white,
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Segoe UI', 'Arial', sans-serif",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 50% 30%, hsl(${bgHue}, 100%, 97%), ${COLORS.white})`,
        }}
      />

      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          top: 200,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.brandYellow}15, transparent)`,
          transform: `scale(${interpolate(frame, [0, 600], [0.8, 1.2])})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 300,
          left: -150,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.brandYellow}10, transparent)`,
          transform: `scale(${interpolate(frame, [0, 600], [1.2, 0.9])})`,
        }}
      />

      {/* === MARKETING TEXT AREA (Top section) === */}
      {!isLogoMode && (
        <div
          style={{
            position: "absolute",
            top: 100,
            left: 0,
            right: 0,
            zIndex: 5,
          }}
        >
          {/* Title when phone is entering */}
          {frame < TIMELINE.TYPING_START && (
            <MarketingText
              text="הדרך החכמה לנהל קניות"
              opacity={phoneEnterProgress}
              translateY={interpolate(phoneEnterProgress, [0, 1], [40, 0])}
            />
          )}

          {/* During typing */}
          {frame >= TIMELINE.TYPING_START && frame < TIMELINE.SHOPPING_START && (
            <MarketingText
              text="מכניסים מוצרים בקלות"
              opacity={marketingText1Opacity}
              translateY={marketingText1Y}
            />
          )}

          {/* During shopping */}
          {frame >= TIMELINE.SHOPPING_START && frame < TIMELINE.FINISH_START && (
            <MarketingText
              text="מסמנים תוך כדי תנועה"
              opacity={marketingText2Opacity}
              translateY={marketingText2Y}
            />
          )}

          {/* During finish */}
          {frame >= TIMELINE.FINISH_START && frame < TIMELINE.LOGO_START && (
            <MarketingText
              text="!מעקב אחרי ההוצאות"
              opacity={marketingText3Opacity}
              translateY={marketingText3Y}
            />
          )}
        </div>
      )}

      {/* === PHONE MOCKUP === */}
      {!isLogoMode && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 0,
            transform: `
              translateX(-50%)
              translateY(${phoneY}px)
              scale(${isFinishMode ? phoneExitScale : phoneScale})
              perspective(1200px)
              rotateY(${phoneRotateY}deg)
            `,
            transformOrigin: "center center",
            zIndex: 10,
          }}
        >
          <PhoneMockup>
            {/* App Header */}
            <AppHeader />

            {/* App Content */}
            <div style={{ padding: "0", flex: 1 }}>
              {/* === LIST MODE === */}
              {!isShoppingMode && frame >= TIMELINE.TYPING_START && (
                <>
                  {/* Input field */}
                  <div
                    style={{
                      padding: "12px 14px",
                      borderBottom: `1px solid ${COLORS.gray200}`,
                      direction: "rtl",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: `2px solid ${COLORS.gray300}`,
                        fontSize: 15,
                        color: COLORS.gray600,
                        minHeight: 20,
                      }}
                    >
                      {frame >= TIMELINE.TYPING_START &&
                      frame < TIMELINE.TYPING_END
                        ? currentItemText.substring(0, typedChars + 1)
                        : ""}
                      <span
                        style={{
                          borderRight: `2px solid ${COLORS.black}`,
                          marginRight: 2,
                          animation: "blink 1s infinite",
                        }}
                      />
                    </div>
                  </div>

                  {/* List items */}
                  {ITEMS.slice(0, Math.max(0, visibleItems - 1)).map(
                    (item, i) => (
                      <ListItem key={i} text={item} />
                    )
                  )}
                  {visibleItems > 0 &&
                    currentItemIndex > 0 &&
                    typedChars >= currentItemText.length - 1 && (
                      <ListItem text={ITEMS[currentItemIndex]} />
                    )}

                  {/* Start shopping button */}
                  {visibleItems >= ITEMS.length && (
                    <StartShoppingBtn
                      highlight={
                        frame > TIMELINE.TYPING_END - 20
                      }
                    />
                  )}
                </>
              )}

              {/* === SHOPPING MODE === */}
              {isShoppingMode && !isFinishMode && (
                <>
                  {/* Shopping mode header */}
                  <div
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#E8F5E9",
                      textAlign: "center",
                      fontSize: 14,
                      fontWeight: 600,
                      color: COLORS.green600,
                      direction: "rtl",
                    }}
                  >
                    🛒 מצב קניות פעיל
                  </div>

                  {ITEMS.map((item, i) => (
                    <ListItem
                      key={i}
                      text={item}
                      checked={i < checkedCount}
                      animateCheck
                    />
                  ))}

                  {checkedCount >= ITEMS.length && <FinishShoppingBtn />}
                </>
              )}

              {/* === FINISH MODE (Modal) === */}
              {isFinishMode && !isLogoMode && (
                <>
                  {ITEMS.map((item, i) => (
                    <ListItem key={i} text={item} checked />
                  ))}
                  {showModal && (
                    <div
                      style={{
                        transform: `scale(${modalProgress})`,
                        transformOrigin: "center center",
                      }}
                    >
                      <StoreModal
                        selectedStore={selectedStore}
                        amount={amount}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </PhoneMockup>
        </div>
      )}

      {/* === LOGO REVEAL === */}
      {isLogoMode && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 40,
            zIndex: 30,
            backgroundColor: COLORS.white,
          }}
        >
          {/* Radial burst */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at 50% 50%, ${COLORS.brandYellow}30, transparent 70%)`,
              transform: `scale(${interpolate(logoScale, [0, 1], [0.5, 2])})`,
              opacity: interpolate(logoScale, [0, 0.5, 1], [0, 1, 0.6]),
            }}
          />

          {/* Logo */}
          <div
            style={{
              transform: `scale(${logoScale * 2.5})`,
              opacity: logoOpacity,
            }}
          >
            <AgalistLogo scale={1.5} />
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: COLORS.gray600,
              direction: "rtl",
              textAlign: "center",
              opacity: interpolate(
                frame,
                [TIMELINE.LOGO_START + 20, TIMELINE.LOGO_START + 40],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              ),
              transform: `translateY(${interpolate(
                frame,
                [TIMELINE.LOGO_START + 20, TIMELINE.LOGO_START + 40],
                [20, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              )}px)`,
              marginTop: 120,
            }}
          >
            רשימת הקניות החכמה שלך
          </div>
        </div>
      )}
    </div>
  );
};
