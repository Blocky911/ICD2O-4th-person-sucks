const habitForm = document.getElementById("habitForm");
const habitInput = document.getElementById("habitInput");
const categoryInput = document.getElementById("categoryInput");
const priorityInput = document.getElementById("priorityInput");
const habitList = document.getElementById("habitList");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
const themeBtn = document.getElementById("themeBtn");

const totalHabits = document.getElementById("totalHabits");
const completedHabits = document.getElementById("completedHabits");
const progressPercent = document.getElementById("progressPercent");
const streakCount = document.getElementById("streakCount");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const quoteText = document.getElementById("quoteText");

let currentFilter = "all";

let habits = JSON.parse(localStorage.getItem("habitflowHabits")) || [
  {
    text: "Drink 8 glasses of water",
    category: "Health",
    priority: "Medium",
    completed: false
  },
  {
    text: "Study for 30 minutes",
    category: "School",
    priority: "High",
    completed: false
  },
  {
    text: "Exercise for 20 minutes",
    category: "Fitness",
    priority: "Low",
    completed: false
  }
];

const quotes = [
  "Small habits create big changes.",
  "Success is built one habit at a time.",
  "Consistency beats motivation.",
  "Your future is created by what you do today.",
  "Do something today that your future self will thank you for."
];

function saveHabits() {
  localStorage.setItem("habitflowHabits", JSON.stringify(habits));
}

function renderHabits() {
  habitList.innerHTML = "";

  let filteredHabits = habits.filter(function(habit) {
    if (currentFilter === "completed") return habit.completed;
    if (currentFilter === "active") return !habit.completed;
    return true;
  });

  const searchValue = searchInput.value.toLowerCase();

  filteredHabits = filteredHabits.filter(function(habit) {
    return habit.text.toLowerCase().includes(searchValue);
  });

  if (filteredHabits.length === 0) {
    habitList.innerHTML = `<p class="empty">No habits found. Add one or change your filter.</p>`;
    updateDashboard();
    return;
  }

  filteredHabits.forEach(function(habit) {
    const realIndex = habits.indexOf(habit);

    const li = document.createElement("li");
    li.className = "habit-item";

    if (habit.completed) {
      li.classList.add("completed");
    }

    li.innerHTML = `
      <input type="checkbox" class="habit-check" ${habit.completed ? "checked" : ""} />

      <div>
        <p class="habit-title">${habit.text}</p>
        <div class="habit-info">
          <span class="badge ${habit.category}">${habit.category}</span>
          <span class="badge priority-${habit.priority}">${habit.priority}</span>
        </div>
      </div>

      <button class="delete-btn">Delete</button>
    `;

    const checkbox = li.querySelector(".habit-check");
    const deleteBtn = li.querySelector(".delete-btn");

    checkbox.addEventListener("change", function() {
      habits[realIndex].completed = checkbox.checked;
      saveHabits();
      renderHabits();
    });

    deleteBtn.addEventListener("click", function() {
      habits.splice(realIndex, 1);
      saveHabits();
      renderHabits();
    });

    habitList.appendChild(li);
  });

  updateDashboard();
}

function updateDashboard() {
  const total = habits.length;
  const completed = habits.filter(function(habit) {
    return habit.completed;
  }).length;

  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  totalHabits.textContent = total;
  completedHabits.textContent = completed;
  progressPercent.textContent = percent + "%";
  progressText.textContent = `${completed}/${total} completed`;
  progressFill.style.width = percent + "%";

  streakCount.textContent = completed > 0 ? `🔥 ${completed}` : "🔥 0";
}

habitForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const text = habitInput.value.trim();

  if (text === "") {
    alert("Please enter a habit.");
    return;
  }

  habits.push({
    text: text,
    category: categoryInput.value,
    priority: priorityInput.value,
    completed: false
  });

  habitInput.value = "";

  saveHabits();
  renderHabits();
});

filterButtons.forEach(function(button) {
  button.addEventListener("click", function() {
    filterButtons.forEach(function(btn) {
      btn.classList.remove("active");
    });

    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderHabits();
  });
});

searchInput.addEventListener("input", renderHabits);

themeBtn.addEventListener("click", function() {
  document.body.classList.toggle("light");

  if (document.body.classList.contains("light")) {
    themeBtn.textContent = "☀️";
    localStorage.setItem("habitflowTheme", "light");
  } else {
    themeBtn.textContent = "🌙";
    localStorage.setItem("habitflowTheme", "dark");
  }
});

function loadTheme() {
  const savedTheme = localStorage.getItem("habitflowTheme");

  if (savedTheme === "light") {
    document.body.classList.add("light");
    themeBtn.textContent = "☀️";
  }
}

function loadQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  quoteText.textContent = quotes[randomIndex];
}

loadTheme();
loadQuote();
renderHabits();