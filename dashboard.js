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



// RIONA MARIA VARGHESE

document.addEventListener("DOMContentLoaded", () => {
    const modalPopup = document.getElementById("modal-section-popup");
    const modalSection = document.querySelector('.modal-section');
    const modalOverlay = document.querySelector('.modal-section-overlay');

    function closeModal() {
        modalSection.style.display = 'none';
        modalOverlay.classList.add('hidden');
    }
    
    // Close modal when clicking outside
    document.addEventListener('mousedown', function(event) {
        // Check if the click is outside the modal content
        if (modalSection.style.display === 'flex' || modalSection.style.display === 'block') {
            closeModal();
        }
    });
    
    axios.get("https://js-ilp-default-rtdb.firebaseio.com/ExperionTravels/.json")
        .then(response => {
            const employees = response.data.employees;
            
            // Get all request card elements
            const requestCardElements  = document.querySelectorAll(".request-card");
            
            requestCardElements.forEach(cardElement => {
                // Find the employee name element within this card
                const employeeNameElement = cardElement.querySelector(".request-card-employeename");
                
                if (employeeNameElement) {
                    const employeeName = employeeNameElement.textContent.trim();
                    
                    // Find the employee ID by matching the name
                    let matchedEmployeeId = null;
                    for (const empId in employees) {
                        if (employees[empId].name === employeeName) {
                            matchedEmployeeId = empId;
                            break;
                        }
                    }
                    
                    if (matchedEmployeeId) {
                        // Add click event to the entire card
                        cardElement.addEventListener("click", () => {
                            document.querySelector(".modal-section").style.display = "block";
                            modalPopup.classList.add("active");
                            modalOverlay.classList.remove('hidden');

                            fetchModalContents(matchedEmployeeId);
                        });

                        // Make the entire card appear clickable
                        cardElement.style.cursor = "pointer";
                    } else {
                        console.log(`No employee ID found for ${employeeName}`);
                    }
                }
            });
        })
        .catch(error => {
            console.error("Error setting up request card click handlers:", error);
        });
});

function fetchModalContents(employeeId) {
    axios.get("https://js-ilp-default-rtdb.firebaseio.com/ExperionTravels/.json")
        .then(response => {
            const travelReq = response.data.travelRequests;
            const container = document.getElementById("modal-section-popup-content-sub-trip-details");
            
            // Check if container exists
            if (!container) {
                console.error("Element 'modal-section-popup-content-sub-trip-details' not found");
                return;
            }
            
            // Clear previous content
            container.innerHTML = "";
            
            // Add heading back
            const heading = document.createElement("div");
            heading.classList.add("mspc-std-heading");
            heading.textContent = "Sub Trips";
            container.appendChild(heading);
            
            // Find travel requests for the specific employee
            const employeeRequests = Object.values(travelReq).filter(req => req.employeeId === employeeId);
            
            if (employeeRequests.length === 0) {
                container.innerHTML += "<div>No travel requests found for this employee.</div>";
                return;
            }
            
            const request = employeeRequests[0];
            
            // Update the main travel request details first
            updateTravelRequestDetails(request, response.data.employees[employeeId], response.data.passports[employeeId]);
            
            // Check if this request has sub-trips
            if (!request.subTrips) {
                updateTravelRequestDetails(request, response.data.employees[employeeId], response.data.passports[employeeId]);
                const noSubTripsMsg = document.createElement("div");
                noSubTripsMsg.textContent = "No sub-trips available for this travel request.";
                container.appendChild(noSubTripsMsg);
                return;
            }
            
            // Display each sub-trip
            Object.keys(request.subTrips).forEach(subTripId => {
                const subTrip = request.subTrips[subTripId];
                
                // Create sub-trip content container
                const content = document.createElement("div");
                content.classList.add("mspc-std-content");
                
                // Set appropriate icon based on sub-trip type
                let iconClass = "fa-car-alt";
                if (subTrip.type === "hotel") iconClass = "fa-hotel";
                else if (subTrip.type === "meeting") iconClass = "fa-briefcase";
                else if (subTrip.type === "dropoff") iconClass = "fa-plane-departure";
                
                const headerHtml = `
                    <div class="mspc-std-header">
                        <div class="mspc-std-header-top">
                            <i class="fas ${iconClass}" style="padding-right: 10px; color:#0080FF"></i>
                            <div class="mspc-std-header-top-mode">${subTrip.type.charAt(0).toUpperCase() + subTrip.type.slice(1)}</div>
                        </div>
                        <i class="fa fa-trash" style="color: #ff5353; cursor: pointer;"></i>
                    </div>
                `;
                
                const srcDestHtml = `
                    <div class="mspc-std-source-destination">
                        ${subTrip.source} to ${subTrip.destination}
                    </div>
                `;
                
                const timeHtml = `
                    <div class="mspc-std-time">
                        <i class="fa-solid fa-clock"></i>
                        <div class="mspc-std-time-value">${subTrip.time}</div>
                    </div>
                `;
                
                content.innerHTML = headerHtml + srcDestHtml + timeHtml;
                
                container.appendChild(content);
            });
        })
        .catch(error => {
            console.error("Error fetching travel request data:", error);
        });
}

function updateTravelRequestDetails(request, employee, passport) {
    // Update traveller name
    const travellerNameElement = document.getElementById("traveller-name");
    if (travellerNameElement) travellerNameElement.textContent = employee.name;
    
    // Update request status with appropriate styling
    const requestStatusElement = document.getElementById("request-status");
    if (requestStatusElement) {
        requestStatusElement.textContent = request.status;
        
        if (request.status.toLowerCase() === "verified") {
            requestStatusElement.style.backgroundColor = "rgb(15, 148, 15)";
            requestStatusElement.style.color = "white";
        } else if (request.status.toLowerCase() === "denied") {
            requestStatusElement.style.backgroundColor = "#ff5353";
            requestStatusElement.style.color = "white";
        } else {
            requestStatusElement.style.backgroundColor = "#FFD700";
            requestStatusElement.style.color = "black";
        }
    }
    
    const projectCodeElement = document.getElementById("project-code");
    if (projectCodeElement) projectCodeElement.textContent = request.projectCode;
    
    const mainTripElement = document.getElementById("main-trip");
    if (mainTripElement) mainTripElement.textContent = `${request.source} to ${request.destination}`;
    
    const departureDateElement = document.getElementById("departure-date");
    if (departureDateElement) departureDateElement.textContent = formatDate(request.departure);
    
    const passportExpiryElement = document.getElementById("passport-expiry");
    if (passportExpiryElement) passportExpiryElement.textContent = formatDate(passport.expiry);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Add event listeners for approve and deny buttons
document.addEventListener("DOMContentLoaded", () => {
    const approveButton = document.querySelector(".mspc-buttons-approve");
    const denyButton = document.querySelector(".mspc-buttons-deny");
    const modalPopup = document.getElementById("modal-section-popup");
    
    if (approveButton) {
        approveButton.addEventListener("click", () => {
            alert("Request approved!");
            // modalPopup.classList.remove("active");
        });
    }
    
    if (denyButton) {
        denyButton.addEventListener("click", () => {
            alert("Request denied!");
            // modalPopup.classList.remove("active");
        });
    }
});