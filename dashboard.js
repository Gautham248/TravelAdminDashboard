const fetchAndUpdateStats = async () => {
  try {
    const response = await axios.get(
      "https://js-ilp-default-rtdb.firebaseio.com/ExperionTravels/.json"
    );
    const data = response.data;

    if (!data) {
      console.error("No data received from Firebase.");
      return;
    }

    console.log("Fetched Data:", data); // ✅ Debugging Line

    let threats = 0;
    let totalRequests = 0;
    let verifiedRequests = 0;

    const today = new Date();

    // ✅ Calculate Threats (Passports Expiring in 30 Days)
    if (data.passports) {
      Object.values(data.passports).forEach((passport) => {
        const expiryDate = new Date(passport.expiry);
        const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

        console.log(`Passport Expiry: ${passport.expiry}, Days Left: ${daysLeft}`); // ✅ Debugging Line

        if (daysLeft <= 30) threats++;
      });
    }

    // Count Total Travel Requests
    if (data.travelRequests) {
      totalRequests = Object.keys(data.travelRequests).length;
    }

    // ✅ Count Verified Travel Requests
    if (data.travelRequests) {
      Object.values(data.travelRequests).forEach((request) => {
        if (request.status === "verified") verifiedRequests++;
      });
    }

    // ✅ Update UI
    document.querySelector(".stats-section-threats-number").innerText = threats.toString();
    document.querySelector(".stats-section-totalrequests-number").innerText = totalRequests.toString();
    document.querySelector(".stats-section-verified-number").innerText = verifiedRequests.toString();

    console.log("Stats Updated:", { threats, totalRequests, verifiedRequests });

  } catch (error) {
    console.error("Error fetching data:", error);
    document.querySelector(".stats-section-threats-number").innerText = "Error!";
  }
};

// Call the function on page load or periodically
fetchAndUpdateStats();

const fetchAndUpdateNotifications = async () => {
  try {
      const response = await axios.get(
          "https://js-ilp-default-rtdb.firebaseio.com/ExperionTravels/.json"
      );
      const data = response.data;

      if (!data || !data.passports || !data.employees) {
          console.error("No valid data received.");
          return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize time

      const notifications = [];

      Object.entries(data.passports).forEach(([employeeId, passport]) => {
          const employee = data.employees[employeeId]; // ✅ Direct lookup using object keys

          if (!employee) {
              console.warn(`No matching employee found for passport expiry: ${passport.expiry}`);
              return;
          }

          const expiryDate = new Date(passport.expiry);
          expiryDate.setHours(0, 0, 0, 0); // Normalize time

          if (isNaN(expiryDate.getTime())) {
              console.error("Invalid expiry date:", passport.expiry);
              return;
          }

          const timeDiff = expiryDate.getTime() - today.getTime();
          const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

          // Only add employees whose passport is expired or expires in 30 days
          if (daysLeft <= 30) {
              notifications.push({
                  name: employee.name,  // ✅ Correct employee lookup
                  expiry: passport.expiry,
                  daysLeft: daysLeft < 0 ? "Expired" : `${daysLeft} days left`,
                  isExpired: daysLeft < 0
              });
          }
      });

      // ✅ Update UI
      const notificationList = document.getElementById("notification-list");
      notificationList.innerHTML = ""; // Clear previous notifications

      if (notifications.length === 0) {
          notificationList.innerHTML = "<p>No urgent passport expiries.</p>";
      } else {
          notifications.forEach((employee) => {
              const notificationCard = document.createElement("div");
              notificationCard.classList.add("notification-card");

              notificationCard.innerHTML = `
                  <strong>${employee.name}</strong>
                  <p class="expiry">
                      Passport Expires: <span class="${employee.isExpired ? 'expired' : ''}">
                          ${employee.isExpired ? "Expired" : employee.daysLeft}
                      </span>
                  </p>
              `;

              notificationList.appendChild(notificationCard);
          });
      }

      console.log("Notifications Updated:", notifications);
  } catch (error) {
      console.error("Error fetching data:", error);
  }
};

// Call function on page load
fetchAndUpdateNotifications();

