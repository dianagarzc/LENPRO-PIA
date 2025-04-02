document.getElementById("analyzeButton").addEventListener("click", function () {
    let file = document.getElementById("fileInput").files[0];
    if (!file) {
        alert("Por favor, sube un archivo CSV o JSON.");
        return;
    }

    let reader = new FileReader();
    reader.onload = function (e) {
        let content = e.target.result;

        if (file.name.endsWith(".csv")) {
            parseCSV(content); 
        } else if (file.name.endsWith(".json")) {
            parseJSON(content);
        } else {
            alert("Formato no válido. Solo CSV o JSON son permitidos.");
        }
    };
    reader.readAsText(file);
});

function parseCSV(csvText) {
    let rows = csvText.split("\n").map(row => row.split(","));
    if (rows.length < 2) {
        alert("No se encontraron datos en el archivo CSV.");
        return;
    }
    createTable(rows[0], rows.slice(1));
}

function parseJSON(jsonText) {
    let data = JSON.parse(jsonText);
    if (!Array.isArray(data) || data.length === 0) {
        alert("El archivo JSON no contiene datos válidos.");
        return;
    }

    let headers = Object.keys(data[0]);
    let rows = data.map(obj => headers.map(header => obj[header]));

    createTable(headers, rows);
}

function createTable(headers, rows) {
    let tableHeader = document.getElementById("tableHeader");
    let tableBody = document.getElementById("tableBody");

    tableHeader.innerHTML = "";
    tableBody.innerHTML = "";

    headers.forEach((header, index) => {
        let th = document.createElement("th");
        th.textContent = header;
        th.addEventListener("click", () => sortTable(index)); // Añade funcionalidad de ordenación
        tableHeader.appendChild(th);
    });

    rows.forEach(row => {
        let tr = document.createElement("tr");
        row.forEach(cellData => {
            let td = document.createElement("td");
            td.textContent = cellData;
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });

    document.getElementById("searchInput").addEventListener("input", function () {
        filterTable(rows, headers);
    });
}

function filterTable(rows, headers) {
    let filter = document.getElementById("searchInput").value.toLowerCase();
    let tableBody = document.getElementById("tableBody");
    let filteredRows = rows.filter(row => row.some(cell => cell.toLowerCase().includes(filter)));

    tableBody.innerHTML = "";
    rows.forEach(row => {
        let isMatch = row.some(cell => cell.toLowerCase().includes(filter));
        if (isMatch) {
            let tr = document.createElement("tr");
            row.forEach(cellData => {
                let td = document.createElement("td");
                td.textContent = cellData;
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        }
    });
}

function sortTable(columnIndex) {
    let tableBody = document.getElementById("tableBody");
    let rows = Array.from(tableBody.rows);
    let isAscending = tableBody.dataset.sortColumn === columnIndex && tableBody.dataset.sortOrder === "asc";

    rows.sort((a, b) => {
        let cellA = a.cells[columnIndex].textContent.trim();
        let cellB = b.cells[columnIndex].textContent.trim();
        
        if (cellA < cellB) return isAscending ? 1 : -1;
        if (cellA > cellB) return isAscending ? -1 : 1;
        return 0;
    });

    tableBody.innerHTML = "";
    rows.forEach(row => tableBody.appendChild(row));

    tableBody.dataset.sortColumn = columnIndex;
    tableBody.dataset.sortOrder = isAscending ? "desc" : "asc";
}