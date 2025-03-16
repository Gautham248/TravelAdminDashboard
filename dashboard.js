// Firebase URL constant
const DB_URL = 'https://js-ilp-default-rtdb.firebaseio.com/ExperionTravels/.json';

// Global state variables
let allData = null;
let activeTab = 'all';
let searchTerm = '';

// Fetch data once and store it
const fetchData = async () => {
  try {
    const response = await axios.get(DB_URL);
    allData = response.data;
    console.log('Data fetched:', allData);
    applyFiltersAndRender();
    updateStats();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// Function to filter data based on active tab and search term
const applyFiltersAndRender = () => {
  if (!allData?.travelRequests) return;
  
  const today = new Date();
  const filteredRequests = {};
  
  // Filter based on search term and active tab
  Object.entries(allData.travelRequests).forEach(([requestId, request]) => {
    const employee = allData.employees[request.employeeId];
    const passport = allData.passports[request.employeeId];
    let includeInResults = true;
    
    // Search filter
    if (searchTerm) {
      const employeeName = employee?.name?.toLowerCase() || '';
      const source = request.source?.toLowerCase() || '';
      const destination = request.destination?.toLowerCase() || '';
      const projectCode = request.projectCode?.toLowerCase() || '';
      
      if (!employeeName.includes(searchTerm) && 
          !source.includes(searchTerm) && 
          !destination.includes(searchTerm) &&
          !projectCode.includes(searchTerm)) {
        includeInResults = false;
      }
    }
    
    // Tab filter
    if (activeTab !== 'all') {
      // For upcoming tab - show requests with departure dates in the future
      if (activeTab === 'upcoming') {
        const departureDate = new Date(request.departure);
        if (departureDate <= today) {
          includeInResults = false;
        }
      }
      // For threats tab - show requests with passports expiring within 6 months
      else if (activeTab === 'threats') {
        const expiryDate = new Date(passport?.expiry);
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(today.getMonth() + 6);
        
        if (!(expiryDate < sixMonthsFromNow)) {
          includeInResults = false;
        }
      }
      // For verified tab - show only verified requests
      else if (activeTab === 'verified') {
        if (request.status !== 'verified') {
          includeInResults = false;
        }
      }
    }
    
    // Include request if it passed all filters
    if (includeInResults) {
      filteredRequests[requestId] = request;
    }
  });
  
  renderRequestsList(filteredRequests);
};

const renderRequestsList = (filteredRequests = null) => {
  const requestsToRender = filteredRequests || allData.travelRequests;
  
  const travelDetails = Object.entries(requestsToRender).map(([requestId, request]) => {
    const employee = allData.employees[request.employeeId];
    const passport = allData.passports[request.employeeId];

    return {
      id: requestId,
      employeeId: request.employeeId,
      departureDate: request.departure,
      source: request.source,
      destination: request.destination,
      projectCode: request.projectCode,
      employeeName: employee.name,
      passportExpiry: passport.expiry,
      status: request.status,
      subTrips: request.subTrips
    };
  });

  renderRequestCards(travelDetails);
};

const renderRequestCards = (travelDetails) => {
  const container = document.querySelector('.requestsection-allrequests');   
  container.innerHTML = '';
  
  if (travelDetails.length === 0) {
    const noResultsMessage = document.createElement('div');
    noResultsMessage.classList.add('no-results-message');
    noResultsMessage.textContent = 'No travel requests match your criteria';
    container.appendChild(noResultsMessage);
    return;
  }

  travelDetails.forEach(dataRequest => {
    const card = createRequestCard(dataRequest);
    container.appendChild(card);
  });
};

const createRequestCard = (dataRequest) => {
  const card = document.createElement('div');
  card.classList.add('request-card');
  
  // Create the entire card structure using template literal
  card.innerHTML = `
    <div class="request-card-employee">
      <div class="request-card-employeename">${dataRequest.employeeName}</div>
      <div class="request-card-employee-details">
        <div class="request-card-sourceanddestination">${dataRequest.source} - ${dataRequest.destination}</div>
        <div class="request-card-traveldate">${formatDate(dataRequest.departureDate)}</div>
        <div class="request-card-projectcode">${dataRequest.projectCode}</div>
        <div class="request-card-passport-expiry">Passport expires on ${formatDate(dataRequest.passportExpiry)}</div>
      </div>
    </div>
    <div class="request-card-sectionbutton">
      <button class="request-card-statusbutton ${dataRequest.status === 'verified' ? 'status-verified' : 
                                              dataRequest.status === 'denied' ? 'status-denied' : ''}">${dataRequest.status || 'Pending'}</button>
    </div>
  `;
  
  // Add click event to open modal
  card.addEventListener('click', () => {
    openModal(dataRequest);
  });
  
  return card;
};

const openModal = (dataRequest) => {
  // Get modal elements
  const modal = document.querySelector('.modal-section');
  const modalOverlay = document.querySelector('.modal-section-overlay');
  const modalPopup = document.getElementById("modal-section-popup");
  
  if (!modal) return;
  
  // Update modal content
  try {
    // Update traveler information
    updateModalHeader(dataRequest);
    
    // Update travel request details
    updateTravelRequestDetails(dataRequest);
    
    // Render subtrips
    renderSubTrips(dataRequest);
    
    // Show the modal
    modal.style.display = 'block';
    if (modalPopup) modalPopup.classList.add("active");
    if (modalOverlay) modalOverlay.classList.remove('hidden');
  } catch (error) {
    console.error('Error updating modal content:', error);
  }
};

const updateModalHeader = (dataRequest) => {
  const travelerNameElement = document.querySelector('.mspc-header-traveller');
  const statusElement = document.querySelector('.mspc-header-status');
  
  if (travelerNameElement) {
    travelerNameElement.textContent = dataRequest.employeeName;
  }
  
  if (statusElement) {
    statusElement.textContent = dataRequest.status || 'Pending';
    
    // Reset styles
    statusElement.style.backgroundColor = '';
    statusElement.style.color = '';
    
    // Apply appropriate styling
    if (dataRequest.status?.toLowerCase() === 'verified') {
      statusElement.style.backgroundColor = 'rgb(15, 148, 15)';
      statusElement.style.color = 'white';
    } else if (dataRequest.status?.toLowerCase() === 'denied') {
      statusElement.style.backgroundColor = '#ff5353';
      statusElement.style.color = 'white';
    } else {
      statusElement.style.backgroundColor = '#FFD700';
      statusElement.style.color = 'black';
    }
  }
};

const updateTravelRequestDetails = (dataRequest) => {
  // Update project code
  const projectCodeElement = document.querySelector('.mspc-trd-project-code-value');
  if (projectCodeElement) {
    projectCodeElement.textContent = dataRequest.projectCode;
  }

  // Update main trip
  const mainTripElement = document.querySelector('.mspc-trd-main-trip-value');
  if (mainTripElement) {
    mainTripElement.textContent = `${dataRequest.source} → ${dataRequest.destination}`;
  }

  // Update departure date
  const departureDateElement = document.querySelector('.mspc-trd-departure-date-value');
  if (departureDateElement) {
    departureDateElement.textContent = formatDate(dataRequest.departureDate);
  }

  // Update passport expiry
  const passportExpiryElement = document.querySelector('.mspc-trd-passport-expiry-value');
  if (passportExpiryElement) {
    passportExpiryElement.textContent = formatDate(dataRequest.passportExpiry);
  }
};

const renderSubTrips = (dataRequest) => {
  const container = document.querySelector('.mspc-std-content');
  if (!container) {
    console.log("error");
    return; 
  }
  
  // Clear previous content
  container.innerHTML = '';
  
  // Add heading back
  const heading = document.createElement('div');
  heading.classList.add('mspc-std-heading');
  heading.textContent = 'Sub Trips';
  container.appendChild(heading);
  
  // Check if this request has sub-trips
  if (!dataRequest.subTrips || Object.keys(dataRequest.subTrips).length === 0) {
    const noSubTripsMsg = document.createElement('div');
    noSubTripsMsg.classList.add('mspc-std-no-subtrips');
    noSubTripsMsg.textContent = 'No sub-trips available for this travel request.';
    container.appendChild(noSubTripsMsg);
    return;
  }
  
  // Display each sub-trip
  Object.entries(dataRequest.subTrips).forEach(([subTripId, subTrip]) => {
    // Create sub-trip content container
    const content = document.createElement('div');
    content.classList.add('mspc-std-content');
    
    // Set appropriate icon based on sub-trip type
    let iconClass = 'fa-car-alt';
    if (subTrip.type === 'hotel') iconClass = 'fa-hotel';
    else if (subTrip.type === 'meeting') iconClass = 'fa-briefcase';
    else if (subTrip.type === 'dropoff') iconClass = 'fa-plane-departure';
    
    content.innerHTML = `
      <div class="mspc-std-header">
        <div class="mspc-std-header-top">
          <i class="fas ${iconClass}" style="padding-right: 10px; color:#0080FF"></i>
          <div class="mspc-std-header-top-mode">${capitalizeFirstLetter(subTrip.type)}</div>
        </div>
        <i class="fa fa-trash" style="color: #ff5353; cursor: pointer;"></i>
      </div>
      <div class="mspc-std-source-destination">
        ${subTrip.source} to ${subTrip.destination}
      </div>
      <div class="mspc-std-time">
        <i class="fa-solid fa-clock"></i>
        <div class="mspc-std-time-value">${subTrip.time}</div>
      </div>
    `;
    
    // Add delete functionality to trash icon
    const trashIcon = content.querySelector('.fa-trash');
    trashIcon.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent modal from closing
      // Here you would add the delete functionality
      alert(`Delete subtrip: ${subTripId}`);
    });
    
    container.appendChild(content);
  });
};

