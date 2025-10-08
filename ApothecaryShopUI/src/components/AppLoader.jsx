import { useEffect, useState } from "react";
import "./AppLoader.css";
const AppLoader = ({
  className,
  message = "Loading",
  fullScreen = true, // or false for an inline loader
  position = "fixed", // or "absolute"
}) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const positionClass = fullScreen ? `${position} inset-0` : "relative";

  return (
    <div
      className={`${positionClass} flex items-center justify-center bg-white z-50 ${
        className || ""
      }`}
      style={fullScreen ? { minHeight: "100vh" } : undefined}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Animated Mortar and Pestle */}
        <div className="relative h-24 w-24">
          {/* Mortar (bowl) */}
          <div className="absolute bottom-0 left-1/2 h-16 w-20 -translate-x-1/2 rounded-b-full border-4 border-emerald-600 bg-emerald-50 animate-pulse" />

          {/* Pestle */}
          <div className="absolute left-1/2 top-0 h-20 w-3 -translate-x-1/2 origin-bottom swing-animation">
            <div className="h-full w-full rounded-full bg-emerald-700" />
            <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-emerald-800" />
          </div>

          {/* Particles */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="absolute h-1.5 w-1.5 rounded-full bg-emerald-400 particle1-animation" />
            <div className="absolute h-1 w-1 rounded-full bg-emerald-500 particle2-animation" />
            <div className="absolute h-1.5 w-1.5 rounded-full bg-emerald-300 particle3-animation" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-medium text-emerald-700">
            {message}
            <span className="inline-block w-8 text-left">{dots}</span>
          </p>

          {/* Progress Bar */}
          <div className="h-1 w-48 overflow-hidden rounded-full bg-emerald-100">
            <div className="h-full w-1/3 progress-animation rounded-full bg-emerald-600" />
          </div>
        </div>

        {/* Decorative Pills */}
        <div className="flex gap-2">
          <div className="h-3 w-6 bounce-1 rounded-full bg-emerald-500" />
          <div className="h-3 w-6 bounce-2 rounded-full bg-emerald-600" />
          <div className="h-3 w-6 bounce-3 rounded-full bg-emerald-700" />
        </div>
      </div>
    </div>
  );
};

export default AppLoader;
