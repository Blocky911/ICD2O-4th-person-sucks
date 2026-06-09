const habitForm = document.getElementById("habitForm");
const habitInput = document.getElementById("habitInput");
const typeInput = document.getElementById("typeInput");
const categoryInput = document.getElementById("categoryInput");
const priorityInput = document.getElementById("priorityInput");
const targetInput = document.getElementById("targetInput");
const unitInput = document.getElementById("unitInput");

const habitList = document.getElementById("habitList");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
const resetDataBtn = document.getElementById("resetDataBtn");
const themeBtn = document.getElementById("themeBtn");

const totalHabits = document.getElementById("totalHabits");
const completedHabits = document.getElementById("completedHabits");
const counterHabits = document.getElementById("counterHabits");
const progressPercent = document.getElementById("progressPercent");
const progressText = document.getElementById("progressText");
const progressFill = document.getElementById("progressFill");
const quoteText = document.getElementById("quoteText");

let currentFilter = "all";

// Helper to safely compute days elapsed between two dates
function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000; 
  return Math.floor(Math.abs((date2 - date1) / oneDay));
}

// Updated with Preloaded Anti-Habits alongside the original placeholders
function getPreloadedHabits() {
  const todayIso = new Date().toISOString();
  return [
    {
      text: "Drink 8 glasses of water",
      type: "counter",
      category: "Health",
      priority: "High",
      target: 8,
      current: 0,
      unit: "glasses"
    },
    {
      text: "Study for 60 minutes",
      type: "counter",
      category: "School",
      priority: "High",
      target: 60,
      current: 0,
      unit: "mins"
    },
    {
      text: "Make my bed",
      type: "checkbox",
      category: "Productivity",
      priority: "Medium",
      completed: false
    },
    {
      text: "No Soda / Sugary Drinks",
      type: "anti",
      category: "Health",
      priority: "High",
      target: 1,
      current: 0,
      unit: "slips",
      createdAt: todayIso,
      lastInfractionDate: null
    },
    {
      text: "Limit Social Media before 12 PM",
      type: "anti",
      category: "Mindset",
      priority: "Medium",
      target: 3,
      current: 0,
      unit: "slips",
      createdAt: todayIso,
      lastInfractionDate: null
    }
  ];
}

const localData = localStorage.getItem("habitflowHabits");
let habits = [];

if (localData !== null) {
  try {
    habits = JSON.parse(localData);
  } catch(e) {
    habits = getPreloadedHabits();
  }
} else {
  habits = getPreloadedHabits();
}

const quotes = [
  "Small habits create big changes.",
  "Consistency beats motivation.",
  "Success is built one habit at a time.",
  "Do something today your future self will thank you for.",
  "Progress is progress, no matter how small.",
  "Every completed habit is a win."
];

function saveHabits() {
  localStorage.setItem("habitflowHabits", JSON.stringify(habits));
}

function getHabitCompleted(habit) {
  if (habit.type === "counter") {
    return habit.current >= habit.target;
  }
  if (habit.type === "anti") {
    return habit.current < habit.target;
  }
  return habit.completed;
}

function getCounterPercent(habit) {
  if (habit.type === "checkbox") return 0;
  if (!habit.target || habit.target <= 0) return 0;
  const percent = Math.round((habit.current / habit.target) * 100);
  return Math.min(percent, 100);
}

