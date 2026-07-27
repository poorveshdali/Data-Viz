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
  const keywordCount = keywords.length;

  if (rows.length === 0 || keywordCount === 0) {
    showError('No keyword columns or country rows found in the CSV.');
    return;
  }
  clearError();

  const columnCount = rows.length;
  const margin = { top: 120, right: 60, bottom: 42, left: 180 };
  const columnWidth = 220;
  const columnGap = 48;
  const columnHeight = Math.max(960, (maxRank || 1) * 8);
  const width = margin.left + columnCount * columnWidth + (columnCount - 1) * columnGap + margin.right;
  const height = margin.top + columnHeight + margin.bottom;

  const rankDomainMax = Math.max(1, maxRank || 1);
  const yScale = d3.scaleLinear()
    .domain([1, rankDomainMax])
    .range([margin.top, margin.top + columnHeight]);

  const svg = container.append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .classed('viz-svg', true);

  currentSvg = svg;

  svg.append('text')
    .attr('x', margin.left)
    .attr('y', 36)
    .attr('font-family', 'Georgia, serif')
    .attr('font-size', 22)
    .attr('fill', '#222')
    .text('Headline keyword ranks by country');

  svg.append('text')
    .attr('x', margin.left)
    .attr('y', 62)
    .attr('font-family', 'Inter, sans-serif')
    .attr('font-size', 12)
    .attr('fill', '#5d5d5d')
    .text('Each column shows the rank distribution for keywords in that country.');

  const axisLabel = svg.append('g')
    .attr('class', 'axis-label')
    .attr('transform', `translate(${margin.left - 72}, ${margin.top + ((rankDomainMax - 1) * rowHeight) / 2}) rotate(-90)`);

  axisLabel.append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .text('WORD OCCURS MORE OFTEN →');

  const grid = svg.append('g').attr('class', 'rank-grid');
  const ticks = d3.range(1, rankDomainMax + 1);
  grid.selectAll('line')
    .data(ticks)
    .join('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#e1d8cc')
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.18);

  const tooltip = d3.select('#tooltip');

  const columnGroups = svg.append('g')
    .selectAll('g.column-group')
    .data(rows)
    .join('g')
      .attr('class', 'column-group')
      .attr('transform', (row, colIndex) => `translate(${margin.left + colIndex * (columnWidth + columnGap)},0)`);

  columnGroups.append('text')
    .attr('x', columnWidth / 2)
    .attr('y', margin.top - 20)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'Inter, sans-serif')
    .attr('font-size', 12)
    .attr('fill', '#222')
    .attr('font-weight', 700)
    .text(d => d.country || '');

  columnGroups.each(function(row) {
    const column = d3.select(this);
    const ticksData = keywords.map((keyword, keywordIndex) => ({
      keyword,
      rank: row.ranks[keywordIndex],
      country: row.country
    })).filter(d => d.rank !== null);

    column.selectAll('line.tick')
      .data(ticksData)
      .join('line')
        .attr('class', 'tick')
        .attr('x1', 16)
        .attr('x2', columnWidth - 16)
        .attr('y1', d => yScale(d.rank))
        .attr('y2', d => yScale(d.rank))
        .attr('stroke', '#E0D5B8')
        .attr('stroke-width', 4)
        .attr('stroke-opacity', 1)
        .attr('cursor', 'pointer')
        .on('mouseenter', (event, d) => {
          tooltip.html(`<div><strong>Keyword:</strong> ${d.keyword}</div><div><strong>Country:</strong> ${d.country}</div><div><strong>Rank:</strong> ${d.rank}</div>`);
          tooltip.style('display', 'block');
          positionTooltip(event);
        })
        .on('mousemove', (event) => positionTooltip(event))
        .on('mouseleave', () => tooltip.style('display', 'none'));

    column.selectAll('circle.hit')
      .data(ticksData)
      .join('circle')
        .attr('class', 'hit')
        .attr('cx', columnWidth / 2)
        .attr('cy', d => yScale(d.rank))
        .attr('r', 3)
        .attr('fill', '#2b2b2b')
        .attr('fill-opacity', 0.8)
        .attr('cursor', 'pointer')
        .on('mouseenter', (event, d) => {
          tooltip.html(`<div><strong>Keyword:</strong> ${d.keyword}</div><div><strong>Country:</strong> ${d.country}</div><div><strong>Rank:</strong> ${d.rank}</div>`);
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

  const columnWidth = 180;
  const marginLeft = 180;
  const rankDomainMax = Math.max(parsedData.keywords.length, parsedData.maxRank || parsedData.keywords.length);
  const rowHeight = Math.max(2.5, 960 / Math.max(parsedData.keywords.length, 120));
  const yScale = d3.scaleLinear()
    .domain([1, rankDomainMax])
    .range([140, 140 + (rankDomainMax - 1) * rowHeight]);

  parsedData.rows.forEach((row, colIndex) => {
    const rank = row.ranks[keywordIndex];
    if (rank === null) return;
    const xValue = marginLeft + colIndex * columnWidth + columnWidth / 2;
    const yValue = yScale(rank);

    currentSvg.append('circle')
      .attr('class', 'highlight')
      .attr('cx', xValue)
      .attr('cy', yValue)
      .attr('r', 5)
      .attr('fill', '#d95f5f')
      .attr('fill-opacity', 0.95);
  });

  const labelX = marginLeft + parsedData.rows.length * columnWidth + 12;
  currentSvg.append('text')
    .attr('class', 'highlight')
    .attr('x', labelX)
    .attr('y', 60)
    .attr('font-family', 'Inter, sans-serif')
    .attr('font-size', 13)
    .attr('fill', '#d95f5f')
    .attr('font-weight', 700)
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
