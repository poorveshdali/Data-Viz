// script.js (updated with annotation API and refactored loader)
const CSV_PATH = 'data.csv';
const EXPECTED_ROWS = 1231;

let dataset = [];      // top words array: {word, freq_all, freqs:{india,...}, ranks:{india,...}}
let headers = [];
let highlightEls = [];
let labelEl = null;

function createColumns(root, count){
  const cols = [];
  for(let i=0;i<count;i++){
    const col = document.createElement('div');
    col.className = 'column';
    const track = document.createElement('div');
    track.className = 'col-track';
    col.appendChild(track);
    root.appendChild(col);
    cols.push(track);
  }
  return cols;
}

function showError(message){
  const warning = document.getElementById('warning');
  warning.hidden = false;
  warning.textContent = message;
}

function clearError(){
  const warning = document.getElementById('warning');
  warning.hidden = true;
  warning.textContent = '';
}

function findHeaderFor(countryKeywords){
  const normalized = headers.map(h => (h||'').toString().toLowerCase().replace(/\s+/g,'').replace(/[^a-z0-9_]/g,''));
  for(const kw of countryKeywords){
    for(let i=0;i<normalized.length;i++){
      if(normalized[i].includes(kw)) return headers[i];
    }
  }
  return null;
}

function tokenizeHeadline(text){
  if(!text) return [];
  // lowercase, remove punctuation, remove numbers, split on whitespace
  const cleaned = text.toString().toLowerCase().replace(/[-–——\u2013\u2014]/g,' ').replace(/[\u2018\u2019\u201C\u201D"'`]/g,'')
    .replace(/[\(\)\[\]{}:,;.!?<>\/\\@#%&*=+~^$|']/g,' ')
    .replace(/[0-9]+/g,' ');
  return cleaned.split(/\s+/).map(s=>s.trim()).filter(s=>s.length>0);
}

function computeWordFrequency(rows, countryCol){
  const allCounts = Object.create(null);
  const countryCounts = {
    india: Object.create(null),
    south_africa: Object.create(null),
    uk: Object.create(null),
    usa: Object.create(null)
  };

  for(const row of rows){
    const text = row.headline_no_site || '';
    const tokens = tokenizeHeadline(text);
    const rawCountry = (countryCol && row[countryCol]) ? String(row[countryCol]).toLowerCase() : '';
    let which = null;
    if(/india/.test(rawCountry)) which = 'india';
    else if(/south/.test(rawCountry) || /africa/.test(rawCountry)) which = 'south_africa';
    else if(/uk|britain|united kingdom|england/.test(rawCountry)) which = 'uk';
    else if(/us|usa|united states|america/.test(rawCountry)) which = 'usa';

    for(const t of tokens){
      // ignore tokens that contain digits or are very short
      if(/[0-9]/.test(t)) continue;
      if(t.length < 2) continue;
      allCounts[t] = (allCounts[t] || 0) + 1;
      if(which) countryCounts[which][t] = (countryCounts[which][t] || 0) + 1;
    }
  }

  return { allCounts, countryCounts };
}

function computeRanksFromCounts(counts){
  // counts: object word->count
  const entries = Object.keys(counts).map(w => ({word:w, count: counts[w]}));
  entries.sort((a,b) => b.count - a.count || a.word.localeCompare(b.word));
  const ranks = Object.create(null);
  for(let i=0;i<entries.length;i++){
    ranks[entries[i].word] = i+1; // 1-based
  }
  return {entries, ranks};
}

function renderBackground(data){
  const columnsRoot = document.getElementById('columns');
  const tooltip = document.getElementById('tooltip');
  columnsRoot.innerHTML = '';

  // Create five columns
  const tracks = createColumns(columnsRoot, 5);

  const rowCount = data.length;
  console.log('Rendering rows:', rowCount);

  // determine container height and spacing
  const containerHeight = Math.max(1200, rowCount * 2); // px
  document.querySelectorAll('.column').forEach(c => c.style.height = containerHeight + 'px');
  const spacing = containerHeight / Math.max(1, rowCount);

  for(let i=0;i<rowCount;i++){
    for(let colIndex=0;colIndex<tracks.length;colIndex++){
      const line = document.createElement('div');
      line.className = 'line';
      line.setAttribute('data-index', i);
      line.setAttribute('data-word', data[i].word);
      line.setAttribute('tabindex', '0');
      line.style.top = (i * spacing) + 'px';
      line.setAttribute('aria-label', `Rank ${i+1}`);

      line.addEventListener('mouseenter', (e)=> showRow(i, e, data));
      line.addEventListener('mousemove', (e)=> positionTooltip(e));
      line.addEventListener('mouseleave', hideTooltip);
      line.addEventListener('focus', (e)=> showRow(i, e, data));
      line.addEventListener('blur', hideTooltip);
      line.addEventListener('keydown', (e)=>{
        if(e.key === 'ArrowDown'){
          e.preventDefault();
          const next = document.querySelector(`.line[data-index='${i+1}']`);
          if(next) next.focus();
        }else if(e.key === 'ArrowUp'){
          e.preventDefault();
          const prev = document.querySelector(`.line[data-index='${i-1}']`);
          if(prev) prev.focus();
        }
      });

      tracks[colIndex].appendChild(line);
    }
  }

  function showRow(i, event, data){
    document.querySelectorAll('.line').forEach(n => n.classList.remove('active'));
    document.querySelectorAll(`.line[data-index='${i}']`).forEach(n => n.classList.add('active'));

    const wordObj = data[i];
    // determine which column the mouse is over to show 'Country'
    let colLabel = 'ALL COUNTRIES';
    const colEl = event.target.closest('.column');
    if(colEl){
      const cols = Array.from(document.querySelectorAll('.column'));
      const idx = cols.indexOf(colEl);
      const labels = ['ALL COUNTRIES','INDIA','SOUTH AFRICA','UK','USA'];
      colLabel = labels[idx] || colLabel;
    }

    let html = `<div><strong>Word:</strong> ${wordObj.word}</div>`;
    html += `<div><strong>Country:</strong> ${colLabel}</div>`;
    html += `<div><strong>Rank (all):</strong> ${i+1}</div>`;
    html += `<div><strong>Frequency (all):</strong> ${wordObj.freq_all}</div>`;

    // show the specific country's rank/freq first
    const countryKeys = ['all','india','south_africa','uk','usa'];
    const labels = ['ALL COUNTRIES','INDIA','SOUTH AFRICA','UK','USA'];
    const cols = Array.from(document.querySelectorAll('.column'));
    const idx = cols.indexOf(colEl);
    const focusKey = countryKeys[idx >= 0 ? idx : 0];
    if(focusKey && focusKey !== 'all'){
      const r = wordObj.ranks[focusKey];
      const f = wordObj.freqs[focusKey] || 0;
      if(r){ html += `<div><strong>${labels[idx]}:</strong> rank ${r} — ${f}</div>`; }
    }

    // then list other countries
    ['india','south_africa','uk','usa'].forEach(k => {
      const r = wordObj.ranks[k];
      const f = wordObj.freqs[k] || 0;
      if(r){ html += `<div><strong>${k.replace(/_/g,' ')}:</strong> rank ${r} — ${f}</div>`; }
    });

    tooltip.innerHTML = html;
    tooltip.hidden = false;
    positionTooltip(event);
  }

  function hideTooltip(){
    tooltip.hidden = true;
    document.querySelectorAll('.line').forEach(n => n.classList.remove('active'));
  }

  function positionTooltip(e){
    const padding = 12;
    const tipW = tooltip.offsetWidth || 220;
    const tipH = tooltip.offsetHeight || 80;
    let x = e.clientX + 12;
    let y = e.clientY + 12;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if(x + tipW + padding > vw) x = vw - tipW - padding;
    if(y + tipH + padding > vh) y = vh - tipH - padding;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
  }
}

function clearHighlight(){
  highlightEls.forEach(el => el.remove());
  highlightEls = [];
  if(labelEl){ labelEl.remove(); labelEl = null; }
}

function highlightWord(word){
  clearHighlight();
  if(!word){ showError('No word provided to highlight'); return; }
  const target = String(word).trim().toLowerCase();
  const rowIndex = dataset.findIndex(r => r.word === target);
  if(rowIndex === -1){ showError('Word not found in dataset.'); return; }
  clearError();

  const wordObj = dataset[rowIndex];
  const columnsRoot = document.getElementById('columns');
  const colElems = Array.from(columnsRoot.querySelectorAll('.column'));
  const totalRows = dataset.length;
  const chartHeight = colElems[0] ? colElems[0].clientHeight : Math.max(1200, totalRows * 2);

  // use computed ranks (wordObj.ranks)
  const ranks = [wordObj.ranks.all || rowIndex+1, wordObj.ranks.india || rowIndex+1, wordObj.ranks.south_africa || rowIndex+1, wordObj.ranks.uk || rowIndex+1, wordObj.ranks.usa || rowIndex+1];

  ranks.forEach((rank, colIdx) => {
    const col = colElems[colIdx];
    if(!col) return;
    const rect = col.getBoundingClientRect();
    const y = ((rank - 1) / totalRows) * chartHeight;
    const top = rect.top + y;
    const hl = document.createElement('div');
    hl.className = 'highlight-line';
    hl.style.top = top + 'px';
    hl.style.left = rect.left + 'px';
    hl.style.width = rect.width + 'px';
    hl.style.opacity = '0';
    document.body.appendChild(hl);
    highlightEls.push(hl);
    requestAnimationFrame(()=>{
      hl.style.opacity = '1';
    });
  });

  const usaCol = colElems[4];
  if(usaCol){
    const usaRect = usaCol.getBoundingClientRect();
    const usaY = ((ranks[4] - 1) / totalRows) * chartHeight;
    const lbl = document.createElement('div');
    lbl.className = 'annotation-label';
    lbl.textContent = String(word).toUpperCase();
    document.body.appendChild(lbl);
    labelEl = lbl;
    const left = usaRect.right + 12;
    const top = usaRect.top + usaY;
    lbl.style.position = 'fixed';
    lbl.style.left = left + 'px';
    lbl.style.top = top + 'px';
    lbl.style.opacity = '0';
    requestAnimationFrame(()=> lbl.style.opacity = '1');
  }
}

function showAnnotation(word){
  highlightWord(word);
}

function loadCSV(){
  console.log('Page URL:', window.location.href);
  console.log('CSV loading path:', CSV_PATH);
  if(window.location.protocol === 'file:'){
    const msg = 'CSV loading may be blocked because this page is opened directly from the filesystem. Please run the project using a local development server such as VS Code Live Server.';
    showError(msg);
    console.warn(msg);
  }

  if(!window.d3 || !d3.csv){
    const msg = 'd3.csv is not available. Make sure to include D3 (e.g. <script src="https://d3js.org/d3.v7.min.js"></script>) in index.html.';
    console.error(msg);
    showError(msg);
    return;
  }

  d3.csv(CSV_PATH).then(rawData => {
    console.log('Raw rows loaded (data.length):', rawData.length);
    console.log('CSV columns (data.columns):', rawData.columns || []);
    console.log('First five rows:', rawData.slice(0,5));
    headers = rawData.columns || Object.keys(rawData[0] || {});

    // detect country column
    const countryCol = findHeaderFor(['country']);

    // compute frequencies
    const { allCounts, countryCounts } = computeWordFrequency(rawData, countryCol);
    const allRankData = computeRanksFromCounts(allCounts);
    const indiaRankData = computeRanksFromCounts(countryCounts.india);
    const saRankData = computeRanksFromCounts(countryCounts.south_africa);
    const ukRankData = computeRanksFromCounts(countryCounts.uk);
    const usaRankData = computeRanksFromCounts(countryCounts.usa);

    // build top words list from allCounts
    const top = allRankData.entries.slice(0, EXPECTED_ROWS);
    const topWords = top.map((e, idx) => {
      const w = e.word;
      return {
        word: w,
        freq_all: e.count,
        freqs: {
          india: countryCounts.india[w] || 0,
          south_africa: countryCounts.south_africa[w] || 0,
          uk: countryCounts.uk[w] || 0,
          usa: countryCounts.usa[w] || 0
        },
        ranks: {
          all: allRankData.ranks[w] || null,
          india: indiaRankData.ranks[w] || null,
          south_africa: saRankData.ranks[w] || null,
          uk: ukRankData.ranks[w] || null,
          usa: usaRankData.ranks[w] || null
        }
      };
    });

    dataset = topWords;
    console.log('Computed top words:', dataset.length);

    if(dataset.length === EXPECTED_ROWS){
      clearError();
    } else if(dataset.length > 0){
      showError(`Warning: found ${dataset.length} unique words (expected ${EXPECTED_ROWS}). Visualization will render ${dataset.length} rows.`);
    } else {
      showError('Warning: no valid words found after processing the CSV.');
    }

    renderBackground(dataset);

  }).catch(err => {
    console.error('CSV loading error:', err);
    const message = err && err.message ? err.message : String(err);
    showError('CSV loading error: ' + message);
  });
}

window.loadCSV = loadCSV;
window.highlightWord = highlightWord;
window.clearHighlight = clearHighlight;
window.showAnnotation = showAnnotation;

document.addEventListener('DOMContentLoaded', loadCSV);