// Function to update stats dynamically
const updateStats = () => {
  if (!allData?.travelRequests || !allData?.passports) {
    console.error("Invalid data format");
    return;
  }

  const totalRequests = Object.keys(allData.travelRequests).length;
  let verifiedRequests = 0;
  let threatRequests = 0;
  const today = new Date();

  // Loop through travel requests
  Object.values(allData.travelRequests).forEach(request => {
    if (request.status === "verified") {
      verifiedRequests++;
    }

    const employeeId = request.employeeId;
    const passport = allData.passports[employeeId];

    if (passport?.expiry) {
      const expiryDate = new Date(passport.expiry);
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(today.getMonth() + 6);

      // If passport expires in less than 6 months, it's a threat
      if (expiryDate < sixMonthsFromNow) {
        threatRequests++;
      }
    }
  });

  // Update UI
  const totalElement = document.querySelector(".stats-section-totalrequests-number");
  const threatsElement = document.querySelector(".stats-section-threats-number");
  const verifiedElement = document.querySelector(".stats-section-verified-number");

  if (totalElement) totalElement.textContent = totalRequests;
  if (threatsElement) threatsElement.textContent = threatRequests;
  if (verifiedElement) verifiedElement.textContent = verifiedRequests;

  console.log("Stats updated:", { totalRequests, threatRequests, verifiedRequests });
};

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// const addNewTask = () => {
//     const taskInput = document.getElementById('task-input');
//     const taskText = taskInput.value.trim();
    
