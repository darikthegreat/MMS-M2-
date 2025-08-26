document.addEventListener('DOMContentLoaded', () => {

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const taskList = document.getElementById('taskList');
    const newTaskInput = document.getElementById('newTask');


    function renderTasks() {
        taskList.innerHTML = ''; 
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = task.completed ? 'completed' : '';

           
            const taskText = document.createElement('span');
            taskText.textContent = task.text;
            taskText.className = 'task-text'; 

            
            const btnGroup = document.createElement('div');
            btnGroup.className = 'btn-group';

            
            const completeBtn = document.createElement('button');
            completeBtn.textContent = task.completed ? 'Undo' : 'Complete';
            completeBtn.className = 'complete-btn';
            completeBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                tasks[index].completed = !tasks[index].completed; 
                if (tasks[index].completed) {
                    tasks[index].completedDate = new Date().toISOString().split('T')[0];
                } else {
                    tasks[index].completedDate = null;
                }
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderTasks(); 
            });

            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.className = 'delete-btn';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                tasks.splice(index, 1); 
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderTasks(); 
            });

            btnGroup.appendChild(completeBtn);
            btnGroup.appendChild(deleteBtn);
            li.appendChild(taskText);
            li.appendChild(btnGroup);
            taskList.appendChild(li);
        });
    }


    document.getElementById('addTaskBtn').addEventListener('click', () => {
        const text = newTaskInput.value.trim();
        if (text !== '') {
            tasks.push({ text: text, completed: false, completedDate: null });
            localStorage.setItem('tasks', JSON.stringify(tasks));
            newTaskInput.value = '';
            renderTasks();
        }
    });


    newTaskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); 
            document.getElementById('addTaskBtn').click(); 
        }
    });


    document.getElementById('backBtn').addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    renderTasks();
});
