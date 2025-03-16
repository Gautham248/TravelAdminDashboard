
// //########################################### Request section #################################

// const url = 'https://js-ilp-default-rtdb.firebaseio.com/ExperionTravels/.json';

// axios.get(url)
//   .then(response => {
//     const dataRequest = response.data;
//     console.log(dataRequest);  
//     renderRequestsList(dataRequest);
//   })
//   .catch(error => {
//     console.error('Error fetching data:', error);
//   });

// function renderRequestsList(dataRequest) {
//   const travelDetails = Object.values(dataRequest.travelRequests).map(request => {
//     const employee = dataRequest.employees[request.employeeId];
//     const passport = dataRequest.passports[request.employeeId];

//     return {
//       departureDate: request.departure,
//       source: request.source,
//       destination: request.destination,
//       projectCode: request.projectCode,
//       employeeName: employee.name,
//       passportExpiry: passport.expiry,
//       status: request.status  
//     };
//   });


//   renderRequestCards(travelDetails);
// }

// function renderRequestCards(travelDetails) {
//   const container = document.querySelector('.requestsection-allrequests');   

//   container.innerHTML = '';

//   travelDetails.forEach(dataRequest => {
//     const card = createRequestCard(dataRequest);
//     container.appendChild(card);
//   });
// }

// function createRequestCard(dataRequest) {
 
//   const card = document.createElement('div');
//   card.classList.add('request-card');

 
//   const employeeSection = document.createElement('div');
//   employeeSection.classList.add('request-card-employee');

//   const nameElement = document.createElement('div');
//   nameElement.classList.add('request-card-employeename');
//   nameElement.textContent = dataRequest.employeeName;

//   const detailsSection = document.createElement('div');
//   detailsSection.classList.add('request-card-employee-details');

//   const sourceAndDestinationElement = document.createElement('div');
//   sourceAndDestinationElement.classList.add('request-card-sourceanddestination');
//   sourceAndDestinationElement.textContent = `${dataRequest.source} - ${dataRequest.destination}`;

//   const travelDateElement = document.createElement('div');
//   travelDateElement.classList.add('request-card-traveldate');
//   travelDateElement.textContent = `${dataRequest.departureDate}`;

//   const projectCodeElement = document.createElement('div');
//   projectCodeElement.classList.add('request-card-projectcode');
//   projectCodeElement.textContent = `${dataRequest.projectCode}`;

//   const passportExpiryElement = document.createElement('div');
//   passportExpiryElement.classList.add('request-card-passport-expiry');
//   passportExpiryElement.textContent = `Passport expires on ${dataRequest.passportExpiry}`;

//   detailsSection.appendChild(sourceAndDestinationElement);
//   detailsSection.appendChild(travelDateElement);
//   detailsSection.appendChild(projectCodeElement);
//   detailsSection.appendChild(passportExpiryElement);

//   employeeSection.appendChild(nameElement);
//   employeeSection.appendChild(detailsSection);

//   card.appendChild(employeeSection);

//   const buttonSection = document.createElement('div');
//   buttonSection.classList.add('request-card-sectionbutton');

//   const statusButton = document.createElement('button');
//   statusButton.classList.add('request-card-statusbutton');
//   statusButton.textContent = dataRequest.status || 'Pending'; 

//   buttonSection.appendChild(statusButton);
//   card.appendChild(buttonSection);

//   return card;
// }

// ///#################################################################################################

// // ############################### MAHESH ##########################################################

// const DB_URL = "https://js-ilp-default-rtdb.firebaseio.com/ExperionTravels/.json";

// // Function to update stats dynamically
// async function updateStats() {
//     try {
//         // Fetch data from Firebase
//         const response = await axios.get(DB_URL);
//         const data = response.data;

//         if (!data || !data.travelRequests || !data.passports) {
//             console.error("Invalid data format");
//             return;
//         }

//         let totalRequests = Object.keys(data.travelRequests).length;
//         let verifiedRequests = 0;
//         let threatRequests = 0;
//         const today = new Date();

//         // Loop through travel requests
//         Object.values(data.travelRequests).forEach(request => {
//             if (request.status === "verified") {
//                 verifiedRequests++;
//             }

//             const employeeId = request.employeeId;
//             const passport = data.passports[employeeId];

//             if (passport && passport.expiry) {
//                 const expiryDate = new Date(passport.expiry);
//                 const sixMonthsFromNow = new Date();
//                 sixMonthsFromNow.setMonth(today.getMonth() + 6);

//                 // If passport expires in less than 6 months, it's a threat
//                 if (expiryDate < sixMonthsFromNow) {
//                     threatRequests++;
//                 }
//             }
//         });

