document.addEventListener('DOMContentLoaded', () => {
  const statSection = document.querySelector('.stat-section');
  const copy = document.querySelector('.stat-section__copy');
  const frame = document.querySelector('.panel-frame');
  const tradeContainer = document.querySelector('#trade-container');

  if (!statSection || !copy || !frame) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          copy.classList.add('is-visible');
          frame.classList.add('is-visible');
          observer.disconnect();
        }
      });
    },
    { threshold: 0.35 }
  );

  observer.observe(statSection);

  const routeSection = document.querySelector('.route-section');
  const cargoShip = document.querySelector('.cargo-ship');
  const sriLankaMap = document.querySelector('#sri-lanka-map');
  const lankaStory = document.querySelector('.lanka-story');
  const lankaAfterMap = document.querySelector('.lanka-after-map');
  const cargoGrid = document.querySelector('.cargo-grid');
  const trafficCard = document.querySelector('.hambantota-traffic-card');
  const mapTwoStory = document.querySelector('.map-two-story');
  const mapTwoVisual = document.querySelector('.map-two-visual');
  const mapTwoDots = document.querySelector('.map-two-dots');
  const shippingLaneRoute = document.querySelector('#shipping-lane-route');
  const shippingLaneCard = document.querySelector('.shipping-lane-card');
  const shippingLaneFollowup = document.querySelector('.shipping-lane-card--followup');
  const chinaPortsStory = document.querySelector('.china-ports-story');
  const chinaPortsMap = document.querySelector('.china-ports-map-shell');
  const chinaPortsCard = document.querySelector('.china-ports-card');
  const overseasPortsStory = document.querySelector('.overseas-ports-story');
  const overseasMapShell = document.querySelector('.overseas-map-shell');
  const overseasPortsCard = document.querySelector('.overseas-ports-card');
  const analysisIntroStory = document.querySelector('.analysis-intro-story');
  const analysisIntroText = document.querySelector('.analysis-intro-text');
  const portReachStory = document.querySelector('.port-reach-story');
  const portReachFrame = document.querySelector('.port-reach-frame');

  if (!routeSection || !cargoShip || !sriLankaMap || !lankaStory || !lankaAfterMap || !cargoGrid || !trafficCard || !mapTwoStory || !mapTwoVisual || !mapTwoDots || !shippingLaneRoute || !shippingLaneCard || !shippingLaneFollowup || !chinaPortsStory || !chinaPortsMap || !chinaPortsCard || !overseasPortsStory || !overseasMapShell || !overseasPortsCard || !analysisIntroStory || !analysisIntroText || !portReachStory || !portReachFrame) return;

  const cargoTiles = Array.from({ length: 200 }, () => {
    const tile = document.createElement('span');
    tile.className = 'cargo-tile';
    tile.setAttribute('aria-hidden', 'true');
    cargoGrid.appendChild(tile);
    return tile;
  });

  const dotPositions = [[6,59],[12,54],[14,65],[19,70],[20,80],[24,86],[31,94],[33,74],[40,80],[49,86],[57,93],[59,68],[64,78],[70,73],[75,82],[80,68],[84,58],[88,52],[93,67],[95,42]];
  dotPositions.forEach(([x, y], index) => {
    const dot = document.createElement('span');
    dot.className = `map-two-dot${index === 11 ? ' map-two-dot--hambantota' : ''}`;
    dot.style.left = `${x}%`;
    dot.style.top = `${y}%`;
    mapTwoDots.appendChild(dot);
  });

  const shippingLaneLength = shippingLaneRoute.getTotalLength();
  shippingLaneRoute.style.strokeDasharray = shippingLaneLength;
  shippingLaneRoute.style.strokeDashoffset = shippingLaneLength;

  const updateCargoPosition = () => {
    const bounds = routeSection.getBoundingClientRect();
    const travelDistance = Math.max(routeSection.offsetHeight - window.innerHeight, 1);
    const progress = Math.max(0, Math.min(1, -bounds.top / travelDistance));
    const finaleProgress = Math.max(0, Math.min(1, (progress - 0.90) / 0.10));
    cargoShip.style.opacity = `${1 - finaleProgress}`;
    cargoShip.style.left = '50%';
    cargoShip.style.top = `${110 + (1900 * progress)}px`;
    cargoShip.style.transform = 'translate(-50%, -100%)';

    const lankaBounds = lankaStory.getBoundingClientRect();
    const mapReveal = Math.max(0, Math.min(1, (window.innerHeight - lankaBounds.top) / (window.innerHeight * 0.65)));
    const lankaTravel = Math.max(lankaStory.offsetHeight - window.innerHeight, 1);
    const lankaProgress = Math.max(0, Math.min(1, -lankaBounds.top / lankaTravel));
    const mapLift = Math.max(0, Math.min(1, (lankaProgress - 0.38) / 0.14));
    const contentReveal = Math.max(0, Math.min(1, (lankaProgress - 0.54) / 0.08));
    const gridProgress = Math.max(0, Math.min(1, (lankaProgress - 0.66) / 0.30));
    const contentLift = Math.max(0, Math.min(1, (lankaProgress - 0.62) / 0.26));
    const trafficReveal = Math.max(0, Math.min(1, (lankaProgress - 0.82) / 0.10));
    const contentScrollDistance = Math.max(700, lankaAfterMap.offsetHeight - window.innerHeight * 0.20);
    sriLankaMap.style.opacity = `${mapReveal}`;
    sriLankaMap.style.transform = `translateY(${-window.innerHeight * 1.08 * mapLift}px) scale(${0.62 + mapReveal * 0.38})`;
    lankaAfterMap.style.opacity = `${contentReveal}`;
    lankaAfterMap.style.transform = `translate(-50%, ${80 * (1 - contentReveal) - contentScrollDistance * contentLift}px)`;
    trafficCard.style.opacity = `${trafficReveal}`;
    trafficCard.style.transform = `translateY(${40 * (1 - trafficReveal)}px)`;

    cargoTiles.forEach((tile, index) => {
      const tileStart = index / (cargoTiles.length * 1.1);
      const tileProgress = Math.max(0, Math.min(1, (gridProgress - tileStart) * 12));
      tile.style.opacity = `${tileProgress}`;
      tile.style.transform = `translateX(${-24 * (1 - tileProgress)}px) scale(${0.9 + tileProgress * 0.1})`;
    });

    const mapTwoBounds = mapTwoStory.getBoundingClientRect();
    const mapTwoTravel = Math.max(mapTwoStory.offsetHeight - window.innerHeight, 1);
    const mapTwoProgress = Math.max(0, Math.min(1, -mapTwoBounds.top / mapTwoTravel));
    const mapTwoReveal = Math.max(0, Math.min(1, (mapTwoProgress - 0.04) / 0.14));
    const laneDraw = Math.max(0, Math.min(1, (mapTwoProgress - 0.25) / 0.35));
    const cardProgress = Math.max(0, Math.min(1, (mapTwoProgress - 0.62) / 0.14));
    const cardExit = Math.max(0, Math.min(1, (mapTwoProgress - 0.77) / 0.11));
    const followupProgress = Math.max(0, Math.min(1, (mapTwoProgress - 0.84) / 0.12));
    mapTwoVisual.style.opacity = `${mapTwoReveal}`;
    mapTwoVisual.style.transform = `translateX(-50%) scale(${0.85 + mapTwoReveal * 0.15})`;
    mapTwoDots.style.opacity = `${mapTwoReveal}`;
    shippingLaneRoute.style.strokeDashoffset = `${shippingLaneLength * (1 - laneDraw)}`;
    shippingLaneCard.style.opacity = `${cardProgress}`;
    shippingLaneCard.style.transform = `translate(-50%, ${110 - cardProgress * (110 + window.innerHeight * 0.36) - cardExit * window.innerHeight * 1.1}px)`;
    shippingLaneFollowup.style.opacity = `${followupProgress}`;
    shippingLaneFollowup.style.transform = `translate(-50%, ${110 - followupProgress * (110 + window.innerHeight * 0.36)}px)`;

    const chinaBounds = chinaPortsStory.getBoundingClientRect();
    const chinaTravel = Math.max(chinaPortsStory.offsetHeight - window.innerHeight, 1);
    const chinaProgress = Math.max(0, Math.min(1, -chinaBounds.top / chinaTravel));
    const chinaImageIn = Math.max(0, Math.min(1, (chinaProgress - 0.05) / 0.20));
    const chinaCardIn = Math.max(0, Math.min(1, (chinaProgress - 0.38) / 0.16));
    const chinaCardOut = Math.max(0, Math.min(1, (chinaProgress - 0.62) / 0.18));
    const chinaImageOut = Math.max(0, Math.min(1, (chinaProgress - 0.82) / 0.18));
    chinaPortsMap.style.opacity = `${chinaImageIn * (1 - chinaImageOut)}`;
    chinaPortsMap.style.transform = `scale(${0.72 + chinaImageIn * 0.28 - chinaImageOut * 0.08})`;
    chinaPortsCard.style.opacity = `${chinaCardIn * (1 - chinaCardOut)}`;
    chinaPortsCard.style.transform = `translate(-50%, ${110 - chinaCardIn * (110 + window.innerHeight * 0.36) - chinaCardOut * window.innerHeight * 1.1}px)`;

    const overseasBounds = overseasPortsStory.getBoundingClientRect();
    const overseasTravel = Math.max(overseasPortsStory.offsetHeight - window.innerHeight, 1);
    const overseasProgress = Math.max(0, Math.min(1, -overseasBounds.top / overseasTravel));
    const overseasMapIn = Math.max(0, Math.min(1, (overseasProgress - 0.05) / 0.18));
    const overseasCardIn = Math.max(0, Math.min(1, (overseasProgress - 0.42) / 0.16));
    const overseasCardOut = Math.max(0, Math.min(1, (overseasProgress - 0.64) / 0.16));
    const overseasMapOut = Math.max(0, Math.min(1, (overseasProgress - 0.84) / 0.16));
    overseasMapShell.style.opacity = `${overseasMapIn * (1 - overseasMapOut)}`;
    overseasMapShell.style.transform = `scale(${0.94 + overseasMapIn * 0.06 - overseasMapOut * 0.04})`;
    overseasPortsCard.style.opacity = `${overseasCardIn * (1 - overseasCardOut)}`;
    overseasPortsCard.style.transform = `translate(-50%, ${110 - overseasCardIn * (110 + window.innerHeight * 0.36) - overseasCardOut * window.innerHeight * 1.1}px)`;

    const analysisBounds = analysisIntroStory.getBoundingClientRect();
    const analysisTravel = Math.max(analysisIntroStory.offsetHeight - window.innerHeight, 1);
    const analysisProgress = Math.max(0, Math.min(1, -analysisBounds.top / analysisTravel));
    const analysisFade = Math.max(0, Math.min(1, (analysisProgress - 0.06) / 0.12));
    const analysisLift = Math.max(0, Math.min(1, (analysisProgress - 0.40) / 0.32));
    const analysisOut = Math.max(0, Math.min(1, (analysisProgress - 0.56) / 0.18));
    analysisIntroText.style.opacity = `${analysisFade * (1 - analysisOut)}`;
    analysisIntroText.style.transform = `translate(-50%, calc(-50% - ${analysisLift * window.innerHeight * 1.15}px))`;

    const portReachBounds = portReachStory.getBoundingClientRect();
    const portReachTravel = Math.max(portReachStory.offsetHeight - window.innerHeight, 1);
    const portReachProgress = Math.max(0, Math.min(1, -portReachBounds.top / portReachTravel));
    const portReachIn = Math.max(0, Math.min(1, (portReachProgress - 0.03) / 0.09));
    const portReachOut = Math.max(0, Math.min(1, (portReachProgress - 0.84) / 0.16));
    portReachFrame.style.opacity = `${portReachIn * (1 - portReachOut)}`;
    portReachFrame.style.transform = `scale(${0.92 + portReachIn * 0.08 - portReachOut * 0.05})`;

    updateTradeContainerMorph();
  };

  let tradeMorphSource = null;

  function updateTradeContainerMorph() {
    if (!tradeContainer || !frame) return;

    const frameBounds = frame.getBoundingClientRect();
    const routeBounds = routeSection.getBoundingClientRect();
    // Hold the complete card in place until its centre reaches the viewport centre.
    // Only then does the scroll-controlled transformation into the ship begin.
    const startScroll = window.scrollY + frameBounds.top + frameBounds.height * 0.5 - window.innerHeight * 0.5;
    const endScroll = window.scrollY + routeBounds.top - window.innerHeight * 0.62;
    const distance = Math.max(endScroll - startScroll, 1);
    const progress = Math.max(0, Math.min(1, (window.scrollY - startScroll) / distance));

    if (progress <= 0) {
      if (tradeMorphSource) {
        tradeContainer.classList.remove('is-morphing');
        tradeContainer.style.cssText = '';
        tradeMorphSource = null;
      }
      return;
    }

    if (!tradeMorphSource) {
      const source = tradeContainer.getBoundingClientRect();
      tradeMorphSource = { left: source.left, top: source.top, width: source.width, height: source.height };
      tradeContainer.classList.add('is-morphing');
    }

    const shipBounds = cargoShip.getBoundingClientRect();
    const targetWidth = Math.max(42, shipBounds.width * 0.26);
    const targetHeight = Math.max(13, shipBounds.height * 0.24);
    const targetLeft = shipBounds.left + shipBounds.width * 0.43 - targetWidth * 0.5;
    const targetTop = shipBounds.top + shipBounds.height * 0.32 - targetHeight * 0.5;
    const ease = progress * progress * (3 - 2 * progress);

    tradeContainer.style.left = `${tradeMorphSource.left + (targetLeft - tradeMorphSource.left) * ease}px`;
    tradeContainer.style.top = `${tradeMorphSource.top + (targetTop - tradeMorphSource.top) * ease}px`;
    tradeContainer.style.width = `${tradeMorphSource.width + (targetWidth - tradeMorphSource.width) * ease}px`;
    tradeContainer.style.height = `${tradeMorphSource.height + (targetHeight - tradeMorphSource.height) * ease}px`;
    tradeContainer.style.borderRadius = `${3 * (1 - ease) + 2 * ease}px`;
    // The cargo and its transformed container complete the route as one unit.
    tradeContainer.style.opacity = cargoShip.style.opacity || '1';
  }

  window.addEventListener('scroll', updateCargoPosition, { passive: true });
  window.addEventListener('resize', updateCargoPosition);
  updateCargoPosition();
});
