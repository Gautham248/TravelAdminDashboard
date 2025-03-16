
//########################################### Request section #################################

const url = 'https://js-ilp-default-rtdb.firebaseio.com/ExperionTravels/.json';

axios.get(url)
  .then(response => {
    const dataRequest = response.data;
    console.log(dataRequest);  
    renderRequestsList(dataRequest);
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });

function renderRequestsList(dataRequest) {
  const travelDetails = Object.values(dataRequest.travelRequests).map(request => {
    const employee = dataRequest.employees[request.employeeId];
    const passport = dataRequest.passports[request.employeeId];

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

  travelDetails.forEach(dataRequest => {
    const card = createRequestCard(dataRequest);
    container.appendChild(card);
  });
}

function createRequestCard(dataRequest) {
 
  const card = document.createElement('div');
  card.classList.add('request-card');

 
  const employeeSection = document.createElement('div');
  employeeSection.classList.add('request-card-employee');

  const nameElement = document.createElement('div');
  nameElement.classList.add('request-card-employeename');
  nameElement.textContent = dataRequest.employeeName;

  const detailsSection = document.createElement('div');
  detailsSection.classList.add('request-card-employee-details');

  const sourceAndDestinationElement = document.createElement('div');
  sourceAndDestinationElement.classList.add('request-card-sourceanddestination');
  sourceAndDestinationElement.textContent = `${dataRequest.source} - ${dataRequest.destination}`;

  const travelDateElement = document.createElement('div');
  travelDateElement.classList.add('request-card-traveldate');
  travelDateElement.textContent = `${dataRequest.departureDate}`;

  const projectCodeElement = document.createElement('div');
  projectCodeElement.classList.add('request-card-projectcode');
  projectCodeElement.textContent = `${dataRequest.projectCode}`;

  const passportExpiryElement = document.createElement('div');
  passportExpiryElement.classList.add('request-card-passport-expiry');
  passportExpiryElement.textContent = `Passport expires on ${dataRequest.passportExpiry}`;

  detailsSection.appendChild(sourceAndDestinationElement);
  detailsSection.appendChild(travelDateElement);
  detailsSection.appendChild(projectCodeElement);
  detailsSection.appendChild(passportExpiryElement);

  employeeSection.appendChild(nameElement);
  employeeSection.appendChild(detailsSection);

  card.appendChild(employeeSection);

  const buttonSection = document.createElement('div');
  buttonSection.classList.add('request-card-sectionbutton');

  const statusButton = document.createElement('button');
  statusButton.classList.add('request-card-statusbutton');
  statusButton.textContent = dataRequest.status || 'Pending'; 

  buttonSection.appendChild(statusButton);
  card.appendChild(buttonSection);

  return card;
}

///#################################################################################################