//         // Update UI
//         document.querySelector(".stats-section-totalrequests-number").textContent = totalRequests;
//         document.querySelector(".stats-section-threats-number").textContent = threatRequests;
//         document.querySelector(".stats-section-verified-number").textContent = verifiedRequests;

//         console.log("Stats updated:", { totalRequests, threatRequests, verifiedRequests });

//     } catch (error) {
//         console.error("Error fetching data:", error);
//     }
// }

// // Call function when page loads
// updateStats();

// // ################################### END---MAHESH ##################################################

// // ################################### GAUTHAM ###########
// function setupEventListeners() {
//     // Tab buttons
//     document.querySelectorAll('.tab-btn').forEach(btn => {
//         btn.addEventListener('click', (e) => {
//             document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
//             e.target.classList.add('active');
//             activeTab = e.target.getAttribute('data-tab');
//             renderRequestsList();
//         });
//     });
    
//     // Close modal
//     document.querySelector('.close').addEventListener('click', () => {
//         document.getElementById('modal').style.display = 'none';
//     });
    
//     // Click outside modal to close
//     window.addEventListener('click', (e) => {
//         if (e.target === document.getElementById('modal')) {
//             document.getElementById('modal').style.display = 'none';
//         }
//     });
    
//     // Approve request button
//     document.getElementById('verify-btn').addEventListener('click', () => updateRequestStatus('verified'));
    
//     // Deny request button
//     document.getElementById('deny-btn').addEventListener('click', () => updateRequestStatus('denied'));
    
//     // Add subtrip button
//     document.getElementById('add-subtrip-btn').addEventListener('click', addSubtrip);
    
//     // Search functionality
//     document.getElementById('search-btn').addEventListener('click', performSearch);
//     document.getElementById('search-input').addEventListener('keyup', (e) => {
//         if (e.key === 'Enter') performSearch();
//     });
// }

// // Search functionality
// function performSearch() {
//     const searchTerm = document.getElementById('search-input').value.toLowerCase();
//     if (!searchTerm) {
//         renderRequests();
//         return;
//     }
    
//     const filteredRequests = {};
    
//     Object.entries(allData.travelRequests).forEach(([requestId, request]) => {
//         const employee = allData.employees[request.employeeId];
        
//         // Search in employee name, source, destination
//         if (
//             (employee?.name && employee.name.toLowerCase().includes(searchTerm)) ||
//             (request.source && request.source.toLowerCase().includes(searchTerm)) ||
//             (request.destination && request.destination.toLowerCase().includes(searchTerm))
//         ) {
//             filteredRequests[requestId] = request;
//         }
//     });
    
//     renderRequestsList(filteredRequests);
// }

//########################################### Request section #################################

const url = 'https://js-ilp-default-rtdb.firebaseio.com/ExperionTravels/.json';
let allData = null;
let activeTab = 'all';
let searchTerm = '';

