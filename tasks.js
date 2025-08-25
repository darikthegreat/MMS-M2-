

document.addEventListener('DOMContentLoaded', async () => {
    let tasks = [];
    
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        
        window.location.href = 'login.html';
        return;
    }

    const authToken = session.access_token;

    
    async function fetchTasks() {
        const response = await fetch('/api/tasks', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        tasks = await response.json();
        renderTasks();
    }
    
    function renderTasks() {
        
    }

   
    document.getElementById('addTaskBtn').addEventListener('click', async () => {
        const text = newTaskInput.value.trim();
        if (text !== '') {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ text: text })
            });
            const newTask = await response.json();
            tasks.push(newTask);
            newTaskInput.value = '';
            renderTasks();
        }
    });

    await fetchTasks(); 
});
