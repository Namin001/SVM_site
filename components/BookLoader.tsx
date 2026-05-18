'use client';

import React, { useEffect, useState } from 'react';

export default function BookLoader({ text = "Syncing Academic Records..." }: { text?: string }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Audio integration
    const audio = new Audio('/loader.mp3');
    audio.volume = 0.5;

    const playAudio = async () => {
      try {
        await audio.play();
        // Limit playback to exactly 5 seconds as requested
        setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
        }, 5000);
      } catch (error) {
        console.warn("Audio autoplay blocked by browser:", error);
      }
    };

    playAudio();

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  // Create a grid of pixels for the forming effect
  const gridSize = 14;
  const pixels = Array.from({ length: gridSize * gridSize });

  return (
    <div className="pixel-loader-container">
      <div className="loader-content">
        <div className="logo-wrapper">
          {/* The Base Logo */}
          <img src="/svm_logo.png" alt="Logo" className="base-logo" />

          {/* The Pixel Grid */}
          <div className="pixel-grid">
            {isMounted && pixels.map((_, i) => {
              const x = i % gridSize;
              const y = Math.floor(i / gridSize);
              const delay = Math.random() * 1.2;
              const duration = 0.8 + Math.random() * 0.8;

              const startX = (Math.random() - 0.5) * 500;
              const startY = (Math.random() - 0.5) * 500;
              const startRotate = (Math.random() - 0.5) * 720;

              return (
                <div
                  key={i}
                  className="pixel"
                  style={{
                    width: `${100 / gridSize}%`,
                    height: `${100 / gridSize}%`,
                    left: `${(x * 100) / gridSize}%`,
                    top: `${(y * 100) / gridSize}%`,
                    backgroundImage: 'url(/svm_logo.png)',
                    backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                    backgroundPosition: `${(x * 100) / (gridSize - 1)}% ${(y * 100) / (gridSize - 1)}%`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`,
                    '--startX': `${startX}px`,
                    '--startY': `${startY}px`,
                    '--startRotate': `${startRotate}deg`
                  } as React.CSSProperties}
                />
              );
            })}
          </div>

          {/* Ribbon Shimmer Effect Overlay */}
          <div className="ribbon-shimmer"></div>
        </div>

        <div className="brand-wrapper">
          <div className="brand-content">
            <h1 className="brand-title">SHUBHA VIDYALAYA</h1>
            <h2 className="brand-subtitle">MATRICULATION HIGHER SECONDARY SCHOOL</h2>
            <p className="brand-motto">TO BUILD CREATIVE, DISCIPLINED AND DYNAMIC LEADER OF TOMORROW </p>
          </div>
          <div className="loading-bar">
            <div className="bar-fill"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .pixel-loader-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: rgba(5, 5, 10, 0.98);
          backdrop-filter: blur(30px);
          z-index: 9999;
          overflow: hidden;
        }

        .loader-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2.5rem;
        }

        .logo-wrapper {
          position: relative;
          width: 250px;
          height: 250px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .base-logo {
          width: 100%;
          height: auto;
          opacity: 0;
          animation: revealLogo 0.8s ease forwards;
          animation-delay: 2.5s;
          filter: drop-shadow(0 0 25px rgba(252, 163, 17, 0.25));
        }

        @keyframes revealLogo {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        .pixel-grid {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .pixel {
          position: absolute;
          opacity: 0;
          animation: formPixel 2.2s cubic-bezier(0.19, 1, 0.22, 1) forwards;
          box-shadow: 0 0 5px rgba(252, 163, 17, 0.1);
        }

        @keyframes formPixel {
          0% {
            opacity: 0;
            transform: translate(var(--startX), var(--startY)) rotate(var(--startRotate)) scale(0);
          }
          15% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
        }

        .ribbon-shimmer {
          position: absolute;
          bottom: 15%;
          left: 5%;
          right: 5%;
          height: 25%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0) 30%,
            rgba(255, 255, 255, 0.6) 50%,
            rgba(255, 255, 255, 0) 70%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
          pointer-events: none;
          z-index: 10;
          mix-blend-mode: overlay;
          opacity: 0;
          animation-delay: 2.8s;
          animation-fill-mode: forwards;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { background-position: 200% 0; opacity: 0; }
        }

        /* Brand Styling */
        .brand-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          text-align: center;
          width: 100%;
          max-width: 600px;
          animation: fadeInText 1s ease-out 0.5s both;
        }

        @keyframes fadeInText {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .brand-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .brand-title {
          font-family: 'Outfit', sans-serif;
          color: #FFFFFF;
          font-size: 2.2rem;
          font-weight: 900;
          letter-spacing: 4px;
          margin: 0;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
        }

        .brand-subtitle {
          font-family: 'Outfit', sans-serif;
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.1rem;
          font-weight: 600;
          letter-spacing: 2px;
          margin: 0;
          opacity: 0.8;
        }

        .brand-motto {
          font-family: 'Inter', sans-serif;
          color: rgba(252, 163, 17, 0.9);
          font-size: 0.75rem;
          font-weight: 300;
          letter-spacing: 1.5px;
          margin-top: 0.5rem;
          max-width: 450px;
          line-height: 1.5;
        }

        .loading-bar {
          width: 280px;
          height: 3px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }

        .bar-fill {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, #FCA311, #FFFFFF, #FCA311, transparent);
          animation: barProgress 2s infinite;
        }

        @keyframes barProgress {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .pixel-loader-container::before {
          content: '';
          position: absolute;
          width: 150%;
          height: 150%;
          background: radial-gradient(circle at center, rgba(10, 54, 104, 0.2) 0%, transparent 70%);
          animation: pulseBg 6s ease-in-out infinite;
        }

        @keyframes pulseBg {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }

        @media (max-width: 768px) {
          .logo-wrapper {
            width: 180px;
            height: 180px;
          }
          .brand-title {
            font-size: 1.5rem;
            letter-spacing: 2px;
          }
          .brand-subtitle {
            font-size: 0.9rem;
            letter-spacing: 1px;
          }
          .brand-motto {
            font-size: 0.65rem;
            padding: 0 1.5rem;
          }
          .loading-bar {
            width: 200px;
          }
          .loader-content {
            gap: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
