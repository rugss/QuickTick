function redirectToHome() {
  window.location.href = "index.html";
}

document.getElementById("home-icon").addEventListener("click", redirectToHome);

function generateQRCode(elementId, data) {
  return new QRCode(document.getElementById(elementId), {
    text: data,
    width: 256,
    height: 256,
  });
}

function createBookingCard(booking) {
  const card = document.createElement("div");
  card.className = "booking-card";

  const info = document.createElement("div");
  info.className = "booking-info";
  info.innerHTML = `
    <h3>${booking.date}</h3>
    <p>${booking.museum}</p>
  `;
  card.appendChild(info);

  card.addEventListener("click", () => showQRModal(booking));

  return card;
}

function showQRModal(booking) {
  const modal = document.createElement("div");
  modal.className = "qr-modal";
  modal.innerHTML = `
    <div class="qr-modal-content">
      <h2>Booking QR Code</h2>
      <div id="modal-qr-${booking.id}"></div>
      <p>Booking ID: ${booking.id}</p>
      <p>Date: ${booking.date}</p>
      <p>Museum: ${booking.museum}</p>
      <button id="download-qr-${booking.id}">Download QR Code</button>
      <button id="close-modal">Close</button>
    </div>
  `;

  document.body.appendChild(modal);

  const qrCode = generateQRCode(
    `modal-qr-${booking.id}`,
    booking.id.toString()
  );

  document
    .getElementById(`download-qr-${booking.id}`)
    .addEventListener("click", () => downloadQR(qrCode, booking.id));
  document
    .getElementById("close-modal")
    .addEventListener("click", () => document.body.removeChild(modal));
}

function downloadQR(qrCode, bookingId) {
  const canvas = qrCode._el.querySelector("canvas");
  const image = canvas
    .toDataURL("image/png")
    .replace("image/png", "image/octet-stream");
  const link = document.createElement("a");
  link.href = image;
  link.download = `qr-code-booking-${bookingId}.png`;
  link.click();
}

function displayBookings(bookings) {
  const grid = document.getElementById("bookings-grid");
  grid.innerHTML = "";

  bookings.forEach((booking) => {
    const card = createBookingCard(booking);
    grid.appendChild(card);
  });
}

// Sample data - replace this with actual data fetching logic
const sampleBookings = [
  { id: 1720127, date: "September 15, 2024", museum: "National Museum of Art" },
  {
    id: 1720128,
    date: "October 5, 2024",
    museum: "Science and Technology Museum",
  },
];

// Display bookings when the page loads
window.addEventListener("load", () => displayBookings(sampleBookings));

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
    const response = await fetch("http://127.0.0.1:5000/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input_string: userInput }),
    });

    const data = await response.json();
    console.log(data);

    if (loader && loader.parentNode) {
      loader.parentNode.removeChild(loader);
    }

    const botMessage = document.createElement("div");
    botMessage.className = "message bot-message";

    if (typeof data.processed_string === "string") {
      botMessage.textContent = data.processed_string;
    } else if (data.Response) {
      botMessage.textContent = data.Response;
      if (data.Museum && data.Museum !== "Not found") {
        botMessage.textContent += `\nMuseum: ${data.Museum}`;
      }
      if (data.Date && data.Date !== "Invalid date") {
        botMessage.textContent += `\nDate: ${data.Date}`;
      }
    } else {
      botMessage.textContent = "I'm sorry, I couldn't process that request.";
    }

    if (messageContainer) {
      messageContainer.appendChild(botMessage);
      messageContainer.scrollTop = messageContainer.scrollHeight;
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

function showFullImage(imgSrc) {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.backgroundColor = "rgba(0,0,0,0.8)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "1000";

  const fullImg = document.createElement("img");
  fullImg.src = imgSrc;
  fullImg.style.maxWidth = "90%";
  fullImg.style.maxHeight = "90%";
  fullImg.style.objectFit = "contain";

  overlay.appendChild(fullImg);

  overlay.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });

  document.body.appendChild(overlay);
}

// Add event listeners to booking cards
document.querySelectorAll(".booking-card").forEach((card) => {
  const img = card.querySelector("img");
  card.addEventListener("click", () => {
    showFullImage(img.src);
  });
});

// No need for initPage function or DOMContentLoaded event listener,
// as we're using static content
