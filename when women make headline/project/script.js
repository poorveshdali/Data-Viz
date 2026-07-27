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

    // 3. Function to draw the ticks based on row count
    function drawTicks(rowCount) {
        columnsConfig.forEach(col => {
            const container = document.querySelector(`#col-${col.id} .ticks-container`);
            // Create a document fragment for better performance when appending 1000+ divs
            const fragment = document.createDocumentFragment();
            
            for (let i = 0; i < rowCount; i++) {
                const tick = document.createElement('div');
                tick.className = 'tick';
                fragment.appendChild(tick);
            }
            
            container.appendChild(fragment);
        });
    }

    // 4. Load the data using D3
    // Make sure your CSV file is named "data.csv" and is in the same folder.
    d3.csv('data.csv').then(data => {
        // If successful, read the length of the CSV and draw that many ticks
        const rowCount = data.length;
        console.log(`Successfully loaded ${rowCount} rows from CSV.`);
        drawTicks(rowCount);
        
    }).catch(error => {
        // Fallback: If CSV fails to load (e.g., viewing as local file without a server), 
        // default to exactly 1,231 lines so the layout matches the original article.
        console.warn("CSV not found or CORS error. Rendering 1,231 dummy lines as fallback.");
        drawTicks(1231);
    });
});