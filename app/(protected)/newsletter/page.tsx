'use client';
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import BookLoader from '@/components/BookLoader';

const SCENE_NAMES = ["DAWN", "MIDDAY", "DUSK", "NIGHT", "STORM"];

// Shader Source Constants
const VS_SOURCE = `
attribute vec2 a;
void main() {
  gl_Position = vec4(a, 0.0, 1.0);
}
`;

const FS_SOURCE = `
precision highp float;

uniform vec2  uR;
uniform float uT, uS, uSc, uBl;
uniform vec3  uBg;

#define PI 3.14159265359
#define TAU 6.28318530718
#define MARCH_STEPS 22
#define REFINE_STEPS 5

float sat(float x) {
  return clamp(x, 0.0, 1.0);
}

float smoother(float x) {
  x = sat(x);
  return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
}

vec3 sCol(vec3 c0, vec3 c1, vec3 c2, vec3 c3, vec3 c4) {
  int si = int(uSc);
  vec3 a = c0;
  vec3 b = c1;
  if (si == 1) { a = c1; b = c2; }
  else if (si == 2) { a = c2; b = c3; }
  else if (si == 3) { a = c3; b = c4; }
  return mix(a, b, uBl);
}

float sF(float c0, float c1, float c2, float c3, float c4) {
  int si = int(uSc);
  float a = c0;
  float b = c1;
  if (si == 1) { a = c1; b = c2; }
  else if (si == 2) { a = c2; b = c3; }
  else if (si == 3) { a = c3; b = c4; }
  return mix(a, b, uBl);
}

mat2 rot(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float waveH(vec2 p, float t, float amp, float storm) {
  float h = 0.0;

  vec2 swell1 = normalize(vec2(1.0, 0.28));
  vec2 swell2 = normalize(vec2(-0.48, 0.88));
  vec2 swell3 = normalize(vec2(0.82, -0.16));

  swell2 = rot(storm * 0.18) * swell2;
  swell3 = rot(-storm * 0.14) * swell3;

  float d1 = dot(p, swell1);
  float d2 = dot(p, swell2);
  float d3 = dot(p, swell3);

  h += amp * 0.66 * sin(d1 * 0.42 + t * 0.38);
  h += amp * 0.22 * sin(d1 * 0.94 - t * 0.62);
  h += amp * 0.14 * sin(d2 * 1.18 - t * 0.82);
  h += amp * 0.09 * sin(d3 * 1.82 + t * 1.04);

  h += amp * (0.11 + storm * 0.07) * sin(p.x * 1.45 - t * 0.76 + p.y * 0.66);
  h += amp * (0.07 + storm * 0.05) * sin(p.x * 2.85 + t * 1.06 - p.y * 0.52);
  h += amp * (0.04 + storm * 0.03) * sin(p.x * 4.60 - t * 1.50 + p.y * 1.02);

  float micro = noise(p * 14.0 + vec2(t * 0.18, t * 0.06)) - 0.5;
  h += micro * amp * (0.010 + storm * 0.008);

  return h;
}

vec3 waveNorm(vec2 p, float t, float amp, float storm) {
  float e = 0.018;
  float hL = waveH(p - vec2(e, 0.0), t, amp, storm);
  float hR = waveH(p + vec2(e, 0.0), t, amp, storm);
  float hD = waveH(p - vec2(0.0, e), t, amp, storm);
  float hU = waveH(p + vec2(0.0, e), t, amp, storm);
  return normalize(vec3(-(hR - hL) / (2.0 * e), 1.0, -(hU - hD) / (2.0 * e)));
}

float starField(vec2 uv) {
  vec2 gv = floor(uv);
  vec2 lv = fract(uv) - 0.5;

  float h = hash(gv);
  float size = mix(0.012, 0.0025, h);
  float d = length(lv + vec2(hash(gv + 3.1) - 0.5, hash(gv + 7.3) - 0.5) * 0.25);
  float star = smoothstep(size, 0.0, d);
  star *= smoothstep(0.82, 1.0, h);
  return star;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - uR * 0.5) / uR.y;

  float s = smoother(uS);

  float camY = mix(1.14, 1.03, s);
  camY += sin(s * PI * 1.4) * 0.028;
  float camZ = mix(0.08, -0.18, s);
  float pitch = mix(0.115, 0.088, s);

  vec3 ro = vec3(0.0, camY, camZ);
  vec3 rd = normalize(vec3(uv.x, uv.y - pitch, -1.4));

  float storm = smoothstep(0.80, 1.0, s);
  float night = smoothstep(0.56, 0.84, s);

  vec3 skyTop = sCol(
    vec3(0.18, 0.06, 0.24),
    vec3(0.05, 0.24, 0.68),
    vec3(0.26, 0.06, 0.04),
    vec3(0.01, 0.01, 0.05),
    vec3(0.04, 0.05, 0.09)
  );

  vec3 skyHori = sCol(
    vec3(0.92, 0.48, 0.18),
    vec3(0.42, 0.62, 0.90),
    vec3(0.88, 0.32, 0.04),
    vec3(0.03, 0.05, 0.14),
    vec3(0.15, 0.17, 0.23)
  );

  vec3 sunCol = sCol(
    vec3(1.0, 0.62, 0.22),
    vec3(1.0, 0.96, 0.80),
    vec3(1.0, 0.38, 0.05),
    vec3(0.70, 0.75, 0.94),
    vec3(0.26, 0.28, 0.34)
  );

  vec3 seaDeep = sCol(
    vec3(0.08, 0.05, 0.12),
    vec3(0.03, 0.14, 0.34),
    vec3(0.10, 0.06, 0.04),
    vec3(0.00, 0.01, 0.03),
    vec3(0.03, 0.04, 0.07)
  );

  vec3 seaShlo = sCol(
    vec3(0.28, 0.17, 0.24),
    vec3(0.09, 0.38, 0.60),
    vec3(0.24, 0.13, 0.06),
    vec3(0.04, 0.06, 0.16),
    vec3(0.07, 0.10, 0.14)
  );

  vec3 fogCol = sCol(
    vec3(0.80, 0.50, 0.30),
    vec3(0.58, 0.72, 0.90),
    vec3(0.70, 0.28, 0.05),
    vec3(0.02, 0.03, 0.08),
    vec3(0.12, 0.14, 0.18)
  );

  float sunProgress = clamp(s / 0.58, 0.0, 1.0);
  float sunAngle = sunProgress * PI;
  float sunArcX = cos(sunAngle) * -0.75;
  float sunArcY = sin(sunAngle) * 0.38 - 0.08;

  vec3 sunDir = normalize(vec3(sunArcX, sunArcY, -1.0));
  vec3 moonDir = normalize(vec3(-0.14, 0.42, -1.0));

  float waveAmp = sF(0.082, 0.070, 0.100, 0.054, 0.30);
  waveAmp += storm * 0.020;

  float fogDen = sF(0.020, 0.010, 0.022, 0.034, 0.046);
  float moonAmt = sF(0.0, 0.0, 0.05, 0.92, 0.06);

  float sunAbove = step(0.0, sunDir.y);
  float sunGlow = smoothstep(-0.10, 0.06, sunDir.y);

  vec3 col;

  if (rd.y < 0.0) {
    float tFlat = ro.y / (-rd.y);
    float stepSize = tFlat / float(MARCH_STEPS);
    float t = stepSize;

    for (int i = 0; i < MARCH_STEPS; i++) {
      vec2 wpTest = ro.xz + rd.xz * t;
      float wy = ro.y + rd.y * t;
      if (wy < waveH(wpTest, uT, waveAmp, storm)) break;
      t += stepSize;
    }

    float ta = t - stepSize;
    float tb = t;

    for (int i = 0; i < REFINE_STEPS; i++) {
      float tm = (ta + tb) * 0.5;
      vec2 wpm = ro.xz + rd.xz * tm;
      if (ro.y + rd.y * tm < waveH(wpm, uT, waveAmp, storm)) tb = tm;
      else ta = tm;
    }

    t = (ta + tb) * 0.5;

    vec2 wp = ro.xz + rd.xz * t;
    vec3 n = waveNorm(wp, uT, waveAmp, storm);
    vec3 vDir = -rd;

    float fres = pow(1.0 - clamp(dot(n, vDir), 0.0, 1.0), 4.0);

    vec3 refl = reflect(rd, n);
    float rh = clamp(refl.y, 0.0, 1.0);

    vec3 reflSky = mix(skyHori, skyTop, pow(rh, 0.42));
    reflSky = mix(reflSky, skyHori, 0.12);

    float rSun = max(dot(refl, sunDir), 0.0);
    reflSky += sunCol * pow(rSun, 120.0) * 2.0 * sunGlow;
    reflSky += sunCol * pow(rSun, 18.0) * 0.07 * sunGlow;

    if (moonAmt > 0.04) {
      float rMoon = max(dot(refl, moonDir), 0.0);
      reflSky += vec3(0.72, 0.80, 0.95) * pow(rMoon, 120.0) * 0.78 * moonAmt;
    }

    float depth = exp(-t * 0.40);
    vec3 waterC = mix(seaDeep, seaShlo, depth * 0.5);

    vec3 absorb = vec3(0.85, 0.92, 1.0);
    waterC *= mix(vec3(1.0), absorb, clamp(t * 0.25, 0.0, 1.0));

    col = mix(waterC, reflSky, 0.15 + fres * 0.34);

    float spec = pow(max(dot(reflect(-sunDir, n), vDir), 0.0), 200.0);
    col += sunCol * spec * 1.10 * sunAbove;

    float broadSpec = pow(max(dot(reflect(-sunDir, n), vDir), 0.0), 32.0);
    col += sunCol * broadSpec * 0.12 * sunGlow;

    float sunLine = pow(max(dot(reflect(rd, n), sunDir), 0.0), 8.0);
    col += sunCol * sunLine * 0.48 * smoothstep(0.0, 0.35, -rd.y) * sunGlow;

    float sparkle = noise(wp * 18.0 + vec2(uT * 0.55, uT * 0.22));
    sparkle = smoothstep(0.94, 1.0, sparkle);
    col += sunCol * sparkle * 0.08 * sunGlow * sunAbove;

    if (moonAmt > 0.04) {
      float mSpec = pow(max(dot(reflect(-moonDir, n), vDir), 0.0), 520.0);
      col += vec3(0.72, 0.80, 0.95) * mSpec * 0.09 * moonAmt;
    }

    float hC = waveH(wp, uT, waveAmp, storm);
    float hL = waveH(wp - vec2(0.025, 0.0), uT, waveAmp, storm);
    float hR = waveH(wp + vec2(0.025, 0.0), uT, waveAmp, storm);
    float hD = waveH(wp - vec2(0.0, 0.025), uT, waveAmp, storm);
    float hU = waveH(wp + vec2(0.0, 0.025), uT, waveAmp, storm);

    float curvature = hR + hL + hU + hD - 4.0 * hC;
    float foam = clamp(curvature * (24.0 + storm * 10.0), 0.0, 1.0);
    col += foam * vec3(1.0) * (0.03 + storm * 0.10);

    float fog = 1.0 - exp(-t * fogDen * 1.65);
    col = mix(col, fogCol, fog);
  } else {
    float h = clamp(rd.y, 0.0, 1.0);
    col = mix(skyHori, skyTop, pow(h, 0.38));
  }

  float horizonW = 0.008;
  float skyMix = smoothstep(-horizonW, horizonW, rd.y);

  vec3 skyCol;
  {
    float h = clamp(rd.y, 0.0, 1.0);
    skyCol = mix(skyHori, skyTop, pow(h, 0.38));

    float cloudBand = noise(rd.x * 5.5 + vec2(rd.y * 3.0, uT * 0.015));
    float cloudBand2 = noise(rd.x * 8.0 - vec2(rd.y * 4.0, uT * 0.010));
    float clouds = smoothstep(0.62, 0.86, cloudBand * 0.65 + cloudBand2 * 0.35);
    clouds *= smoothstep(-0.02, 0.24, rd.y);
    clouds *= 0.08 + storm * 0.18;

    vec3 cloudCol = mix(
      vec3(1.0, 0.82, 0.65),
      vec3(0.42, 0.48, 0.56),
      storm
    );

    skyCol = mix(skyCol, mix(skyCol * 0.97, cloudCol, 0.35), clouds);

    float sd = max(dot(rd, sunDir), 0.0);
    skyCol += sunCol * pow(sd, 380.0) * 6.8 * sunGlow;
    skyCol += sunCol * pow(sd, 22.0)  * 0.20 * sunGlow;
    skyCol += sunCol * pow(sd, 5.0)   * 0.09 * sunGlow;

    float sunDisk = smoothstep(0.99925, 0.99995, dot(rd, sunDir));
    skyCol += sunCol * sunDisk * 2.6 * sunGlow;

    float horizonBand = exp(-abs(rd.y) * 24.0);
    skyCol += sunCol * horizonBand * 0.11 * sunGlow;

    float viewSun = max(dot(rd, sunDir), 0.0);
    skyCol += sunCol * pow(viewSun, 3.0) * 0.035 * sunGlow;

    if (moonAmt > 0.04) {
      float md = max(dot(rd, moonDir), 0.0);
      skyCol += vec3(0.88, 0.92, 1.0) * pow(md, 820.0) * 7.4 * moonAmt;
      skyCol += vec3(0.88, 0.92, 1.0) * pow(md, 6.0)   * 0.045 * moonAmt;
    }

    if (night > 0.02) {
      vec2 starUv = rd.xy / max(0.12, rd.z + 1.6);
      starUv *= 140.0;
      float stars = starField(starUv) + starField(starUv * 0.55 + 11.7) * 0.65;
      stars *= smoothstep(0.02, 0.26, rd.y);
      stars *= (1.0 - storm * 0.85);
      skyCol += vec3(0.80, 0.88, 1.0) * stars * night * 0.82;
    }

    float horizonMist = exp(-abs(rd.y) * mix(38.0, 22.0, storm));
    skyCol += fogCol * horizonMist * (0.09 + storm * 0.10);

    skyCol = mix(skyCol, skyCol * vec3(0.91, 0.94, 0.98), storm * 0.22);
  }

  col = mix(col, skyCol, skyMix);

  float hEdge = smoothstep(-0.008, 0.018, rd.y);
  col = mix(fogCol, col, hEdge * 0.25 + 0.75);

  float grain = hash(gl_FragCoord.xy * 0.5 + floor(uT * 12.0)) - 0.5;
  col += grain * 0.006;

  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

function ImageSlider({ images, isLarge }: { images: string[], isLarge: boolean }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  if (images.length === 0) return null;

  return (
    <div style={{ position: 'relative', height: isLarge ? '800px' : '700px', width: '100%', overflow: 'hidden', borderRadius: '12px', marginBottom: '2.5rem', background: 'rgba(0,0,0,0.2)' }}>
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`Slide ${idx}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: idx === currentIdx ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out'
          }}
        />
      ))}

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrentIdx(prev => (prev - 1 + images.length) % images.length); }}
            style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: 'white', cursor: 'pointer', zIndex: 10 }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrentIdx(prev => (prev + 1) % images.length); }}
            style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: 'white', cursor: 'pointer', zIndex: 10 }}
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
}

