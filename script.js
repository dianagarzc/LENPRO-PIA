let originalRows = [];
let lineChart, barChart, pieChart;

document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        if (file.name.endsWith('.csv')) {
            processCSV(content);
        } else if (file.name.endsWith('.json')) {
            processJSON(content);
        } else {
            alert('Formato no soportado');
        }
    };
    reader.readAsText(file);
});

function processCSV(content) {
    const rows = content.trim().split('\n').map(row => row.split(','));
    originalRows = rows;
    generateTable(rows);
    loadCharts(rows);
}

function processJSON(content) {
    const data = JSON.parse(content);
    const keys = Object.keys(data[0]);
    const rows = [keys, ...data.map(obj => keys.map(k => obj[k]))];
    originalRows = rows;
    generateTable(rows);
    loadCharts(rows);
}

function generateTable(rows) {
    const header = document.getElementById('tableHeader');
    const body = document.getElementById('tableBody');
    header.innerHTML = '';
    body.innerHTML = '';

    rows[0].forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        header.appendChild(th);
    });

    rows.slice(1).forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        body.appendChild(tr);
    });
}

document.getElementById('searchButton').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = originalRows.slice(1).filter(row =>
        row.some(cell => cell.toLowerCase().includes(query))
    );
    const result = [originalRows[0], ...filtered];
    generateTable(result);
    loadCharts(result);
});

document.getElementById('filterOptions').addEventListener('change', function () {
    const option = this.value;
    let filteredRows = originalRows.slice(1);
    switch (option) {
        case 'sortAsc':
            filteredRows.sort((a, b) => parseFloat(a[1]) - parseFloat(b[1]));
            break;
        case 'sortDesc':
            filteredRows.sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]));
            break;
        case 'specificValue':
            const value = prompt("Ingresa el valor a filtrar:");
            filteredRows = filteredRows.filter(row => row.includes(value));
            break;
    }
    const result = [originalRows[0], ...filteredRows];
    generateTable(result);
    loadCharts(result);
});

function loadCharts(rows) {
    const labels = rows.slice(1).map(row => row[0]);
    const values = rows.slice(1).map(row => parseFloat(row[1]));

    if (lineChart) lineChart.destroy();
    if (barChart) barChart.destroy();
    if (pieChart) pieChart.destroy();

    lineChart = new Chart(document.getElementById('lineChart').getContext('2d'), {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Datos',
                data: values,
                borderColor: 'green',
                fill: false
            }]
        }
    });

    barChart = new Chart(document.getElementById('barChart').getContext('2d'), {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Datos',
                data: values,
                backgroundColor: 'lightgreen'
            }]
        }
    });

    pieChart = new Chart(document.getElementById('pieChart').getContext('2d'), {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: ['#6a9f58', '#8ed081', '#a6e7a4', '#c7f1c3', '#e3fbe1']
            }]
        }
    });
}

function exportChartAsImage(chartId) {
    const canvas = document.getElementById(chartId);
    const link = document.createElement('a');
    link.href = canvas.toDataURL();
    link.download = chartId + '.png';
    link.click();
}
