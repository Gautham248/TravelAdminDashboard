const data = [
    { "year": 2023, "month": 1, "approved": 80, "rejected": 40 },
    { "year": 2023, "month": 2, "approved": 75, "rejected": 35 },
    { "year": 2023, "month": 3, "approved": 90, "rejected": 45 },
    { "year": 2023, "month": 4, "approved": 100, "rejected": 50 },
    { "year": 2023, "month": 5, "approved": 85, "rejected": 40 },
    { "year": 2023, "month": 6, "approved": 95, "rejected": 55 },
    { "year": 2023, "month": 7, "approved": 110, "rejected": 60 },
    { "year": 2023, "month": 8, "approved": 90, "rejected": 30 },
    { "year": 2023, "month": 9, "approved": 105, "rejected": 50 },
    { "year": 2023, "month": 10, "approved": 115, "rejected": 65 },
    { "year": 2023, "month": 11, "approved": 120, "rejected": 70 },
    { "year": 2023, "month": 12, "approved": 130, "rejected": 75 },
    { "year": 2024, "month": 1, "approved": 140, "rejected": 80 },
    { "year": 2024, "month": 2, "approved": 130, "rejected": 70 },
    { "year": 2024, "month": 3, "approved": 150, "rejected": 90 },
    { "year": 2024, "month": 4, "approved": 160, "rejected": 85 },
    { "year": 2024, "month": 5, "approved": 145, "rejected": 75 },
    { "year": 2024, "month": 6, "approved": 110, "rejected": 70 },
    { "year": 2024, "month": 7, "approved": 170, "rejected": 95 },
    { "year": 2024, "month": 8, "approved": 180, "rejected": 100 },
    { "year": 2024, "month": 9, "approved": 140, "rejected": 60 },
    { "year": 2024, "month": 10, "approved": 190, "rejected": 110 },
    { "year": 2024, "month": 11, "approved": 200, "rejected": 120 },
    { "year": 2024, "month": 12, "approved": 210, "rejected": 130 }
];

let ctx = document.getElementById('myChart').getContext('2d');
let chart;
let currentYear = 2024;
const maxYear = new Date().getFullYear();
const minYear = Math.min(...data.map(d => d.year));

function updateChart(quarter) {
    document.getElementById("yearDisplay").textContent = currentYear;
    const filteredData = data.filter(d => d.year === currentYear && Math.floor((d.month - 1) / 3) + 1 === quarter);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const labels = filteredData.map(d => monthNames[d.month - 1]);
    
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                { label: 'Approved', data: filteredData.map(d => d.approved), backgroundColor: 'green' },
                { label: 'Rejected', data: filteredData.map(d => d.rejected), backgroundColor: 'red' }
            ]
        }
    });
}

function changeYear(offset) {
    const newYear = currentYear + offset;
    if (newYear >= minYear && newYear <= maxYear) {
        currentYear = newYear;
        updateChart(1);
    }
}

updateChart(1);
