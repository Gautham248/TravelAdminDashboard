const DB_URL = 'https://js-ilp-default-rtdb.firebaseio.com/Xpress/.json';

let allData = null;
let activeTab = 'all';
let searchTerm = '';

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

const applyFiltersAndRender = () => {
  if (!allData?.travelRequests) return;
  
  const today = new Date();
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(today.getMonth() + 1);
  
  const filteredRequests = {};
  
  Object.entries(allData.travelRequests).forEach(([requestId, request]) => {
    const employee = allData.employees[request.employeeId];
    const passport = allData.passports[request.employeeId];
    let includeInResults = true;
    
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
    
    if (activeTab !== 'all') {
      if (activeTab === 'upcoming') {
        const departureDate = new Date(request.departure);
        if (departureDate <= today || departureDate > oneMonthFromNow) {
          includeInResults = false;
        }
      }
      else if (activeTab === 'threats') {
        const expiryDate = new Date(passport?.expiry);
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(today.getMonth() + 6);
        
        if (!(expiryDate < sixMonthsFromNow)) {
          includeInResults = false;
        }
      }
      else if (activeTab === 'verified') {
        if (request.status !== 'verified') {
          includeInResults = false;
        }
      }
    }
    
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
  
  card.addEventListener('click', () => {
    openModal(dataRequest);
  });
  
  return card;
};

const openModal = (dataRequest) => {
  const modal = document.querySelector('.modal-section');
  const modalOverlay = document.querySelector('.modal-section-overlay');
  const modalPopup = document.getElementById("modal-section-popup");
  
  if (!modal) return;
  
  try {
    updateModalHeader(dataRequest);
    
    updateTravelRequestDetails(dataRequest);
    
    renderSubTrips(dataRequest);
    
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
    
    statusElement.style.backgroundColor = '';
    statusElement.style.color = '';
    
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
  const projectCodeElement = document.querySelector('.mspc-trd-project-code-value');
  if (projectCodeElement) {
    projectCodeElement.textContent = dataRequest.projectCode;
  }

  const mainTripElement = document.querySelector('.mspc-trd-main-trip-value');
  if (mainTripElement) {
    mainTripElement.textContent = `${dataRequest.source} → ${dataRequest.destination}`;
  }

  const departureDateElement = document.querySelector('.mspc-trd-departure-date-value');
  if (departureDateElement) {
    departureDateElement.textContent = formatDate(dataRequest.departureDate);
  }

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
  
  container.innerHTML = '';
  
  const heading = document.createElement('div');
  heading.classList.add('mspc-std-heading');
  heading.textContent = 'Sub Trips';
  container.appendChild(heading);
  
  if (!dataRequest.subTrips || Object.keys(dataRequest.subTrips).length === 0) {
    const noSubTripsMsg = document.createElement('div');
    noSubTripsMsg.classList.add('mspc-std-no-subtrips');
    noSubTripsMsg.textContent = 'No sub-trips available for this travel request.';
    container.appendChild(noSubTripsMsg);
    return;
  }
  
  Object.entries(dataRequest.subTrips).forEach(([subTripId, subTrip]) => {
    const content = document.createElement('div');
    content.classList.add('mspc-std-content');
    
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
    
    const trashIcon = content.querySelector('.fa-trash');
    trashIcon.addEventListener('click', (event) => {
      event.stopPropagation(); 
      alert(`Delete subtrip: ${subTripId}`);
    });
    
    container.appendChild(content);
  });
};

const updateStats = () => {
  if (!allData?.travelRequests || !allData?.passports) {
    console.error("Invalid data format");
    return;
  }

  const totalRequests = Object.keys(allData.travelRequests).length;
  let verifiedRequests = 0;
  let threatRequests = 0;
  const today = new Date();

  Object.values(allData.travelRequests).forEach(request => {
    if (request.status === "verified") {
      verifiedRequests++;
    }

    const employeeId = request.employeeId;
    const passport = allData.passports[employeeId];

    if (passport?.expiry) {
      const expiryDate = new Date(passport.expiry);
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(today.getMonth() + 1);

      if (expiryDate < sixMonthsFromNow) {
        threatRequests++;
      }
    }
  });


  const totalElement = document.querySelector(".stats-section-totalrequests-number");
  const threatsElement = document.querySelector(".stats-section-threats-number");
  const verifiedElement = document.querySelector(".stats-section-verified-number");

  if (totalElement) totalElement.textContent = totalRequests;
  if (threatsElement) threatsElement.textContent = threatRequests;
  if (verifiedElement) verifiedElement.textContent = verifiedRequests;

  console.log("Stats updated:", { totalRequests, threatRequests, verifiedRequests });
};


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

  const setupEventListeners = () => {

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeTab = e.target.getAttribute('data-tab');
        applyFiltersAndRender();
      });
    });

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

    setupModalCloseHandlers();
    

    setupApprovalButtons();
  };
  
  const setupModalCloseHandlers = () => {

    const closeButtons = document.querySelectorAll('.close, .modal-close');
    closeButtons.forEach(btn => {
      if (btn) {
        btn.addEventListener('click', closeModal);
      }
    });
  

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
    const approveButton = document.querySelector('.mspc-buttons-approve');
    const denyButton = document.querySelector('.mspc-buttons-deny');
    
    if (approveButton) {
      approveButton.addEventListener('click', () => {
        closeModal();
        fetchData();
      });
    }
    
    if (denyButton) {
      denyButton.addEventListener('click', () => {
        closeModal();
        fetchData();
      });
    }
  };

  
  document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    setupEventListeners();
  });
    
    // ############################### Advait ##########################################
    
    const firebaseURL = "https://js-ilp-default-rtdb.firebaseio.com/Xpress/tasks.json";

    const taskOverlay = document.querySelector(".task-overlay");
    const taskModal = document.querySelector(".task-modal");
    const taskModalClose = document.querySelector(".task-modal-close");
    const taskList = document.querySelector(".task-list");
    const viewAllBtn = document.querySelector(".view-all");
    const closeBtn = document.querySelector(".close-task-modal");
    
    // Function to fetch and display recent tasks
    async function fetchRecentTasks() {
        try {
            const response = await axios.get(firebaseURL);
            const tasksData = response.data;
    
            if (!tasksData) return;
    

            // Convert object to an array of tasks
            const tasksArray = Object.values(tasksData);
    
            // Sort tasks by date and time (newest first) and select the first 2 tasks
            tasksArray.sort((a, b) =>  new Date(`${a.date} ${a.time}`)-new Date(`${b.date} ${b.time}`));
            const recentTasks = tasksArray.slice(0, 2);
    

        
            const task1 = document.getElementById("task-1");
            const task2 = document.getElementById("task-2");
    
         
            if (recentTasks[0]) {
                document.getElementById("task-1").querySelector(".date").textContent = recentTasks[0].date;
                document.getElementById("task-1").querySelector(".time").textContent = recentTasks[0].time;
                document.getElementById("task-1").querySelector(".task-description p").textContent = recentTasks[0].task;
            }
    
     
            if (recentTasks[1]) {
                document.getElementById("task-2").querySelector(".date").textContent = recentTasks[1].date;
                document.getElementById("task-2").querySelector(".time").textContent = recentTasks[1].time;
                document.getElementById("task-2").querySelector(".task-description p").textContent = recentTasks[1].task;
            }
    
            // Populate full task list
            taskList.innerHTML = "";
            tasksArray.forEach(tasktodo => {
                const taskItem = document.createElement("li");
                taskItem.textContent = `${tasktodo.date} ${tasktodo.time} - ${tasktodo.task}`;
                taskList.appendChild(taskItem);
            });
    
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    }
    
    // Function to add a new task
    document.querySelector(".submit-button").addEventListener("click", async () => {
      console.log("submit button clicked");
        const taskInput = document.getElementById("task-input").value.trim();
        const taskDate = document.getElementById("task-date").value;
        const taskTime = document.getElementById("task-time").value;
    
        if (!taskInput || !taskDate || !taskTime) {
            alert("Please enter a task, date, and time!");
            return;
        }
    
        // Generate a unique task number
        const taskNo = `task${Date.now()}`;
    
        // Create the new task object
        const newTask = {
            [taskNo]: {
                date: taskDate,
                time: taskTime,
                task: taskInput,
            }
        };
    
        try {
            const response = await axios.patch(firebaseURL, newTask);
            if (response.status === 200) {
                alert("Task added successfully!");
                document.getElementById("task-input").value = ""; // Clear input field
                document.getElementById("task-date").value = ""; // Clear date
                document.getElementById("task-time").value = ""; // Clear time
                fetchRecentTasks(); // Refresh displayed tasks
            }
        } catch (error) {
            console.error("Error adding task:", error);
        }
    });
    
    // Event listener for View All button
    viewAllBtn.addEventListener("click", () => {
        taskOverlay.style.display = "flex";
    });
    
    // Event listener for closing modal
    closeBtn.addEventListener("click", () => {
        taskOverlay.style.display = "none";
    });
    
    // Initial fetch to populate tasks
    fetchRecentTasks();
    
    
//#################################MAHESH####################################################
//##########################################################################################
const fetchAndUpdateNotifications = async () => {
  try {
      const response = await axios.get(
          "https://js-ilp-default-rtdb.firebaseio.com/Xpress/.json"
      );
      const data = response.data;

      if (!data || !data.passports || !data.employees) {
          console.error("No valid data received.");
          return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0); 

      const notifications = [];

      Object.entries(data.passports).forEach(([employeeId, passport]) => {
          const employee = data.employees[employeeId]; 

          if (!employee) {
              console.warn(`No matching employee found for passport expiry: ${passport.expiry}`);
              return;
          }

          const expiryDate = new Date(passport.expiry);
          expiryDate.setHours(0, 0, 0, 0); 

          if (isNaN(expiryDate.getTime())) {
              console.error("Invalid expiry date:", passport.expiry);
              return;
          }

          const timeDiff = expiryDate.getTime() - today.getTime();
          const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        
          if (daysLeft <= 30) {
              notifications.push({
                  name: employee.name,
                  email: employee.email,
                  expiry: passport.expiry,
                  daysLeft: daysLeft < 0 ? "Expired" : `${daysLeft} days left`,
                  isExpired: daysLeft < 0
              });
          }
      });

      const notificationList = document.getElementById("notification-list");
      notificationList.innerHTML = ""; 

      if (notifications.length === 0) {
          notificationList.innerHTML = "<p>No urgent passport expiries.</p>";
      } else {
          notifications.forEach((employee) => {
              const notificationCard = document.createElement("div");
              notificationCard.classList.add("notification-card");

              notificationCard.innerHTML = `
                  <strong>${employee.name}</strong>
                  <p class="expiry">
                      Passport</br> expires in: <span class="${employee.isExpired ? 'expired' : ''}">
                          ${employee.isExpired ? "Expired" : employee.daysLeft}
                      </span>
                  </p>
                  <button class="send-email-btn" onclick="sendEmail('${employee.email}')">Send Email</button>
              `;

              notificationList.appendChild(notificationCard);
          });
      }

      console.log("Notifications Updated:", notifications);
  } catch (error) {
      console.error("Error fetching data:", error);
  }
};

function sendEmail(employeeEmail) {
    const mailtoLink = `mailto:${employeeEmail}?subject=Urgent: Passport Expiry Notice&body=Dear Employee,%0D%0A%0D%0AYour passport is set to expire soon. Please take the necessary actions.%0D%0A%0D%0ABest Regards,%0D%0AAdmin Team`;
    window.location.href = mailtoLink;
}


fetchAndUpdateNotifications();

//#######################GEORGE JOSE######################################################
//##########################################################################################



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
        const response = await axios.get('https://js-ilp-default-rtdb.firebaseio.com/Xpress/.json');
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