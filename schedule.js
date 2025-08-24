document.addEventListener('DOMContentLoaded', function() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const scheduleGrid = document.getElementById('scheduleGrid');
    const taskNameInput = document.getElementById('taskName');
    const subjectInput = document.getElementById('subject');
    const dateInput = document.getElementById('date');
    const durationInput = document.getElementById('duration');
    const addTaskButton = document.getElementById('addTaskButton');
    const backToHomeButton = document.getElementById('backToHomeButton');

    let currentTasks = JSON.parse(localStorage.getItem('studySchedule')) || [];

    function initializeScheduleGrid() {
        scheduleGrid.innerHTML = ''; // Clear any existing columns (e.g., if re-initializing)
        days.forEach(day => {
            const dayColumn = document.createElement('div');
            dayColumn.className = 'day-column';
            dayColumn.setAttribute('data-day', day);

            // Add drag and drop listeners to each day column
            dayColumn.addEventListener('dragover', (e) => {
                e.preventDefault(); // Necessary to allow dropping
                dayColumn.style.backgroundColor = '#e9e9e9'; // Visual feedback
            });

            dayColumn.addEventListener('dragleave', () => {
                dayColumn.style.backgroundColor = ''; // Reset background
            });

            dayColumn.addEventListener('drop', (e) => {
                e.preventDefault();
                dayColumn.style.backgroundColor = ''; // Reset background
                const taskId = e.dataTransfer.getData('text/plain');
                const task = currentTasks.find(t => t.id === taskId);
                if (task) {
                    const originalDay = task.day;
                    task.day = dayColumn.getAttribute('data-day');

                    // Also update the date if the day changes significantly (optional, basic logic)
                    // This is a simplified example; a real app might need a date picker for the new day
                    const dayDifference = days.indexOf(task.day) - days.indexOf(originalDay);
                    if (task.date) {
                        const currentDate = new Date(task.date);
                        currentDate.setDate(currentDate.getDate() + dayDifference);
                        task.date = currentDate.toISOString().split('T')[0];
                    }
                    saveTasks();
                    renderTasks();
                }
            });
            scheduleGrid.appendChild(dayColumn);
        });
    }

    function saveTasks() {
        localStorage.setItem('studySchedule', JSON.stringify(currentTasks));
    }

    function renderTasks() {
        // Clear only task cards from day columns, not the columns themselves
        document.querySelectorAll('.day-column').forEach(col => col.innerHTML = '');

        currentTasks.forEach(task => {
            const dayColumn = document.querySelector(`.day-column[data-day="${task.day}"]`);
            if (dayColumn) {
                const taskCard = document.createElement('div');
                taskCard.className = 'task-card';
                taskCard.style.backgroundColor = task.color || getRandomColor(); // Ensure color exists
                taskCard.draggable = true;
                taskCard.setAttribute('data-task-id', task.id);

                const taskContent = document.createElement('div');
                taskContent.className = 'task-content';
                taskContent.textContent = `${task.name} (${task.duration} min)`;

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.innerHTML = '&times;'; // Using HTML entity for '×'
                deleteBtn.onclick = (e) => { // Attached directly for simplicity here
                    e.stopPropagation(); // Prevent drag or other parent events
                    deleteTask(task.id);
                };

                taskCard.appendChild(taskContent);
                taskCard.appendChild(deleteBtn);

                taskCard.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', task.id);
                    e.dataTransfer.effectAllowed = 'move';
                    setTimeout(() => { // Hide original element slightly after drag starts
                        taskCard.style.opacity = '0.5';
                    }, 0);
                });

                taskCard.addEventListener('dragend', () => {
                    taskCard.style.opacity = '1'; // Reset opacity when drag ends
                });
                dayColumn.appendChild(taskCard);
            }
        });
    }

    function addTask() {
        const taskName = taskNameInput.value.trim();
        const subject = subjectInput.value;
        const dateValue = dateInput.value;
        const duration = durationInput.value;

        if (!taskName || !dateValue || !duration) {
            alert('Please fill all fields: Task Name, Date, and Duration.');
            return;
        }
        if (parseInt(duration) < 15 || parseInt(duration) > 240) {
            alert('Duration must be between 15 and 240 minutes.');
            return;
        }


        const dateObj = new Date(dateValue + "T00:00:00"); // Ensure consistent date parsing by including time
        const dayIndex = dateObj.getUTCDay(); // Use getUTCDay for consistency as date is YYYY-MM-DD
        const day = days[dayIndex === 0 ? 6 : dayIndex - 1]; // Sunday is 0, make it last day

        const newTask = {
            id: Date.now().toString(),
            name: taskName,
            subject: subject,
            day: day, // The day of the week string
            date: dateValue, // The actual YYYY-MM-DD date
            duration: duration,
            color: getRandomColor()
        };

        currentTasks.push(newTask);
        saveTasks();
        renderTasks();

        // Clear form fields
        taskNameInput.value = '';
        // subjectInput.value = subjectInput.options[0].value; // Reset to first option
        dateInput.value = '';
        durationInput.value = '';
    }

    function deleteTask(taskId) {
        currentTasks = currentTasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
    }

    function getRandomColor() {
        const colors = ['#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#B1A2CA', '#888FC7']; // Added more colors
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Event Listeners
    if (addTaskButton) {
        addTaskButton.addEventListener('click', addTask);
    }
    if (backToHomeButton) {
        backToHomeButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // Initial setup
    initializeScheduleGrid(); // Create the day columns first
    renderTasks(); // Then render tasks into them
});