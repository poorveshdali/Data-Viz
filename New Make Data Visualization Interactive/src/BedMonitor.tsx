import { useState, useMemo, useCallback } from "react";
import svgPaths from "@/imports/Login/svg-7zqqzslfqu"; // v2



// Tube gradient animation — fog blobs, flow stream, and vapor wisps
// driven by flow rate (sliderT 0–1), ported from tube-gradient-animation.html
function TubeGradient({ sliderT }: { sliderT: number }) {
  const streamDuration = (5.5 - sliderT * 3.3).toFixed(2) + "s";
  const streamOpacity = 0.35 + sliderT * 0.65;
  const activeWisps = sliderT <= 4 / 14 ? 1 : sliderT <= 10 / 14 ? 3 : 4;
  const wispDur = (7 - sliderT * 4.5) / 2;

  // Track each wisp's current x position — reassigned randomly after every cycle
  const [wispPositions, setWispPositions] = useState(() =>
    Array.from({ length: 4 }, () => 5 + Math.random() * 88)
  );
  const handleIteration = useCallback((idx: number) => {
    setWispPositions((prev) => {
      const next = [...prev];
      next[idx] = 5 + Math.random() * 88;
      return next;
    });
  }, []);

  const wispDelays = useMemo(() =>
    Array.from({ length: 4 }, () => Math.random())
  , []);

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: "inherit", pointerEvents: "none" }}>
      {/* Fog blobs — drifting straight down, speed scales 1x→2x with flow rate */}
      {[
        { left: "35%", w: 180, h: 180, baseDur: 18, delay: "0s" },
        { left: "60%", w: 220, h: 220, baseDur: 24, delay: "-8s" },
        { left: "25%", w: 160, h: 160, baseDur: 20, delay: "-14s" },
        { left: "55%", w: 200, h: 200, baseDur: 22, delay: "-5s" },
      ].map((b, i) => {
        const dur = (b.baseDur / (1 + sliderT * 3)).toFixed(2) + "s";
        return (
          <div key={i} style={{
            position: "absolute", left: b.left, top: 0,
            width: b.w, height: b.h, borderRadius: "50%",
            opacity: 0.25,
            background: "radial-gradient(circle, rgba(120,190,220,0.9) 0%, rgba(90,150,190,0.35) 55%, rgba(90,150,190,0) 75%)",
            filter: "blur(80px)",
            animation: `fogDrift ${dur} linear ${b.delay} infinite`,
          }} />
        );
      })}

      {/* Continuously-moving flow stream */}
      <div style={{
        position: "absolute", inset: "-15% -25%",
        backgroundImage: "radial-gradient(circle at 50% 50%, rgba(120,190,220,0.23) 0%, rgba(90,150,190,0.09) 55%, rgba(90,150,190,0) 75%)",
        backgroundRepeat: "repeat-y",
        backgroundSize: "100% 170px",
        filter: "blur(20px)",
        opacity: streamOpacity,
        animation: `streamMove ${streamDuration} linear infinite`,
        transition: "opacity 900ms ease",
      }} />

      {/* Vapor wisp trails — x position randomised after every cycle */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {Array.from({ length: activeWisps }, (_, i) => {
          const delay = -(wispDelays[i] * wispDur);
          return (
            <div
              key={i}
              onAnimationIteration={() => handleIteration(i)}
              style={{
                position: "absolute",
                top: 0,
                left: `${wispPositions[i]}%`,
                width: 3,
                height: 120,
                borderRadius: 9999,
                background: "linear-gradient(180deg, rgba(210,235,245,0) 0%, rgba(210,235,245,0.3) 25%, rgba(210,235,245,0.3) 75%, rgba(210,235,245,0) 100%)",
                filter: "blur(2px)",
                opacity: 0,
                animation: `wispFall ${wispDur.toFixed(2)}s linear ${delay.toFixed(2)}s infinite`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

const MIN_BED = 1;
const MAX_BED = 7;
const MIN_FLOW = 1;
const MAX_FLOW = 15;

const BED_GASES: Record<number, string> = {
  1: "Oxygen (O₂)",
  2: "Nitrous Oxide (N₂O)",
  3: "Medical Air",
  4: "Carbon Dioxide (CO₂)",
  5: "Nitrogen (N₂)",
  6: "Helium (He)",
  7: "Entonox (O₂/N₂O)",
};

// Soft pastel colours — medically associated hues for each gas
const GAS_COLORS: Record<number, string> = {
  1: "#93C5E8", // Oxygen      — medical blue (O₂ cylinders are blue)
  2: "#C4B5E8", // Nitrous Oxide — soft lavender (anaesthetic / calming)
  3: "#A8BDD4", // Medical Air  — neutral steel blue-grey
  4: "#96D4B4", // CO₂          — soft mint green (plant/organic)
  5: "#A0B8C8", // Nitrogen     — cool slate (inert, muted)
  6: "#F5C09A", // Helium       — warm peach (balloon warmth)
  7: "#C0AAE0", // Entonox      — blue-lavender blend (O₂ + N₂O mix)
};

// Gradient stops matching the slider: white → green → yellow → red
const GRAD_STOPS = [
  { t: 0,        r: 255, g: 255, b: 255 },
  { t: 0.461538, r: 46,  g: 227, b: 37  },
  { t: 0.802885, r: 255, g: 251, b: 34  },
  { t: 1,        r: 255, g: 30,  b: 0   },
];

function getGradientColor(t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  for (let i = 0; i < GRAD_STOPS.length - 1; i++) {
    const a = GRAD_STOPS[i], b = GRAD_STOPS[i + 1];
    if (clamped <= b.t) {
      const seg = (clamped - a.t) / (b.t - a.t);
      return `rgb(${Math.round(a.r + seg * (b.r - a.r))},${Math.round(a.g + seg * (b.g - a.g))},${Math.round(a.b + seg * (b.b - a.b))})`;
    }
  }
  return "rgb(255,30,0)";
}

function Frame({ bedNo, onPrev, onNext }: { bedNo: number; onPrev: () => void; onNext: () => void }) {
  return (
    <div
      className="-translate-x-1/2 absolute h-[76px] left-1/2 rounded-[20px] top-[66px] w-[334px]"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 100%)",
        backdropFilter: "blur(16px) saturate(160%)",
        WebkitBackdropFilter: "blur(16px) saturate(160%)",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)",
      }}
    >
      <div
        className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Inconsolata',sans-serif] font-extrabold justify-center leading-[0] left-[167px] text-[32px] text-center text-white top-[38px] whitespace-nowrap"
        style={{ fontVariationSettings: '"wdth" 100, "wght" 800' }}
      >
        <p className="leading-[normal]">Bed No. {bedNo}</p>
        <p className="leading-[normal] text-[11px] font-light mt-[4px] tracking-wide" style={{ color: "rgba(210,230,248,0.7)", fontVariationSettings: '"wdth" 100, "wght" 300' }}>Patient: Rahul S &nbsp;·&nbsp; Nurse: Payal</p>
      </div>
      <button
        onClick={onPrev}
        disabled={bedNo <= MIN_BED}
        className="absolute flex h-[19.919px] items-center justify-center left-[15px] top-[20.54px] w-[8.25px] cursor-pointer disabled:opacity-30 active:scale-90 transition-transform"
        aria-label="Previous bed"
      >
        <div className="-rotate-90 flex-none">
          <div className="h-[8.25px] relative w-[19.919px]">
            <div className="absolute inset-[-7.33%_-4.8%_-14%_-4.8%]">
              <svg className="block size-full" fill="none" height="10.0095" preserveAspectRatio="none" viewBox="0 0 21.8324 10.0095" width="21.8324">
                <path d={svgPaths.p37c1cf00} stroke="#D9D9D9" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>
      </button>
      <button
        onClick={onNext}
        disabled={bedNo >= MAX_BED}
        className="absolute flex h-[19.919px] items-center justify-center left-[305px] top-[21px] w-[8.25px] cursor-pointer disabled:opacity-30 active:scale-90 transition-transform"
        aria-label="Next bed"
      >
        <div className="-rotate-90 -scale-y-100 flex-none">
          <div className="h-[8.25px] relative w-[19.919px]">
            <div className="absolute inset-[-7.33%_-4.8%_-14%_-4.8%]">
              <svg className="block size-full" fill="none" height="10.0095" preserveAspectRatio="none" viewBox="0 0 21.8324 10.0095" width="21.8324">
                <path d={svgPaths.p37c1cf00} stroke="#D9D9D9" strokeWidth="3" />
              </svg>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

function HomeIndicator() {
  return (
    <div className="h-[34px] relative shrink-0 w-full">
      <div className="-translate-x-1/2 absolute bg-[#b2b2b2] bottom-[8px] h-[5px] left-1/2 rounded-[100px] w-[134px]" />
    </div>
  );
}

function IOsTabBar() {
  return (
    <div className="absolute content-stretch flex flex-col items-center left-0 pb-[2px] pt-[10px] top-[822px] w-[402px]">
      <HomeIndicator />
    </div>
  );
}

function FlowCard({ flowRate }: { flowRate: number }) {
  const display = String(flowRate).padStart(2, "0");
  const t = (flowRate - MIN_FLOW) / (MAX_FLOW - MIN_FLOW);
  return (
    // Exact properties from Figma Frame1 import
    <div className="-translate-x-1/2 [word-break:break-word] absolute font-['Inconsolata',sans-serif] font-light h-[150px] leading-[0] left-[calc(50%+4.5px)] rounded-[27px] text-center text-white top-[407px] w-[153px]" style={{ backgroundColor: "rgba(49, 72, 97, 0.6)" }}>
      <div
        className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col h-[73px] justify-center left-[77px] text-[96px] top-[53.5px] w-[96px]"
        style={{
          fontVariationSettings: '"wdth" 100, "wght" 300',
          color: getGradientColor(t),
          transition: "color 0.2s",
        }}
      >
        <p className="leading-[normal]">{display}</p>
      </div>
      <div
        className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col justify-center left-[77px] text-[24px] top-[120.5px] whitespace-nowrap"
        style={{ fontVariationSettings: '"wdth" 100, "wght" 300' }}
      >
        <p className="leading-[normal]">L/min</p>
      </div>
    </div>
  );
}

function FlowSlider({ flowRate, onChange }: { flowRate: number; onChange: (v: number) => void }) {
  const t = (flowRate - MIN_FLOW) / (MAX_FLOW - MIN_FLOW);

  return (
    <div className="absolute left-[38px] top-[620px] w-[335px]">
      <p
        className="text-center text-[15px] mb-[8px]"
        style={{ fontFamily: "'Inconsolata', monospace", color: "rgb(232, 244, 254)", letterSpacing: "0.3px", fontVariationSettings: '"wdth" 100, "wght" 400' }}
      >
        Prescribed safe range: 2–6 L/min
      </p>
      {/* Glassmorphism card */}
      <div
        className="rounded-[20px] px-[17px] py-[15px]"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%)",
          backdropFilter: "blur(16px) saturate(160%)",
          WebkitBackdropFilter: "blur(16px) saturate(160%)",
          border: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.18)",
        }}
      >
        <div className="relative h-[40px] flex items-center">
          {/* Full-width dim track (always visible underneath) */}
          <div
            className="absolute inset-y-[12px] inset-x-0 rounded-full"
            style={{ background: "rgba(180,190,210,0.25)" }}
          />
          {/* Gradient revealed only up to the thumb — clip-path masks the right portion */}
          <div
            className="absolute inset-y-[12px] left-0 rounded-full pointer-events-none"
            style={{
              width: "100%",
              background: "linear-gradient(to right, #ffffff 0%, #2EE325 46.15%, #FFFB22 80.29%, #FF1E00 100%)",
              clipPath: `inset(0 ${100 - t * 100}% 0 0 round 9999px)`,
              transition: "clip-path 0.05s linear",
            }}
          />
          {/* Native range input — transparent, sits on top for interaction */}
          <input
            type="range"
            min={MIN_FLOW}
            max={MAX_FLOW}
            step={1}
            value={flowRate}
            onChange={(e) => onChange(Number(e.target.value))}
            className="slider-input absolute inset-0 w-full opacity-0 cursor-pointer z-10"
            aria-label="Flow rate"
          />
          {/* Custom glassmorphic thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-[left] duration-75"
            style={{
              left: `${t * 100}%`,
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 100%)",
              backdropFilter: "blur(10px) saturate(150%)",
              WebkitBackdropFilter: "blur(10px) saturate(150%)",
              border: "1px solid rgba(255,255,255,0.35)",
              boxShadow: `0 2px 16px rgba(0,0,0,0.35), 0 0 0 2px ${getGradientColor(t)}44`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Group2({ timeRemaining }: { timeRemaining: number }) {
  const hrs = String(timeRemaining).padStart(2, "0");
  return (
    <div className="[word-break:break-word] absolute contents leading-[0] left-[48px] text-center text-white top-[736px]">
      <div
        className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Inconsolata',sans-serif] font-light h-[37px] justify-center left-[92.5px] text-[0px] top-[785.5px] w-[89px]"
        style={{ fontVariationSettings: '"wdth" 100, "wght" 300' }}
      >
        <p>
          <span className="font-bold leading-[normal] text-[48px]" style={{ fontVariationSettings: '"wdth" 100, "wght" 700' }}>{hrs}</span>
          <span className="font-bold leading-[normal] text-[13px]" style={{ fontVariationSettings: '"wdth" 100, "wght" 700' }}>{` `}</span>
          <span className="font-light leading-[normal] text-[24px]" style={{ fontVariationSettings: '"wdth" 100, "wght" 300' }}>hr</span>
        </p>
      </div>
      <div
        className="-translate-y-1/2 absolute flex flex-col font-['Inconsolata',sans-serif] font-bold h-[37px] justify-center left-[270px] text-[48px] top-[787.5px] w-[53px]"
        style={{ fontVariationSettings: '"wdth" 100, "wght" 700' }}
      >
        <p className="leading-[normal]">02</p>
      </div>
      <div
        className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col font-['Inconsolata',sans-serif] font-light justify-center left-[121px] text-[20px] top-[746.5px] whitespace-nowrap"
        style={{ fontVariationSettings: '"wdth" 100, "wght" 300' }}
      >
        <p className="leading-[normal]">Time Remaining</p>
      </div>
      <div
        className="-translate-y-1/2 absolute flex flex-col font-['Inconsolata',sans-serif] font-light justify-center left-[270px] text-[16px] top-[746.5px] whitespace-nowrap"
        style={{ fontVariationSettings: '"wdth" 100, "wght" 300' }}
      >
        <p className="leading-[normal]">No of Cylinder</p>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2 absolute h-[13px] left-[calc(50%+9.66px)] top-[calc(50%-404.5px)] w-[307.328px]">
      <svg className="absolute block inset-0 size-full" fill="none" height="13.0005" preserveAspectRatio="none" viewBox="0 0 307.328 13.0005" width="307.328">
        <g id="status bar">
          <path d={svgPaths.p5cc4500} fill="#B2B2B2" opacity="0.35" />
          <path d={svgPaths.pb846200} fill="#B2B2B2" />
        </g>
      </svg>
    </div>
  );
}

export default function BedMonitor() {
  const [bedNo, setBedNo] = useState(1);
  const [flowRate, setFlowRate] = useState(5);

  const handlePrev = () => setBedNo((n) => Math.max(MIN_BED, n - 1));
  const handleNext = () => setBedNo((n) => Math.min(MAX_BED, n + 1));

  const gasName = BED_GASES[bedNo];
  const gasColor = GAS_COLORS[bedNo];
  const sliderT = (flowRate - MIN_FLOW) / (MAX_FLOW - MIN_FLOW);
  const lineColor = getGradientColor(sliderT);
  // 12 hrs at min flow → 7 hrs at max flow
  const timeRemaining = Math.round(12 - sliderT * 5);

  return (
    <div className="bg-gradient-to-b from-[#1b3d64] overflow-clip relative rounded-[63px] size-full to-[#061a32]">
      {/* Left vertical line — color tracks slider gradient */}
      <div className="absolute flex h-[420px] items-center justify-center left-[51px] top-[193px] w-0">
        <div className="flex-none rotate-90">
          <div className="h-0 relative w-[420px]">
            <div className="absolute inset-[-3.5px_-1.06%]">
              <svg className="block size-full" fill="none" height="7" preserveAspectRatio="none" viewBox="0 0 426 7" width="426">
                <path d="M3.5 3.5H422.5" stroke={lineColor} strokeLinecap="round" strokeWidth="7" style={{ transition: "stroke 0.2s" }} />
              </svg>
            </div>
          </div>
        </div>
      </div>
      {/* Right vertical line */}
      <div className="absolute flex h-[420px] items-center justify-center left-[351px] top-[193px] w-0">
        <div className="flex-none rotate-90">
          <div className="h-0 relative w-[420px]">
            <div className="absolute inset-[-3.5px_-1.06%]">
              <svg className="block size-full" fill="none" height="7" preserveAspectRatio="none" viewBox="0 0 426 7" width="426">
                <path d="M3.5 3.5H422.5" stroke={lineColor} strokeLinecap="round" strokeWidth="7" style={{ transition: "stroke 0.2s" }} />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tube gradient animation — center zone between the two vertical lines */}
      <div style={{ position: "absolute", left: 51, top: 225, width: 300, height: 649, zIndex: 0, borderRadius: 12, maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%), linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)", maskComposite: "intersect", WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%), linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)", WebkitMaskComposite: "source-in" }}>
        <TubeGradient sliderT={sliderT} />
      </div>

      {/* All UI content above the snake layer */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }}>
        <div style={{ position: "relative", width: "100%", height: "100%", pointerEvents: "auto" }}>
      <Frame bedNo={bedNo} onPrev={handlePrev} onNext={handleNext} />
      <FlowSlider flowRate={flowRate} onChange={setFlowRate} />
      <IOsTabBar />
      <FlowCard flowRate={flowRate} />
      <div
        className="-translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Inconsolata',sans-serif] font-light h-[16px] justify-center leading-[0] left-[calc(50%-149px)] text-[15px] text-white top-[605px] w-[299px]"
        style={{ fontVariationSettings: '"wdth" 100, "wght" 300' }}
      >
        <p className="leading-[normal]"></p>
      </div>
      {/* Gas header rectangle — border and glow shift with gas colour */}
      <div
        className="-translate-x-1/2 absolute h-[63px] left-1/2 top-[162px] w-[308px]"
        style={{
          filter: `drop-shadow(0 0 10px ${gasColor}55) drop-shadow(0 0 24px ${gasColor}30)`,
          transition: "filter 0.5s ease",
        }}
      >
        <div className="absolute inset-[-6.35%_-1.3%]">
          <svg className="block size-full" fill="none" height="71" preserveAspectRatio="none" viewBox="0 0 316 71" width="316">
            <path
              d={svgPaths.p7ce3a00}
              fill={gasColor}
              fillOpacity={1}
              stroke="#254164"
              strokeWidth="0"
              style={{ transition: "fill 0.5s ease" }}
            />
          </svg>
        </div>
      </div>
      <Group2 timeRemaining={timeRemaining} />
      <div
        className="-translate-x-1/2 -translate-y-1/2 [word-break:break-word] absolute flex flex-col font-['Inconsolata',sans-serif] font-normal justify-center leading-[0] left-1/2 text-[20px] text-center text-white top-[193px] whitespace-nowrap"
        style={{ fontVariationSettings: '"wdth" 100, "wght" 400' }}
      >
        <p className="leading-[normal]">{gasName}</p>
      </div>
      <div className="-translate-x-1/2 absolute bg-black h-[36px] left-1/2 rounded-[18px] top-[14px] w-[124px]" />
      <StatusBar />
        </div>
      </div>
    </div>
  );
}
