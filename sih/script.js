let currentSlide = 0;
const carousel = document.querySelector(".carousel");
const items = document.querySelectorAll(".carousel-item");
const totalItems = items.length;

function redirectToHome() {
  window.location.href = "index.html";
}

document.getElementById("home-icon").addEventListener("click", redirectToHome);

function isHomePage() {
  return (
    window.location.pathname.endsWith("index.html") ||
    window.location.pathname === "/"
  );
}

if (isHomePage()) {
  function moveCarousel(direction) {
    currentSlide = (currentSlide + direction + totalItems) % totalItems;
    carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
  }

  document
    .querySelector(".carousel-button.prev")
    .addEventListener("click", () => moveCarousel(-1));
  document
    .querySelector(".carousel-button.next")
    .addEventListener("click", () => moveCarousel(1));

  // Auto-advance carousel every 5 seconds
  setInterval(() => moveCarousel(1), 5000);
}

// React component for Explore boxes
const ExploreBox = ({ icon, title, description }) => (
  <div
    className="explore-box"
    onClick={() => {
      if (title === "Museum") {
        window.location.href = "museums.html";
      } else if (title === "My Bookings") {
        window.location.href = "my_bookings.html";
      }
    }}
  >
    <div className="explore-box-header">
      <img src={icon} alt={title} className="explore-box-icon" />
      <h3 className="explore-box-title">{title}</h3>
    </div>
    <p className="explore-box-description">{description}</p>
  </div>
);

const ExploreDashboard = () => {
  const exploreItems = [
    {
      icon: "img/musuem.png",
      title: "Museum",
      description: "Explore all the museums across the country.",
    },
    {
      icon: "img/calendar.png",
      title: "My Bookings",
      description: "View your upcoming and past bookings.",
    },
    {
      icon: "img/about_us.png",
      title: "About us",
      description: "Learn more about our mission.",
    },
    {
      icon: "img/ticket.png",
      title: "Tickets",
      description: "Your purchased tickets are stored here.",
    },
    {
      icon: "img/faq.png",
      title: "FAQ",
      description: "Find answers to your common questions.",
    },
  ];

  return (
    <div>
      <h2 style={{ color: "#fff", marginBottom: "20px" }}>Explore Features</h2>
      <div className="explore-grid">
        {exploreItems.map((item, index) => (
          <ExploreBox key={index} {...item} />
        ))}
      </div>
    </div>
  );
};

if (isHomePage()) {
  // Render React component
  ReactDOM.render(
    <React.StrictMode>
      <ExploreDashboard />
    </React.StrictMode>,
    document.getElementById("explore-dashboard")
  );
}

// Function to send message and display output
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

    if (messageContainer) {
      messageContainer.appendChild(botMessage);
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    // Check for "book tickets" intent and add "Book Ticket" button if detected
    if (data.intent === "book_ticket") {
      const bookTicketButton = document.createElement("button");
      bookTicketButton.innerText = "Book Ticket";
      bookTicketButton.className = "book-ticket-button";

      bookTicketButton.onclick = function () {
        window.location.href = "museums.html";
      };

      if (messageContainer) {
        messageContainer.appendChild(bookTicketButton);
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    }

    if (data.intent === "mybooking") {
      const bookTicketButton = document.createElement("button");
      bookTicketButton.innerText = "Your bookings";
      bookTicketButton.className = "book-ticket-button";

      bookTicketButton.onclick = function () {
        window.location.href = "my_bookings.html";
      };

      if (messageContainer) {
        messageContainer.appendChild(bookTicketButton);
        messageContainer.scrollTop = messageContainer.scrollHeight;
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