export default function NewsletterPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const res = await fetch('/api/posts?type=NEWSLETTER');
    if (res.ok) {
      setPosts(await res.json());
    }
    setIsLoading(false);
  };

  // WebGL Renderer Effect
  useEffect(() => {
    if (!canvasRef.current || isLoading) return;

    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance"
    });

    if (!gl) return;

    const mkShader = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    };

    const vert = mkShader(gl.VERTEX_SHADER, VS_SOURCE);
    const frag = mkShader(gl.FRAGMENT_SHADER, FS_SOURCE);
    if (!vert || !frag) return;

    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const ap = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(ap);
    gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);

    const uR = gl.getUniformLocation(prog, "uR");
    const uTi = gl.getUniformLocation(prog, "uT");
    const uScroll = gl.getUniformLocation(prog, "uS");
    const uScene = gl.getUniformLocation(prog, "uSc");
    const uBlend = gl.getUniformLocation(prog, "uBl");
    const uBg = gl.getUniformLocation(prog, "uBg");

    const hexToVec3 = (hex: string) => {
      const n = parseInt(hex.replace("#", ""), 16);
      return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    };

    let theme = document.documentElement.getAttribute('data-theme') || 'light';
    const updateThemeUniform = () => {
      const color = theme === 'dark' ? "#0a0a0f" : "#eef4ff";
      const [r, g, b] = hexToVec3(color);
      gl.uniform3f(uBg, r, g, b);
    };
    updateThemeUniform();

    let scrollTgt = 0;
    let scrollSmooth = 0;
    const N_SCENES = SCENE_NAMES.length;

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uR, canvas.width, canvas.height);
    };

    const handleScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollTgt = max > 0 ? window.scrollY / max : 0;
      setProgress(Math.round(scrollTgt * 100));
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    handleResize();
    handleScroll();

    let raf: number;
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);

      scrollSmooth += (scrollTgt - scrollSmooth) * 0.1;
      const raw = scrollSmooth * (N_SCENES - 1);
      const si = Math.min(Math.floor(raw), N_SCENES - 2);
      const bl = raw - si;

      setActiveSceneIndex(Math.min(N_SCENES - 1, Math.floor(scrollSmooth * N_SCENES)));

      gl.uniform1f(uTi, (now - t0) / 1000);
      gl.uniform1f(uScroll, scrollSmooth);
      gl.uniform1f(uScene, si);
      gl.uniform1f(uBlend, bl);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(raf);
    };
  }, [isLoading]);

  // Reveal Animation Effect
  useEffect(() => {
    if (isLoading) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.tag, h1, h2, .body-text, .cta, .h-line').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [isLoading, posts]);

  if (isLoading) return <BookLoader text="Opening the Cinematic News Horizon..." />;

  return (
    <div className="newsletter-cinematic">
      <canvas ref={canvasRef} id="webgl_canvas" />

      <div id="hud">
        <div id="hud_pct">{String(progress).padStart(3, '0')}%</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="scene-label">{SCENE_NAMES[activeSceneIndex]}</div>
      </div>

      <div id="scene_strip">
        {SCENE_NAMES.map((_, i) => (
          <div key={i} className={`scene-dot ${i === activeSceneIndex ? 'active' : ''}`} />
        ))}
      </div>

      <div id="scroll_container">
        {/* Welcome Section */}
        <section id="s-intro">
          <div className="text-card">
            <div className="tag">Volume {new Date().getFullYear()}</div>
            <h1>SVM<br />NEWS<br />HORIZON</h1>
            <p className="body-text">
              Welcome to our newsletter. Scroll through the shifting tides of our school
              community, where every achievement and story moves like the endless sea.
            </p>
            <a className="cta" href="#s-post-0" onClick={(e) => {
              e.preventDefault();
              document.getElementById('s-post-0')?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Begin Journey <ArrowRight size={14} style={{ marginLeft: '8px' }} />
            </a>
          </div>
        </section>

        {/* Dynamic Post Sections */}
        {posts.map((post, idx) => {
          const isRight = idx % 2 === 0;
          const isCenter = idx % 3 === 2;
          const cardClass = isCenter ? 'center' : isRight ? 'right' : '';
          const additionalImages = post.additionalImages ? JSON.parse(post.additionalImages) : [];
          const allImages = post.imagePath ? [post.imagePath, ...additionalImages] : additionalImages;

          return (
            <section key={post.id} id={`s-post-${idx}`}>
              <div className={`text-card ${cardClass}`}>
                <div className="h-line"></div>
                <div className="tag">{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</div>
                <h2>{post.title.split(' ').map((word: string, i: number) => <span key={i}>{word}<br /></span>)}</h2>

                {allImages.length > 0 && (
                  <div className="content-media">
                    <ImageSlider images={allImages} isLarge={false} />
                  </div>
                )}

                {post.videoPath && (
                  <video src={post.videoPath} controls className="section-video" />
                )}

                <div className="body-text">
                  {post.content.split('\n').map((line: string, i: number) => (
                    <div key={i} style={{ marginBottom: line.trim() ? '0.8rem' : '1.5rem', display: 'flex', gap: '10px' }}>
                      {line.trim().startsWith('•') || line.trim().startsWith('-') ? (
                        <span>{line}</span>
                      ) : (
                        line.trim() && <span>{line}</span>
                      )}
                    </div>
                  ))}
                </div>

                {idx < posts.length - 1 && (
                  <a className="cta" href={`#s-post-${idx + 1}`} onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(`s-post-${idx + 1}`)?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    Next Chapter <ArrowRight size={14} style={{ marginLeft: '8px' }} />
                  </a>
                )}
              </div>
            </section>
          );
        })}

        {posts.length === 0 && (
          <section>
            <div className="text-card center">
              <div className="tag">Status</div>
              <h2>QUIET<br />WATERS</h2>
              <p className="body-text">No stories to tell yet. Check back soon for the latest updates from SVM.</p>
            </div>
          </section>
        )}
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400&display=swap");

        .newsletter-cinematic {
          --dark-bg: #0a0a0f;
          --dark-fg: #e8e4d9;
          --dark-muted: #6a6a7e;
          --dark-accent: #c8ff47;
          --dark-card-bg: rgba(10, 10, 15, 0.4);
          --dark-card-border: rgba(200, 255, 71, 0.3);

          --light-bg: #eef4ff;
          --light-fg: #0b141a;
          --light-muted: #6c8296;
          --light-accent: #1b7ed6;
          --light-card-bg: rgba(245, 249, 255, 0.6);
          --light-card-border: rgba(27, 126, 214, 0.4);

          --bg: var(--dark-bg);
          --fg: var(--dark-fg);
          --muted: var(--dark-muted);
          --accent: var(--dark-accent);
          --card-bg: var(--dark-card-bg);
          --card-border: var(--dark-card-border);

          --font-display: "Bebas Neue", sans-serif;
          --font-mono: "DM Mono", monospace;
          --hairline: 0.0625rem;
          --ui-inset: 2rem;
        }

        [data-theme="light"] .newsletter-cinematic {
          --bg: var(--light-bg);
          --fg: var(--light-fg);
          --muted: var(--light-muted);
          --accent: var(--light-accent);
          --card-bg: var(--light-card-bg);
          --card-border: var(--light-card-border);
        }

        #webgl_canvas {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          z-index: 0;
          pointer-events: none;
        }

        #hud {
          position: fixed;
          top: 8rem;
          right: var(--ui-inset);
          z-index: 10;
          text-align: right;
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          color: var(--muted);
          text-transform: uppercase;
          font-family: var(--font-mono);
        }

        .progress-bar {
          width: 7.5rem;
          height: 1px;
          background: var(--muted);
          margin-top: 0.5rem;
          margin-left: auto;
          position: relative;
          overflow: hidden;
        }

        .progress-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: var(--accent);
          transition: width 0.1s linear;
        }

        .scene-label {
          font-size: 0.6rem;
          color: var(--accent);
          margin-top: 0.4rem;
        }

        #scene_strip {
          position: fixed;
          left: 2rem;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .scene-dot {
          width: 0.25rem;
          height: 0.25rem;
          border-radius: 50%;
          background: var(--muted);
          transition: all 0.3s;
        }

        .scene-dot.active {
          background: var(--accent);
          transform: scale(1.8);
        }

        #scroll_container {
          position: relative;
          z-index: 1;
        }

        section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding: 6rem 5rem;
        }

        .text-card {
          max-width: 70rem;
          padding: 4.5rem;
          background: var(--card-bg);
          border: var(--hairline) solid var(--card-border);
          border-radius: 32px;
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          box-shadow: 0 40px 80px rgba(0,0,0,0.3);
          transition: all 0.5s ease;
          width: 90%;
        }

        .text-card.right { margin-left: auto; text-align: right; }
        .text-card.center { max-width: 85rem; margin: 0 auto; text-align: center; }

        .tag {
          font-size: 0.85rem;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 2rem;
          font-family: var(--font-mono);
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        h1, h2 {
          font-family: var(--font-display);
          font-weight: 400;
          letter-spacing: 0.05em;
          line-height: 0.9;
          margin-bottom: 1.5rem;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s;
        }

        h1 { font-size: 7.5rem; }
        h2 { font-size: 5.5rem; }

        .body-text {
          font-size: 1.15rem;
          line-height: 1.9;
          color: var(--fg);
          opacity: 0.95;
          margin-top: 2rem;
          font-family: var(--font-mono);
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s;
        }

        .tag.visible, h1.visible, h2.visible, .body-text.visible, .cta.visible, .h-line.visible {
          opacity: 1;
          transform: translateY(0) scaleX(1);
        }

        .h-line {
          width: 100px;
          height: 1px;
          background: var(--accent);
          margin-bottom: 2rem;
          opacity: 0;
          transform: scaleX(0);
          transform-origin: left;
          transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .text-card.right .h-line { transform-origin: right; margin-left: auto; }
        .text-card.center .h-line { transform-origin: center; margin: 0 auto 1.5rem; }

        .cta {
          display: inline-flex;
          align-items: center;
          margin-top: 2rem;
          padding: 0.75rem 1.5rem;
          border: 1px solid var(--accent);
          color: var(--accent);
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.3s;
          opacity: 0;
          transform: translateY(20px);
        }

        .cta:hover {
          background: var(--accent);
          color: var(--bg);
        }

        .section-video {
          width: 100%;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          border: 1px solid var(--card-border);
        }

        .loading-screen {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--dark-bg);
          color: white;
          font-family: var(--font-display);
        }

        @media (max-width: 768px) {
          section { padding: 4rem 1.5rem; }
          .text-card { padding: 2rem; }
          h1 { font-size: 4rem; }
          h2 { font-size: 3rem; }
          #hud, #scene_strip { display: none; }
        }
      `}</style>
    </div>
  );
}
