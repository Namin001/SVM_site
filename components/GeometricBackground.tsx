'use client';
import React from 'react';

export function GeometricBackground() {
  return (
    <div className="geo-bg-container">
      {/* Primary Hero Shape (Magenta/Purple vibe but with school colors) */}
      <div className="shape shape-1" />
      <div className="shape shape-2" />
      <div className="shape shape-3" />
      
      {/* Bottom Graphics */}
      <div className="shape shape-bottom-1" />
      <div className="shape shape-bottom-2" />
      
      {/* Accent Streaks */}
      <div className="streak streak-1" />
      <div className="streak streak-2" />
      <div className="streak streak-3" />
      
      {/* Floating Triangles */}
      <div className="triangle tri-1" />
      <div className="triangle tri-2" />
      
      <style jsx>{`
        .geo-bg-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -3;
          pointer-events: none;
          overflow: hidden;
          background: var(--bg-color);
        }

        .shape {
          position: absolute;
          opacity: 0.08;
          transition: all 0.5s ease;
        }

        .shape-1 {
          top: -10%;
          left: -5%;
          width: 50vw;
          height: 60vh;
          background: linear-gradient(135deg, var(--primary) 0%, transparent 100%);
          clip-path: polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%);
          transform: rotate(-15deg);
        }

        .shape-2 {
          top: 15%;
          left: 5%;
          width: 35vw;
          height: 40vh;
          background: linear-gradient(135deg, var(--accent) 0%, transparent 100%);
          clip-path: polygon(20% 0%, 100% 20%, 80% 100%, 0% 80%);
          opacity: 0.05;
        }

        .shape-3 {
          bottom: -10%;
          right: -5%;
          width: 45vw;
          height: 50vh;
          background: linear-gradient(225deg, var(--primary) 0%, transparent 100%);
          clip-path: polygon(0% 25%, 100% 0%, 75% 100%, 25% 100%);
          opacity: 0.06;
        }

        .shape-bottom-1 {
          bottom: 5%;
          left: -5%;
          width: 40vw;
          height: 30vh;
          background: linear-gradient(45deg, var(--accent) 0%, transparent 100%);
          clip-path: polygon(0% 0%, 100% 30%, 80% 100%, 20% 100%);
          opacity: 0.04;
          transform: rotate(10deg);
        }

        .shape-bottom-2 {
          bottom: 10%;
          right: 5%;
          width: 30vw;
          height: 25vh;
          background: linear-gradient(-45deg, var(--primary) 0%, transparent 100%);
          clip-path: polygon(20% 0%, 100% 0%, 80% 100%, 0% 100%);
          opacity: 0.03;
        }

        .streak {
          position: absolute;
          height: 40px;
          opacity: 0.04;
          background: var(--accent);
        }

        .streak-1 {
          top: 40%;
          left: -10%;
          width: 60vw;
          transform: skewX(-45deg);
        }

        .streak-2 {
          top: 45%;
          right: -10%;
          width: 40vw;
          background: var(--primary);
          transform: skewX(-45deg);
        }

        .streak-3 {
          bottom: 20%;
          left: 20%;
          width: 30vw;
          transform: skewX(-45deg);
        }

        .triangle {
          position: absolute;
          width: 0;
          height: 0;
          border-left: 100px solid transparent;
          border-right: 100px solid transparent;
          border-bottom: 173px solid var(--primary);
          opacity: 0.02;
        }

        .tri-1 {
          top: 10%;
          right: 20%;
          transform: rotate(30deg);
        }

        .tri-2 {
          bottom: 15%;
          left: 10%;
          transform: rotate(-20deg) scale(1.5);
        }

        [data-theme="dark"] .shape { opacity: 0.15; }
        [data-theme="dark"] .streak { opacity: 0.08; }
        [data-theme="dark"] .triangle { opacity: 0.05; }
      `}</style>
    </div>
  );
}
