// Select elements
const habitList = document.getElementById('habits');
const habitForm = document.getElementById('habit-form');
const newHabitInput = document.getElementById('new-habit');

// Add event listener for adding a new habit
habitForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const newHabit = newHabitInput.value;
    if (newHabit === '') {
        alert('Please enter a habit!');
        return;
    }

    // Create new habit item (BUG: Missing functionality here)
    const li = document.createElement('li');
    li.innerHTML = `
        <input type="checkbox" class="habit-checkbox">
        <span>${newHabit}</span>
        <button class="delete-btn">Delete</button>
    `;
    habitList.appendChild(li);

    // Clear input field (BUG: This doesn't work)
    newHabitInput.value = '';
});

// Add event listener for marking habits as complete
habitList.addEventListener('change', function(e) {
    if (e.target.classList.contains('habit-checkbox')) {
        const checkbox = e.target;
        const habitText = checkbox.nextElementSibling;

        // BUG: Progress tracker doesn't update
        if (checkbox.checked) {
            habitText.style.textDecoration = 'line-through';
        } else {
            habitText.style.textDecoration = 'none';
        }
    }
});

// Add event listener for deleting habits
habitList.addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-btn')) {
        const li = e.target.parentElement;
        habitList.removeChild(li); // BUG: Doesn't delete properly
    }
});
