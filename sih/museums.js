function redirectToHome() {
  window.location.href = "index.html";
}

document.getElementById("home-icon").addEventListener("click", redirectToHome);

async function fetchMuseums() {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/api/museums/?format=json"
    );
    if (!response.ok) {
      const text = await response.text(); // Log the response as text
      console.error(`Error fetching museums: ${text}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Could not fetch museums:", error);
    return [];
  }
}

async function fetchSlots() {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/api/slots/?format=json"
    );
    if (!response.ok) {
      const text = await response.text();
      console.error(`Error fetching slots: ${text}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Fetched slots:", data); // Add this line
    return data;
  } catch (error) {
    console.error("Could not fetch slots:", error);
    return [];
  }
}

// Global variables to store fetched data
let museums = [];
let slots = [];

// Function to initialize the page
async function initPage() {
  museums = await fetchMuseums();
  slots = await fetchSlots();
  renderMuseumCards();
}

// Function to render museum cards
function renderMuseumCards() {
  const museumsGrid = document.querySelector(".museums-grid");
  museumsGrid.innerHTML = ""; // Clear existing cards

  museums.forEach((museum) => {
    const card = document.createElement("div");
    card.className = "museum-card";
    card.onclick = () => showDetails(museum.id);
    card.innerHTML = `
        <div class="museum-card-image">
          <img src="img/pot_bg.jpeg" alt="${museum.name}" />
        </div>
        <div class="museum-card-content">
          <h3>${museum.name}</h3>
          <p>${museum.description.substring(0, 50)}...</p>
        </div>
      `;
    museumsGrid.appendChild(card);
  });
}

function showDetails(museumId) {
  console.log("Showing details for museum ID:", museumId);

  museumId = Number(museumId);

  const museum = museums.find((m) => m.id === museumId);
  console.log("Found museum:", museum);

  if (museum) {
    console.log("All slots:", slots);
    const museumSlots = slots.filter(
      (slot) => Number(slot.museum) === museumId
    );
    console.log("Filtered slots for this museum:", museumSlots);

    let slotsInfo = "";

    if (museumSlots.length > 0) {
      museumSlots.forEach((slot) => {
        const bookingButton =
          slot.remaining_seats > 0
            ? `<button class="book-now-btn" onclick="bookSlot(${slot.id})">Book Now</button>`
            : "";

        slotsInfo += `
          <div class="slot-info">
            <p>Start Time: ${new Date(slot.start_time).toLocaleString()}</p>
            <p>End Time: ${new Date(slot.end_time).toLocaleString()}</p>
            <p>Seats Left: ${slot.remaining_seats} / ${slot.seat_limit}</p>
            ${bookingButton}
          </div>
        `;
      });
    } else {
      slotsInfo = "<p>No slots available for this museum.</p>";
    }

    console.log("Slots info HTML:", slotsInfo);

    const museumImageElement = document.getElementById("museum-image");
    const museumTitleElement = document.getElementById("museum-title");
    const museumDescriptionElement =
      document.getElementById("museum-description");
    const museumSlotsElement = document.getElementById("museum-slots");
    const museumDetailsElement = document.getElementById("museum-details");

    if (
      museumImageElement &&
      museumTitleElement &&
      museumDescriptionElement &&
      museumSlotsElement &&
      museumDetailsElement
    ) {
      museumImageElement.src = "img/museum-placeholder.jpg";
      museumTitleElement.textContent = museum.name;
      museumDescriptionElement.textContent = museum.description;
      museumSlotsElement.innerHTML = slotsInfo;
      museumDetailsElement.classList.remove("hidden");
      console.log("Updated museum details in DOM");
    } else {
      console.error("One or more required DOM elements are missing");
    }
  } else {
    console.error("Museum not found for ID:", museumId);
  }
}
function hideDetails() {
  document.getElementById("museum-details").classList.add("hidden");
}

async function bookSlot(slotId) {
  console.log(`Booking slot with ID: ${slotId}`);

  try {
    const response = await fetch(
      `http://127.0.0.1:8000/api/book_slot/${slotId}/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add any necessary authentication headers here
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Booking successful:", result);

    // Update the UI to reflect the booking
    alert("Booking successful!");

    // Refresh the museum details to show updated seat counts
    const museumId = slots.find((slot) => slot.id === slotId).museum;
    showDetails(museumId);
  } catch (error) {
    console.error("Error booking slot:", error);
    alert("Failed to book slot. Please try again.");
  }
}

async function sendMessage() {
  const userInput = document.getElementById("user-input").value;
  if (userInput.trim() === "") return;

  const messageContainer = document.getElementById("chat-messages");
  const waitingCharacter = document.getElementById("waiting-character");

  if (waitingCharacter) {
    waitingCharacter.style.display = "none";
  }

  const userMessage = document.createElement("div");
  userMessage.className = "message user-message";
  userMessage.textContent = userInput;
  if (messageContainer) {
    messageContainer.appendChild(userMessage);
  }

  document.getElementById("user-input").value = "";

  let loader = document.getElementById("loader");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "loader";
    loader.className = "loader";
    loader.innerHTML = `
      <div id="hill"></div>
      <div id="box"></div>
    `;
  }

  if (messageContainer) {
    messageContainer.appendChild(loader);
  }

  if (messageContainer) {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  try {
    const output = await fetch("http://127.0.0.1:5000/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input_string: userInput }),
    });

    const data = await output.json();
    console.log(data);

    if (loader && loader.parentNode) {
      loader.parentNode.removeChild(loader);
    }

    const botMessage = document.createElement("div");
    botMessage.className = "message bot-message";

    if (typeof data.processed_string === "string") {
      botMessage.textContent = data.processed_string;
    } else if (data.output) {
      botMessage.textContent = data.output;
      if (data.Museum && data.Museum !== "Not found") {
        botMessage.textContent += `\nMuseum: ${data.Museum}`;
      }
      if (data.Date && data.Date !== "Invalid date") {
        botMessage.textContent += `\nDate: ${data.Date}`;
      }
    } else {
      botMessage.textContent = "I'm sorry, I couldn't process that request.";
    }

    // Append bot message first
    if (messageContainer) {
      messageContainer.appendChild(botMessage);
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    // Append the Book Tickets button if intent is "book tickets"
    if (data.intent === "book tickets") {
      const bookButton = document.createElement("button");
      bookButton.className = "book-ticket-btn";
      bookButton.textContent = "Book Tickets";
      bookButton.onclick = function () {
        window.location.href = "museums.html";
      };
      if (messageContainer) {
        messageContainer.appendChild(bookButton);
        messageContainer.scrollTop = messageContainer.scrollHeight; // Ensure the button is visible
      }
    }
  } catch (error) {
    console.error("Error:", error);
    if (loader && loader.parentNode) {
      loader.parentNode.removeChild(loader);
    }
    const errorMessage = document.createElement("div");
    errorMessage.className = "message bot-message";
    errorMessage.textContent =
      "Sorry, I'm having trouble processing your request.";
    if (messageContainer) {
      messageContainer.appendChild(errorMessage);
    }
  }
}

// Add event listener for Enter key
document
  .getElementById("user-input")
  .addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  });

// Call initPage when the DOM is loaded
document.addEventListener("DOMContentLoaded", initPage);

document.addEventListener("DOMContentLoaded", function () {
  initPage(); // Initialize museum page
  // Additional chatbot setup if needed
});
