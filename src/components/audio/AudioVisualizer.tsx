import React, { useEffect, useRef } from "react";
import { useAtmosphere } from "../../context/AtmosphereContext";

interface AudioVisualizerProps {
  className?: string;
  barCount?: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  className = "w-24 h-6",
  barCount = 10,
}) => {
  const { isPlaying, getFrequencyData, currentMood } = useAtmosphere();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dataArray = new Uint8Array(32);

    const moodColorMap: Record<string, string> = {
      happy: "#E8B84A",      // Soft Honey Yellow
      calm: "#A8B29A",       // Muted Sage
      reflective: "#6B4938", // Chocolate Brown
      stressed: "#8E7162",   // Muted Cocoa
      curious: "#D4A373",    // Honey Latte
      focused: "#3B2922",    // Deep Cocoa
    };

    const activeColor = moodColorMap[currentMood] || "#6B4938";

    // Draw static/frozen bars when paused
    if (!isPlaying) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / barCount) * 0.7;
      const gap = (width - barWidth * barCount) / Math.max(1, barCount - 1);

      // Frozen resting pattern
      const restingHeights = [0.2, 0.35, 0.45, 0.3, 0.5, 0.35, 0.25, 0.4, 0.3, 0.2];

      for (let i = 0; i < barCount; i++) {
        const factor = restingHeights[i % restingHeights.length];
        const barHeight = Math.max(3, factor * height * 0.5);
        const x = i * (barWidth + gap);
        const y = height - barHeight;

        ctx.fillStyle = activeColor;
        ctx.globalAlpha = 0.25;

        const radius = barWidth / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, radius);
        ctx.fill();
      }
      return;
    }

    // Active playback animated waveform
    const render = () => {
      getFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / barCount) * 0.7;
      const gap = (width - barWidth * barCount) / Math.max(1, barCount - 1);

      for (let i = 0; i < barCount; i++) {
        const rawVal = dataArray[i % dataArray.length];
        const normalized = Math.max(0.15, rawVal / 255);
        const barHeight = Math.max(3, normalized * height);
        const x = i * (barWidth + gap);
        const y = height - barHeight;

        ctx.fillStyle = activeColor;
        ctx.globalAlpha = 0.85;

        const radius = barWidth / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, radius);
        ctx.fill();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, currentMood, getFrequencyData, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={120}
      height={32}
      className={`${className} transition-opacity duration-300`}
      title={isPlaying ? "Atmosphere ambient waveform" : "Atmosphere paused"}
    />
  );
};