// Fetch data once and store it
function fetchData() {
  axios.get(url)
    .then(response => {
      allData = response.data;
      console.log(allData);  
      applyFiltersAndRender();
      updateStats();
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}

// Function to filter data based on active tab and search term
function applyFiltersAndRender() {
  if (!allData || !allData.travelRequests) return;
  
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
}

function renderRequestsList(filteredRequests = null) {
  const requestsToRender = filteredRequests || allData.travelRequests;
  
  const travelDetails = Object.values(requestsToRender).map(request => {
    const employee = allData.employees[request.employeeId];
    const passport = allData.passports[request.employeeId];

    return {
      departureDate: request.departure,
      source: request.source,
      destination: request.destination,
      projectCode: request.projectCode,
      employeeName: employee.name,
      passportExpiry: passport.expiry,
      status: request.status  
    };
  });

  renderRequestCards(travelDetails);
}

function renderRequestCards(travelDetails) {
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
}
function createRequestCard(dataRequest) {
    const card = document.createElement('div');
    card.classList.add('request-card');
    
    // Create the entire card structure using template string
    card.innerHTML = `
      <div class="request-card-employee">
        <div class="request-card-employeename">${dataRequest.employeeName}</div>
        <div class="request-card-employee-details">
          <div class="request-card-sourceanddestination">${dataRequest.source} - ${dataRequest.destination}</div>
          <div class="request-card-traveldate">${dataRequest.departureDate}</div>
          <div class="request-card-projectcode">${dataRequest.projectCode}</div>
          <div class="request-card-passport-expiry">Passport expires on ${dataRequest.passportExpiry}</div>
        </div>
      </div>
      <div class="request-card-sectionbutton">
        <button class="request-card-statusbutton ${dataRequest.status === 'verified' ? 'status-verified' : 
                                                dataRequest.status === 'denied' ? 'status-denied' : ''}">${dataRequest.status || 'Pending'}</button>
      </div>
    `;
    
    // Add click event to open modal
    card.addEventListener('click', () => {
      // Get the modal element by class name
      const modal = document.querySelector('.modal-section');
      const modalOverlay = document.querySelector('.modal-section-overlay');
      const modalPopup = document.getElementById("modal-section-popup");
      
      if (modal) {
        // Update modal content if needed
        try {
          // Only update modal content if these elements exist
          if (document.querySelector('.mspc-header-traveller')) {
            document.querySelector('.mspc-header-traveller').textContent = dataRequest.employeeName;
          }
          if (document.querySelector('.mspc-header-status')) {
            document.querySelector('.mspc-header-status').textContent = dataRequest.status || 'Pending';
          }
          if (document.querySelector('.mspc-trd-project-code-value')) {
            document.querySelector('.mspc-trd-project-code-value').textContent = dataRequest.projectCode;
          }
          if (document.querySelector('.mspc-trd-main-trip-value')) {
            document.querySelector('.mspc-trd-main-trip-value').textContent = `${dataRequest.source} → ${dataRequest.destination}`;
          }
          if (document.querySelector('.mspc-trd-departure-date-value')) {
            document.querySelector('.mspc-trd-departure-date-value').textContent = dataRequest.departureDate;
          }
          if (document.querySelector('.mspc-trd-passport-expiry-value')) {
            document.querySelector('.mspc-trd-passport-expiry-value').textContent = dataRequest.passportExpiry;
          }
        } catch (error) {
          console.error('Error updating modal content:', error);
        }
        
        // Show the modal
        modal.style.display = 'block';
        if (modalPopup) modalPopup.classList.add("active");
        if (modalOverlay) modalOverlay.classList.remove('hidden');
      }
    });
    return card;
  }
  
  document.addEventListener("DOMContentLoaded", () => {
      const modalPopup = document.getElementById("modal-section-popup");
      const modalSection = document.querySelector('.modal-section');
      const modalOverlay = document.querySelector('.modal-section-overlay');
  
      function closeModal() {
          modalSection.style.display = 'none';
          modalOverlay.classList.add('hidden');
          if (modalPopup) modalPopup.classList.remove("active");
      }
      
      // Close modal when clicking outside
      document.addEventListener('mousedown', function(event) {
          const modalContent = document.querySelector('.modal-section-popup-content');
          
          // Check if modal is visible and click is outside modal content
          if ((modalSection.style.display === 'flex' || modalSection.style.display === 'block') && 
              modalContent && !modalContent.contains(event.target)) {
              closeModal();
          }
      });
      
      axios.get("https://js-ilp-default-rtdb.firebaseio.com/ExperionTravels/.json")
          .then(response => {
              const employees = response.data.employees;
              
              // Get all request card elements
              const requestCardElements = document.querySelectorAll(".request-card");
              
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
          
      // Add event listeners for approve and deny buttons
      const approveButton = document.querySelector(".mspc-buttons-approve");
      const denyButton = document.querySelector(".mspc-buttons-deny");
      
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

// function createRequestCard(dataRequest) {
//     const card = document.createElement('div');
//     card.classList.add('request-card');
    
//     // Create the entire card structure using template string
//     card.innerHTML = `
//       <div class="request-card-employee">
//         <div class="request-card-employeename">${dataRequest.employeeName}</div>
//         <div class="request-card-employee-details">
//           <div class="request-card-sourceanddestination">${dataRequest.source} - ${dataRequest.destination}</div>
//           <div class="request-card-traveldate">${dataRequest.departureDate}</div>
//           <div class="request-card-projectcode">${dataRequest.projectCode}</div>
//           <div class="request-card-passport-expiry">Passport expires on ${dataRequest.passportExpiry}</div>
//         </div>
//       </div>
//       <div class="request-card-sectionbutton">
//         <button class="request-card-statusbutton ${dataRequest.status === 'verified' ? 'status-verified' : 
//                                                 dataRequest.status === 'denied' ? 'status-denied' : ''}">${dataRequest.status || 'Pending'}</button>
//       </div>
//     `;
    
//     // Add click event to open modal
//     card.addEventListener('click', () => {
//       // Get the modal element by class name
//       const modal = document.querySelector('.modal-section');
      
//       if (modal) {
//         // Update modal content if needed
//         try {
//           // Only update modal content if these elements exist
//           if (document.querySelector('.mspc-header-traveller')) {
//             document.querySelector('.mspc-header-traveller').textContent = dataRequest.employeeName;
//           }
//           if (document.querySelector('.mspc-header-status')) {
//             document.querySelector('.mspc-header-status').textContent = dataRequest.status || 'Pending';
//           }
//           if (document.querySelector('.mspc-trd-project-code-value')) {
//             document.querySelector('.mspc-trd-project-code-value').textContent = dataRequest.projectCode;
//           }
//           if (document.querySelector('.mspc-trd-main-trip-value')) {
//             document.querySelector('.mspc-trd-main-trip-value').textContent = `${dataRequest.source} → ${dataRequest.destination}`;
//           }
//           if (document.querySelector('.mspc-trd-departure-date-value')) {
//             document.querySelector('.mspc-trd-departure-date-value').textContent = dataRequest.departureDate;
//           }
//           if (document.querySelector('.mspc-trd-passport-expiry-value')) {
//             document.querySelector('.mspc-trd-passport-expiry-value').textContent = dataRequest.passportExpiry;
//           }
//         } catch (error) {
//           console.error('Error updating modal content:', error);
//         }
        
//         // Show the modal
//         modal.style.display = 'block';
        
//         // Add event listener to close modal when clicking outside
//         document.addEventListener('mousedown', closeModalOutside);
//       }
//     });
//     return card;
//   }
  
//   // Function to close modal when clicking outside
//   function closeModalOutside(event) {
//     const modal = document.querySelector('.modal-section');
//     const modalContent = document.querySelector('.modal-section-popup-content');
    
//     // If modal exists and click is outside the modal content
//     if (modal && modalContent && !modalContent.contains(event.target)) {
//       modal.style.display = 'none';
      
//       // Remove the event listener after closing
//       document.removeEventListener('mousedown', closeModalOutside);
//     }
//   }
// // Function to open modal (stub - implement as needed)
// function openRequestModal(requestData) {
//   const modal = document.getElementById('modal-section-popup');
//   if (modal) {
//     // Populate modal with request data
//     document.querySelector('.mspc-header-traveller').textContent = requestData.employeeName;
//     document.querySelector('.mspc-header-status').textContent = requestData.status || 'Pending';
//     document.querySelector('.mspc-trd-project-code-value').textContent = requestData.projectCode;
//     document.querySelector('.mspc-trd-main-trip-value').textContent = `${requestData.source} → ${requestData.destination}`;
//     document.querySelector('.mspc-trd-departure-date-value').textContent = requestData.departureDate;
//     document.querySelector('.mspc-trd-passport-expiry-value').textContent = requestData.passportExpiry;
    
//     // Display the modal
//     modal.style.display = 'block';
//   }
// }

///#################################################################################################

// ############################### STATS SECTION ####################################################

// Function to update stats dynamically
function updateStats() {
    if (!allData || !allData.travelRequests || !allData.passports) {
        console.error("Invalid data format");
        return;
    }

    let totalRequests = Object.keys(allData.travelRequests).length;
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

        if (passport && passport.expiry) {
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
    document.querySelector(".stats-section-totalrequests-number").textContent = totalRequests;
    document.querySelector(".stats-section-threats-number").textContent = threatRequests;
    document.querySelector(".stats-section-verified-number").textContent = verifiedRequests;

    console.log("Stats updated:", { totalRequests, threatRequests, verifiedRequests });
}

// ################################### EVENT LISTENERS ##############################################

function setupEventListeners() {
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
            searchTerm = searchInput.value.toLowerCase().trim();
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
    
    // Modal close button (if exists)
    const closeButtons = document.querySelectorAll('.close, .modal-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = document.getElementById('modal-section-popup');
            if (modal) modal.style.display = 'none';
        });
    });
    
    // Click outside modal to close (if modal exists)
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('modal-section-popup');
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Add task functionality
    const taskInput = document.getElementById('task-input');
    const submitButton = document.querySelector('.submit-button');
    
    if (taskInput && submitButton) {
        submitButton.addEventListener('click', addNewTask);
        taskInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                addNewTask();
            }
        });
    }
}

// Function to add new task (stub - implement as needed)
function addNewTask() {
    const taskInput = document.getElementById('task-input');
    const taskText = taskInput.value.trim();
    
    if (taskText) {
        const taskContainer = document.querySelector('.todo-list');
        const currentDate = new Date();
        const formattedDate = `${currentDate.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][currentDate.getMonth()]} ${String(currentDate.getFullYear()).slice(2)}`;
        const formattedTime = `${currentDate.getHours()}:${String(currentDate.getMinutes()).padStart(2, '0')} ${currentDate.getHours() >= 12 ? 'PM' : 'AM'}`;
        
        const newTask = document.createElement('div');
        newTask.classList.add('task');
        newTask.innerHTML = `
            <div class="date-and-time">
                <p class="date">${formattedDate}</p>
                <p class="time">${formattedTime}</p>
            </div>
            <div class="task-description">
                <p>${taskText}</p>
            </div>
        `;
        
        // Insert before the task-container
        const taskContainerElement = document.querySelector('.task-container');
        taskContainer.insertBefore(newTask, taskContainerElement);
        
        // Clear input
        taskInput.value = '';
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    setupEventListeners();
});