// script.js (updated with annotation API and refactored loader)
const CSV_PATH = 'data.csv';
const EXPECTED_ROWS = 1231;

let dataset = [];      // rows used for visualization (unique headline_no_site)
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

    const row = data[i] || {};
    let html = `<div><strong>Rank:</strong> ${i+1}</div>`;
    html += `<div><strong>Word:</strong> ${row.headline_no_site || ''}</div>`;

    Object.keys(row).forEach(k => {
      if(k === 'headline_no_site') return;
      const val = row[k];
      if(val !== undefined && String(val).trim() !== ''){
        html += `<div><strong>${k.replace(/_/g,' ')}:</strong> ${val}</div>`;
      }
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

  const rowIndex = dataset.findIndex(r => (r.headline_no_site||'').toString().trim().toLowerCase() === target);
  if(rowIndex === -1){ showError('Word not found in dataset.'); return; }
  clearError();

  const columnsRoot = document.getElementById('columns');
  const colElems = Array.from(columnsRoot.querySelectorAll('.column'));
  const totalRows = dataset.length;
  const chartHeight = colElems[0] ? colElems[0].clientHeight : Math.max(1200, totalRows * 2);

  const allHeader = findHeaderFor(['rankall','rank_all','allcountries','all']);
  const indiaHeader = findHeaderFor(['india','rankindia','rank_india']);
  const saHeader = findHeaderFor(['southafrica','south_africa','south','ranksouth']);
  const ukHeader = findHeaderFor(['uk','britain','unitedkingdom','rankuk','rank_uk']);
  const usaHeader = findHeaderFor(['usa','us','unitedstates','rankusa','rank_usa']);

  const countryHeaders = [allHeader, indiaHeader, saHeader, ukHeader, usaHeader];

  const ranks = countryHeaders.map(h => {
    if(!h) return null;
    const val = dataset[rowIndex][h];
    const n = parseInt(String(val||'').replace(/[^0-9]/g,''), 10);
    return isNaN(n) ? null : n;
  });

  for(let i=0;i<ranks.length;i++){
    if(ranks[i] == null) ranks[i] = rowIndex + 1;
  }

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

    const uniqueWords = new Set();
    const uniqueData = [];
    for(const row of rawData){
      const word = row.headline_no_site ? String(row.headline_no_site).trim() : '';
      if(!word) continue;
      const lower = word.toLowerCase();
      if(uniqueWords.has(lower)) continue;
      uniqueWords.add(lower);
      uniqueData.push(row);
      if(uniqueData.length === EXPECTED_ROWS) break;
    }

    dataset = uniqueData;
    console.log('Unique valid rows (first up to 1231 unique headline_no_site):', dataset.length);

    if(dataset.length === EXPECTED_ROWS){
      clearError();
    } else if(dataset.length > 0){
      showError(`Warning: found ${dataset.length} unique headline_no_site words (expected ${EXPECTED_ROWS}). Visualization will render ${dataset.length} rows.`);
    } else {
      showError('Warning: no valid headline_no_site values found in the CSV.');
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
