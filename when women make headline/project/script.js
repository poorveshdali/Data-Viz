document.addEventListener("DOMContentLoaded", () => {
    // 1. Define the structural data for the columns
    const columnsConfig = [
        { id: 'all', label: 'ALL<br>COUNTRIES', flag: '' },
        { id: 'india', label: 'INDIA', flag: '🇮🇳' },
        { id: 'sa', label: 'SOUTH<br>AFRICA', flag: '🇿🇦' },
        { id: 'uk', label: 'UK', flag: '🇬🇧' },
        { id: 'usa', label: 'USA', flag: '🇺🇸' }
    ];

    const wrapper = document.getElementById('columns-wrapper');

    // 2. Generate the DOM structure for the columns and headers
    columnsConfig.forEach(col => {
        // Create the main column div
        const colDiv = document.createElement('div');
        colDiv.className = 'country-column';
        colDiv.id = `col-${col.id}`;

        // Create the header (Flag + Country Name)
        const header = document.createElement('div');
        header.className = 'col-header';
        header.innerHTML = `
            ${col.flag ? `<div class="flag">${col.flag}</div>` : ''}
            <div class="label">${col.label}</div>
        `;
        colDiv.appendChild(header);

        // Create the container that will hold the ticks
        const ticksContainer = document.createElement('div');
        ticksContainer.className = 'ticks-container';
        colDiv.appendChild(ticksContainer);

        wrapper.appendChild(colDiv);
    });

    // 3. Function to draw the ticks from the loaded CSV data
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
                .map(([keyword, value]) => ({
                    keyword: String(keyword).trim(),
                    rank: Number(value)
                }))
                .filter(item => !Number.isNaN(item.rank));

            entries.sort((a, b) => {
                const rankA = Number.isFinite(a.rank) ? a.rank : Number.MAX_SAFE_INTEGER;
                const rankB = Number.isFinite(b.rank) ? b.rank : Number.MAX_SAFE_INTEGER;
                return rankA - rankB;
            });

            entries.forEach(item => {
                const tick = document.createElement('div');
                tick.className = 'tick';
                tick.setAttribute('title', item.keyword);
                tick.setAttribute('data-keyword', item.keyword);
                tick.setAttribute('data-rank', String(item.rank));
                fragment.appendChild(tick);
            });

            container.appendChild(fragment);
        });
    }

    // 4. Load the data using D3
    d3.csv('data.csv').then(data => {
        const validRows = data.filter(row => String(row.country || '').trim());
        console.log(`Successfully loaded ${validRows.length} rows from CSV.`);
        drawTicks(validRows);
    }).catch(error => {
        console.warn('CSV not found or CORS error.', error);
    });
});