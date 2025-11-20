import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface NotebookCanvasProps {
  lineHeight?: number;
  marginLeft?: number;
}

export const NotebookCanvas = ({ lineHeight = 32, marginLeft = 80 }: NotebookCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      ctx.scale(dpr, dpr);

      // Get computed colors from CSS variables
      const styles = getComputedStyle(document.documentElement);
      const lineColor = styles.getPropertyValue("--notebook-line").trim();
      const marginColor = styles.getPropertyValue("--notebook-margin").trim();
      const holeColor = styles.getPropertyValue("--notebook-hole").trim();

      // Convert HSL to actual color
      const hslToColor = (hsl: string) => `hsl(${hsl})`;

      // Draw horizontal lines
      ctx.strokeStyle = hslToColor(lineColor);
      ctx.lineWidth = 1;

      for (let y = lineHeight; y < rect.height; y += lineHeight) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(rect.width, y);
        ctx.stroke();
      }

      // Draw red margin line
      ctx.strokeStyle = hslToColor(marginColor);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(marginLeft, 0);
      ctx.lineTo(marginLeft, rect.height);
      ctx.stroke();

      // Draw binder holes
      const holeRadius = 6;
      const holeX = 40;
      const holes = [
        rect.height * 0.15,
        rect.height * 0.35,
        rect.height * 0.65,
        rect.height * 0.85,
      ];

      ctx.fillStyle = hslToColor(holeColor);
      holes.forEach((holeY) => {
        ctx.beginPath();
        ctx.arc(holeX, holeY, holeRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner shadow effect
        ctx.strokeStyle = theme === "dark" ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.15)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    };

    updateCanvas();

    const resizeObserver = new ResizeObserver(updateCanvas);
    resizeObserver.observe(canvas);

    return () => resizeObserver.disconnect();
  }, [lineHeight, marginLeft, theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: "100%", height: "100%" }}
    />
  );
};