//     if (taskText) {
//       const taskContainer = document.querySelector('.todo-list');
//       const currentDate = new Date();
//       const formattedDate = `${currentDate.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][currentDate.getMonth()]} ${String(currentDate.getFullYear()).slice(2)}`;
//       const formattedTime = `${currentDate.getHours()}:${String(currentDate.getMinutes()).padStart(2, '0')} ${currentDate.getHours() >= 12 ? 'PM' : 'AM'}`;
      
//       const newTask = document.createElement('div');
//       newTask.classList.add('task');
//       newTask.innerHTML = `
//         <div class="date-and-time">
//           <p class="date">${formattedDate}</p>
//           <p class="time">${formattedTime}</p>
//         </div>
//         <div class="task-description">
//           <p>${taskText}</p>
//         </div>
//       `;
      
//       // Insert before the task-container or at the beginning
//       const taskContainerElement = document.querySelector('.task-container');
//       if (taskContainerElement) {
//         taskContainer.insertBefore(newTask, taskContainerElement);
//       } else {
//         taskContainer.appendChild(newTask);
//       }
      
//       // Clear input
//       taskInput.value = '';
//     }
//   };
  
  // Setup event listeners for the entire application
  const setupEventListeners = () => {
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeTab = e.target.getAttribute('data-tab');
        applyFiltersAndRender();
      });
    });
    
    // Search functionality
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        searchTerm = searchInput?.value.toLowerCase().trim() || '';
        applyFiltersAndRender();
      });
    }
    
    if (searchInput) {
      searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          searchTerm = searchInput.value.toLowerCase().trim();
          applyFiltersAndRender();
        }
      });
    }
    
    // Modal close functionality
    setupModalCloseHandlers();
    
    // Add task functionality
    // const taskInput = document.getElementById('task-input');
    // const submitButton = document.querySelector('.submit-button');
    
    // if (taskInput && submitButton) {
    //   submitButton.addEventListener('click', addNewTask);
    //   taskInput.addEventListener('keyup', (e) => {
    //     if (e.key === 'Enter') {
    //       addNewTask();
    //     }
    //   });
    // }
    
    // Add approve and deny button functionality
    setupApprovalButtons();
  };
  
  const setupModalCloseHandlers = () => {
    // Set up modal close button
    const closeButtons = document.querySelectorAll('.close, .modal-close');
    closeButtons.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', closeModal);
      }
    });
  
    // Close modal when clicking outside
    const modalOverlay = document.querySelector('.modal-section-overlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
          closeModal();
        }
      });
    }
  };
  
  const closeModal = () => {
    const modal = document.querySelector('.modal-section');
    const modalOverlay = document.querySelector('.modal-section-overlay');
    const modalPopup = document.getElementById('modal-section-popup');
    
    if (modal) modal.style.display = 'none';
    if (modalOverlay) modalOverlay.classList.add('hidden');
    if (modalPopup) modalPopup.classList.remove('active');
  };
  
  const setupApprovalButtons = () => {
    // Add event listeners for approve and deny buttons
    const approveButton = document.querySelector('.mspc-buttons-approve');
    const denyButton = document.querySelector('.mspc-buttons-deny');
    
    if (approveButton) {
      approveButton.addEventListener('click', () => {
        // Here you would update the request status in the database
        // alert('Request approved!');
        // Optional: Close the modal after approving
        closeModal();
        // Optional: Refresh data
        fetchData();
      });
    }
    
    if (denyButton) {
      denyButton.addEventListener('click', () => {
        // Here you would update the request status in the database
        // alert('Request denied!');
        // Optional: Close the modal after denying
        closeModal();
        // Optional: Refresh data
        fetchData();
      });
    }
  };
  
  // Function to add a new subtrip
  const addSubtrip = (employeeId, requestId) => {
    // This would be implemented to add new subtrips to a travel request
    console.log(`Adding new subtrip for employee ${employeeId} on request ${requestId}`);
    
    // Here you would show a form to collect subtrip details
    // After collecting details, you would update the database
    
    // For now, just show an alert
    alert('Add subtrip functionality would appear here');
  };
  
  // Initialize the app
  document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    setupEventListeners();
  });

  let chart;
  let currentYear;
  let currentQuarter = 0;
  let minYear;
  let maxYear;
  
  const quarterMonths = {
      0: ["Jan", "Feb", "Mar"],
      1: ["Apr", "May", "Jun"],
      2: ["Jul", "Aug", "Sep"],
      3: ["Oct", "Nov", "Dec"]
  };
  
  async function fetchAndUpdateChart(year = currentYear, quarter = currentQuarter) {
      try {
          const response = await axios.get('https://js-ilp-default-rtdb.firebaseio.com/ExperionTravels/.json');
          const data = response.data;
  
          let monthlyApproved = [0, 0, 0];
          let monthlyRejected = [0, 0, 0];
          let years = new Set();
  
          for (let key in data.travelRequests) {
              const request = data.travelRequests[key];
              if (!request.departure) continue;
              const departureDate = new Date(request.departure);
              if (isNaN(departureDate)) continue;
  
              const departureYear = departureDate.getFullYear();
              years.add(departureYear);
  
              const month = departureDate.getMonth();
              const quarterIndex = Math.floor(month / 3);
              const monthIndex = month % 3;
  
              if (departureYear === year && quarterIndex === quarter) {
                  if (request.status.toLowerCase() === "verified" || request.status.toLowerCase() === "approved") {
                      monthlyApproved[monthIndex]++;
                  } else if (request.status.toLowerCase() === "denied") {
                      monthlyRejected[monthIndex]++;
                  }
              }
          }
  
          // Set min and max years only if years exist
          if (years.size > 0) {
              minYear = Math.min(...years);
              maxYear = Math.max(...years);
              if (currentYear === undefined) currentYear = maxYear; // Set only once
          }
  
          document.getElementById("yearDisplay").textContent = currentYear;
  
          const chartData = {
              labels: quarterMonths[quarter],
              datasets: [
                  {
                      label: "Approved",
                      data: monthlyApproved,
                      backgroundColor: "green"
                  },
                  {
                      label: "Rejected",
                      data: monthlyRejected,
                      backgroundColor: "red"
                  }
              ]
          };
  
          if (chart) {
              chart.data = chartData;
              chart.update();
          } else {
              const ctx = document.getElementById('myChart').getContext('2d');
              chart = new Chart(ctx, {
                  type: 'bar',
                  data: chartData,
                  options: {
                      plugins: {
                          legend: {
                              display: true,
                              labels: {
                                  color: 'black'
                              }
                          }
                      }
                  }
              });
          }
  
      } catch (error) {
          console.error("Error fetching data:", error);
      }
  }
  
  // Ensure the year display is set correctly on page load
  document.addEventListener("DOMContentLoaded", () => {
      document.getElementById("yearDisplay").textContent = currentYear;
      fetchAndUpdateChart();
  });
  
  function changeYear(direction) {
      let newYear = currentYear + direction;
      if (newYear >= minYear && newYear <= maxYear) {
          currentYear = newYear;
          document.getElementById("yearDisplay").textContent = currentYear;
          fetchAndUpdateChart(currentYear, currentQuarter);
      }
  }
  
  function changeQuarter(quarter) {
      currentQuarter = quarter;
      fetchAndUpdateChart(currentYear, currentQuarter);
  }
  
  function updateChart(quarter) {
      changeQuarter(quarter - 1);
  }
    
