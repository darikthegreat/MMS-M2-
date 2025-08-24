document.addEventListener('DOMContentLoaded', () => {
    // Retrieve tasks from localStorage, or initialize as an empty array
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const taskList = document.getElementById('taskList');
    const newTaskInput = document.getElementById('newTask');

    // Render tasks in the list
    function renderTasks() {
        taskList.innerHTML = ''; // Clear existing tasks
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = task.completed ? 'completed' : '';

            // Task text
            const taskText = document.createElement('span');
            taskText.textContent = task.text;
            taskText.className = 'task-text'; // Added for styling consistency

            // Button group for actions
            const btnGroup = document.createElement('div');
            btnGroup.className = 'btn-group';

            // Complete/Undo button
            const completeBtn = document.createElement('button');
            completeBtn.textContent = task.completed ? 'Undo' : 'Complete';
            completeBtn.className = 'complete-btn';
            completeBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                tasks[index].completed = !tasks[index].completed; // Toggle completed state
                if (tasks[index].completed) {
                    tasks[index].completedDate = new Date().toISOString().split('T')[0];
                } else {
                    tasks[index].completedDate = null;
                }
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderTasks(); // Re-render the list
            });

            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'delete-btn';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event bubbling
                tasks.splice(index, 1); // Remove task from array
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderTasks(); // Re-render the list
            });

            btnGroup.appendChild(completeBtn);
            btnGroup.appendChild(deleteBtn);
            li.appendChild(taskText);
            li.appendChild(btnGroup);
            taskList.appendChild(li);
        });
    }

    // Add a new task
    document.getElementById('addTaskBtn').addEventListener('click', () => {
        const text = newTaskInput.value.trim();
        if (text !== '') {
            tasks.push({ text: text, completed: false, completedDate: null });
            localStorage.setItem('tasks', JSON.stringify(tasks));
            newTaskInput.value = ''; // Clear input field
            renderTasks(); // Re-render the list
        }
    });

    // Allow adding task with Enter key
    newTaskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default form submission if it were in a form
            document.getElementById('addTaskBtn').click(); // Trigger click on Add Task button
        }
    });


    // Back button returns to the home page (index.html)
    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // Initial render of tasks
    renderTasks();
});