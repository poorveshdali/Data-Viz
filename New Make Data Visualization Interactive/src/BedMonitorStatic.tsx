import { useState, useMemo, useCallback } from "react"; // v2

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

const GAS_COLORS: Record<number, string> = {
  1: "#93C5E8",
  2: "#C4B5E8",
  3: "#A8BDD4",
  4: "#96D4B4",
  5: "#A0B8C8",
  6: "#F5C09A",
  7: "#C0AAE0",
};

function TubeGradient({ sliderT }: { sliderT: number }) {
  const streamDuration = (5.5 - sliderT * 3.3).toFixed(2) + "s";
  const streamOpacity = 0.35 + sliderT * 0.65;
  const activeWisps = sliderT <= 4 / 14 ? 1 : sliderT <= 10 / 14 ? 3 : 4;
  const wispDur = (7 - sliderT * 4.5) / 2;

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
      {/* Fog blobs — speed scales with flow rate */}
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
      {/* Flow stream */}
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
      {/* Wisp trails */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        {Array.from({ length: activeWisps }, (_, i) => {
          const delay = -(wispDelays[i] * wispDur);
          return (
            <div
              key={i}
              onAnimationIteration={() => handleIteration(i)}
              style={{
                position: "absolute", top: 0,
                left: `${wispPositions[i]}%`,
                width: 3, height: 120, borderRadius: 9999,
                background: "linear-gradient(180deg, rgba(210,235,245,0) 0%, rgba(210,235,245,0.3) 25%, rgba(210,235,245,0.3) 75%, rgba(210,235,245,0) 100%)",
                filter: "blur(2px)", opacity: 0,
                animation: `wispFall ${wispDur.toFixed(2)}s linear ${delay.toFixed(2)}s infinite`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

const assetPathPrefix = `${import.meta.env.BASE_URL}assets`;
const imgGroup38 = `${assetPathPrefix}/2c809.svg`;
const imgGroup39 = `${assetPathPrefix}/a1cff.svg`;
const imgLine4 = `${assetPathPrefix}/6b830.svg`;
const imgLine5 = `${assetPathPrefix}/17da0.svg`;
const imgEllipse74 = `${assetPathPrefix}/59af8.svg`;
const imgVector = `${assetPathPrefix}/bbfb4.svg`;
const imgVector1 = `${assetPathPrefix}/f5592.svg`;
const imgVector2 = `${assetPathPrefix}/cf4af.svg`;
const imgVector3 = `${assetPathPrefix}/5f3b1.svg`;
const imgIcon = `${assetPathPrefix}/3ca94.svg`;

const BED_INFO: Record<number, { patient: string; nurse: string }> = {
  1: { patient: "Rahul S", nurse: "Payal" },
  2: { patient: "Meera K", nurse: "Anjali" },
  3: { patient: "Arjun V", nurse: "Sunita" },
  4: { patient: "Priya M", nurse: "Rekha" },
  5: { patient: "Suresh R", nurse: "Divya" },
  6: { patient: "Kavitha N", nurse: "Shalini" },
  7: { patient: "Rajan P", nurse: "Usha" },
};

export default function BedMonitorStatic() {
  const [bedNo, setBedNo] = useState(1);
  const [flowRate, setFlowRate] = useState(5);
  const handlePrev = () => setBedNo((n) => Math.max(MIN_BED, n - 1));
  const handleNext = () => setBedNo((n) => Math.min(MAX_BED, n + 1));
  const { patient, nurse } = BED_INFO[bedNo];
  const sliderT = (flowRate - MIN_FLOW) / (MAX_FLOW - MIN_FLOW);
  const gasName = BED_GASES[bedNo];
  const gasColor = GAS_COLORS[bedNo];

  // Circle fill: blue at bottom (sliderT=0) → cyan → green → orange → red at top (sliderT=1)
  const gaugeColor = (() => {
    const stops = [
      [0,    [59,  130, 246]],  // blue
      [0.33, [34,  211, 238]],  // cyan
      [0.55, [34,  197, 94]],   // green
      [0.75, [251, 146, 60]],   // orange
      [1,    [239, 68,  68]],   // red
    ] as [number, number[]][];
    let i = stops.length - 2;
    for (let j = 0; j < stops.length - 1; j++) {
      if (sliderT <= stops[j + 1][0]) { i = j; break; }
    }
    const [t0, c0] = stops[i];
    const [t1, c1] = stops[i + 1];
    const f = (sliderT - t0) / (t1 - t0);
    const r = Math.round(c0[0] + f * (c1[0] - c0[0]));
    const g = Math.round(c0[1] + f * (c1[1] - c0[1]));
    const b = Math.round(c0[2] + f * (c1[2] - c0[2]));
    return `rgb(${r},${g},${b})`;
  })();

  return (
    <div className="relative" style={{ width: 402, height: 874 }}>
      <div
        className="absolute h-[874px] left-0 overflow-clip rounded-[63px] top-0 w-[402px]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgb(27,61,100) 0%, rgb(25,58,96) 7.69%, rgb(24,55,92) 15.38%, rgb(22,53,88) 23.08%, rgb(20,50,84) 30.77%, rgb(18,47,80) 38.46%, rgb(17,44,76) 46.15%, rgb(15,42,72) 53.85%, rgb(13,39,68) 61.54%, rgb(11,36,64) 69.23%, rgb(9,33,60) 76.92%, rgb(7,30,56) 84.62%, rgb(5,27,52) 92.31%, rgb(3,24,48) 100%)",
        }}
      >
        {/* Tube gradient container — animated, speed driven by slider */}
        <div
          className="absolute left-[51px] top-0 w-[300px] rounded-[12px]"
          style={{
            height: 625,
            maskImage: "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%), linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            maskComposite: "intersect",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%), linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            WebkitMaskComposite: "source-in",
          }}
        >
          <TubeGradient sliderT={sliderT} />
        </div>

        {/* Left scale — ticks flush left, labels to the right, 0–15 */}
        <div className="absolute h-[465px] left-[53px] top-[112px] w-[40px]">
          {Array.from({ length: 16 }, (_, v) => {
            const y = 416.5 - v * (320 / 15);
            const isMajor = v % 5 === 0;
            const isActive = Math.round(sliderT * 15) === v;
            return (
              <div key={v} className="absolute flex items-center" style={{ top: y, left: 0 }}>
                <div
                  className="flex-none"
                  style={{
                    width: isMajor ? 14 : 8,
                    height: 1.5,
                    background: isActive ? "rgba(255,255,255,0.9)" : isMajor ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Right scale — ticks flush right, labels to the left, 0–15 */}
        <div className="absolute h-[465px] left-[308px] top-[112px] w-[40px]">
          {Array.from({ length: 16 }, (_, v) => {
            const y = 416.5 - v * (320 / 15);
            const isMajor = v % 5 === 0;
            const isActive = Math.round(sliderT * 15) === v;
            return (
              <div key={v} className="absolute flex items-center justify-end" style={{ top: y, left: 0, right: 0 }}>
                <div
                  className="flex-none"
                  style={{
                    width: isMajor ? 14 : 8,
                    height: 1.5,
                    background: isActive ? "rgba(255,255,255,0.9)" : isMajor ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Flow rate gauge — circle + horizontal lines */}
        <div className="absolute h-[97px] left-[24px] w-[354px]" style={{ top: Math.max(160, Math.round(480 - sliderT * 368)), transition: "top 0.1s linear" }}>
          {/* Left horizontal line */}
          <div className="absolute flex h-0 items-center justify-center left-[-6px] top-[43px] w-[176px]">
            <div className="flex-none rotate-180">
              <div className="h-0 relative w-[176px]">
                <div className="absolute inset-[-10px_2.84%_0_0]">
                  <img alt="" className="block max-w-none size-full" src={imgLine4} />
                </div>
              </div>
            </div>
          </div>
          {/* Right horizontal line */}
          <div className="absolute h-0 left-[188px] top-[53px] w-[172px]">
            <div className="absolute inset-[-10px_2.91%_0_0]">
              <img alt="" className="block max-w-none size-full" src={imgLine5} />
            </div>
          </div>
          {/* Circle — color interpolates blue→red with sliderT */}
          <div className="absolute left-[131px] size-[97px] top-[-0.06px]">
            <div className="absolute inset-[-23.71%_-27.84%_-31.96%_-27.84%]">
              <svg preserveAspectRatio="none" overflow="visible" style={{ display: "block" }} width="151" height="151" viewBox="0 0 151 151" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g filter="url(#circleFilter)" >
                  <circle cx="75.5" cy="71.5" r="48.5" fill={gaugeColor} shapeRendering="crispEdges" style={{ transition: "fill 0.1s linear" }} />
                  <circle cx="75.5" cy="71.5" r="50" stroke="white" strokeOpacity="0.9" strokeWidth="3" shapeRendering="crispEdges" />
                </g>
                <defs>
                  <filter id="circleFilter" x="-8.9" y="-12.9" width="168.8" height="168.8" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="4" />
                    <feGaussianBlur stdDeviation="12" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dy="1" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.18 0" />
                    <feBlend mode="normal" in="shape" result="effect2_innerShadow" />
                  </filter>
                </defs>
              </svg>
            </div>
          </div>
          {/* L/min */}
          <p
            className="-translate-x-1/2 absolute leading-[normal] left-[180px] text-[15px] text-center top-[56.94px] whitespace-nowrap"
            style={{ color: "rgba(255,255,255,0.8)", fontFamily: "Inconsolata, monospace", fontWeight: 300, fontVariationSettings: '"wdth" 100' }}
          >
            L/min
          </p>
          {/* Flow value */}
          <p
            className="-translate-x-1/2 absolute leading-[normal] left-[179px] text-[40px] text-center top-[14.94px] whitespace-nowrap"
            style={{ color: "rgba(255,255,255,0.8)", fontFamily: "Inconsolata, monospace", fontWeight: 300, fontVariationSettings: '"wdth" 100' }}
          >
            {String(Math.round(sliderT * 15)).padStart(2, "0")}
          </p>
        </div>

        {/* Left vertical gradient line */}
        <div className="absolute flex items-center justify-center" style={{ top: "9.59%", left: "12.69%", right: "87.31%", bottom: "29.76%", containerType: "size" }}>
          <div className="flex-none rotate-90" style={{ height: 0, width: "100cqh" }}>
            <div className="relative size-full">
              <div className="absolute inset-[-3.51px_-0.66%]">
                <img alt="" className="block max-w-none size-full" src={imgVector} />
              </div>
            </div>
          </div>
        </div>

        {/* Right vertical gradient line */}
        <div className="absolute flex items-center justify-center" style={{ top: "9.59%", left: "87.31%", right: "12.69%", bottom: "29.76%", containerType: "size" }}>
          <div className="flex-none rotate-90" style={{ height: 0, width: "100cqh" }}>
            <div className="relative size-full">
              <div className="absolute inset-[-3.51px_-0.66%]">
                <img alt="" className="block max-w-none size-full" src={imgVector} />
              </div>
            </div>
          </div>
        </div>

        {/* Gas name bar */}
        <div
          className="absolute h-[63px] left-[47px] top-[562px] w-[308px]"
          style={{
            filter: `drop-shadow(0px 0px 10px ${gasColor}55) drop-shadow(0px 0px 24px ${gasColor}30)`,
            transition: "filter 0.5s ease",
          }}
        >
          <div className="absolute inset-[6.26%_-0.01%_4.84%_0]">
            <svg className="absolute block inset-0 max-w-none size-full" preserveAspectRatio="none" overflow="visible" viewBox="0 0 308 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 6.22222C0 2.78579 3.13401 0 7 0H301C304.866 0 308 2.78579 308 6.22222V49.7778C308 53.2142 304.866 56 301 56H7C3.134 0 0 2.78579 0 49.7778V6.22222Z" fill={gasColor} style={{ transition: "fill 0.5s ease" }} />
            </svg>
          </div>
          <p
            className="-translate-x-1/2 absolute leading-[normal] left-[154px] text-[20px] text-center text-white top-[19.5px] whitespace-nowrap"
            style={{ fontFamily: "Inconsolata, monospace", fontWeight: 400, fontVariationSettings: '"wdth" 100' }}
          >
            {gasName}
          </p>
        </div>

        {/* Time Remaining */}
        <p
          className="-translate-x-1/2 absolute leading-[normal] left-[126px] text-[20px] text-center text-white top-[663px] whitespace-nowrap"
          style={{ fontFamily: "Inconsolata, monospace", fontWeight: 300, fontVariationSettings: '"wdth" 100' }}
        >
          Time Remaining:
        </p>
        <div className="absolute flex flex-col h-[37px] items-start justify-center left-[263px] top-[655px] w-[89px]">
          <p
            className="leading-[0] text-center text-white whitespace-nowrap w-full"
            style={{ fontFamily: "Inconsolata, monospace", fontWeight: 700, fontVariationSettings: '"wdth" 100' }}
          >
            <span className="leading-[normal] text-[48px]">11</span>
            <span className="leading-[normal] text-[13px]"> </span>
            <span className="leading-[normal] text-[24px]" style={{ fontWeight: 300 }}>hr</span>
          </p>
        </div>

        {/* Bed No. widget */}
        <div
          className="absolute h-[76px] left-[34px] rounded-[20px] top-[79.94px] w-[334px]"
          style={{
            border: "0.584px solid rgba(255,255,255,0.18)",
            boxShadow: "0px 4px 24px 0px rgba(0,0,0,0.25)",
          }}
        >
          {/* Glassmorphism fill */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none rounded-[20px]"
            style={{
              backdropFilter: "blur(16px)",
              backgroundImage: "linear-gradient(167.18deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.04) 100%)",
            }}
          />
          {/* Text group — vertically centred in 76px */}
          <div className="absolute flex flex-col items-start justify-center left-[71.5px] top-[13.5px] w-[191px]">
            <div className="flex flex-col items-center w-full">
              <p
                className="leading-[normal] text-[32px] text-center text-white whitespace-nowrap"
                style={{ fontFamily: "Inconsolata, monospace", fontWeight: 800, fontVariationSettings: '"wdth" 100' }}
              >
                Bed No. {bedNo}
              </p>
            </div>
            <div className="flex flex-col items-center h-[16px] pt-[4px] w-full">
              <p
                className="leading-[normal] text-[11px] text-center tracking-[0.275px] whitespace-pre"
                style={{ color: "rgba(210,230,248,0.7)", fontFamily: "Inconsolata, monospace", fontWeight: 300, fontVariationSettings: '"wdth" 100' }}
              >
                {`Patient: ${patient}  ·  Nurse: ${nurse}`}
              </p>
            </div>
          </div>
          {/* Left arrow button */}
          <button
            onClick={handlePrev}
            disabled={bedNo <= MIN_BED}
            aria-label="Previous bed"
            className="absolute flex items-center justify-center cursor-pointer active:scale-90 transition-all"
            style={{ opacity: bedNo <= MIN_BED ? 0.3 : 1, top: "calc(36.92% - 0.15px)", left: "calc(3.59% - 0.54px)", right: "calc(94.21% + 0.52px)", bottom: "calc(36.9% - 0.15px)", containerType: "size" }}
          >
            <div className="-rotate-90 flex-none" style={{ height: "100cqw", width: "100cqh" }}>
              <div className="relative size-full">
                <div className="absolute inset-[-20.4%_-4.8%_-15.71%_-4.8%]">
                  <img alt="" className="block max-w-none size-full" src={imgVector2} />
                </div>
              </div>
            </div>
          </button>
          {/* Right arrow button */}
          <button
            onClick={handleNext}
            disabled={bedNo >= MAX_BED}
            aria-label="Next bed"
            className="absolute flex items-center justify-center cursor-pointer active:scale-90 transition-all"
            style={{ opacity: bedNo >= MAX_BED ? 0.3 : 1, top: "calc(36.92% - 0.15px)", left: "calc(94.01% + 0.51px)", right: "calc(3.79% - 0.54px)", bottom: "calc(36.9% - 0.15px)", containerType: "size" }}
          >
            <div className="-scale-x-100 flex-none rotate-90" style={{ height: "100cqw", width: "100cqh" }}>
              <div className="relative size-full">
                <div className="absolute inset-[-20.4%_-4.8%_-15.71%_-4.8%]">
                  <img alt="" className="block max-w-none size-full" src={imgVector3} />
                </div>
              </div>
            </div>
          </button>
          {/* Inset top highlight */}
          <div className="absolute inset-0 pointer-events-none rounded-[inherit]" style={{ boxShadow: "inset 0px 1px 0px 0px rgba(255,255,255,0.2)" }} />
        </div>

        {/* Slider section */}
        <div className="absolute flex flex-col items-start left-[35px] top-[713px] w-[335px]">
          <p
            className="leading-[22.5px] text-[#e8f4fe] text-[15px] text-center tracking-[0.3px] whitespace-nowrap w-full"
            style={{ fontFamily: "Inconsolata, monospace", fontWeight: 400, fontVariationSettings: '"wdth" 100' }}
          >
            Prescribed safe range: 2–6 L/min
          </p>
          <div className="pt-[8px] w-full">
            <div
              className="relative rounded-[20px] px-[17px] py-[15px] w-full"
              style={{
                border: "0.584px solid rgba(255,255,255,0.15)",
                boxShadow: "0px 4px 24px 0px rgba(0,0,0,0.25), inset 0px 1px 0px 0px rgba(255,255,255,0.18)",
                backdropFilter: "blur(16px)",
                backgroundImage: "linear-gradient(168deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)",
              }}
            >
              <div className="h-[40px] relative w-full flex items-center">
                <div className="absolute rounded-full top-[12px] left-0 right-0 h-[16px]" style={{ background: "rgba(180,190,210,0.25)" }} />
                <div
                  className="absolute rounded-full top-[12px] left-0 h-[16px]"
                  style={{
                    width: "100%",
                    backgroundImage: "linear-gradient(90deg, rgb(255,255,255) 0%, rgb(46,227,37) 46.15%, rgb(255,251,34) 80.29%, rgb(255,30,0) 100%)",
                    clipPath: `inset(0 ${100 - sliderT * 100}% 0 0 round 9999px)`,
                    transition: "clip-path 0.05s linear",
                  }}
                />
                <input
                  type="range"
                  min={MIN_FLOW}
                  max={MAX_FLOW}
                  step={1}
                  value={flowRate}
                  onChange={(e) => setFlowRate(Number(e.target.value))}
                  className="slider-input absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none"
                  style={{
                    left: `${sliderT * 100}%`,
                    width: 40, height: 40, borderRadius: "50%",
                    backdropFilter: "blur(10px)",
                    border: "0.584px solid rgba(255,255,255,0.35)",
                    backgroundImage: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 100%)",
                    transition: "left 0.05s linear",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute h-[34px] left-0 top-[832px] w-[402px]">
          <div className="absolute bg-[#b2b2b2] h-[5px] left-[134px] rounded-[100px] top-[21px] w-[134px] />
        </div>

        {/* Dynamic island */}
        <div className="absolute bg-black h-[36px] left-[139px] rounded-[18px] top-[14px] w-[124px] />

        {/* Status bar */}
        <div className="absolute h-[13px] left-[57px] top-[26px] w-[307px]">
          <img alt="" className="absolute block inset-0 max-w-none size-full" src={imgIcon} />
        </div>
      </div>
    </div>
  );
}
