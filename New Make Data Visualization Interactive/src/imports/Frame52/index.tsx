export default function Frame() {
  return (
    <div className="[word-break:break-word] bg-[rgba(36,52,69,0.2)] font-['Inconsolata:Light',sans-serif] font-light leading-[0] relative rounded-[27px] size-full text-center text-white">
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col h-[72px] justify-center left-[77px] text-[96px] top-[53px] w-[96px]" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[normal]">35</p>
      </div>
      <div className="-translate-x-1/2 -translate-y-1/2 absolute flex flex-col justify-center left-[77px] text-[24px] top-[120.5px] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[normal]">L/min</p>
      </div>
    </div>
  );
}