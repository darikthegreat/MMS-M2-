// index.js
import { supabase } from './lib/supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
  // --- Session and User Check ---
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    // No logged-in user, redirect to login page
    window.location.href = 'login.html';
    return;
  }
  const user = session.user;
  const authToken = session.access_token;

  // --- Essential DOM Elements ---
  const body = document.body;
  const logoEl = document.querySelector('.logo');
  
  // --- Logout Function ---
  const logoutIcon = document.querySelector('.logout-icon');
  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      // Redirect to login page after successful logout
      window.location.href = 'login.html';
    }
  }
  if (logoutIcon) logoutIcon.addEventListener('click', logout);

  // --- Personalize UI ---
  if (user && logoEl) {
    // Get username from metadata
    const username = user.user_metadata?.username || user.email;
    logoEl.textContent = `${username}'s Study Hub`;
  }

  // --- Dark Mode Function (remains the same) ---
  const darkModeToggle = document.querySelector('.dark-mode-toggle');
  function toggleDarkMode() {
    body.classList.toggle('dark-mode');
    localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark' : 'light');
  }
  if (darkModeToggle) darkModeToggle.addEventListener('click', toggleDarkMode);
  
  function applyInitialTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      body.classList.add('dark-mode');
    }
  }

  // --- Data Fetching and Rendering ---
  // Example for rendering tasks on the home page.
  // You would create similar functions for assignments and schedule.
  const tasksDisplayEl = document.getElementById('tasksDisplay');
  const homeTasksCountEl = document.getElementById('homeTasksCount');

  async function renderTasksOnHomePage() {
    if (!tasksDisplayEl) return;
    try {
      const response = await fetch('/api/tasks', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch tasks');
      
      const tasks = await response.json();
      const pendingTasksCount = tasks.filter(task => !task.completed).length;

      tasksDisplayEl.innerHTML = '';
      if (tasks.length === 0) {
        tasksDisplayEl.innerHTML = `<li>No tasks yet. Add some!</li>`;
      } else {
        tasks.slice(0, 5).forEach(task => { // Show max 5 tasks
            const li = document.createElement('li');
            li.textContent = task.text;
            if (task.completed) {
                li.style.textDecoration = 'line-through';
                li.style.color = '#999';
            }
            tasksDisplayEl.appendChild(li);
        });
      }
      if (homeTasksCountEl) {
          homeTasksCountEl.textContent = `${pendingTasksCount} pending / ${tasks.length} total.`;
      }
    } catch (error) {
      console.error(error);
      tasksDisplayEl.innerHTML = `<li>Error loading tasks.</li>`;
    }
  }

  // --- All other functions (widgets, navigation, etc.) remain largely the same ---
  // They no longer need to read from localStorage for tasks, assignments, etc.
  // They can either be removed or updated to fetch data if needed.
  // For simplicity, we are only showing the updated task rendering.

  // --- Initialization Calls ---
  applyInitialTheme();
  await renderTasksOnHomePage();
  // Call other render functions for assignments, schedule here.
});