let originalRows = [];
let labels = [];
let dataset = [];
let lineChart, barChart, pieChart;

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
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
    const rows = [keys, ...data.map(obj => keys.map(key => obj[key]))];
    originalRows = rows;
    generateTable(rows);
    loadCharts(rows);
}

function generateTable(rows) {
    const table = document.getElementById('dataTable');
    table.innerHTML = '';
    rows.forEach((row, index) => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement(index === 0 ? 'th' : 'td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });
}

document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('valueFilter').addEventListener('input', applyFilters);

function applyFilters() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const minValue = parseFloat(document.getElementById('valueFilter').value);
    const headers = originalRows[0];
    const rows = originalRows.slice(1).filter(row => {
        const matchesText = row.some(cell => cell.toLowerCase().includes(query));
        const valueCheck = isNaN(minValue) || parseFloat(row[1]) >= minValue;
        return matchesText && valueCheck;
    });
    const filtered = [headers, ...rows];
    generateTable(filtered);
    loadCharts(filtered);
}

function loadCharts(rows) {
    if (!rows || rows.length < 2) return;

    labels = rows.slice(1).map(r => r[0]);
    dataset = rows.slice(1).map(r => parseFloat(r[1]));
    const trend = calculateTrendline(labels, dataset);

    if (lineChart) lineChart.destroy();
    if (barChart) barChart.destroy();
    if (pieChart) pieChart.destroy();

    const ctxLine = document.getElementById('lineChart').getContext('2d');
    const ctxBar = document.getElementById('barChart').getContext('2d');
    const ctxPie = document.getElementById('pieChart').getContext('2d');

    lineChart = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Valores',
                    data: dataset,
                    borderColor: 'green',
                    backgroundColor: 'rgba(0,128,0,0.1)',
                    tension: 0.3
                },
                {
                    label: 'Tendencia',
                    data: trend,
                    borderColor: 'red',
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            onClick: (e, elements) => {
                if (elements.length > 0) {
                    const i = elements[0].index;
                    alert(`Etiqueta: ${labels[i]}\nValor: ${dataset[i]}`);
                }
            }
        }
    });

    barChart = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Valores',
                data: dataset,
                backgroundColor: 'rgba(0,128,0,0.7)',
                borderColor: '#006400',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });

    pieChart = new Chart(ctxPie, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                label: 'Distribución',
                data: dataset,
                backgroundColor: labels.map(() => randomColor())
            }]
        },
        options: {
            responsive: true
        }
    });
}

function calculateTrendline(labels, data) {
    const n = data.length;
    const sumX = labels.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, y) => sum + y, 0);
    const sumXY = data.reduce((sum, y, i) => sum + i * y, 0);
    const sumX2 = labels.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return labels.map((_, i) => slope * i + intercept);
}

function randomColor() {
    const r = Math.floor(Math.random() * 180);
    const g = Math.floor(Math.random() * 180);
    const b = Math.floor(Math.random() * 180);
    return `rgb(${r},${g},${b})`;
}

function exportChartAsImage(chartId) {
    const canvas = document.getElementById(chartId);
    const link = document.createElement('a');
    link.download = chartId + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

function exportChartAsPDF(chartId) {
    const canvas = document.getElementById(chartId);
    const image = canvas.toDataURL('image/png');
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height / canvas.width) * width;
    pdf.addImage(image, 'PNG', 10, 10, width - 20, height);
    pdf.save(chartId + '.pdf');
}
