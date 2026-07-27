const CSV_PATH = 'data.csv';
let parsedData = null;
let currentSvg = null;

function showError(message) {
  const warning = document.getElementById('warning');
  warning.hidden = false;
  warning.textContent = message;
}

function clearError() {
  const warning = document.getElementById('warning');
  warning.hidden = true;
  warning.textContent = '';
}

function getCountryColumn(columns) {
  const candidate = columns.find(c => /country/i.test(c));
  return candidate || columns[0];
}

function parseCSVData(rawData) {
  if (!rawData || rawData.length === 0) {
    return { keywords: [], rows: [], maxRank: 1 };
  }

  const rawColumns = rawData.columns || Object.keys(rawData[0] || {});
  const columns = rawColumns.filter(c => c && c.toString().trim() !== '');
  const countryCol = getCountryColumn(columns);
  const keywords = columns.filter(c => c !== countryCol);

  const rows = rawData.map(row => {
    const country = row[countryCol] || '';
    const ranks = keywords.map(keyword => {
      const value = row[keyword];
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : null;
    });
    return { country, ranks };
  });

  const maxRank = d3.max(rows, row => d3.max(row.ranks.filter(v => v !== null)));
  return {
    keywords,
    rows,
    countryCol,
    maxRank: maxRank || 1
  };
}

function renderVisualization(rawData) {
  const container = d3.select('#columns');
  container.selectAll('*').remove();
  currentSvg = null;

  parsedData = parseCSVData(rawData);
  const { keywords, rows, maxRank } = parsedData;

  if (keywords.length === 0) {
    showError('No keyword columns found in CSV.');
    return;
  }
  clearError();

  const width = Math.max(1200, keywords.length * 10);
  const rowGap = 120;
  const trackHeight = 72;
  const margin = { top: 140, right: 120, bottom: 40, left: 140 };
  const height = margin.top + rows.length * rowGap + margin.bottom;

  const x = d3.scalePoint()
    .domain(keywords)
    .range([margin.left, width - margin.right])
    .padding(0.5);

  const rankScale = d3.scaleLinear()
    .domain([1, maxRank])
    .range([0, trackHeight]);

  const svg = container.append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .classed('viz-svg', true);

  currentSvg = svg;

  svg.append('text')
    .attr('x', margin.left)
    .attr('y', 40)
    .attr('font-family', 'Georgia, serif')
    .attr('font-size', 22)
    .attr('fill', '#222')
    .text('Headline keyword ranks by country');

  svg.append('text')
    .attr('x', margin.left)
    .attr('y', 64)
    .attr('font-family', 'Inter, sans-serif')
    .attr('font-size', 12)
    .attr('fill', '#5d5d5d')
    .text('Each country row plots a keyword rank from the CSV matrix. Hover to see the specific keyword rank.');

  const axisY = margin.top - 28;

  svg.append('line')
    .attr('x1', margin.left)
    .attr('x2', width - margin.right)
    .attr('y1', axisY)
    .attr('y2', axisY)
    .attr('stroke', '#333')
    .attr('stroke-width', 1.5);

  const labelStep = Math.max(1, Math.floor(keywords.length / 26));
  const xLabels = keywords.filter((d, i) => i % labelStep === 0 || i === keywords.length - 1);

  svg.append('g')
    .selectAll('text')
    .data(xLabels)
    .join('text')
      .attr('x', d => x(d))
      .attr('y', axisY - 12)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-size', 9)
      .attr('fill', '#303030')
      .attr('transform', d => `translate(0,0)`)
      .text(d => d);

  const tooltip = d3.select('#tooltip');

  const lineGenerator = d3.line()
    .defined(d => d.rank !== null)
    .x(d => x(d.keyword))
    .y(d => d.trackY + rankScale(d.rank));

  rows.forEach((row, rowIndex) => {
    const trackY = margin.top + rowIndex * rowGap;
    const rowGroup = svg.append('g').attr('class', 'country-row');

    rowGroup.append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', trackY)
      .attr('y2', trackY)
      .attr('stroke', '#ddd')
      .attr('stroke-width', 1);

    rowGroup.append('text')
      .attr('x', margin.left - 16)
      .attr('y', trackY + 4)
      .attr('text-anchor', 'end')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-size', 13)
      .attr('fill', '#222')
      .text(row.country || `row ${rowIndex + 1}`);

    const rowPoints = keywords.map((keyword, keywordIndex) => ({
      keyword,
      rank: row.ranks[keywordIndex],
      trackY
    }));

    rowGroup.append('path')
      .datum(rowPoints)
      .attr('d', lineGenerator)
      .attr('fill', 'none')
      .attr('stroke', '#666')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.25);

    rowGroup.selectAll('circle')
      .data(rowPoints.filter(d => d.rank !== null))
      .join('circle')
        .attr('cx', d => x(d.keyword))
        .attr('cy', d => d.trackY + rankScale(d.rank))
        .attr('r', 2.2)
        .attr('fill', '#111')
        .attr('fill-opacity', 0.8)
        .attr('cursor', 'pointer')
        .on('mouseenter', (event, d) => {
          tooltip.html(`<div><strong>Keyword:</strong> ${d.keyword}</div><div><strong>Country:</strong> ${row.country}</div><div><strong>Rank:</strong> ${d.rank}</div>`);
          tooltip.style('display', 'block');
          positionTooltip(event);
        })
        .on('mousemove', (event) => positionTooltip(event))
        .on('mouseleave', () => tooltip.style('display', 'none'));
  });

  function positionTooltip(event) {
    const tooltipEl = document.getElementById('tooltip');
    if (!tooltipEl) return;
    const offset = 12;
    let xPos = event.clientX + offset;
    let yPos = event.clientY + offset;
    const tipW = tooltipEl.offsetWidth;
    const tipH = tooltipEl.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (xPos + tipW + offset > vw) xPos = vw - tipW - offset;
    if (yPos + tipH + offset > vh) yPos = vh - tipH - offset;
    tooltipEl.style.left = `${xPos}px`;
    tooltipEl.style.top = `${yPos}px`;
  }
}