function renderHabits() {
  habitList.innerHTML = "";

  let filteredHabits = habits.filter(function(habit) {
    return habit && typeof habit === "object" && habit.text && habit.type;
  });

  filteredHabits = filteredHabits.filter(function(habit) {
    const completed = getHabitCompleted(habit);

    if (currentFilter === "completed") return habit.type === "anti" ? habit.current >= habit.target : completed;
    if (currentFilter === "active") return habit.type === "anti" ? habit.current < habit.target : !completed;
    if (currentFilter === "counter") return habit.type === "counter";
    if (currentFilter === "anti") return habit.type === "anti";

    return true;
  });

  const searchValue = searchInput.value.toLowerCase();

  filteredHabits = filteredHabits.filter(function(habit) {
    return (
      habit.text.toLowerCase().includes(searchValue) ||
      habit.category.toLowerCase().includes(searchValue) ||
      habit.priority.toLowerCase().includes(searchValue)
    );
  });

  if (filteredHabits.length === 0) {
    habitList.innerHTML = `<p class="empty">No habits found. Add one or change your filter.</p>`;
    updateDashboard();
    return;
  }

  filteredHabits.forEach(function(habit) {
    const realIndex = habits.indexOf(habit);
    if (realIndex === -1) return; 

    const li = document.createElement("li");
    li.className = "habit-item";

    if (habit.type !== "anti" && getHabitCompleted(habit)) {
      li.classList.add("completed");
    } else if (habit.type === "anti" && habit.current >= habit.target) {
      li.classList.add("anti-failed");
    }

    if (habit.type === "checkbox") {
      li.innerHTML = `
        <input 
          type="checkbox" 
          class="habit-check" 
          ${habit.completed ? "checked" : ""}
        />
        <div>
          <p class="habit-title">${habit.text}</p>
          <div class="habit-info">
            <span class="badge type-badge">Checkbox</span>
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
    }

    if (habit.type === "counter") {
      const percent = getCounterPercent(habit);

      li.innerHTML = `
        <div class="counter-icon">🔢</div>
        <div>
          <p class="habit-title">${habit.text}</p>
          <div class="habit-info">
            <span class="badge type-badge">Counter</span>
            <span class="badge ${habit.category}">${habit.category}</span>
            <span class="badge priority-${habit.priority}">${habit.priority}</span>
          </div>
          <div class="counter-box">
            <div class="counter-top">
              <span>${habit.current} / ${habit.target} ${habit.unit}</span>
              <span>${percent}%</span>
            </div>
            <div class="counter-bar">
              <div class="counter-fill" style="width: ${percent}%"></div>
            </div>
            <div class="counter-actions">
              <button class="counter-btn minus">-1</button>
              <button class="counter-btn plus">+1</button>
              <button class="quick-btn">+5</button>
              <button class="quick-btn complete-btn">Complete</button>
            </div>
          </div>
        </div>
        <button class="delete-btn">Delete</button>
      `;

      const minusBtn = li.querySelector(".minus");
      const plusBtn = li.querySelector(".plus");
      const quickBtn = li.querySelector(".quick-btn");
      const completeBtn = li.querySelector(".complete-btn");
      const deleteBtn = li.querySelector(".delete-btn");

      minusBtn.addEventListener("click", function() {
        habits[realIndex].current = Math.max(0, habits[realIndex].current - 1);
        saveHabits();
        renderHabits();
      });

      plusBtn.addEventListener("click", function() {
        habits[realIndex].current = Math.min(habits[realIndex].target, habits[realIndex].current + 1);
        saveHabits();
        renderHabits();
      });

      quickBtn.addEventListener("click", function() {
        habits[realIndex].current = Math.min(habits[realIndex].target, habits[realIndex].current + 5);
        saveHabits();
        renderHabits();
      });

      completeBtn.addEventListener("click", function() {
        habits[realIndex].current = habits[realIndex].target;
        saveHabits();
        renderHabits();
      });

      deleteBtn.addEventListener("click", function() {
        habits.splice(realIndex, 1);
        saveHabits();
        renderHabits();
      });
    }

    if (habit.type === "anti") {
      const percent = getCounterPercent(habit);
      const isFailed = habit.current >= habit.target;

      // Dynamic Streak Computations
      const createdDate = habit.createdAt ? new Date(habit.createdAt) : new Date();
      const todayDate = new Date();
      
      const activeStreak = isFailed ? 0 : daysBetween(createdDate, todayDate);
      const daysSinceInfraction = habit.lastInfractionDate 
        ? daysBetween(new Date(habit.lastInfractionDate), todayDate) 
        : daysBetween(createdDate, todayDate);

      li.innerHTML = `
        <div class="counter-icon">⚠️</div>
        <div>
          <p class="habit-title">${habit.text} ${isFailed ? '(Failed Today)' : '(Active Streak)'}</p>
          <div class="habit-info">
            <span class="badge type-badge anti-badge">Anti-Habit</span>
            <span class="badge ${habit.category}">${habit.category}</span>
            <span class="badge priority-${habit.priority}">${habit.priority}</span>
            <span class="badge anti-metric-badge">🔥 Active Streak: ${activeStreak} days</span>
            <span class="badge anti-metric-badge">🛡️ Since Infraction: ${daysSinceInfraction} days</span>
          </div>
          <div class="counter-box">
            <div class="counter-top">
              <span>Slips: ${habit.current} / Max Allowed: ${habit.target} ${habit.unit}</span>
              <span>${percent}% Limit Reach</span>
            </div>
            <div class="counter-bar">
              <div class="counter-fill anti-fill" style="width: ${percent}%"></div>
            </div>
            <div class="counter-actions">
              <button class="counter-btn minus">-1 slip</button>
              <button class="counter-btn plus warn">+1 Slip (Report Failure)</button>
            </div>
          </div>
        </div>
        <button class="delete-btn">Delete</button>
      `;

      const minusBtn = li.querySelector(".minus");
      const plusBtn = li.querySelector(".plus");
      const deleteBtn = li.querySelector(".delete-btn");

      minusBtn.addEventListener("click", function() {
        const oldVal = habits[realIndex].current;
        habits[realIndex].current = Math.max(0, habits[realIndex].current - 1);
        
        // If rolling back below failure threshold, clean up infraction status
        if (oldVal >= habits[realIndex].target && habits[realIndex].current < habits[realIndex].target) {
          habits[realIndex].lastInfractionDate = null;
        }
        saveHabits();
        renderHabits();
      });

      plusBtn.addEventListener("click", function() {
        habits[realIndex].current = habits[realIndex].current + 1;
        
        // Check if this action triggers crossing into an infraction state
        if (habits[realIndex].current >= habits[realIndex].target) {
          habits[realIndex].lastInfractionDate = new Date().toISOString();
        }
        saveHabits();
        renderHabits();
      });

      deleteBtn.addEventListener("click", function() {
        habits.splice(realIndex, 1);
        saveHabits();
        renderHabits();
      });
    }

    habitList.appendChild(li);
  });

  updateDashboard();
}

function updateDashboard() {
  const validHabits = habits.filter(h => h && h.text && h.type);
  const total = validHabits.length;

  const completed = validHabits.filter(function(habit) {
    return getHabitCompleted(habit);
  }).length;

  const counters = validHabits.filter(function(habit) {
    return habit.type === "counter";
  }).length;

  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  totalHabits.textContent = total;
  completedHabits.textContent = completed;
  counterHabits.textContent = counters;
  progressPercent.textContent = percent + "%";
  progressText.textContent = `${completed}/${total} successful`;
  progressFill.style.width = percent + "%";
}

habitForm.addEventListener("submit", function(e) {
  e.preventDefault();

  const text = habitInput.value.trim();
  const type = typeInput.value;
  const category = categoryInput.value;
  const priority = priorityInput.value;

  if (text === "") {
    alert("Please enter a habit.");
    return;
  }

  if (type === "checkbox") {
    habits.push({
      text: text,
      type: "checkbox",
      category: category,
      priority: priority,
      completed: false
    });
  }

  if (type === "counter" || type === "anti") {
    const target = Number(targetInput.value);
    const unit = unitInput.value.trim() || (type === "anti" ? "slips" : "times");

    if (!target || target <= 0) {
      alert("Please enter a valid target/limit threshold number.");
      return;
    }

    const newHabit = {
      text: text,
      type: type,
      category: category,
      priority: priority,
      target: target,
      current: 0,
      unit: unit
    };

    // Tracking metadata initialized specifically for new Anti-Habits
    if (type === "anti") {
      descTimestamp = new Date().toISOString();
      newHabit.createdAt = descTimestamp;
      newHabit.lastInfractionDate = null;
    }

    habits.push(newHabit);
  }

  habitInput.value = "";
  targetInput.value = "";
  unitInput.value = "";

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

resetDataBtn.addEventListener("click", function() {
  if (confirm("Are you sure you want to clear your data and reload preloaded habits?")) {
    habits = getPreloadedHabits();
    saveHabits();
    renderHabits();
  }
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

typeInput.addEventListener("change", function() {
  if (typeInput.value === "checkbox") {
    targetInput.style.display = "none";
    unitInput.style.display = "none";
    targetInput.required = false;
  } else if (typeInput.value === "anti") {
    targetInput.style.display = "block";
    unitInput.style.display = "block";
    targetInput.placeholder = "Max Allowed Slips";
    targetInput.required = true;
  } else {
    targetInput.style.display = "block";
    unitInput.style.display = "block";
    targetInput.placeholder = "Target";
    targetInput.required = true;
  }
});

function setupFormType() {
  if (typeInput.value === "checkbox") {
    targetInput.style.display = "none";
    unitInput.style.display = "none";
    targetInput.required = false;
  }
}

loadTheme();
loadQuote();
setupFormType();
renderHabits();