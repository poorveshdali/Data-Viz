document.addEventListener("DOMContentLoaded", () => {
    const tooltip = document.getElementById('tooltip');

    function showTooltip(event, keyword, rank) {
        tooltip.innerHTML = `<strong>${keyword}</strong><br>Rank: ${rank}`;
        tooltip.classList.add('visible');
        tooltip.setAttribute('aria-hidden', 'false');
        tooltip.style.left = `${event.clientX + 12}px`;
        tooltip.style.top = `${event.clientY + 12}px`;
    }

    function hideTooltip() {
        tooltip.classList.remove('visible');
        tooltip.setAttribute('aria-hidden', 'true');
    }

    const columnsConfig = [
        { id: 'all', label: 'ALL<br>COUNTRIES', flag: '' },
        { id: 'india', label: 'INDIA', flag: '🇮🇳' },
        { id: 'sa', label: 'SOUTH<br>AFRICA', flag: '🇿🇦' },
        { id: 'uk', label: 'UK', flag: '🇬🇧' },
        { id: 'usa', label: 'USA', flag: '🇺🇸' }
    ];

    const wrapper = document.getElementById('columns-wrapper');

    columnsConfig.forEach(col => {
        const colDiv = document.createElement('div');
        colDiv.className = 'country-column';
        colDiv.id = `col-${col.id}`;

        const header = document.createElement('div');
        header.className = 'col-header';
        header.innerHTML = `
            ${col.flag ? `<div class="flag">${col.flag}</div>` : ''}
            <div class="label">${col.label}</div>
        `;
        colDiv.appendChild(header);

        const ticksContainer = document.createElement('div');
        ticksContainer.className = 'ticks-container';
        colDiv.appendChild(ticksContainer);

        wrapper.appendChild(colDiv);
    });

    function clearHighlights() {
        document.querySelectorAll('.tick').forEach(tick => {
            tick.classList.remove('muted', 'highlight');
        });
        document.querySelectorAll('.tick-label').forEach(label => label.remove());
    }

    function drawTicks(rows) {
        const countryMap = {
            all: 'All countries',
            india: 'India',
            sa: 'South Africa',
            uk: 'UK',
            usa: 'USA'
        };

        columnsConfig.forEach(col => {
            const container = document.querySelector(`#col-${col.id} .ticks-container`);
            if (!container) return;

            const matchingRow = rows.find(row => {
                const rowCountry = String(row.country || '').trim().toLowerCase();
                return rowCountry === countryMap[col.id].toLowerCase();
            });

            if (!matchingRow) return;

            const fragment = document.createDocumentFragment();
            const entries = Object.entries(matchingRow)
                .filter(([key]) => key && key !== 'country')
                .map(([keyword, value]) => {
                    const normalizedValue = String(value ?? '').trim();
                    if (!normalizedValue) return null;

                    const rank = Number(normalizedValue);
                    if (!Number.isFinite(rank)) return null;

                    return {
                        keyword: String(keyword).trim(),
                        rank
                    };
                })
                .filter(Boolean)
                .sort((a, b) => a.rank - b.rank || a.keyword.localeCompare(b.keyword));

            entries.forEach(item => {
                const tick = document.createElement('div');
                tick.className = 'tick';
                tick.setAttribute('data-keyword', item.keyword);
                tick.setAttribute('data-rank', String(item.rank));
                tick.addEventListener('mouseenter', event => showTooltip(event, item.keyword, item.rank));
                tick.addEventListener('mousemove', event => showTooltip(event, item.keyword, item.rank));
                tick.addEventListener('mouseleave', hideTooltip);
                fragment.appendChild(tick);
            });

            container.appendChild(fragment);
        });
    }

    function loadData() {
        return d3.csv('data.csv').catch(error => {
            console.warn('Primary CSV load failed, trying fallback fetch.', error);
            return fetch('data.csv')
                .then(response => {
                    if (!response.ok) throw new Error('CSV request failed');
                    return response.text();
                })
                .then(text => d3.csvParse(text));
        });
    }

    loadData().then(data => {
        const validRows = data.filter(row => String(row.country || '').trim());
        console.log(`Successfully loaded ${validRows.length} rows from CSV.`);
        drawTicks(validRows);
        updateTickStates();
    }).catch(error => {
        console.warn('CSV not found or CORS error.', error);
    });

    function updateTickStates() {
        const ticks = document.querySelectorAll('.tick');
        clearHighlights();

        const stepTwoActive = document.getElementById('step-2').getBoundingClientRect().top < window.innerHeight * 0.6;
        const stepThreeActive = document.getElementById('step-3').getBoundingClientRect().top < window.innerHeight * 0.6;

        if (stepTwoActive && !stepThreeActive) {
            ticks.forEach(tick => tick.classList.add('muted'));

            const highlightedTicks = Array.from(ticks).filter(tick => tick.getAttribute('data-keyword')?.toLowerCase() === 'sue');
            highlightedTicks.forEach(tick => {
                tick.classList.remove('muted');
                tick.classList.add('highlight');
            });

            const usaColumn = document.getElementById('col-usa');
            if (usaColumn) {
                const usaTick = highlightedTicks.find(tick => tick.closest('#col-usa'));
                if (usaTick && !usaColumn.querySelector('.tick-label')) {
                    const label = document.createElement('span');
                    label.className = 'tick-label';
                    label.textContent = 'SUE';
                    usaTick.parentNode.appendChild(label);
                }
            }
        }

        if (stepThreeActive) {
            ticks.forEach(tick => tick.classList.add('muted'));

            const highlightedTicks = Array.from(ticks).filter(tick => tick.getAttribute('data-keyword')?.toLowerCase() === 'black');
            highlightedTicks.forEach(tick => {
                tick.classList.remove('muted');
                tick.classList.add('highlight');
            });

            const usaColumn = document.getElementById('col-usa');
            if (usaColumn) {
                const usaTick = highlightedTicks.find(tick => tick.closest('#col-usa'));
                if (usaTick && !usaColumn.querySelector('.tick-label')) {
                    const label = document.createElement('span');
                    label.className = 'tick-label';
                    label.textContent = 'BLACK';
                    usaTick.parentNode.appendChild(label);
                }
            }
        }
    }

    const steps = document.querySelectorAll('.step');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                updateTickStates();
            }
        });
    }, { threshold: 0.6 });

    steps.forEach(step => observer.observe(step));
    window.addEventListener('scroll', updateTickStates, { passive: true });
    window.addEventListener('resize', updateTickStates);
});