function clearHighlight() {
  if (!currentSvg) return;
  currentSvg.selectAll('.highlight').remove();
}

function highlightWord(keyword) {
  clearHighlight();
  clearError();
  if (!parsedData || !currentSvg) {
    showError('Visualization has not finished loading yet.');
    return;
  }

  const target = String(keyword || '').trim().toLowerCase();
  const keywordIndex = parsedData.keywords.findIndex(k => k.toLowerCase() === target);
  if (keywordIndex === -1) {
    showError('Keyword not found in data.');
    return;
  }

  const x = d3.scalePoint()
    .domain(parsedData.keywords)
    .range([140, Math.max(1200, parsedData.keywords.length * 10) - 120])
    .padding(0.5);

  const maxRank = parsedData.maxRank;
  const rankScale = d3.scaleLinear()
    .domain([1, maxRank])
    .range([0, 72]);

  const xValue = x(parsedData.keywords[keywordIndex]);

  currentSvg.append('line')
    .attr('class', 'highlight')
    .attr('x1', xValue)
    .attr('x2', xValue)
    .attr('y1', 140)
    .attr('y2', 140 + parsedData.rows.length * 120)
    .attr('stroke', '#d95f5f')
    .attr('stroke-width', 1.5)
    .attr('stroke-opacity', 0.9);

  parsedData.rows.forEach((row, rowIndex) => {
    const rank = row.ranks[keywordIndex];
    if (rank === null) return;
    const trackY = 140 + rowIndex * 120;
    currentSvg.append('circle')
      .attr('class', 'highlight')
      .attr('cx', xValue)
      .attr('cy', trackY + rankScale(rank))
      .attr('r', 4)
      .attr('fill', '#d95f5f');
  });

  currentSvg.append('text')
    .attr('class', 'highlight')
    .attr('x', xValue + 10)
    .attr('y', 130)
    .attr('font-family', 'Inter, sans-serif')
    .attr('font-size', 12)
    .attr('fill', '#d95f5f')
    .attr('font-weight', '700')
    .text(parsedData.keywords[keywordIndex]);
}

function showAnnotation(keyword) {
  highlightWord(keyword);
}

function loadCSV() {
  if (window.location.protocol === 'file:') {
    const msg = 'CSV loading may be blocked when the page is opened from the filesystem. Use a local development server such as VS Code Live Server.';
    showError(msg);
    console.warn(msg);
  }

  if (!window.d3 || !d3.csv) {
    const msg = 'd3.csv is not available. Make sure D3 v7 is included in index.html.';
    showError(msg);
    return;
  }

  d3.csv(CSV_PATH).then(data => {
    renderVisualization(data);
  }).catch(err => {
    console.error('CSV loading error:', err);
    showError('CSV loading error: ' + (err.message || err));
  });
}

window.loadCSV = loadCSV;
window.highlightWord = highlightWord;
window.clearHighlight = clearHighlight;
window.showAnnotation = showAnnotation;

document.addEventListener('DOMContentLoaded', loadCSV);
