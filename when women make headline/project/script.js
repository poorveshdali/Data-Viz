// script.js (updated to use d3.csv with detailed debugging)
const CSV_PATH = 'data.csv';
const EXPECTED_ROWS = 1231;

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

function renderVisualization(data){
  const columnsRoot = document.getElementById('columns');
  const tooltip = document.getElementById('tooltip');
  columnsRoot.innerHTML = '';

  // Create five columns
  const tracks = createColumns(columnsRoot, 5);

  const rowCount = data.length;
  console.log('Rendering rows:', rowCount);

  // determine container height and spacing
  const containerHeight = Math.max(1200, rowCount * 2); // px; keeps dense look
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

    // show remaining available columns
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

function init(){
  const columnsRoot = document.getElementById('columns');
  const tooltip = document.getElementById('tooltip');
  const warning = document.getElementById('warning');

  clearError();

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

    // Filter only by existence of headline_no_site
    const validData = rawData.filter(d => {
      const v = d.headline_no_site;
      return v !== undefined && String(v).trim() !== '';
    });

    console.log('Valid rows (headline_no_site present):', validData.length);

    if(validData.length === EXPECTED_ROWS){
      clearError();
    } else {
      showError(`Warning: loaded ${validData.length} rows (expected ${EXPECTED_ROWS}). Visualization will render ${validData.length} rows.`);
    }

    // Render using validData (which preserves order from CSV)
    renderVisualization(validData);

  }).catch(err => {
    console.error('CSV loading error:', err);
    const message = err && err.message ? err.message : String(err);
    showError('CSV loading error: ' + message);
  });
}

document.addEventListener('DOMContentLoaded', init);
